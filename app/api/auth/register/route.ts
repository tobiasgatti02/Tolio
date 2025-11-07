import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from '@prisma/client'
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

const prisma = new PrismaClient()

// Validar y normalizar número de teléfono argentino
function validateAndNormalizePhone(phone: string): { isValid: boolean; normalizedPhone?: string; error?: string } {
  if (!phone) return { isValid: true } // Teléfono es opcional
  
  // Remover espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // Patrones para números argentinos
  const patterns = [
    /^\+54(9)?(\d{10})$/, // +54911XXXXXXXX o +549XXXXXXXXXX
    /^54(9)?(\d{10})$/,   // 54911XXXXXXXX o 549XXXXXXXXXX
    /^(9)?(\d{10})$/,     // 911XXXXXXXX o 9XXXXXXXXXX
    /^(9)?1(\d{8})$/,     // 91XXXXXXXX o 1XXXXXXXX (Buenos Aires)
    /^(\d{8})$/,          // XXXXXXXX (solo área metropolitana)
  ]

  for (const pattern of patterns) {
    const match = cleanPhone.match(pattern)
    if (match) {
      // Normalizar al formato +54 9 XXX XXX XXXX
      let areaCode = ''
      let number = ''
      
      if (match[2]) {
        // Tiene código de área completo
        number = match[2]
        areaCode = number.substring(0, 3)
        number = number.substring(3)
      } else if (match[1] && match[1].length === 8) {
        // Solo número de 8 dígitos (área metropolitana)
        areaCode = '011'
        number = match[1]
      }
      
      // Validar que el número tenga la longitud correcta
      if (number.length === 7 || number.length === 8) {
        const normalizedPhone = `+54 9 ${areaCode} ${number.substring(0, 4)} ${number.substring(4)}`
        return { isValid: true, normalizedPhone }
      }
    }
  }
  
  return { 
    isValid: false, 
    error: "Formato de teléfono inválido. Use formato argentino: +54 9 11 1234 5678" 
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone
    } = body

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Formato de email inválido" },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Validar teléfono si se proporciona
    let normalizedPhone = null
    if (phone) {
      const phoneValidation = validateAndNormalizePhone(phone)
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { message: phoneValidation.error },
          { status: 400 }
        )
      }
      normalizedPhone = phoneValidation.normalizedPhone

      // Verificar que el teléfono no esté en uso
      const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber: normalizedPhone }
      })

      if (existingPhone) {
        return NextResponse.json(
          { message: "Este número de teléfono ya está registrado" },
          { status: 409 }
        )
      }
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Este email ya está registrado" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: normalizedPhone,
        isVerified: false,
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })

    // Enviar email de verificación
    try {
      await sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken,
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // No fallar el registro si el email falla
    }

    return NextResponse.json(
      { 
        message: "Usuario creado exitosamente. Por favor verifica tu email.",
        user,
        requiresVerification: true
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
