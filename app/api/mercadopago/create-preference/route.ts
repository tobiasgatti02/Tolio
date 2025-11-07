import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createPaymentPreference } from "@/lib/mercadopago";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    // Obtener la reserva con todos los datos necesarios
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                mercadopagoAccessToken: true, // Para marketplace split
                mercadopagoConnected: true,
              },
            },
          },
        },
        borrower: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario sea el borrower
    if (booking.borrower.email !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar que no exista ya un pago
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Ya existe un pago para esta reserva" },
        { status: 400 }
      );
    }

    // Verificar si el owner tiene MercadoPago configurado para marketplace split
    const ownerAccessToken = booking.item.owner.mercadopagoConnected && booking.item.owner.mercadopagoAccessToken
      ? booking.item.owner.mercadopagoAccessToken
      : undefined;

    console.log('[MercadoPago Create Preference]', {
      bookingId,
      ownerId: booking.item.owner.id,
      hasOwnerToken: !!ownerAccessToken,
      willUseMarketplaceSplit: !!ownerAccessToken,
    });

    // Crear preferencia de MercadoPago
    const preference = await createPaymentPreference({
      title: `Alquiler de ${booking.item.title}`,
      quantity: 1,
      unit_price: booking.totalPrice,
      bookingId: booking.id,
      userId: booking.borrower.id,
      itemId: booking.item.id,
      ownerAccessToken, // Si existe, se usará marketplace split con 5% fee
    });

    // Calcular comisiones
    const marketplaceFee = booking.totalPrice * 0.05; // 5%
    const ownerAmount = booking.totalPrice * 0.95; // 95%

    // Crear registro de pago en la base de datos
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        paymentProvider: "mercadopago",
        mercadopagoPreferenceId: preference.id,
        status: "PENDING",
        // Guardar las comisiones calculadas
        marketplaceFee,
        ownerAmount,
        marketplaceAmount: marketplaceFee,
      },
    });

    // Retornar la URL de pago de MercadoPago
    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
