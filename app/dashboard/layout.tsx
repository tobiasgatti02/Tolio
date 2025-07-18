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
}: { 
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <CleanDashboard user={session.user}>
      {children}
    </CleanDashboard>
  )
}
