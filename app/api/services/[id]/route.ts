import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                ServiceReview: {
                    select: {
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                },
                User: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                        phoneNumber: true,
                    },
                },
            },
        })

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            )
        }

        // Calcular rating promedio
        const averageRating = service.ServiceReview.length > 0
            ? service.ServiceReview.reduce((sum: number, review: {rating: number}) => sum + review.rating, 0) / service.ServiceReview.length
            : undefined

        const formattedService = {
            ...service,
            averageRating: averageRating !== undefined ? parseFloat(averageRating.toFixed(1)) : undefined,
            reviewCount: service.ServiceReview.length,
            provider: service.User,
        }

        return NextResponse.json(formattedService)
    } catch (error) {
        console.error("Error fetching service:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
