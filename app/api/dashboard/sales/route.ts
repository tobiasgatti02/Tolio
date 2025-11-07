import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get("range") || "month"

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    if (range === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (range === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (range === "year") {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Get items bookings (completed)
    const itemsBookings = await prisma.booking.findMany({
      where: {
        item: {
          ownerId: session.user.id
        },
        status: "COMPLETED",
        endDate: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        item: {
          select: {
            title: true,
            price: true
          }
        }
      }
    })

    // Get services bookings (completed) - when ServiceBooking model exists
    // For now using placeholder
    const servicesBookings: any[] = []

    // Calculate totals
    const calculateBookingPrice = (booking: any) => {
      const days = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))
      return booking.item.price * Math.max(days, 1)
    }
    
    const itemsRevenue = itemsBookings.reduce((sum, b) => sum + calculateBookingPrice(b), 0)
    const servicesRevenue = servicesBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    const totalRevenue = itemsRevenue + servicesRevenue

    // Calculate monthly sales
    const monthlySales = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthName = monthDate.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthItems = itemsBookings.filter(b => {
        const date = new Date(b.endDate)
        return date >= monthStart && date <= monthEnd
      }).reduce((sum, b) => sum + calculateBookingPrice(b), 0)
      
      const monthServices = 0 // Placeholder
      
      monthlySales.push({
        month: monthName,
        items: monthItems,
        services: monthServices
      })
    }

    // Top items
    const itemsMap = new Map<string, number>()
    itemsBookings.forEach(b => {
      const title = b.item.title
      itemsMap.set(title, (itemsMap.get(title) || 0) + calculateBookingPrice(b))
    })
    
    const topItems = Array.from(itemsMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top services (placeholder)
    const topServices = [
      { name: "Servicio ejemplo 1", revenue: 0 },
      { name: "Servicio ejemplo 2", revenue: 0 },
      { name: "Servicio ejemplo 3", revenue: 0 },
    ]

    return NextResponse.json({
      totalRevenue,
      itemsRevenue,
      servicesRevenue,
      totalSales: itemsBookings.length + servicesBookings.length,
      itemsSales: itemsBookings.length,
      servicesSales: servicesBookings.length,
      monthlySales,
      topItems: topItems.length > 0 ? topItems : [{ name: "Sin datos", revenue: 0 }],
      topServices
    })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
