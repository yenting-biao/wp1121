import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { and, eq, or } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatroomsTable, messagesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import type { ChatroomPinMessage, DeleteChatroom } from "@/lib/types/db";
import { deleteChatroomSchema } from "@/validators/deleteMessage";
import { pinMessageSchema } from "@/validators/pinMessage";

// PUT /api/chatroomInfo/:chatroomId
export async function PUT(
  req: NextRequest,
  { params }: { params: { chatroomId: string } },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const username = session.user.username;

    // Check ownership of chatroom
    const [chat] = await db
      .select({
        chatroomId: chatroomsTable.displayId,
      })
      .from(chatroomsTable)
      .where(
        and(
          or(
            eq(chatroomsTable.user1name, username),
            eq(chatroomsTable.user2name, username),
          ),
          eq(chatroomsTable.displayId, params.chatroomId),
        ),
      );
    if (!chat) {
      return NextResponse.json({ error: "Chat Not Found" }, { status: 404 });
    }

    // Parse the request body
    const reqBody = await req.json();
    //console.log("reqBody:", reqBody);
    let validatedReqBody: ChatroomPinMessage;
    try {
      validatedReqBody = pinMessageSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //("before chatroom in pin message");
    //console.log("validateReqBody: ", validatedReqBody);

    // Pin message
    const [newChatroomInfo] = await db
      .update(chatroomsTable)
      .set({
        pinnedMessageId: validatedReqBody.pinnedMessageId,
      })
      .where(eq(chatroomsTable.displayId, validatedReqBody.chatroomId))
      .returning();

    const [pinnedMes] = await db
      .select({
        pinnedMessageContent: messagesTable.message,
      })
      .from(messagesTable)
      .where(eq(messagesTable.id, validatedReqBody.pinnedMessageId));

    //console.log("after req in pin message");

    // Trigger pusher event
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(
      `private-${params.chatroomId}`,
      "chatroom:pinnedMessage",
      {
        senderUsername: username,
        message: {
          chatroomID: newChatroomInfo.chatroomID,
          pinnedMessageId: newChatroomInfo.pinnedMessageId,
          pinnedMessageContent: pinnedMes.pinnedMessageContent,
        },
      },
    );

    return NextResponse.json(
      {
        chatroomID: newChatroomInfo.chatroomID,
        pinnedMessageId: newChatroomInfo.pinnedMessageId,
        pinnedMessageContent: pinnedMes.pinnedMessageContent,
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

// DELETE /api/chatroomInfo/:chatroomId
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatroomId: string } },
) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const username = session.user.username;

    // Check ownership of chatroom
    const [chat] = await db
      .select({
        chatroomId: chatroomsTable.displayId,
      })
      .from(chatroomsTable)
      .where(
        and(
          or(
            eq(chatroomsTable.user1name, username),
            eq(chatroomsTable.user2name, username),
          ),
          eq(chatroomsTable.displayId, params.chatroomId),
        ),
      );
    if (!chat) {
      return NextResponse.json({ error: "Chat Not Found" }, { status: 404 });
    }

    // Parse the request body
    const reqBody = await req.json();
    //console.log("reqBody:", reqBody);
    let validatedReqBody: DeleteChatroom;
    try {
      validatedReqBody = deleteChatroomSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Delte message
    const [deleteRes] = await db
      .delete(chatroomsTable)
      .where(eq(chatroomsTable.displayId, validatedReqBody.chatroomId))
      .returning();

    // Trigger pusher event
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    const chatterUsername =
      deleteRes.user1name === username
        ? deleteRes.user2name
        : deleteRes.user1name;
    await pusher.trigger(
      `private-${chatterUsername}`,
      "chatroom:deleteChatroom",
      {
        senderUsername: username,
        message: {
          chatroomID: validatedReqBody.chatroomId,
        },
      },
    );
    await pusher.trigger(`private-${username}`, "chatroom:deleteChatroom", {
      senderUsername: username,
      message: {
        chatroomID: validatedReqBody.chatroomId,
      },
    });

    return NextResponse.json(
      {
        chatroomID: validatedReqBody.chatroomId,
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
