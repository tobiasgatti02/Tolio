import express from "express"
import { prisma } from "../index"
import { AppError } from "../middleware/errorHandler"
import { createNotification } from "../utils/notifications"

const router = express.Router()

// Get user's bookings (as borrower)
router.get("/my-bookings", async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        borrowerId: req.user!.id,
      },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(bookings)
  } catch (error) {
    next(error)
  }
})

// Get bookings for user's items (as owner)
router.get("/received-bookings", async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ownerId: req.user!.id,
      },
      include: {
        item: true,
        borrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(bookings)
  } catch (error) {
    next(error)
  }
})

// Get booking by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
        borrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        payment: true,
        review: true,
      },
    })

    if (!booking) {
      throw new AppError("Booking not found", 404)
    }

    // Check if user is authorized to view this booking
    if (booking.borrowerId !== req.user!.id && booking.ownerId !== req.user!.id) {
      throw new AppError("Not authorized to view this booking", 403)
    }

    res.json(booking)
  } catch (error) {
    next(error)
  }
})

// Create a new booking
router.post("/", async (req, res, next) => {
  try {
    const { itemId, startDate, endDate } = req.body

    // Check if item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      throw new AppError("Item not found", 404)
    }

    if (!item.isAvailable) {
      throw new AppError("Item is not available for booking", 400)
    }

    // Check if user is not booking their own item
    if (item.ownerId === req.user!.id) {
      throw new AppError("Cannot book your own item", 400)
    }

    // Check if dates are valid
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      throw new AppError("End date must be after start date", 400)
    }

    if (start < new Date()) {
      throw new AppError("Start date cannot be in the past", 400)
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        itemId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            // New booking starts during existing booking
            startDate: {
              lte: end,
            },
            endDate: {
              gte: start,
            },
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      throw new AppError("Item is not available for the selected dates", 400)
    }

    // Calculate total price
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = item.price * days

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        startDate: start,
        endDate: end,
        totalPrice,
        item: {
          connect: { id: itemId },
        },
        borrower: {
          connect: { id: req.user!.id },
        },
        owner: {
          connect: { id: item.ownerId },
        },
      },
    })

    // Create notification for owner
    await createNotification({
      userId: item.ownerId,
      type: "BOOKING_REQUEST",
      content: `You have a new booking request for "${item.title}"`,
    })

    res.status(201).json(booking)
  } catch (error) {
    next(error)
  }
})

// Update booking status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        item: true,
      },
    })

    if (!booking) {
      throw new AppError("Booking not found", 404)
    }

    // Check if user is authorized to update this booking
    if (status === "CONFIRMED" || status === "CANCELLED") {
      // Only the owner can confirm or cancel a booking
      if (booking.ownerId !== req.user!.id) {
        throw new AppError("Not authorized to update this booking", 403)
      }
    } else if (status === "COMPLETED") {
      // Only the borrower can mark a booking as completed
      if (booking.borrowerId !== req.user!.id) {
        throw new AppError("Not authorized to update this booking", 403)
      }
    } else {
      throw new AppError("Invalid status", 400)
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    // Create notification
    if (status === "CONFIRMED") {
      await createNotification({
        userId: booking.borrowerId,
        type: "BOOKING_CONFIRMED",
        content: `Your booking for "${booking.item.title}" has been confirmed`,
      })
    } else if (status === "CANCELLED") {
      await createNotification({
        userId: booking.borrowerId,
        type: "BOOKING_CANCELLED",
        content: `Your booking for "${booking.item.title}" has been cancelled`,
      })
    }

    res.json(updatedBooking)
  } catch (error) {
    next(error)
  }
})

export default router

