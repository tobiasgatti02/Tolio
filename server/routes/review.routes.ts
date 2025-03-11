import express from "express"
import { prisma } from "../index"
import { AppError } from "../middleware/errorHandler"
import { createNotification } from "../utils/notifications"

const router = express.Router()

// Get reviews for an item
router.get("/item/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params

    const reviews = await prisma.review.findMany({
      where: {
        itemId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(reviews)
  } catch (error) {
    next(error)
  }
})

// Get reviews for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: userId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(reviews)
  } catch (error) {
    next(error)
  }
})

// Create a review
router.post("/", async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body

    // Check if booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: true,
        review: true,
      },
    })

    if (!booking) {
      throw new AppError("Booking not found", 404)
    }

    if (booking.status !== "COMPLETED") {
      throw new AppError("Cannot review a booking that is not completed", 400)
    }

    // Check if user is the borrower
    if (booking.borrowerId !== req.user!.id) {
      throw new AppError("Not authorized to review this booking", 403)
    }

    // Check if review already exists
    if (booking.review) {
      throw new AppError("Review already exists for this booking", 400)
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400)
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        booking: {
          connect: { id: bookingId },
        },
        item: {
          connect: { id: booking.itemId },
        },
        reviewer: {
          connect: { id: req.user!.id },
        },
        reviewee: {
          connect: { id: booking.ownerId },
        },
      },
    })

    // Create notification
    await createNotification({
      userId: booking.ownerId,
      type: "REVIEW_RECEIVED",
      content: `You received a review for "${booking.item.title}"`,
    })

    res.status(201).json(review)
  } catch (error) {
    next(error)
  }
})

export default router

