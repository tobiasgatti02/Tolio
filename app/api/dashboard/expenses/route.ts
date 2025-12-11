import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"



const calculateBookingPrice = (booking: {
  price: number
  startDate: Date
  endDate: Date
}) => {
  const days = Math.ceil(
    (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return booking.price * days
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "month"

  // Calculate date range
  const now = new Date()
  const startDate = new Date()

  if (range === "week") {
    startDate.setDate(now.getDate() - 7)
  } else if (range === "month") {
    startDate.setMonth(now.getMonth() - 1)
  } else if (range === "year") {
    startDate.setFullYear(now.getFullYear() - 1)
  }

  try {
    // Fetch bookings where the user is the borrower
    const bookings = await prisma.booking.findMany({
      where: {
        borrowerId: session.user.id,
        startDate: {
          gte: startDate,
        },
      },
      include: {
        Item: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    })

    // Calculate expenses
    const totalExpenses = bookings.reduce(
      (sum: number, b) =>
        sum +
        calculateBookingPrice({
          price: b.Item.price,
          startDate: b.startDate,
          endDate: b.endDate,
        }),
      0
    )
    const itemsExpenses = totalExpenses // All are items for now
    const servicesExpenses = 0 // Placeholder for ServiceBooking

    // Group by month
    const monthlyExpensesMap = new Map<string, { items: number; services: number }>()

    bookings.forEach((booking) => {
      const month = new Intl.DateTimeFormat("es-AR", {
        month: "short",
        year: "numeric",
      }).format(new Date(booking.startDate))

      const expense = calculateBookingPrice({
        price: booking.Item.price,
        startDate: booking.startDate,
        endDate: booking.endDate,
      })

      if (!monthlyExpensesMap.has(month)) {
        monthlyExpensesMap.set(month, { items: 0, services: 0 })
      }

      const monthData = monthlyExpensesMap.get(month)!
      monthData.items += expense
    })

    const monthlyExpenses = Array.from(monthlyExpensesMap.entries())
      .map(([month, data]) => ({
        month,
        items: data.items,
        services: data.services,
      }))
      .sort((a, b) => {
        const aDate = new Date(a.month)
        const bDate = new Date(b.month)
        return aDate.getTime() - bDate.getTime()
      })

    // Get top expenses
    const topExpenses = bookings
      .map((booking) => ({
        name: booking.Item.title,
        amount: calculateBookingPrice({
          price: booking.Item.price,
          startDate: booking.startDate,
          endDate: booking.endDate,
        }),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return NextResponse.json({
      totalExpenses,
      itemsExpenses,
      servicesExpenses,
      totalBookings: bookings.length,
      itemsBookings: bookings.length,
      servicesBookings: 0,
      monthlyExpenses,
      topExpenses,
    })
  } catch (error) {
    console.error("Error fetching expenses data:", error)
    return NextResponse.json(
      { error: "Failed to fetch expenses data" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
