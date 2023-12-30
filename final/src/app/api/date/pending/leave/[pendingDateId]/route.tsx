import { NextResponse, type NextRequest } from "next/server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { pendingDatesTable, pendingDateParticipantsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      pendingDateId: string;
    };
  }
) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { pendingDateId } = params;

  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!regex.test(pendingDateId)) {
    NextResponse.json(
      { error: "Invalid pendingDateId" },
      {
        status: 400,
      }
    );
  }

  try {
    const [pendingDate] = await db
      .select({
        participantCount: pendingDatesTable.participantCount,
        remainingSlots: pendingDatesTable.remainingSlots,
      })
      .from(pendingDatesTable)
      .where(eq(pendingDatesTable.pendingDateId, pendingDateId));
    if (!pendingDate)
      return NextResponse.json(
        {
          error: "Pending date not found",
        },
        { status: 404 }
      );

    const [participating] = await db
      .select({
        participantId: pendingDateParticipantsTable.participantId,
      })
      .from(pendingDateParticipantsTable)
      .where(
        and(
          eq(pendingDateParticipantsTable.pendingDateId, pendingDateId),
          eq(pendingDateParticipantsTable.participantId, userId)
        )
      )
      .execute();
    if (!participating)
      return NextResponse.json(
        {
          error: "You have not joined this date",
        },
        { status: 400 }
      );

    await db
      .delete(pendingDateParticipantsTable)
      .where(eq(pendingDateParticipantsTable.participantId, userId));

    if (pendingDate.remainingSlots + 1 === pendingDate.participantCount) {
      // delete pending date if no user has joined
      await db
        .delete(pendingDatesTable)
        .where(eq(pendingDatesTable.pendingDateId, pendingDateId));
    } else {
      await db
        .update(pendingDatesTable)
        .set({ remainingSlots: pendingDate.remainingSlots + 1 })
        .where(eq(pendingDatesTable.pendingDateId, pendingDateId));
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
