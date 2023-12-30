import { db } from "@/db";
import { restaurantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { placeId} = reqBody;

    if (typeof placeId !== 'string') {
      return NextResponse.json(
        { error: "placeId must be a string" },
        { status: 400 },
      )
    }

    const [pos] = await db
      .select({
        lat: restaurantsTable.latitude,
        lng: restaurantsTable.longitude,
      })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.placeId, placeId))
      .execute();
    return NextResponse.json(
      { lat: pos.lat, lng: pos.lng },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}