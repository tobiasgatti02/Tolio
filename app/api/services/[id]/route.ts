import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/utils"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                reviews: {
                    select: {
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                },
                provider: {
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
        const averageRating = service.reviews.length > 0
            ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
            : undefined

        const formattedService = {
            ...service,
            averageRating: averageRating !== undefined ? parseFloat(averageRating.toFixed(1)) : undefined,
            reviewCount: service.reviews.length,
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
