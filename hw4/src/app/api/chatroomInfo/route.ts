import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatroomsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import type { newChatroom } from "@/lib/types/db";
import { newChatroomSchema } from "@/validators/newChatroom";

// POST /api/chatroomInfo
export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const username = session.user.username;

    // Parse the request body
    const reqBody = await req.json();
    //console.log("reqBody:", reqBody);
    let validatedReqBody: newChatroom;
    try {
      validatedReqBody = newChatroomSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //console.log("validateReqBody in add chatroom: ", validatedReqBody);

    const [findUser2] = await db
      .select({
        user2name: usersTable.username,
      })
      .from(usersTable)
      .where(eq(usersTable.username, validatedReqBody.user2name));

    //console.log("findUser2: ", findUser2);

    if (!findUser2) {
      console.log("user2 not found");
      return NextResponse.json({ error: "User2 Not Found." }, { status: 404 });
    }

    // Create chatroom
    const [res] = await db
      .insert(chatroomsTable)
      .values({
        user1name: validatedReqBody.user1name,
        user2name: validatedReqBody.user2name,
      })
      .returning();

    //console.log("after req in add chatroom");

    // Trigger pusher event
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(
      `private-${validatedReqBody.user1name}`,
      "newChatroom",
      {
        senderUsername: username,
        message: {
          chatroomId: res.displayId,
          user1name: validatedReqBody.user1name,
          user2name: validatedReqBody.user2name,
        },
      },
    );

    await pusher.trigger(
      `private-${validatedReqBody.user2name}`,
      "newChatroom",
      {
        senderUsername: username,
        message: {
          chatroomId: res.displayId,
          user1name: validatedReqBody.user1name,
          user2name: validatedReqBody.user2name,
        },
      },
    );

    return NextResponse.json(
      {
        chatroomId: res.displayId,
        user1name: validatedReqBody.user1name,
        user2name: validatedReqBody.user2name,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
