import { desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { chatroomsTable, messagesTable } from "@/db/schema";

export const createChatroom = async (
  username: string,
  chatterUsername: string,
) => {
  "use server";
  console.log("[createChatroom]");

  try {
    const [newChat] = await db
      .insert(chatroomsTable)
      .values({
        user1name: username,
        user2name: chatterUsername,
      })
      .returning();

    return newChat.displayId;
  } catch (error) {
    return null;
  }
};

export const getChatrooms = async (username: string) => {
  "use server";

  const subQuery = db
    .select({
      chatroomID: messagesTable.chatroomID,
      message: messagesTable.message,
      id: messagesTable.id,
    })
    .from(messagesTable)
    .where(
      sql`(${messagesTable.chatroomID}, ${messagesTable.id}) IN (
    SELECT ${messagesTable.chatroomID}, MAX(${messagesTable.id})
    FROM ${messagesTable}
    GROUP BY ${messagesTable.chatroomID}
  )`,
    )
    .as("m_sub");

  const chatrooms = await db
    .select({
      user1name: chatroomsTable.user1name,
      user2name: chatroomsTable.user2name,
      chatroomID: chatroomsTable.displayId,
      message: subQuery.message,
      messageID: subQuery.id,
      pinnedMessage: messagesTable.message,
    })
    .from(chatroomsTable)
    .leftJoin(subQuery, eq(subQuery.chatroomID, chatroomsTable.displayId))
    .leftJoin(
      messagesTable,
      eq(chatroomsTable.pinnedMessageId, messagesTable.id),
    )
    .where(
      or(
        eq(chatroomsTable.user1name, username),
        eq(chatroomsTable.user2name, username),
      ),
    )
    .orderBy(desc(subQuery.id));

  return chatrooms;
};
