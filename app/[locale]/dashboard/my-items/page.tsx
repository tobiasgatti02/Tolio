import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import MyContentClient from "./my-content-client";

export const metadata = {
  title: "Mis Publicaciones | Tolio",
  description: "Gestiona tus herramientas y servicios publicados",
};

export default async function MyItemsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/my-items");
  }

  return <MyContentClient userId={session.user.id} />;
}