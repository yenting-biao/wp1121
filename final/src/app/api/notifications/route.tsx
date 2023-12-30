import { NextResponse, type NextRequest } from "next/server";

import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import Pusher from "pusher";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const notifications = await db
      .select({
        notificationId: notificationsTable.notificationId,
        type: notificationsTable.type,
        content: notificationsTable.content,
        redirectUrl: notificationsTable.redirectUrl,
        read: notificationsTable.read,
      })
      .from(notificationsTable)
      .where(eq(notificationsTable.targetUserId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .execute();

    return NextResponse.json(
      {
        notifications,
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: { notificationId: string } = await req.json();
  const { notificationId } = data;

  try {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.notificationId, notificationId));

    return NextResponse.json(
      {
        status: "ok",
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
