import { db } from "@/db";
import { tagOwnersTable, taggedRestaurantsTable, tagsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";


async function getTagId(tagName: string) {
    const newTag = await db.insert(tagsTable)
        .values({
            tagName: tagName
        })
        .returning()
        .execute();


    return newTag[0].tagId;
}

// tag a restaurant
export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const { userId, placeId, tagName } = reqBody;
        //console.log(reqBody);
        const tagId = await getTagId(tagName);
        //console.log(tagId);
        // Insert record in tagOwnersTable
        await db.insert(tagOwnersTable)
            .values({
                tagId: tagId,
                ownerId: userId
            })
            .execute();
        // Insert record in taggedRestaurantsTable
        await db.insert(taggedRestaurantsTable).values({
            tagId: tagId,
            placeId: placeId
        }).execute();
        return new NextResponse('OK', { status: 200 });
    }
    catch (error) {
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const { userId, placeId,tagName } = reqBody;

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

        // Perform delete operation for each common tagId
        for (const tagId of commonTagIds) {
            await db.delete(tagOwnersTable)
                .where(and(eq(tagOwnersTable.ownerId, userId), eq(tagOwnersTable.tagId, tagId)))
                .execute();

            await db.delete(taggedRestaurantsTable)
                .where(and(eq(taggedRestaurantsTable.placeId, placeId), eq(taggedRestaurantsTable.tagId, tagId)))
                .execute();
            //console.log(tagsTable.tagId, tagId,tagsTable.tagName,tagName)
            await db.delete(tagsTable).where(and(eq(tagsTable.tagId, tagId),eq(tagsTable.tagName,tagName))).execute();
        }
        return new NextResponse('OK', { status: 200 });
    }
    catch (error) {
        console.error("Error in DELETE request:", error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}



