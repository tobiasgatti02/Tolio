import { NextResponse } from "next/server"
import { getAppSession } from "@/lib/session"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET() {
  try {
    const session = await getAppSession()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const stats = await DashboardService.getUserStats(session.user.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in dashboard stats API:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
