import { prisma } from "@/lib/utils"
import { cache } from "react"


export const getUser = cache(async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                profileImage: true,
            }
        })

        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user")
    }
})