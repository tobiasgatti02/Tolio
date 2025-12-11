import { NextResponse, NextRequest } from "next/server"
import { getAppSession } from "@/lib/session"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') as 'all' | 'active' | 'completed' | null

    const bookings = await DashboardService.getUserBookings(
      session.user.id,
      filter || 'all'
    )

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error in dashboard bookings API:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
