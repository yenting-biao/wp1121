import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { chatroomsTable, messagesTable } from "@/db/schema";

export async function getMessages(chatroomID: string) {
  const messages = await db
    .select({
      id: messagesTable.id,
      chatroomID: messagesTable.chatroomID,
      sender: messagesTable.sender,
      message: messagesTable.message,
      validity: messagesTable.validity,
    })
    .from(messagesTable)
    .where(eq(messagesTable.chatroomID, chatroomID))
    .orderBy(asc(messagesTable.id));
  const messagesWithIdAsString = messages.map((message) => ({
    ...message,
    id: message.id.toString(),
  }));

  return messagesWithIdAsString;
}

export async function sendMessages(
  username: string,
  chatroomID: string,
  message: string,
) {
  await db.insert(messagesTable).values({
    chatroomID: chatroomID,
    sender: username,
    message: message,
  });
}

export async function getPinnedMessage(chatroomId: string) {
  const res = await db
    .select({
      pinnedMessage: messagesTable.message,
    })
    .from(messagesTable)
    .innerJoin(
      chatroomsTable,
      eq(chatroomsTable.pinnedMessageId, messagesTable.id),
    )
    .where(eq(messagesTable.chatroomID, chatroomId));

  return res;
}

export async function getChatroomInfo(chatroomId: string) {
  const [res] = await db
    .select({
      user1name: chatroomsTable.user1name,
      user2name: chatroomsTable.user2name,
    })
    .from(chatroomsTable)
    .where(eq(chatroomsTable.displayId, chatroomId));

  return res;
}
