import { db } from "@/db";
import { tagOwnersTable, taggedRestaurantsTable, tagsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const { userId, placeId, tagName } = reqBody;

        // Fetch tagIds from tagOwnersTable for the given userId
        const tagIdsFromOwner = await db.select({
            tagId: tagOwnersTable.tagId
        }).from(tagOwnersTable)
            .where(eq(tagOwnersTable.ownerId, userId))
            .execute();

        // Fetch tagIds from taggedRestaurantsTable for the given placeId
        const tagIdsFromRestaurant = await db.select({
            tagId: taggedRestaurantsTable.tagId
        }).from(taggedRestaurantsTable)
            .where(eq(taggedRestaurantsTable.placeId, placeId))
            .execute();

        // Find common tagId
        const commonTagIds = tagIdsFromOwner
            .map(owner => owner.tagId)
            .filter(tagId => tagIdsFromRestaurant.some(restaurant => restaurant.tagId === tagId));
        //console.log(commonTagIds);
        for (const tagId of commonTagIds) {
            const tag = await db.select({
                tagName: tagsTable.tagName
            }).from(tagsTable)
                .where(eq(tagsTable.tagId, tagId))
                .execute();
            if (tag[0]?.tagName === tagName) {
                return new NextResponse(JSON.stringify({ message: "true" }), { status: 200 });
            }
        }
        return new NextResponse(JSON.stringify({ message: "false" }), { status: 200 });
    }
    catch (error) {
        console.error("Error in DELETE request:", error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}