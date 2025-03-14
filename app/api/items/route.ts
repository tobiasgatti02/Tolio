import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'
import sharp from "sharp"

export async function GET(request: Request) {
  try {
    // Parse the URL to extract search parameters
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined
    const sort = searchParams.get("sort") || "relevance"
    
    // Build the Prisma query conditions
    const where: any = {
      isAvailable: true,
    }
    
    // Apply search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { features: { has: search } }
      ]
    }
    
    // Apply location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    
    // Apply category filter
    if (category) {
      const categoryObj = await prisma.category.findUnique({
        where: { name: category }
      })
      
      if (categoryObj) {
        where.categoryId = categoryObj.id
      }
    }
    
    // Apply price filters
    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice }
    }
    
    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice }
    }
    
    // Determine the sort order
    let orderBy: any = {}
    switch (sort) {
      case "price_asc":
        orderBy = { price: 'asc' }
        break
      case "price_desc":
        orderBy = { price: 'desc' }
        break
      case "rating":
        orderBy = { reviews: { _count: 'desc' } }
        break
      case "newest":
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' } // Default sort
    }
    
    // Execute the query with filters
    const items = await prisma.item.findMany({
      where,
      orderBy,
      include: {
        category: true,
        reviews: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    })
    
    // Process the results to format them for the frontend
    const formattedItems = items.map(item => {
      // Calculate average rating
      const averageRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / item.reviews.length
        : 0
        
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        category: item.category?.name, // Return the category name, not the object
        rating: parseFloat(averageRating.toFixed(1)),
        reviews: item.reviews.length,
        features: item.features,
        images: item.images,
        createdAt: item.createdAt,
      }
    })
    
    return NextResponse.json(formattedItems)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    
    // Extract text fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryName = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const deposit = parseFloat(formData.get('deposit') as string)
    const location = formData.get('location') as string
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    // Basic validation
    if (!title || !description || !categoryName || isNaN(price) || isNaN(deposit) || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the category by name to get its ID
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
      select: { id: true }
    })

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []

    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          // Resize and compress image before storing
          const buffer = Buffer.from(await imageFile.arrayBuffer())
          
          // Optimize the image - resize to max 800px width and compress
          const optimizedBuffer = await sharp(buffer)
            .resize({ width: 800, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer()
          
          // Convert to more efficient base64
          const base64 = optimizedBuffer.toString('base64')
          const mimeType = "image/jpeg" // Consistently use JPEG
          const dataUrl = `data:${mimeType};base64,${base64}`
          
          imageUrls.push(dataUrl)
        }
      }
    }

    // Create the item in the database
    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        price,
        deposit,
        location,
        features,
        images: imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'],
        ownerId: session.user.id,
        isAvailable: true,
        categoryId: category.id,
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}

// REMOVED: The ItemsLayout component that was causing circular dependencies