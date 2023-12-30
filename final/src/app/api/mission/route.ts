import { db } from "@/db";
import { userFinishedMissionsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { finishMissionSchema } from "@/validators/mission";
import { NextResponse, type NextRequest } from "next/server";

// POST /api/mission
export async function POST (req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    const reqBody = await req.json();
    let validatedReqBody: {
      missionId: string;
    };
    try {
      validatedReqBody = finishMissionSchema.parse(reqBody);
    } catch (error) {
      console.log("error:", error);
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const [mission] = await db
      .insert(userFinishedMissionsTable)
      .values({
        userId: userId,
        missionId: validatedReqBody.missionId,
      })
      .returning();
    
    return NextResponse.json(
      { mission },
      { status: 200 },
    )
    
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}