import { type NextRequest, NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { dateParticipantsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // channel name is in the format: private-<dateId>
    const channelName = channel.slice(8);
    if (!channelName) {
      return NextResponse.json(
        { error: "Invalid channel name" },
        { status: 400 }
      );
    }

    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (regex.test(channelName)) {
      if (channelName !== session.user.id) {
        // Get the document from the database
        const dateId = channelName;
        const [dateParticipation] = await db
          .select()
          .from(dateParticipantsTable)
          .where(
            and(
              eq(dateParticipantsTable.dateId, dateId),
              eq(dateParticipantsTable.participantId, session.user.id)
            )
          );
        if (!dateParticipation) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    } else if (channelName !== "pending")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userData = {
      user_id: session.user.id,
    };

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      userData
    );

    return NextResponse.json(authResponse);
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
