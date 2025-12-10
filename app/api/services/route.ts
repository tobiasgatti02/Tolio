import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import { calculateDistance, isValidCoordinates } from "@/lib/geo-utils"
import sharp from "sharp"
import { moderateImage } from "@/lib/image-moderation"

// Cache headers for CDN and browser caching
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
}

export async function GET(request: Request) {
  const apiStartTime = performance.now()
  console.log('⏱️ [API/SERVICES] Iniciando GET request...')
  
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")?.trim()
    const location = searchParams.get("location")?.trim()
    const category = searchParams.get("category")?.trim()
    const priceType = searchParams.get("priceType")
    const isProfessional = searchParams.get("professional") === 'true' || searchParams.get("isProfessional") === 'true'
    const sort = searchParams.get("sort") || "relevance"

    // Parámetros de búsqueda geográfica
    const userLat = searchParams.get("userLat")
    const userLng = searchParams.get("userLng")
    const radius = searchParams.get("radius")
    const hasGeoFilter = userLat && userLng && radius

    // Build WHERE clause efficiently
    const where: any = { isAvailable: true }

    if (category) {
      where.category = category
    }

    if (search && search.length >= 2) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location && location.length >= 2) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (priceType) {
      where.priceType = priceType
    }

    if (isProfessional) {
      where.isProfessional = true
    }

    // Determine order
    let orderBy: any
    switch (sort) {
      case "price-low":
        orderBy = { pricePerHour: "asc" }
        break
      case "price-high":
        orderBy = { pricePerHour: "desc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    const queryStartTime = performance.now()
    
    // SINGLE OPTIMIZED QUERY: Get services with provider and review aggregation
    const services = await prisma.service.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        category: true,
        pricePerHour: true,
        priceType: true,
        location: true,
        latitude: true,
        longitude: true,
        images: true,
        isProfessional: true,
        createdAt: true,
        provider: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: hasGeoFilter ? 100 : 40,
    })
    
    console.log(`⏱️ [API/SERVICES] Query principal: ${(performance.now() - queryStartTime).toFixed(2)}ms - ${services.length} servicios`)

    // Transform services - calculate ratings in-memory (faster than separate query)
    let formattedServices = services.map(service => {
      const reviews = service.reviews || []
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0
      
      return {
        id: service.id,
        title: service.title,
        category: service.category,
        pricePerHour: service.pricePerHour,
        priceType: service.priceType,
        location: service.location,
        latitude: service.latitude,
        longitude: service.longitude,
        images: service.images,
        isProfessional: service.isProfessional,
        provider: service.provider,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : 0,
        reviewCount: reviews.length,
      }
    })

    // Sort by rating if requested
    if (sort === "rating") {
      formattedServices.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    }

    // Apply geo filter if coordinates provided
    if (hasGeoFilter) {
      const lat = parseFloat(userLat!)
      const lng = parseFloat(userLng!)
      const radiusKm = parseFloat(radius!)

      if (isValidCoordinates(lat, lng)) {
        formattedServices = formattedServices
          .map(service => {
            if (isValidCoordinates(service.latitude, service.longitude)) {
              const distance = calculateDistance(lat, lng, service.latitude!, service.longitude!)
              return { ...service, distance }
            }
            return { ...service, distance: undefined }
          })
          .filter(service => service.distance !== undefined && service.distance <= radiusKm)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, 40)
      }
    }

    const totalTime = performance.now() - apiStartTime
    console.log(`✅ [API/SERVICES] Request completada en: ${totalTime.toFixed(2)}ms`)
    
    return NextResponse.json(formattedServices, { headers: CACHE_HEADERS })
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
    const rejectedImages: string[] = []

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

            // 🔒 MODERACIÓN DE CONTENIDO - Verificar que la imagen sea apropiada
            try {
              const moderationResult = await moderateImage(buffer)
              if (!moderationResult.isAllowed) {
                console.warn(`[Moderación] Imagen rechazada: ${moderationResult.reason}`)
                rejectedImages.push(moderationResult.reason || 'Contenido inapropiado detectado')
                continue // Saltar esta imagen
              }
            } catch (moderationError) {
              console.error('[Moderación] Error al moderar imagen:', moderationError)
              // Si falla la moderación, permitir la imagen (fail-open)
              // Puedes cambiar a 'continue' si prefieres rechazar en caso de error (fail-closed)
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

    // Si todas las imágenes fueron rechazadas por contenido inapropiado
    if (rejectedImages.length > 0 && imageUrls.length === 0 && imageFiles.length > 0) {
      return NextResponse.json({
        error: "Todas las imágenes fueron rechazadas por contenido inapropiado",
        details: rejectedImages,
      }, { status: 400 })
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
