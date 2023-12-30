import { db } from "@/db";

import { restaurantsTable, reviewsTable,restaurantTypesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getRestaurants = async () => {
    "use server";
    const restaurants = await db
        .select({
          placeId: restaurantsTable.placeId,
          name: restaurantsTable.name,
          address: restaurantsTable.address,
          latitude: restaurantsTable.latitude,
          longitude: restaurantsTable.longitude,
          imageUrls: restaurantsTable.imageUrls,
        })
        .from(restaurantsTable)
        .execute();

    return restaurants;
};

