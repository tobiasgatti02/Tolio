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

// GET: Obtener todos los items con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")?.trim()
    const location = searchParams.get("location")?.trim()
    const category = searchParams.get("category")?.trim()
    const sort = searchParams.get("sort") || "recent"

    // Parámetros de búsqueda geográfica
    const userLat = searchParams.get("userLat")
    const userLng = searchParams.get("userLng")
    const radius = searchParams.get("radius")
    const hasGeoFilter = userLat && userLng && radius

    // Build WHERE clause efficiently
    const where: any = { isAvailable: true }

    // Use exact match for category when provided (more efficient than contains)
    if (category && category !== "all") {
      where.category = category
    }

    // Only add search if provided and has meaningful length
    if (search && search.length >= 2) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location && location.length >= 2) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Determine order efficiently
    let orderBy: any
    switch (sort) {
      case "price-low":
      case "price_asc":
        orderBy = { price: 'asc' }
        break
      case "price-high":
      case "price_desc":
        orderBy = { price: 'desc' }
        break
      case "rating":
        orderBy = { createdAt: 'desc' } // Sort by rating in-memory
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // OPTIMIZED QUERY: Only select fields we need
    const items = await prisma.item.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        priceType: true,
        category: true,
        location: true,
        latitude: true,
        longitude: true,
        images: true,
        features: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        _count: {
          select: { Review: true }
        }
      },
      take: hasGeoFilter ? 100 : 40, // Reduced limit for faster queries
    })

    // Get average ratings in a single query using aggregation
    const itemIds = items.map(i => i.id)
    const ratingsData = itemIds.length > 0
      ? await prisma.review.groupBy({
          by: ['itemId'],
          where: { itemId: { in: itemIds } },
          _avg: { rating: true },
        })
      : []

    // Create a Map for O(1) lookup
    const ratingsMap = new Map(
      ratingsData.map(r => [r.itemId, r._avg.rating])
    )

    // Transform items efficiently
    let formattedItems = items.map(item => {
      const avgRating = ratingsMap.get(item.id)
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        priceType: item.priceType,
        category: item.category,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        images: item.images,
        features: item.features,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : 0,
        reviewCount: item._count.Review,
        owner: {
          id: item.User.id,
          firstName: item.User.firstName,
          lastName: item.User.lastName,
          profileImage: item.User.profileImage,
        },
      }
    })

    // Sort by rating if requested
    if (sort === "rating") {
      formattedItems.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    }

    // Apply geo filter if coordinates provided
    if (hasGeoFilter) {
      const lat = parseFloat(userLat!)
      const lng = parseFloat(userLng!)
      const radiusKm = parseFloat(radius!)

      if (isValidCoordinates(lat, lng)) {
        formattedItems = formattedItems
          .map(item => {
            if (isValidCoordinates(item.latitude, item.longitude)) {
              const distance = calculateDistance(lat, lng, item.latitude!, item.longitude!)
              return { ...item, distance }
            }
            return { ...item, distance: undefined }
          })
          .filter(item => item.distance !== undefined && item.distance <= radiusKm)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, 40)
      }
    }

    return NextResponse.json(formattedItems, { headers: CACHE_HEADERS })
  } catch (err) {
    console.error("❌ Error fetching items:", err)
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    console.log("📦 Iniciando creación de item para usuario:", session.user.id)

    const formData = await request.formData()

    // Extraer campos del formulario
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const priceType = (formData.get('priceType') as string) || 'day'
    const deposit = parseFloat(formData.get('deposit') as string) || 0
    const location = formData.get('location') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    console.log("📝 Datos del formulario:", { title, category, price, priceType, location })

    // Validaciones estrictas
    if (!title || title.trim().length === 0) {
      console.error("❌ Título faltante o vacío")
      return NextResponse.json(
        { error: "El título es obligatorio" },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 10) {
      console.error("❌ Descripción inválida")
      return NextResponse.json(
        { error: "La descripción debe tener al menos 10 caracteres" },
        { status: 400 }
      )
    }

    if (!category || category.trim().length === 0) {
      console.error("❌ Categoría faltante")
      return NextResponse.json(
        { error: "La categoría es obligatoria" },
        { status: 400 }
      )
    }

    if (isNaN(price) || price <= 0) {
      console.error("❌ Precio inválido:", price)
      return NextResponse.json(
        { error: "El precio debe ser un número positivo" },
        { status: 400 }
      )
    }

    // Depósito de seguridad opcional - si no se proporciona, se asume 0
    const finalDeposit = isNaN(deposit) ? 0 : Math.max(0, deposit)

    if (!location || location.trim().length === 0) {
      console.error("❌ Ubicación faltante")
      return NextResponse.json(
        { error: "La ubicación es obligatoria" },
        { status: 400 }
      )
    }

    // Procesar imágenes con validación robusta
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []
    const rejectedImages: string[] = []
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    console.log(`🖼️  Procesando ${imageFiles.length} imágenes`)

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i]

        if (imageFile.size === 0) {
          console.log(`⏭️  Omitiendo archivo vacío ${i + 1}`)
          continue
        }

        // Validación de tipo
        if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
          console.warn(`⚠️  Formato no soportado: ${imageFile.type}. Solo se aceptan JPG, PNG y WebP. Omitiendo...`)
          continue
        }

        // Validación de tamaño (máximo 10MB)
        if (imageFile.size > 10 * 1024 * 1024) {
          console.warn(`⚠️  Imagen ${i + 1} demasiado grande (${(imageFile.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB. Omitiendo...`)
          continue
        }

        try {
          console.log(`📸 Procesando imagen ${i + 1}/${imageFiles.length}: ${imageFile.name} (${(imageFile.size / 1024).toFixed(2)}KB)`)

          const buffer = Buffer.from(await imageFile.arrayBuffer())

          // 🔒 MODERACIÓN DE CONTENIDO - Verificar que la imagen sea apropiada
          try {
            const moderationResult = await moderateImage(buffer)
            if (!moderationResult.isAllowed) {
              console.warn(`🚫 [Moderación] Imagen ${i + 1} rechazada: ${moderationResult.reason}`)
              rejectedImages.push(moderationResult.reason || 'Contenido inapropiado detectado')
              continue // Saltar esta imagen
            }
            console.log(`✅ [Moderación] Imagen ${i + 1} aprobada`)
          } catch (moderationError) {
            console.error(`⚠️ [Moderación] Error al moderar imagen ${i + 1}:`, moderationError)
            // Si falla la moderación, permitir la imagen (fail-open)
          }

          // Optimizar imagen con Sharp
          const optimizedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer()

          const base64 = optimizedBuffer.toString('base64')
          const dataUrl = `data:image/jpeg;base64,${base64}`

          imageUrls.push(dataUrl)
          console.log(`✅ Imagen ${i + 1} procesada correctamente (${(optimizedBuffer.length / 1024).toFixed(2)}KB)`)
        } catch (imageError) {
          console.error(`❌ Error procesando imagen ${i + 1}:`, imageError)
          // Continuar con las otras imágenes
          continue
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

    if (imageUrls.length === 0) {
      console.log("⚠️  No hay imágenes válidas, usando placeholder")
      imageUrls.push('/placeholder.svg')
    }

    console.log(`✅ ${imageUrls.length} imágenes listas para la base de datos`)

    // Crear item en la base de datos
    const newItem = await prisma.item.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price,
        priceType,
        deposit: finalDeposit,
        location: location.trim(),
        ...(latitude !== null && { latitude }),
        ...(longitude !== null && { longitude }),
        category: category.trim(),
        features,
        images: imageUrls,
        ownerId: session.user.id,
        isAvailable: true,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    })

    console.log("✅ Item creado exitosamente:", newItem.id)

    return NextResponse.json(newItem, { status: 201 })
  } catch (err) {
    console.error("❌ Error creando item:", err)
    return NextResponse.json(
      {
        error: "Error al crear el item",
        details: err instanceof Error ? err.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

// PUT: Actualizar item existente
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const itemId = formData.get('id') as string

    if (!itemId) {
      return NextResponse.json({ error: "ID del item es obligatorio" }, { status: 400 })
    }

    // Verificar que el usuario es el propietario
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
      select: { ownerId: true }
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
    }

    if (existingItem.ownerId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para editar este item" }, { status: 403 })
    }

    // Extraer campos
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const priceType = (formData.get('priceType') as string) || 'day'
    const deposit = parseFloat(formData.get('deposit') as string) || 0
    const location = formData.get('location') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? JSON.parse(featuresRaw) : []

    // Validaciones
    if (!title || !description || !category || isNaN(price) || price <= 0 || !location) {
      return NextResponse.json({ error: "Campos obligatorios faltantes o inválidos" }, { status: 400 })
    }

    // Procesar imágenes
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []
    const rejectedImages: string[] = []
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile.size === 0) continue

        if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
          console.warn(`⚠️  Formato no soportado: ${imageFile.type}. Omitiendo...`)
          continue
        }

        try {
          const buffer = Buffer.from(await imageFile.arrayBuffer())

          // 🔒 MODERACIÓN DE CONTENIDO
          try {
            const moderationResult = await moderateImage(buffer)
            if (!moderationResult.isAllowed) {
              console.warn(`🚫 [Moderación] Imagen rechazada: ${moderationResult.reason}`)
              rejectedImages.push(moderationResult.reason || 'Contenido inapropiado detectado')
              continue
            }
          } catch (moderationError) {
            console.error('[Moderación] Error al moderar imagen:', moderationError)
          }

          const optimizedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer()

          const base64 = optimizedBuffer.toString('base64')
          const dataUrl = `data:image/jpeg;base64,${base64}`

          imageUrls.push(dataUrl)
        } catch (imageError) {
          console.error('Error procesando imagen:', imageError)
          continue
        }
      }
    }

    // Si todas las imágenes nuevas fueron rechazadas
    if (rejectedImages.length > 0 && imageUrls.length === 0 && imageFiles.length > 0) {
      return NextResponse.json({
        error: "Todas las imágenes fueron rechazadas por contenido inapropiado",
        details: rejectedImages,
      }, { status: 400 })
    }

    // Actualizar item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        title: title.trim(),
        description: description.trim(),
        price,
        priceType,
        deposit,
        location: location.trim(),
        ...(latitude !== null && { latitude }),
        ...(longitude !== null && { longitude }),
        category: category.trim(),
        features,
        ...(imageUrls.length > 0 && { images: imageUrls }),
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (err) {
    console.error("Error actualizando item:", err)
    return NextResponse.json(
      {
        error: "Error al actualizar el item",
        details: err instanceof Error ? err.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

