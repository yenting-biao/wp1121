import { db } from "@/db";
import { reviewsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
    const reqBody = await req.json();
    const { placeId, reviewerId, stars, content, expense,reviewDate } = reqBody;

    try {
        const newReview = await db.insert(reviewsTable).values({
            placeId: placeId,
            reviewerId: reviewerId,
            stars: stars,
            content: content,
            expense: expense,
            createdAt: reviewDate,
        }).returning().execute();

        return NextResponse.json({ newReview }, { status: 200 });
    } catch (error) {
        // Handle errors, such as database connection issues
        console.error('Error inserting data into reviewsTable:', error);
        return NextResponse.json({ error: 'Error inserting review.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest){
    const reqBody = await req.json();
    const {reviewId} = reqBody;
    try {
        await db
          .delete(reviewsTable)
          .where(
              eq(reviewsTable.reviewId, reviewId),
          )
          .execute();
      } catch (error) {
        return NextResponse.json(
          { error: "Error Deleting Rev" },
          { status: 500 },
        );
      }
    
      return new NextResponse("OK", { status: 200 });
    }

