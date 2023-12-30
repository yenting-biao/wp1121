import DateList from "./_components/DateList";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";
import {
  dateParticipantsTable,
  datesTable,
  privateMessagesTable,
  usersTable,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";

export type datePreviewType = {
  dateId: string;
  title: string;
  lastMessage: string | null;
  avatarUrls: { username: string; avatarUrl: string | null }[];
};

const chineseNumbers = ["一", "二", "三", "四"];

async function getDateDetails(dateId: string) {
  const participantUsernamesRet = await db
    .select({
      username: usersTable.username,
    })
    .from(dateParticipantsTable)
    .leftJoin(
      usersTable,
      eq(dateParticipantsTable.participantId, usersTable.userId)
    )
    .where(eq(dateParticipantsTable.dateId, dateId))
    .execute();

  const participantUsernames = participantUsernamesRet.map(
    (obj) => obj.username
  );
  const participantCount = participantUsernames.length;
  let userList = "";
  for (let i = 0; i < participantCount - 1; i++)
    userList += (participantUsernames[i] ?? "[已刪除]") + ", ";
  userList += participantUsernames[participantCount - 1];
  const title = chineseNumbers[participantCount - 1] + "人團：" + userList;

  const [lastMessage] = await db
    .select({
      senderUsername: usersTable.username,
      content: privateMessagesTable.content,
    })
    .from(privateMessagesTable)
    .where(eq(privateMessagesTable.dateId, dateId))
    .leftJoin(usersTable, eq(usersTable.userId, privateMessagesTable.senderId))
    .orderBy(desc(privateMessagesTable.sentAt))
    .limit(1)
    .execute();

  const avatarUrls = await db
    .select({ username: usersTable.username, avatarUrl: usersTable.avatarUrl })
    .from(dateParticipantsTable)
    .innerJoin(
      usersTable,
      eq(usersTable.userId, dateParticipantsTable.participantId)
    )
    .where(eq(dateParticipantsTable.dateId, dateId))
    .execute();

  return {
    dateId,
    title,
    lastMessage: !lastMessage
      ? null
      : (lastMessage.content.slice(0,7) === "server:" ? lastMessage.content.slice(7) : ((lastMessage.senderUsername ?? "[已刪除]") + ": " + lastMessage.content)),
    avatarUrls,
  };
}

export default async function ChatsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL + "/login");
  }
  const userId = session.user.id;

  const dateIdsRet = await db
    .select({
      dateId: dateParticipantsTable.dateId,
    })
    .from(dateParticipantsTable)
    .where(eq(dateParticipantsTable.participantId, userId))
    .innerJoin(datesTable, eq(dateParticipantsTable.dateId, datesTable.dateId))
    .orderBy(desc(datesTable.createdAt))
    .execute();

  const dateIds = dateIdsRet.map((obj) => obj.dateId);

  const dates: datePreviewType[] = [];

  const dateCount = dateIds.length;
  for (let i = 0; i < dateCount; i++) {
    const ret = await getDateDetails(dateIds[i]);
    dates.push(ret);
  }

  return (
    <div className="flex flex-row h-full bg-white">
      <DateList dates={dates} />
      {children}
    </div>
  );
}
