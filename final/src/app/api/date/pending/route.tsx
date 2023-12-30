import { NextResponse, type NextRequest } from "next/server";

import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { pendingDatesTable, pendingDateParticipantsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

// get all pending dates
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const pendingDatesParticipationSubquery = db
      .select({
        pendingDateId: pendingDateParticipantsTable.pendingDateId,
        participantId: pendingDateParticipantsTable.participantId,
      })
      .from(pendingDateParticipantsTable)
      .where(eq(pendingDateParticipantsTable.participantId, userId))
      .as("sq");

    const pendingDates = await db
      .select({
        pendingDateId: pendingDatesTable.pendingDateId,
        participantCount: pendingDatesTable.participantCount,
        remainingSlots: pendingDatesTable.remainingSlots,
        time: pendingDatesTable.time,
        priceRange: pendingDatesTable.priceRange,
        restaurantTypes: pendingDatesTable.restaurantTypes,
        participantId: pendingDatesParticipationSubquery.participantId,
      })
      .from(pendingDatesTable)
      .leftJoin(
        pendingDatesParticipationSubquery,
        eq(
          pendingDatesParticipationSubquery.pendingDateId,
          pendingDatesTable.pendingDateId
        )
      )
      .orderBy(desc(pendingDatesTable.createdAt))
      .execute();

    const pendingDatesWithParticipationStatus = pendingDates.map(
      (pendingDate) => {
        return {
          pendingDateId: pendingDate.pendingDateId,
          participantCount: pendingDate.participantCount,
          remainingSlots: pendingDate.remainingSlots,
          time: pendingDate.time,
          priceRange: pendingDate.priceRange,
          restaurantTypes: pendingDate.restaurantTypes,
          joined: pendingDate.participantId ? true : false,
        };
      }
    );

    return NextResponse.json(
      {
        pendingDatesWithParticipationStatus,
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
