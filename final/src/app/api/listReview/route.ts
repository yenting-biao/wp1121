import { db } from "@/db";
import { reviewsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
        const reqBody = await req.json();
        const {placeId} = reqBody;
        //console.log(placeId);

        //const listReviews = await db.select().from(reviewsTable).
        //  where(eq(reviewsTable.placeId, placeId)).execute();

        const listReviews = await db.select().from(reviewsTable).fullJoin(usersTable, eq(usersTable.userId, reviewsTable.reviewerId)).where(eq(reviewsTable.placeId, placeId));
        return  NextResponse.json({listReviews},{ status: 200 });

}