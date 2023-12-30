import { getRestaurants } from '@/app/restaurants/_components/actions';
import { db } from '@/db';
import { restaurantsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const restaurants = await getRestaurants();
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { placeId } = reqBody;
    const imageUrls = await db.select({
      imageUrls: restaurantsTable.imageUrls
    })
      .from(restaurantsTable).where(eq(restaurantsTable.placeId, placeId))
      .execute();
    return NextResponse.json(imageUrls);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { placeId, imageUrl } = reqBody;
    //console.log(placeId,imageUrl);
    // Fetch the current list of image URLs
    const [restaurant] = await db
      .select({ imageUrls: restaurantsTable.imageUrls })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.placeId, placeId))
      .execute();

    if (restaurant) {
      // Parse the existing imageUrls (assuming they are stored as a JSON string)
      const currentImageUrls = JSON.parse(restaurant.imageUrls || '[]');
      //console.log(currentImageUrls);

      // Append the new imageUrl
      const updatedImageUrls = [...currentImageUrls, imageUrl];
      //console.log(updatedImageUrls);

      // Update the record with the new list of imageUrls
      await db
        .update(restaurantsTable)
        .set({ imageUrls: JSON.stringify(updatedImageUrls) })
        .where(eq(restaurantsTable.placeId, placeId))
        .execute();

      return NextResponse.json({ message: 'Image URL added successfully' });
    } else {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}