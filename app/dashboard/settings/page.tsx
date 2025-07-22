import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/utils"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Obtener información completa del usuario incluyendo datos de MercadoPago
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
      marketplaceAccessToken: true,
      marketplaceConnectedAt: true,
      marketplaceUserId: true,
    }
  })

  if (!user) {
    redirect('/login')
  }

  return <SettingsClient user={user} />
}
