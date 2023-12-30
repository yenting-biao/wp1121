import { NextResponse, type NextRequest } from "next/server";

import { eq, and, desc, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  dateParticipantsTable,
  privateMessagesTable,
  restaurantTypesTable,
  restaurantsTable,
  suggestionsTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import Pusher from "pusher";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      dateId: string;
    };
  }
) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dateId } = params;
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!regex.test(dateId)) {
    NextResponse.json(
      { error: "Invalid dateId" },
      {
        status: 400,
      }
    );
  }

  try {
    const suggestedRestaurants = await db
      .select({
        placeId: suggestionsTable.placeId,
        name: restaurantsTable.name,
        address: restaurantsTable.address,
        lat: restaurantsTable.latitude,
        lng: restaurantsTable.longitude,
      })
      .from(suggestionsTable)
      .innerJoin(
        restaurantsTable,
        eq(restaurantsTable.placeId, suggestionsTable.placeId)
      )
      .where(eq(suggestionsTable.dateId, dateId))
      .execute();
    return NextResponse.json(
      {
        suggestedRestaurants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      dateId: string;
    };
  }
) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { dateId } = params;
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!regex.test(dateId)) {
    NextResponse.json(
      { error: "Invalid dateId" },
      {
        status: 400,
      }
    );
  }

  const [exist] = await db
    .select({
      id: dateParticipantsTable.participantId,
    })
    .from(dateParticipantsTable)
    .where(
      and(
        eq(dateParticipantsTable.dateId, dateId),
        eq(dateParticipantsTable.participantId, userId)
      )
    )
    .execute();

  if (!exist) {
    return NextResponse.json(
      {
        error: "Date not found",
      },
      { status: 404 }
    );
  }

  const [user] = await db
    .select({
      username: usersTable.username,
    })
    .from(usersTable)
    .where(eq(usersTable.userId, userId))
    .execute();

  if (!user) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      { status: 404 }
    );
  }

  const data: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    types: string[];
  } = await req.json();
  const { placeId } = data;
  try {
    const [restaurantExists] = await db
      .select({ placeId: restaurantsTable.placeId })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.placeId, placeId))
      .execute();
    if (!restaurantExists) {
      await db.insert(restaurantsTable).values({
        placeId,
        name: data.name,
        address: data.address,
        latitude: data.lat,
        longitude: data.lng,
      });
      const len = data.types.length;
      for (let i = 0; i < len; i++) {
        if (
          !(
            data.types[i] === "food" ||
            data.types[i] === "point_of_interest" ||
            data.types[i] === "establishment"
          )
        ) {
          await db.insert(restaurantTypesTable).values({
            placeId,
            type: data.types[i],
          });
        }
      }
    }
    const [name] = await db
      .select({ name: restaurantsTable.name })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.placeId, placeId))
      .execute();
    await db.insert(suggestionsTable).values({ dateId, placeId }).returning();

    const [newMessage] = await db
      .insert(privateMessagesTable)
      .values({
        dateId,
        senderId: null,
        content: `server:${session.user.username} 建議 ${name.name}`,
      })
      .returning();

    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-${dateId}`, "chat:send", {
      messageId: newMessage.messageId,
      senderId: null,
      senderUsername: session.user.username,
      content: newMessage.content,
    });

    const participants = await db
      .select({
        userId: dateParticipantsTable.participantId,
      })
      .from(dateParticipantsTable)
      .where(and(eq(dateParticipantsTable.dateId, dateId)))
      .execute();

    const numOfParticipants = participants.length;
    for (let i = 0; i < numOfParticipants; i++) {
      if (participants[i].userId !== null) {
        await pusher.trigger(`private-${participants[i].userId}`, "chat:send", {
          dateId,
          senderId: "",
          senderUsername: "",
          content: newMessage.content,
        });
        await pusher.trigger(`private-${dateId}`, "suggestion", {
          ...data,
          add: true,
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      dateId: string;
    };
  }
) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { dateId } = params;
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!regex.test(dateId)) {
    NextResponse.json(
      { error: "Invalid dateId" },
      {
        status: 400,
      }
    );
  }

  const [exist] = await db
    .select({
      id: dateParticipantsTable.participantId,
    })
    .from(dateParticipantsTable)
    .where(
      and(
        eq(dateParticipantsTable.dateId, dateId),
        eq(dateParticipantsTable.participantId, userId)
      )
    )
    .execute();

  if (!exist) {
    return NextResponse.json(
      {
        error: "Date not found",
      },
      { status: 404 }
    );
  }

  const data: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } = await req.json();
  const { placeId } = data;
  try {
    await db
      .delete(suggestionsTable)
      .where(eq(suggestionsTable.placeId, placeId));

    const [newMessage] = await db
      .insert(privateMessagesTable)
      .values({
        dateId,
        senderId: null,
        content: `server:${session.user.username} 取消建議 ${data.name}`,
      })
      .returning();

    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-${dateId}`, "chat:send", {
      messageId: newMessage.messageId,
      senderId: null,
      senderUsername: session.user.username,
      content: newMessage.content,
    });

    const participants = await db
      .select({
        userId: dateParticipantsTable.participantId,
      })
      .from(dateParticipantsTable)
      .where(and(eq(dateParticipantsTable.dateId, dateId)))
      .execute();

    const numOfParticipants = participants.length;
    for (let i = 0; i < numOfParticipants; i++) {
      if (participants[i].userId !== null) {
        await pusher.trigger(`private-${dateId}`, "suggestion", {
          ...data,
          add: false,
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
