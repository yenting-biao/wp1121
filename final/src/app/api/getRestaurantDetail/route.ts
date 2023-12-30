import { db } from "@/db";
import { restaurantTypesTable,restaurantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
        const reqBody = await req.json();
        const {placeId} = reqBody;
        //console.log(placeId);

        const restaurantDetail = await db.query.restaurantTypesTable.findMany({
          where: eq(restaurantTypesTable.placeId, placeId),
        });

        return  NextResponse.json({restaurantDetail},{ status: 200 });

}