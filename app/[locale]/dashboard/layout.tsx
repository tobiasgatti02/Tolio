import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import CleanDashboard from "./components/clean-dashboard"

export const metadata = {
  title: "Dashboard | Tolio",
  description: "Tu panel personal de Tolio - Gestiona tus artículos, reservas y más",
}

export default async function DashboardLayout({ 
  children,
  params
}: { 
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await getServerSession(authOptions)
  const { locale } = await params
  
  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <CleanDashboard user={session.user}>
      {children}
    </CleanDashboard>
  )
}
