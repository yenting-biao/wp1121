import { db } from "@/db";
import { missionListsTable, userFinishedMissionsTable, usersTable } from "@/db/schema";
import { and, desc, eq, gte, lte, notInArray } from "drizzle-orm";

export async function getLeaderBoard () {
  "use server";
  const res = await db
    .select({
      userId: usersTable.userId,
      username: usersTable.username,
      coins: usersTable.coins,
      ranking: usersTable.coins,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.coins), desc(usersTable.username))
    .limit(20)
    .execute();
  return res;
}

export async function getUnfinishedMission (userId: string) {
  "use server";
  const subQuery = await db
    .select({
      missionId: userFinishedMissionsTable.missionId,    
    })
    .from(userFinishedMissionsTable)
    .where(eq(userFinishedMissionsTable.userId, userId))
    .execute();  

  const missionIds = subQuery.map((q) => q.missionId);

  if (missionIds.length > 0) {
    const res = await db
    .select({
      missionId: missionListsTable.missionId,
      missionName: missionListsTable.missionName,
      missionDescription: missionListsTable.missionDescription,
      relatedPlaceId: missionListsTable.relatedPlaceId,
      prize: missionListsTable.prize,
      startAt: missionListsTable.startAt,
      endAt: missionListsTable.endAt,      
    })
    .from(missionListsTable)
    .where(and(gte(missionListsTable.endAt, new Date()), lte(missionListsTable.startAt, new Date()), notInArray(missionListsTable.missionId, missionIds)))
    .execute();
    return res;
  } else {
    const res = await db
    .select({
      missionId: missionListsTable.missionId,
      missionName: missionListsTable.missionName,
      missionDescription: missionListsTable.missionDescription,
      relatedPlaceId: missionListsTable.relatedPlaceId,
      prize: missionListsTable.prize,
      startAt: missionListsTable.startAt,
      endAt: missionListsTable.endAt,      
    })
    .from(missionListsTable)
    .where(gte(missionListsTable.endAt, new Date()))
    .execute();
    return res;
  }
}

export async function getFinishedMission (userId: string) {
  "use server";
  const res = await db
    .select({
      missionId: userFinishedMissionsTable.missionId,
      missionName: missionListsTable.missionName,
      missionDescription: missionListsTable.missionDescription,
      relatedPlaceId: missionListsTable.relatedPlaceId,
      prize: missionListsTable.prize,
      startAt: missionListsTable.startAt,
      endAt: missionListsTable.endAt,
    })
    .from(userFinishedMissionsTable)
    .innerJoin(missionListsTable, eq(userFinishedMissionsTable.missionId, missionListsTable.missionId))
    .where(and(gte(missionListsTable.endAt, new Date()), lte(missionListsTable.startAt, new Date()), eq(userFinishedMissionsTable.userId, userId)))
    .orderBy(desc(userFinishedMissionsTable.finishedAt))
    .execute();
  return res;
}