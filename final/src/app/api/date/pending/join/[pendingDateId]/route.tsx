import { NextResponse, type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  datesTable,
  dateParticipantsTable,
  pendingDatesTable,
  pendingDateParticipantsTable,
  notificationsTable,
  usersTable,
  privateMessagesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import Pusher from "pusher";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function PUT(
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
    if (!(pendingDate.remainingSlots > 0))
      return NextResponse.json(
        {
          error: "Date is full",
        },
        { status: 400 }
      );

    const participantIdsRet = await db
      .select({
        participantId: pendingDateParticipantsTable.participantId,
        username: usersTable.username,
        bio: usersTable.bio,
      })
      .from(pendingDateParticipantsTable)
      .innerJoin(
        usersTable,
        eq(usersTable.userId, pendingDateParticipantsTable.participantId)
      )
      .where(eq(pendingDateParticipantsTable.pendingDateId, pendingDateId))
      .execute();
    const participantIds = participantIdsRet.map((obj) => obj.participantId);
    if (participantIds.includes(userId))
      return NextResponse.json(
        {
          error: "You have already joined this date",
        },
        { status: 400 }
      );

    await db.insert(pendingDateParticipantsTable).values({
      pendingDateId,
      participantId: userId,
    });

    if (pendingDate.remainingSlots > 1) {
      await db
        .update(pendingDatesTable)
        .set({ remainingSlots: pendingDate.remainingSlots - 1 })
        .where(eq(pendingDatesTable.pendingDateId, pendingDateId));
    } else {
      const [newDate] = await db.insert(datesTable).values({}).returning();
      participantIds.push(userId);

      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });

      const numOfParticipants = participantIds.length;
      for (let i = 0; i < numOfParticipants; i++) {
        await db.insert(dateParticipantsTable).values({
          dateId: newDate.dateId,
          participantId: participantIds[i],
        });
        await db.insert(privateMessagesTable).values({
          dateId: newDate.dateId,
          senderId: participantIds[i],
          content:
            participantIdsRet[i].username +
            " 的自我介紹：\n" +
            (participantIdsRet[i].bio ?? "[未寫自我介紹]"),
        });
        const [newNotif] = await db
          .insert(notificationsTable)
          .values({
            targetUserId: participantIds[i],
            type: "date-create",
            content: "已配對成功，點擊此處開始討論聚餐活動！",
            redirectUrl: `/food-dates/my-dates/${newDate.dateId}`,
          })
          .returning();
        await pusher.trigger(`private-${participantIds[i]}`, "notif", {
          notificationId: newNotif.notificationId,
          type: newNotif.type,
          content: newNotif.content,
          redirectUrl: newNotif.redirectUrl,
          read: false,
        });
      }
      await db
        .delete(pendingDatesTable)
        .where(eq(pendingDatesTable.pendingDateId, pendingDateId));
      // pendingDateParticipants should be deleted by CASCADE trigger
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
