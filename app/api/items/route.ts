import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import sharp from "sharp"

// GET: Obtener todos los items con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") || "recent"
    
    const where: any = {
      isAvailable: true,
    }
    
    // Aplicar filtro de búsqueda
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { features: { has: search } }
      ]
    }
    
    // Aplicar filtro de ubicación
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    
    // Aplicar filtro de categoría
    if (category && category !== "all") {
      where.category = category
    }
    
    // Determinar orden
    let orderBy: any = { createdAt: 'desc' }
    
    if (sort === "price-low") {
      orderBy = { price: 'asc' }
    } else if (sort === "price-high") {
      orderBy = { price: 'desc' }
    } else if (sort === "rating") {
      orderBy = { reviews: { _count: 'desc' } }
    }
    
    const items = await prisma.item.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      take: 50,
    })
    
    const formattedItems = items.map(item => {
      const averageRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
        : 0
        
      return {
        ...item,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: item.reviews.length,
        owner: {
          id: item.owner.id,
          name: `${item.owner.firstName} ${item.owner.lastName}`.trim(),
          image: item.owner.profileImage,
        },
      }
    })
    
    return NextResponse.json(formattedItems)
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
        owner: {
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
        owner: {
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

