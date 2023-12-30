import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";
import { Button } from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage () {
  const session = await auth();
  if (!session?.user?.email || session?.user?.email !== "admin@ntu.edu.tw") {
    redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/profile`);
  }
  return (
    <div className="flex flex-col p-4">
      <Link href="/admin-management/mission">
        <Button variant="contained" className="bg-blue-500 px-10 py-5 text-2xl">
          任務管理
        </Button>
      </Link>
    </div>
  )
}