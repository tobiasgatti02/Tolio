import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/utils"
import sharp from "sharp"
import { moderateImage } from "@/lib/image-moderation"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                Review: {
                    select: {
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                },
                User: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                        phoneNumber: true,
                    },
                },
            },
        })

        if (!item) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            )
        }

        // Calcular rating promedio
        const averageRating = item.Review.length > 0
            ? item.Review.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / item.Review.length
            : undefined

        const formattedItem = {
            ...item,
            averageRating: averageRating !== undefined ? parseFloat(averageRating.toFixed(1)) : undefined,
            reviewCount: item.Review.length,
            owner: {
                id: item.User.id,
                name: `${item.User.firstName} ${item.User.lastName}`.trim(),
                image: item.User.profileImage,
            },
        }

        return NextResponse.json(formattedItem)
    } catch (error) {
        console.error("Error fetching item:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PUT: Actualizar un item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            )
        }

        const { id } = await params

        // Verificar que el item existe y pertenece al usuario
        const existingItem = await prisma.item.findUnique({
            where: { id },
            select: { ownerId: true },
        })

        if (!existingItem) {
            return NextResponse.json(
                { error: "Item no encontrado" },
                { status: 404 }
            )
        }

        if (existingItem.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "No tienes permiso para editar este artículo" },
                { status: 403 }
            )
        }

        const formData = await request.formData()

        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const category = formData.get("category") as string
        const price = parseFloat(formData.get("price") as string)
        const deposit = parseFloat(formData.get("deposit") as string || "0")
        const location = formData.get("location") as string
        const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null
        const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null
        const features = JSON.parse(formData.get("features") as string || "[]")
        const existingImages = JSON.parse(formData.get("existingImages") as string || "[]")
        const newImages = formData.getAll("images") as File[]

        // Validaciones
        if (!title || !description || !category || isNaN(price) || !location) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 }
            )
        }

        // Procesar nuevas imágenes
        const processedNewImages: string[] = []
        
        for (let i = 0; i < newImages.length; i++) {
            const image = newImages[i]
            
            if (image && image.size > 0) {
                const buffer = Buffer.from(await image.arrayBuffer())
                const originalSize = buffer.length / 1024

                console.log(`📸 Procesando imagen ${i + 1}/${newImages.length}: ${image.name} (${originalSize.toFixed(2)}KB)`)

                // Moderar la imagen
                const moderationResult = await moderateImage(buffer)
                
                if (!moderationResult.isApproved) {
                    console.log(`❌ [Moderación] Imagen ${i + 1} rechazada: ${moderationResult.reason}`)
                    return NextResponse.json(
                        { 
                            error: `La imagen ${i + 1} fue rechazada: ${moderationResult.reason}`,
                            code: "IMAGE_MODERATION_FAILED"
                        },
                        { status: 400 }
                    )
                }
                
                console.log(`✅ [Moderación] Imagen ${i + 1} aprobada`)

                // Optimizar imagen
                const optimizedBuffer = await sharp(buffer)
                    .resize(1200, 1200, {
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer()

                const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString("base64")}`
                processedNewImages.push(base64Image)

                console.log(`✅ Imagen ${i + 1} procesada correctamente (${(optimizedBuffer.length / 1024).toFixed(2)}KB)`)
            }
        }

        // Combinar imágenes existentes con nuevas
        const allImages = [...existingImages, ...processedNewImages]

        if (allImages.length === 0) {
            return NextResponse.json(
                { error: "Debe haber al menos una imagen" },
                { status: 400 }
            )
        }

        // Actualizar el item
        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                title,
                description,
                category,
                price,
                deposit: deposit || 0,
                location,
                latitude,
                longitude,
                features,
                images: allImages,
            },
        })

        console.log(`✅ Item actualizado exitosamente: ${updatedItem.id}`)

        return NextResponse.json(updatedItem)
    } catch (error) {
        console.error("Error updating item:", error)
        return NextResponse.json(
            { error: "Error al actualizar el artículo" },
            { status: 500 }
        )
    }
}

// DELETE: Eliminar un item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            )
        }

        const { id } = await params

        // Verificar que el item existe y pertenece al usuario
        const existingItem = await prisma.item.findUnique({
            where: { id },
            select: { ownerId: true },
        })

        if (!existingItem) {
            return NextResponse.json(
                { error: "Item no encontrado" },
                { status: 404 }
            )
        }

        if (existingItem.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "No tienes permiso para eliminar este artículo" },
                { status: 403 }
            )
        }

        // Verificar si hay reservas activas
        const activeBookings = await prisma.booking.count({
            where: {
                itemId: id,
                status: {
                    in: ['PENDIENTE', 'CONFIRMADA'],
                },
            },
        })

        if (activeBookings > 0) {
            return NextResponse.json(
                { 
                    error: "No puedes eliminar un artículo con reservas activas",
                    code: "HAS_ACTIVE_BOOKINGS"
                },
                { status: 400 }
            )
        }

        await prisma.item.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Artículo eliminado exitosamente" })
    } catch (error) {
        console.error("Error deleting item:", error)
        return NextResponse.json(
            { error: "Error al eliminar el artículo" },
            { status: 500 }
        )
    }
}
