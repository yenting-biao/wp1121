import { db } from "@/db";
import { missionListsTable, restaurantsTable } from "@/db/schema";
import { and, asc, gte, lte, sql } from "drizzle-orm";

export async function getInProgressMission() {
  "use server";
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
    .where(and(lte(missionListsTable.startAt, new Date()), gte(missionListsTable.endAt, new Date())))
    .orderBy(asc(missionListsTable.endAt), asc(missionListsTable.startAt))
    .execute();
  return res;
}

export async function getFutureMission() {
  "use server";
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
    .where(gte(missionListsTable.startAt, new Date()))
    .orderBy(asc(missionListsTable.startAt), asc(missionListsTable.endAt))
    .execute();
  return res;
}

export async function getPastMission() {
  "use server";
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
    .where(lte(missionListsTable.endAt, new Date()))
    .orderBy(asc(missionListsTable.endAt), asc(missionListsTable.startAt))
    .execute();
  return res;
}

export async function getRandomPlaceId() {
  "use server";
  const [res] = await db
    .select({
      name: restaurantsTable.name,
      placeId: restaurantsTable.placeId,
      address: restaurantsTable.address,
    })
    .from(restaurantsTable)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .execute();
  return res;
}