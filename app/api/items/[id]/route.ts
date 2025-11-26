import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/utils"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                reviews: {
                    select: {
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                },
                owner: {
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

        if (!item) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            )
        }

        // Calcular rating promedio
        const averageRating = item.reviews.length > 0
            ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
            : 0

        const formattedItem = {
            ...item,
            averageRating: parseFloat(averageRating.toFixed(1)),
            reviewCount: item.reviews.length,
            owner: {
                id: item.owner.id,
                name: `${item.owner.firstName} ${item.owner.lastName}`.trim(),
                image: item.owner.profileImage,
            },
        }

        return NextResponse.json(formattedItem)
    } catch (error) {
        console.error("Error fetching item:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
