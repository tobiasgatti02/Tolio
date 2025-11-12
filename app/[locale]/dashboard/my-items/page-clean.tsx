import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import MyItemsClient from "./my-items-client";

export const metadata = {
  title: "Mis Artículos | Tolio",
  description: "Gestiona tus artículos y prestamos",
};

export default async function MyItemsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/my-items");
  }

  return <MyItemsClient userId={session.user.id} />;
}