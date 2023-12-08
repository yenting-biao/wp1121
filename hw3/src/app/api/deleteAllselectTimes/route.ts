import { NextResponse, type NextRequest } from "next/server";

import { and, eq, } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { selectActivityTimeTable } from "@/db/schema";

const deleteAllTimeRequestSchema = z.object({
  userHandle: z.string().min(1).max(50),
  tweetId: z.number().positive(),
});

type deleteAllTimeRequest = z.infer<typeof deleteAllTimeRequestSchema>;

export async function DELETE(request: NextRequest) {
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
