import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import BookingsClientEnhanced from "./bookings-client-enhanced"

export const metadata = {
  title: "Mis Reservas | Tolio",
  description: "Gestiona tus reservas de herramientas y servicios",
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }

  return <BookingsClientEnhanced userId={session.user.id} />
}
