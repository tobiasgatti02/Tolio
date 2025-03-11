import express from "express"
import { prisma } from "../index"
import { AppError } from "../middleware/errorHandler"
import multer from "multer"
import { uploadToS3 } from "../utils/s3"
import bcrypt from "bcrypt"

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Get current user profile
router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        phoneNumber: true,
        createdAt: true,
        isVerified: true,
      },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Get user's average rating
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: user.id,
      },
    })

    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0

    res.json({
      ...user,
      rating: averageRating,
      reviewCount: reviews.length,
    })
  } catch (error) {
    next(error)
  }
})

// Get user profile by ID (public)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Get user's average rating
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: id,
      },
    })

    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0

    // Get user's items
    const items = await prisma.item.findMany({
      where: {
        ownerId: id,
        isAvailable: true,
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json({
      ...user,
      rating: averageRating,
      reviewCount: reviews.length,
      memberSince: new Date(user.createdAt).getFullYear().toString(),
      items,
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put("/me", upload.single("profileImage"), async (req, res, next) => {
  try {
    const { firstName, lastName, bio, phoneNumber } = req.body

    const updateData: any = {
      firstName,
      lastName,
      bio,
      phoneNumber,
    }

    // Upload profile image if provided
    if (req.file) {
      const imageUrl = await uploadToS3(req.file)
      updateData.profileImage = imageUrl
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        phoneNumber: true,
        isVerified: true,
      },
    })

    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
})

// Change password
router.put("/change-password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401)
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        password: hashedPassword,
      },
    })

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})

// Get user notifications
router.get("/me/notifications", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(notifications)
  } catch (error) {
    next(error)
  }
})

// Mark notification as read
router.patch("/me/notifications/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new AppError("Notification not found", 404)
    }

    if (notification.userId !== req.user!.id) {
      throw new AppError("Not authorized to update this notification", 403)
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    })

    res.json(updatedNotification)
  } catch (error) {
    next(error)
  }
})

export default router

