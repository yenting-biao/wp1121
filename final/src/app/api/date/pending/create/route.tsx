import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { pendingDatesTable, pendingDateParticipantsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import Pusher from "pusher";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

type createPendingDatePayload = {
  participantCount: number;
  time: string;
  priceRange: string;
  restaurantTypes: string;
};

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const {
    participantCount,
    time,
    priceRange,
    restaurantTypes,
  }: createPendingDatePayload = await req.json();
  try {
    const [newPendingDate] = await db
      .insert(pendingDatesTable)
      .values({
        participantCount,
        remainingSlots: participantCount - 1,
        time,
        priceRange,
        restaurantTypes,
      })
      .returning();

    await db.insert(pendingDateParticipantsTable).values({
      pendingDateId: newPendingDate.pendingDateId,
      participantId: userId,
    });

    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-pending`, "pending:create", {
      pendingDateId: newPendingDate.pendingDateId,
      participantCount,
      remainingSlots: participantCount - 1,
      time,
      priceRange,
      restaurantTypes,
      joined: false,
    });

    return NextResponse.json(
      { pendingDateId: newPendingDate.pendingDateId },
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
