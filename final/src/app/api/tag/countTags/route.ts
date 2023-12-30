import { db } from "@/db";
import { tagOwnersTable, tagsTable, taggedRestaurantsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const { userId } = reqBody;

        const result = await db.select({
            placeId: taggedRestaurantsTable.placeId
        })
        .from(tagOwnersTable)
        .innerJoin(tagsTable, eq(tagOwnersTable.tagId, tagsTable.tagId))
        .innerJoin(taggedRestaurantsTable, eq(tagOwnersTable.tagId, taggedRestaurantsTable.tagId))
        .where(eq(tagOwnersTable.ownerId, userId))
        .execute();

        return new NextResponse(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error("Error in API request:", error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
