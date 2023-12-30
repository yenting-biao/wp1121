import { db } from "@/db";
import { restaurantTypesTable, restaurantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type postBody = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];
}

export async function POST (req: NextRequest) {
  try {
    const reqBody: postBody = await req.json();
    const { placeId, name, address, latitude, longitude, types } = reqBody;

    const check = await db
      .select({
        placeId: restaurantsTable.placeId,
      })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.placeId, placeId));
    if (check.length > 0) {
      return NextResponse.json(
        { message: "Restaurant already in db." },
        { status: 302 }
      );
    }

    await db
      .insert(restaurantsTable)
      .values({
        placeId,
        name,
        address,
        latitude,
        longitude,
      })
      .returning();

    for(let i = 0; i < types.length; i++) {
      if (types[i] == "establishment" || types[i] == "point_of_interest" || types[i] == "food") {
        continue;
      }
      await db
      .insert(restaurantTypesTable)
      .values({
        placeId: placeId,
        type: types[i],
      })
    }    

    return NextResponse.json(
      { status: 200 }
    )
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}