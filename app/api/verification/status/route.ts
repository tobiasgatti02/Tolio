import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/verification/status
 * Obtiene el estado de verificación de un usuario
 */
export async function GET(req: NextRequest) {
  console.log('🔍 [VERIFICATION-STATUS] Obteniendo estado de verificación');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ [VERIFICATION-STATUS] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user.id;

    console.log('✅ [VERIFICATION-STATUS] Buscando verificación para usuario:', userId);

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verifiedIdentity: true,
        verifications: {
          where: { type: 'IDENTITY' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      console.log('❌ [VERIFICATION-STATUS] Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const latestVerification = user.verifications[0] || null;

    console.log('📊 [VERIFICATION-STATUS] Estado encontrado:', {
      verifiedIdentity: user.verifiedIdentity,
      hasVerification: !!latestVerification,
      status: latestVerification?.status
    });

    return NextResponse.json({
      verifiedIdentity: user.verifiedIdentity,
      hasVerification: !!latestVerification,
      status: latestVerification?.status || null,
      verificationId: latestVerification?.id || null,
      verifiedAt: latestVerification?.verifiedAt || null,
      createdAt: latestVerification?.createdAt || null
    });

  } catch (error) {
    console.error('❌ [VERIFICATION-STATUS] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de verificación' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
