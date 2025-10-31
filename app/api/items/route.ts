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
    const type = searchParams.get("type") // Filter by SERVICE or TOOL
    // const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined  // Comentado
    // const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined  // Comentado
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
      where.category = { contains: category, mode: 'insensitive' }
    }
    
    // Apply type filter (SERVICE or TOOL)
    if (type) {
      where.type = type
    }
    
    // Apply price filters - Comentado para futuras funcionalidades
    // if (minPrice !== undefined) {
    //   where.price = { ...where.price, gte: minPrice }
    // }
    // if (maxPrice !== undefined) {
    //   where.price = { ...where.price, lte: maxPrice }
    // }
    
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
        ? item.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / item.reviews.length
        : 0
        
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        type: (item as any).type || 'SERVICE', // SERVICE or TOOL
        // price: item.price,   // Comentado - para futuras funcionalidades
        location: item.location,
        category: item.category, // Return the category string directly
        rating: parseFloat(averageRating.toFixed(1)),
        reviews: item.reviews.length,
        features: item.features,
        images: item.images,
        createdAt: item.createdAt,
      }
    })
    
    return NextResponse.json(formattedItems)
  } catch (err) {
    console.error("Error fetching items:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("Starting item creation...")
    console.log("Session user:", session.user)
    
    // Verify that the user exists in the database, create if not exists
    let userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, firstName: true, lastName: true }
    })
    
    if (!userExists) {
      console.log("User not found in database, creating user:", session.user.id)
      
      // Extract name parts
      const fullName = session.user.name || 'Usuario Anónimo'
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'Usuario'
      const lastName = nameParts.slice(1).join(' ') || 'Anónimo'
      
      userExists = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `${session.user.id}@tolio.app`,
          firstName,
          lastName,
          password: '', // Empty password since auth is handled by NextAuth
          profileImage: session.user.image,
        },
        select: { id: true, firstName: true, lastName: true }
      })
      
      console.log("User created:", userExists)
    } else {
      console.log("User exists in DB:", userExists)
    }
    
    const formData = await request.formData()
    
    // Extract text fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = (formData.get('type') as string) || 'SERVICE'
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const priceType = (formData.get('priceType') as string) || 'hour'
    const deposit = parseFloat(formData.get('deposit') as string) || 0
    const location = formData.get('location') as string
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    console.log("Form data extracted:", { title, description, type, category, location, features })

    // Basic validation
    if (!title || !description || !category || isNaN(price) || price <= 0 || !location) {
      console.log("Validation failed: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
    console.log("Creating item with data:", {
      title,
      description,
      type,
      price,
      priceType,
      deposit,
      location,
      features,
      imageCount: imageUrls.length,
      ownerId: session.user.id,
      category: category,
    })
    
    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        type: type as any, // SERVICE or TOOL
        price,
        priceType,
        deposit,
        location,
        features,
        images: imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'],
        ownerId: session.user.id,
        isAvailable: true,
        category: category,
      }
    })

    console.log("Item created successfully:", newItem.id)
    return NextResponse.json(newItem, { status: 201 })
  } catch (err) {
    console.error("Error creating item:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ 
      error: "Failed to create item", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    var itemId = formData.get('id') as string
    // Extract text fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const deposit = parseFloat(formData.get('deposit') as string)
    const location = formData.get('location') as string
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    // Basic validation
    if (!title || !description || !category || isNaN(price) || isNaN(deposit) || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }    const imageFiles = formData.getAll('images') as File[]
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
    const newItem = await prisma.item.update({
      where: { id: itemId },
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
        category: category,
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (err) {
    console.error("Error creating item:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ 
      error: "Failed to create item", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 })
  }
}

