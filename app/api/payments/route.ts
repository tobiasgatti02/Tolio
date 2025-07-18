import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { bookingId, paymentMethod } = await request.json()

    // Validar que la reserva existe y pertenece al usuario
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        borrowerId: session.user.id
      },
      include: {
        item: {
          include: {
            owner: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    if (paymentMethod === 'MERCADOPAGO') {
      // Integración con MercadoPago
      const preference = await createMercadoPagoPreference(booking)
      
      // Crear registro de pago
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentMethod: 'MERCADOPAGO',
          status: 'PENDING',
          stripePaymentId: preference.id
        }
      })

      return NextResponse.json({
        paymentId: payment.id,
        mercadoPagoUrl: preference.init_point,
        preferenceId: preference.id
      })

    } else if (paymentMethod === 'TRANSFER') {
      // Pago por transferencia - queda pendiente de verificación
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentMethod: 'TRANSFER',
          status: 'PENDING'
        }
      })

      // Crear notificación para el propietario
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_PENDING',
          content: `${session.user.name} realizó una transferencia por $${booking.totalPrice} para "${booking.item.title}". Verifica el pago en tu cuenta bancaria.`,
          userId: booking.item.ownerId
        }
      })

      // Crear notificación para el inquilino
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_PENDING',
          content: `Tu transferencia por $${booking.totalPrice} está pendiente de verificación. El propietario confirmará el pago pronto.`,
          userId: session.user.id
        }
      })

      return NextResponse.json({
        paymentId: payment.id,
        message: "Transferencia registrada. Pendiente de verificación por el propietario.",
        bankInfo: {
          accountNumber: "1234567890",
          accountType: "Cuenta Corriente",
          bank: "Banco Ejemplo",
          owner: booking.item.owner.firstName + " " + booking.item.owner.lastName,
          amount: booking.totalPrice,
          reference: booking.id
        }
      })
    }

    return NextResponse.json(
      { message: "Método de pago no válido" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error procesando pago:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Confirmar pago por transferencia (solo propietario)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { paymentId, confirmed } = await request.json()

    // Verificar que el pago existe y que el usuario es el propietario
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        booking: {
          item: {
            ownerId: session.user.id
          }
        }
      },
      include: {
        booking: {
          include: {
            borrower: true,
            item: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Pago no encontrado" },
        { status: 404 }
      )
    }

    if (confirmed) {
      // Confirmar pago
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'PAID' }
      })

      // Actualizar estado de la reserva
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CONFIRMED' }
      })

      // Notificar al inquilino
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          content: `¡Tu pago de $${payment.amount} ha sido confirmado! Tu reserva para "${payment.booking.item.title}" está activa.`,
          userId: payment.booking.borrowerId
        }
      })

      return NextResponse.json({
        message: "Pago confirmado exitosamente",
        booking: payment.booking
      })

    } else {
      // Rechazar pago
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      })

      // Notificar al inquilino
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_PENDING',
          content: `Tu transferencia de $${payment.amount} no fue verificada. Contacta al propietario para resolver el problema.`,
          userId: payment.booking.borrowerId
        }
      })

      return NextResponse.json({
        message: "Pago rechazado",
        booking: payment.booking
      })
    }

  } catch (error) {
    console.error("Error confirmando pago:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

async function createMercadoPagoPreference(booking: any) {
  // Simulación de integración con MercadoPago
  // En un entorno real, usarías el SDK de MercadoPago
  
  const preference = {
    id: `mp_${booking.id}_${Date.now()}`,
    init_point: `https://mercadopago.com/checkout/${booking.id}`,
    items: [
      {
        title: `Alquiler: ${booking.item.title}`,
        unit_price: booking.totalPrice,
        quantity: 1,
        currency_id: "ARS"
      }
    ],
    payer: {
      email: booking.borrower?.email
    },
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/dashboard/bookings?payment=success`,
      failure: `${process.env.NEXTAUTH_URL}/dashboard/bookings?payment=failure`,
      pending: `${process.env.NEXTAUTH_URL}/dashboard/bookings?payment=pending`
    },
    auto_return: "approved"
  }

  return preference
}
