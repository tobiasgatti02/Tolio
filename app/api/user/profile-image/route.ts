import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: "No se proporcionó imagen" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Formato no soportado. Solo se aceptan JPG, PNG y WebP." },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe ser menor a 10MB." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Optimizar y redimensionar imagen (crear un cuadrado centrado para foto de perfil)
    const optimizedBuffer = await sharp(buffer)
      .resize({ 
        width: 400, 
        height: 400, 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    const base64 = optimizedBuffer.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`

    // Actualizar usuario con la nueva imagen
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: dataUrl },
      select: {
        id: true,
        profileImage: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      profileImage: updatedUser.profileImage 
    })
  } catch (error) {
    console.error("Error uploading profile image:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Eliminar la imagen de perfil
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting profile image:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
