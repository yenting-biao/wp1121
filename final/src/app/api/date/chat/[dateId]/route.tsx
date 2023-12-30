import { NextResponse, type NextRequest } from "next/server";

import { eq, and, desc, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  dateParticipantsTable,
  privateMessagesTable,
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
    const participantUsernamesRet = await db
      .select({
        username: usersTable.username,
      })
      .from(dateParticipantsTable)
      .leftJoin(
        usersTable,
        eq(dateParticipantsTable.participantId, usersTable.userId)
      )
      .where(eq(dateParticipantsTable.dateId, dateId))
      .execute();

    if (!participantUsernamesRet.length) {
      return NextResponse.json(
        {
          error: "Date not found",
        },
        { status: 404 }
      );
    }

    const participantUsernames = participantUsernamesRet.map(
      (obj) => obj.username
    );

    const messages = await db
      .select({
        messageId: privateMessagesTable.messageId,
        senderUsername: usersTable.username,
        content: privateMessagesTable.content,
      })
      .from(privateMessagesTable)
      .where(eq(privateMessagesTable.dateId, dateId))
      .leftJoin(
        usersTable,
        eq(usersTable.userId, privateMessagesTable.senderId)
      )
      .orderBy(desc(privateMessagesTable.sentAt))
      .execute();

    const avatarUrls = await db
      .select({
        userId: usersTable.userId,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(dateParticipantsTable)
      .innerJoin(
        usersTable,
        eq(usersTable.userId, dateParticipantsTable.participantId)
      )
      .where(eq(dateParticipantsTable.dateId, dateId))
      .execute();

    return NextResponse.json(
      {
        participantUsernames,
        avatarUrls,
        messages,
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

  const participants = await db
    .select({
      userId: dateParticipantsTable.participantId,
    })
    .from(dateParticipantsTable)
    .where(
      and(
        eq(dateParticipantsTable.dateId, dateId),
        ne(dateParticipantsTable.participantId, userId)
      )
    )
    .execute();

  const data: { content: string } = await req.json();
  const { content } = data;
  try {
    const [newMessage] = await db
      .insert(privateMessagesTable)
      .values({ dateId, senderId: userId, content })
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
      senderId: userId,
      senderUsername: session.user.username,
      content,
    });

    const numOfParticipants = participants.length;
    for (let i = 0; i < numOfParticipants; i++) {
      if (participants[i].userId !== null) {
        await pusher.trigger(`private-${participants[i].userId}`, "chat:send", {
          dateId,
          senderId: userId,
          senderUsername: session.user.username,
          content,
        });
      }
    }

    return NextResponse.json(
      { messageId: newMessage.messageId },
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
