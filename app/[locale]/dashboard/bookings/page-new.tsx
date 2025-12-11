import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import BookingsClient from "./bookings-client"

export const metadata = {
  title: "Mis Reservas | Tolio",
  description: "Gestiona tus reservas y alquileres",
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }

  return <BookingsClient userId={session.user.id} />
}
