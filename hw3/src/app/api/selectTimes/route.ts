import { NextResponse, type NextRequest } from "next/server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { selectActivityTimeTable } from "@/db/schema";

const  selectTimeRequestSchema = z.object({
  userHandle: z.string().min(1).max(50),
  tweetId: z.number().positive(),
  selectedTime: z.string().min(1).max(50).optional(),
});

type SelectTimeRequest = z.infer<typeof selectTimeRequestSchema>;

const deleteAllTimeRequestSchema = z.object({
  userHandle: z.string().min(1).max(50),
  tweetId: z.number().positive(),
});

type deleteAllTimeRequest = z.infer<typeof deleteAllTimeRequestSchema>;

export async function GET(request: NextRequest) {
  const data = await request.json();

  try {
     selectTimeRequestSchema.parse(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, selectedTime } = data as SelectTimeRequest;

  try {
    const [exist] = await db
      .select({ dummy: sql`1` })
      .from( selectActivityTimeTable)
      .where(
        and(
          eq( selectActivityTimeTable.tweetId, tweetId),
          eq( selectActivityTimeTable.userHandle, userHandle),
          eq( selectActivityTimeTable.selectTime, selectedTime!),
        ),
      )
      .execute();
    return NextResponse.json({ liked: Boolean(exist) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
     selectTimeRequestSchema.parse(data);
  } catch (error) {
    console.log("ERROR in selectTimes/route.ts", error);
    console.log(data);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, selectedTime } = data as SelectTimeRequest;

  try {
    await db
      .insert(selectActivityTimeTable)
      .values({
        userHandle,
        tweetId,
        selectTime: selectedTime!
      })
      .onConflictDoNothing()
      .execute();
  } catch (error) {
    console.log("ERROR in selectTimes/route.ts", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
     selectTimeRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, selectedTime } = data as SelectTimeRequest;

  try {
    if(selectedTime){
      await db
      .delete(selectActivityTimeTable)
      .where(
        and(
          eq(selectActivityTimeTable.tweetId, tweetId),
          eq(selectActivityTimeTable.userHandle, userHandle),
          eq(selectActivityTimeTable.selectTime, selectedTime),
        ),
      )
      .execute();
    }else{
      await db
      .delete(selectActivityTimeTable)
      .where(
        and(
          eq(selectActivityTimeTable.tweetId, tweetId),
          eq(selectActivityTimeTable.userHandle, userHandle),
        ),
      )
      .execute();
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}

export async function DELETE_ALL(request: NextRequest) {
  const data = await request.json();

  try {
     deleteAllTimeRequestSchema.parse(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle } = data as deleteAllTimeRequest;

  try {
    await db
      .delete(selectActivityTimeTable)
      .where(
        and(
          eq(selectActivityTimeTable.tweetId, tweetId),
          eq(selectActivityTimeTable.userHandle, userHandle),
        ),
      )
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}
