import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validar los datos
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "El email ya está registrado" }, { status: 400 })
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    })

    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ message: "Error al registrar usuario" }, { status: 500 })
  }
}

