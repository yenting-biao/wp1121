import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { and, eq, or } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatroomsTable, messagesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import type { Message, MessageWithValidity } from "@/lib/types/db";
import { unsendMessageSchema } from "@/validators/UnsendMessage";
import { sendMessageSchema } from "@/validators/sendMessage";

// POST /api/chatrooms/:chatroomId
export async function POST(
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
    let validatedReqBody: Partial<Omit<Message, "id">>;
    try {
      validatedReqBody = sendMessageSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //console.log("after req");

    // Send message
    const [sentMessage] = await db
      .insert(messagesTable)
      .values({
        chatroomID: params.chatroomId,
        sender: username,
        message: validatedReqBody.message || "",
      })
      .returning();

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
      "chatroom:newMessage",
      {
        senderUsername: username,
        message: {
          id: sentMessage.id,
          chatroomID: sentMessage.chatroomID,
          sender: sentMessage.sender,
          message: sentMessage.message,
          validity: sentMessage.validity,
        },
      },
    );

    // set navbar pusher
    const [chatroomUsers] = await db
      .select({
        user1name: chatroomsTable.user1name,
        user2name: chatroomsTable.user2name,
      })
      .from(chatroomsTable)
      .where(eq(chatroomsTable.displayId, params.chatroomId));

    await pusher.trigger(
      `private-${chatroomUsers.user1name}`,
      "chatroom:newMessage",
      {
        senderUsername: username,
        message: {
          id: sentMessage.id,
          chatroomID: sentMessage.chatroomID,
          sender: sentMessage.sender,
          message: sentMessage.message,
          validity: sentMessage.validity,
        },
      },
    );
    await pusher.trigger(
      `private-${chatroomUsers.user2name}`,
      "chatroom:newMessage",
      {
        senderUsername: username,
        message: {
          id: sentMessage.id,
          chatroomID: sentMessage.chatroomID,
          sender: sentMessage.sender,
          message: sentMessage.message,
          validity: sentMessage.validity,
        },
      },
    );

    return NextResponse.json(
      {
        id: sentMessage.id,
        chatroomId: sentMessage.chatroomID,
        sender: sentMessage.sender,
        message: sentMessage.message,
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

// PUT /api/chatrooms/:chatroomId
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
    let validatedReqBody: MessageWithValidity;
    try {
      validatedReqBody = unsendMessageSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //console.log("after req");

    // Unsend message
    const [unsentMessage] = await db
      .update(messagesTable)
      .set({
        validity: validatedReqBody.validity,
      })
      .where(eq(messagesTable.id, Number(validatedReqBody.id)))
      .returning();

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
      "chatroom:unsentMessage",
      {
        senderUsername: username,
        message: {
          id: unsentMessage.id,
          chatroomID: unsentMessage.chatroomID,
          sender: unsentMessage.sender,
          //message: unsentMessage.message,
          validity: unsentMessage.validity,
        },
      },
    );

    return NextResponse.json(
      {
        id: unsentMessage.id,
        chatroomID: unsentMessage.chatroomID,
        sender: unsentMessage.sender,
        message: unsentMessage.message,
        validity: unsentMessage.validity,
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
