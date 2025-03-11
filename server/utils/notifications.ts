import { prisma } from "../index"
import type { NotificationType } from "@prisma/client"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  content: string
}

export const createNotification = async ({ userId, type, content }: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        content,
        user: {
          connect: { id: userId },
        },
      },
    })

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

