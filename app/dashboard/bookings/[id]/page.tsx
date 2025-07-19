import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import BookingDetailsClient from "./booking-details-client"

interface PageProps {
  params: {
    id: string
  }
}

export default async function BookingDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return <BookingDetailsClient bookingId={params.id} />
}
