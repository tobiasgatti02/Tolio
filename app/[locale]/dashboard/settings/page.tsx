import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Obtener información completa del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      bio: true,
      profileImage: true,
      stripeAccountId: true,
      stripeOnboarded: true,
      mercadopagoAccessToken: true,
      mercadopagoUserId: true,
      mercadopagoConnected: true,
      mercadopagoConnectedAt: true,
    }
  })

  if (!user) {
    redirect('/login')
  }

  return <SettingsClient user={user} />
}
