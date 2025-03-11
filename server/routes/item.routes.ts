import express from "express"
import { prisma } from "../index"
import { authenticateToken } from "../middleware/auth"
import { AppError } from "../middleware/errorHandler"
import multer from "multer"
import { uploadToS3 } from "../utils/s3"

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Get all items with filtering
router.get("/", async (req, res, next) => {
  try {
    const { category, location, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // Build filter object
    const filter: any = { isAvailable: true }

    if (category) {
      filter.category = category as string
    }

    if (location) {
      filter.location = {
        contains: location as string,
        mode: "insensitive",
      }
    }

    if (minPrice) {
      filter.price = {
        ...filter.price,
        gte: Number(minPrice),
      }
    }

    if (maxPrice) {
      filter.price = {
        ...filter.price,
        lte: Number(maxPrice),
      }
    }

    if (search) {
      filter.OR = [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search as string,
            mode: "insensitive",
          },
        },
      ]
    }

    // Get items
    const items = await prisma.item.findMany({
      where: filter,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate average rating for each item
    const itemsWithRating = items.map((item) => {
      const totalRatings = item.reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = item.reviews.length > 0 ? totalRatings / item.reviews.length : 0

      return {
        ...item,
        averageRating,
        reviewCount: item.reviews.length,
        reviews: undefined, // Remove reviews array
      }
    })

    // Get total count for pagination
    const totalItems = await prisma.item.count({
      where: filter,
    })

    res.json({
      items: itemsWithRating,
      pagination: {
        total: totalItems,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalItems / Number(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get item by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            createdAt: true,
          },
        },
        reviews: {
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
        },
      },
    })

    if (!item) {
      throw new AppError("Item not found", 404)
    }

    // Calculate average rating
    const totalRatings = item.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = item.reviews.length > 0 ? totalRatings / item.reviews.length : 0

    // Get owner's average rating
    const ownerReviews = await prisma.review.findMany({
      where: {
        revieweeId: item.owner.id,
      },
    })

    const ownerTotalRatings = ownerReviews.reduce((sum, review) => sum + review.rating, 0)
    const ownerAverageRating = ownerReviews.length > 0 ? ownerTotalRatings / ownerReviews.length : 0

    // Format response
    const response = {
      ...item,
      averageRating,
      owner: {
        ...item.owner,
        rating: ownerAverageRating,
        reviewCount: ownerReviews.length,
        memberSince: new Date(item.owner.createdAt).getFullYear().toString(),
      },
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
})

// Create a new item (protected route)
router.post("/", authenticateToken, upload.array("images", 5), async (req, res, next) => {
  try {
    const { title, description, price, deposit, category, location, features } = req.body

    const files = req.files as Express.Multer.File[]

    // Upload images to S3
    const imageUrls = await Promise.all(files.map((file) => uploadToS3(file)))

    // Create item
    const item = await prisma.item.create({
      data: {
        title,
        description,
        price: Number.parseFloat(price),
        deposit: Number.parseFloat(deposit),
        category,
        location,
        features: features ? JSON.parse(features) : [],
        images: imageUrls,
        owner: {
          connect: { id: req.user!.id },
        },
      },
    })

    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
})

// Update an item (protected route)
router.put("/:id", authenticateToken, upload.array("images", 5), async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description, price, deposit, category, location, features, isAvailable, keepImages } = req.body

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findUnique({
      where: { id },
    })

    if (!existingItem) {
      throw new AppError("Item not found", 404)
    }

    if (existingItem.ownerId !== req.user!.id) {
      throw new AppError("Not authorized to update this item", 403)
    }

    const files = req.files as Express.Multer.File[]
    let imageUrls: string[] = []

    // Keep existing images if specified
    if (keepImages) {
      const keepImagesArray = JSON.parse(keepImages)
      imageUrls = existingItem.images.filter((url) => keepImagesArray.includes(url))
    }

    // Upload new images to S3
    if (files.length > 0) {
      const newImageUrls = await Promise.all(files.map((file) => uploadToS3(file)))
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    // Update item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? Number.parseFloat(price) : undefined,
        deposit: deposit ? Number.parseFloat(deposit) : undefined,
        category,
        location,
        features: features ? JSON.parse(features) : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    })

    res.json(updatedItem)
  } catch (error) {
    next(error)
  }
})

// Delete an item (protected route)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findUnique({
      where: { id },
    })

    if (!existingItem) {
      throw new AppError("Item not found", 404)
    }

    if (existingItem.ownerId !== req.user!.id) {
      throw new AppError("Not authorized to delete this item", 403)
    }

    // Check if item has active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        itemId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    })

    if (activeBookings.length > 0) {
      throw new AppError("Cannot delete item with active bookings", 400)
    }

    // Delete item
    await prisma.item.delete({
      where: { id },
    })

    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router

