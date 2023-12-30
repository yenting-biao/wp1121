import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { editProfileSchema } from "@/validators/profile";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/types/db";

interface extenedUser extends User {
  oldPassword: string;
  newPassword: string;
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  try {    
    const session = await auth();
    if (!session || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    // Parse the request body
    const reqBody = await req.json();
    let validatedReqBody: Partial<extenedUser>; // TODO: this is temporary
    try {
      validatedReqBody = editProfileSchema.parse(reqBody);
    } catch (error) {
      console.log("parse error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    //console.log("validatedReqBody:", validatedReqBody);

    if (validatedReqBody.oldPassword && validatedReqBody.newPassword) {
      const [userExistence] = await db
        .select({
          email: usersTable.ntuEmail,
          oldPassword: usersTable.hashedPassword,
        })
        .from(usersTable)
        .where(eq(usersTable.ntuEmail, email));
      
      if (!userExistence) {
        console.log("email", email);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isValid = await bcrypt.compare(validatedReqBody.oldPassword, userExistence.oldPassword);
      if (!isValid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } 
      await db
        .update(usersTable)
        .set({ hashedPassword: await bcrypt.hash(validatedReqBody.newPassword, 10) })
        .where(eq(usersTable.ntuEmail, email));
      
      return NextResponse.json({ status: 200 });
    }

    let toBeUpdated = {};
    if (validatedReqBody.username) {
      toBeUpdated = {
        ...toBeUpdated,
        username: validatedReqBody.username,
      };
    }
    if (validatedReqBody.bio) {
      toBeUpdated = {
        ...toBeUpdated,
        bio: validatedReqBody.bio,
      };
    }
    if (validatedReqBody.avatarUrl) {
      toBeUpdated = {
        ...toBeUpdated,
        avatarUrl: validatedReqBody.avatarUrl,
      };
    }
    if (validatedReqBody.coins) {
      const currentCoins = session.user.coins;
      toBeUpdated = {
        ...toBeUpdated,
        coins: currentCoins + validatedReqBody.coins,
      };
    }

    if (Object.keys(toBeUpdated).length === 0) {
      return NextResponse.json({ error: "Bad Request. At least one thing should be modified." }, { status: 400 });
    }

    await db
      .update(usersTable)
      .set(toBeUpdated)
      .where(eq(usersTable.ntuEmail, email));

    return NextResponse.json(      
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}