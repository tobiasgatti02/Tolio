import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NotificationsClient from "./notifications-client";

export const metadata = {
  title: "Notificaciones | Tolio",
  description: "Todas tus notificaciones",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/notifications");
  }

  return <NotificationsClient userId={session.user.id} />;
}
