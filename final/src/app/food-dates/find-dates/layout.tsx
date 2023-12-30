import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";
export default async function ChatsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session?.user?.id) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL + "/login");
  }

  return <>{children}</>;
}
