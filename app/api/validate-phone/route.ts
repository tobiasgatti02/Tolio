import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Validar y normalizar número de teléfono argentino
function validateAndNormalizePhone(phone: string): { isValid: boolean; normalizedPhone?: string; error?: string } {
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Número de teléfono requerido" },
        { status: 400 }
      )
    }

    // Validar formato
    const validation = validateAndNormalizePhone(phoneNumber)
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      )
    }

    // Verificar que no esté en uso por otro usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: validation.normalizedPhone,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Este número de teléfono ya está registrado por otro usuario" },
        { status: 409 }
      )
    }

    // Actualizar el número de teléfono del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneNumber: validation.normalizedPhone }
    })

    return NextResponse.json({
      success: true,
      phoneNumber: validation.normalizedPhone,
      message: "Número de teléfono actualizado exitosamente"
    })

  } catch (error) {
    console.error("Error validando teléfono:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Validar teléfono sin guardarlo (para formularios)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone')

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Número de teléfono requerido" },
        { status: 400 }
      )
    }

    const validation = validateAndNormalizePhone(phoneNumber)
    
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      })
    }

    // Verificar disponibilidad
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: validation.normalizedPhone
      }
    })

    return NextResponse.json({
      isValid: true,
      normalizedPhone: validation.normalizedPhone,
      isAvailable: !existingUser,
      message: existingUser ? "Este número ya está registrado" : "Número disponible"
    })

  } catch (error) {
    console.error("Error validando teléfono:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
