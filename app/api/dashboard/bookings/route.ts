import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
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
    console.error('Error in dashboard bookings API:', error)
    return NextResponse.json(
      { message: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}
