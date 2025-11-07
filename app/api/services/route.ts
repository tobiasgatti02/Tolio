import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import sharp from "sharp"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const category = searchParams.get("category")
    const priceType = searchParams.get("priceType")
    const isProfessional = searchParams.get("isProfessional")
    const sort = searchParams.get("sort") || "relevance"
    
    const where: any = {
      isAvailable: true,
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { features: { has: search } }
      ]
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }
    
    if (priceType) {
      where.priceType = priceType
    }
    
    if (isProfessional === 'true') {
      where.isProfessional = true
    }
    
    let orderBy: any = {}
    if (sort === "rating") {
      // Will implement rating sorting later
      orderBy = { createdAt: "desc" }
    } else if (sort === "price-low") {
      orderBy = { pricePerHour: "asc" }
    } else if (sort === "price-high") {
      orderBy = { pricePerHour: "desc" }
    } else {
      orderBy = { createdAt: "desc" }
    }
    
    const services = await prisma.service.findMany({
      where,
      orderBy,
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        reviews: {
          select: {
            rating: true,
          }
        }
      }
    })
    
    const servicesWithStats = services.map(service => ({
      ...service,
      averageRating: service.reviews.length > 0
        ? service.reviews.reduce((acc, r) => acc + r.rating, 0) / service.reviews.length
        : 0,
      reviewCount: service.reviews.length
    }))
    
    return NextResponse.json(servicesWithStats)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const pricePerHour = formData.get('pricePerHour') ? parseFloat(formData.get('pricePerHour') as string) : null
    const priceType = (formData.get('priceType') as string) || 'hour'
    const isProfessional = formData.get('isProfessional') === 'true'
    const location = formData.get('location') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const serviceArea = formData.get('serviceArea') as string || null
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    // Validation
    if (!title || !description || !category || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (priceType === 'hour' && (!pricePerHour || pricePerHour <= 0)) {
      return NextResponse.json({ error: "Price per hour is required for hourly services" }, { status: 400 })
    }

    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []

    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0 && imageFile.type.startsWith('image/')) {
          try {
            const buffer = Buffer.from(await imageFile.arrayBuffer())
            
            // Validar formatos soportados
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
              console.warn(`Formato no soportado: ${imageFile.type}. Saltando...`)
              continue
            }
            
            // Guardar imagen original sin procesamiento (como la subió el usuario)
            const base64 = buffer.toString('base64')
            const mimeType = imageFile.type
            const dataUrl = `data:${mimeType};base64,${base64}`
            
            imageUrls.push(dataUrl)
          } catch (imageError) {
            console.error('Error procesando imagen:', imageError)
            // Continuar con las otras imágenes
            continue
          }
        }
      }
    }

    const newService = await prisma.service.create({
      data: {
        title,
        description,
        category,
        pricePerHour,
        priceType,
        isProfessional,
        location,
        latitude,
        longitude,
        serviceArea,
        features,
        images: imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'],
        providerId: session.user.id,
        isAvailable: true,
      }
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (err) {
    console.error("Error creating service:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ 
      error: "Failed to create service", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 })
  }
}
