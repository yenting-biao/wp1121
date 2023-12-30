import { db } from "@/db";
import { missionListsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type Mission } from "@/lib/types/db";
import { deleteMissionSchema, missionSchema } from "@/validators/mission";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

// POST /api/admin-management/mission
export async function POST(req: NextRequest) {
  try {    
    const session = await auth();
    if (!session || !session?.user?.email || session.user.email !== "admin@ntu.edu.tw") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const reqBody = await req.json();
    let validatedReqBody: Omit<Mission, "missionId">; 
    try {
      validatedReqBody = missionSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const [mission] = await db
      .insert(missionListsTable)
      .values({
        missionName: validatedReqBody.missionName,
        missionDescription: validatedReqBody.missionDescription,
        relatedPlaceId: validatedReqBody.relatedPlaceId,
        prize: Number(validatedReqBody.prize),
        startAt: new Date(validatedReqBody.startAt),
        endAt: new Date(validatedReqBody.endAt),      
      })
      .returning();

    return NextResponse.json(   
      { mission },   
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

// DELETE /api/admin-management/mission
export async function DELETE(req: NextRequest) {
  try {    
    const session = await auth();
    if (!session || !session?.user?.email || session.user.email !== "admin@ntu.edu.tw") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const reqBody = await req.json();
    let validatedReqBody: {
      missionId: string;
    };     
    try {
      validatedReqBody = deleteMissionSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    await db
      .delete(missionListsTable)
      .where(eq(missionListsTable.missionId, validatedReqBody.missionId));

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