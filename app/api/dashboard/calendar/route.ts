import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()))

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

    // Fetch all bookings for the user in this month
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ borrowerId: session.user.id }, { ownerId: session.user.id }],
        AND: [
          {
            startDate: {
              lte: endOfMonth,
            },
          },
          {
            endDate: {
              gte: startOfMonth,
            },
          },
        ],
      },
      include: {
        item: {
          select: {
            title: true,
          },
        },
      },
    })

    const events = bookings.map((booking) => ({
      id: booking.id,
      title: booking.item.title,
      startDate: booking.startDate,
      endDate: booking.endDate,
      type: "item",
      status: booking.status,
    }))

    // TODO: Add ServiceBooking when model is created

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 })
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
