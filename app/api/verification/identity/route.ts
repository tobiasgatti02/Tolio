import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { compareFacesForBackend } from '@/lib/face-matching';

const prisma = new PrismaClient();

interface PDF417Data {
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  expirationDate: string;
  rawData: string;
}

/**
 * POST /api/verification/identity
 * Recibe selfie, foto del DNI y datos del PDF417 para verificación
 */
export async function POST(req: NextRequest) {
  console.log('🔐 [IDENTITY-VERIFICATION] Iniciando proceso de verificación');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ [IDENTITY-VERIFICATION] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ [IDENTITY-VERIFICATION] Usuario autenticado:', session.user.id);

    const formData = await req.formData();
    const selfieFile = formData.get('selfie') as File;
    const dniFile = formData.get('dniFront') as File;
    const pdf417Data = formData.get('pdf417Data') as string;

    if (!selfieFile || !dniFile || !pdf417Data) {
      console.log('❌ [IDENTITY-VERIFICATION] Datos incompletos:', {
        hasSelfie: !!selfieFile,
        hasDni: !!dniFile,
        hasPdf417: !!pdf417Data
      });
      return NextResponse.json(
        { error: 'Se requiere selfie, foto del DNI y datos del PDF417' },
        { status: 400 }
      );
    }

    console.log('📄 [IDENTITY-VERIFICATION] Datos recibidos:');
    console.log('  - Selfie:', selfieFile.name, selfieFile.size, 'bytes');
    console.log('  - DNI:', dniFile.name, dniFile.size, 'bytes');

    // Parsear datos del PDF417
    let parsedPDF417: PDF417Data;
    try {
      parsedPDF417 = JSON.parse(pdf417Data);
      console.log('📋 [IDENTITY-VERIFICATION] Datos PDF417 parseados:', {
        documentNumber: parsedPDF417.documentNumber,
        fullName: `${parsedPDF417.firstName} ${parsedPDF417.lastName}`,
        birthDate: parsedPDF417.birthDate
      });
    } catch (error) {
      console.error('❌ [IDENTITY-VERIFICATION] Error parseando PDF417:', error);
      return NextResponse.json(
        { error: 'Datos del PDF417 inválidos' },
        { status: 400 }
      );
    }

    // Crear directorio para almacenar las imágenes
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'verification', session.user.id);
    console.log('📁 [IDENTITY-VERIFICATION] Creando directorio:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ [IDENTITY-VERIFICATION] Directorio creado/verificado');
    } catch (error) {
      console.error('❌ [IDENTITY-VERIFICATION] Error creando directorio:', error);
    }

    // Guardar selfie
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const selfieFilename = `selfie-${Date.now()}.jpg`;
    const selfiePath = path.join(uploadsDir, selfieFilename);
    console.log('💾 [IDENTITY-VERIFICATION] Guardando selfie:', selfiePath);
    await writeFile(selfiePath, selfieBuffer);
    console.log('✅ [IDENTITY-VERIFICATION] Selfie guardada');

    // Guardar foto del DNI
    const dniBuffer = Buffer.from(await dniFile.arrayBuffer());
    const dniFilename = `dni-${Date.now()}.jpg`;
    const dniPath = path.join(uploadsDir, dniFilename);
    console.log('💾 [IDENTITY-VERIFICATION] Guardando DNI:', dniPath);
    await writeFile(dniPath, dniBuffer);
    console.log('✅ [IDENTITY-VERIFICATION] DNI guardado');

    // URLs públicas
    const selfieUrl = `/uploads/verification/${session.user.id}/${selfieFilename}`;
    const dniUrl = `/uploads/verification/${session.user.id}/${dniFilename}`;

    console.log('🔗 [IDENTITY-VERIFICATION] URLs generadas:');
    console.log('  - Selfie:', selfieUrl);
    console.log('  - DNI:', dniUrl);

    // Convertir imágenes a base64 para comparación facial
    const dniBase64 = `data:image/jpeg;base64,${dniBuffer.toString('base64')}`;
    const selfieBase64 = `data:image/jpeg;base64,${selfieBuffer.toString('base64')}`;

    console.log('🎭 [IDENTITY-VERIFICATION] Iniciando comparación facial real...');

    // Comparación facial usando face-api.js
    const faceMatchResult = await compareFacesForBackend(dniBase64, selfieBase64);
    const faceMatchScore = faceMatchResult.score;

    console.log('📊 [IDENTITY-VERIFICATION] Resultado comparación facial:', {
      score: (faceMatchScore * 100).toFixed(1) + '%',
      isMatch: faceMatchResult.isMatch
    });

    // Guardar verificación en la base de datos
    console.log('💾 [IDENTITY-VERIFICATION] Guardando en base de datos...');
    
    const verification = await prisma.verification.create({
      data: {
        userId: session.user.id,
        type: 'IDENTITY',
        status: faceMatchResult.isMatch ? 'APPROVED' : 'REJECTED', // Cambiar a 'APPROVED' si hay match, 'REJECTED' si no
        documentType: 'DNI',
        documentNumber: parsedPDF417.documentNumber,
        firstName: parsedPDF417.firstName,
        lastName: parsedPDF417.lastName,
        birthDate: parsedPDF417.birthDate,
        gender: parsedPDF417.gender,
        expirationDate: parsedPDF417.expirationDate,
        selfieUrl: selfieUrl,
        documentFrontUrl: dniUrl,
        pdf417Data: pdf417Data,
        faceMatchScore: faceMatchScore,
        metadata: {
          verifiedAt: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'unknown',
          faceMatchDetails: {
            isMatch: faceMatchResult.isMatch,
            confidence: faceMatchScore
          }
        }
      }
    });

    console.log('✅ [IDENTITY-VERIFICATION] Verificación guardada, ID:', verification.id);

    // Actualizar usuario si la verificación es exitosa
    if (faceMatchResult.isMatch) {
      console.log('✅ [IDENTITY-VERIFICATION] Score suficiente, actualizando usuario...');

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          verifiedIdentity: true,
          firstName: parsedPDF417.firstName,
          lastName: parsedPDF417.lastName,
        }
      });

      console.log('✅ [IDENTITY-VERIFICATION] Usuario actualizado');
    } else {
      console.log('⚠️ [IDENTITY-VERIFICATION] Score insuficiente, requiere revisión manual');
    }

    console.log('🎉 [IDENTITY-VERIFICATION] Proceso completado exitosamente');

    return NextResponse.json({
      success: true,
      verificationId: verification.id,
      status: verification.status,
      faceMatchScore: faceMatchScore,
      documentData: {
        documentNumber: parsedPDF417.documentNumber,
        fullName: `${parsedPDF417.firstName} ${parsedPDF417.lastName}`,
        birthDate: parsedPDF417.birthDate
      }
    });

  } catch (error) {
    console.error('❌ [IDENTITY-VERIFICATION] Error en el proceso:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de verificación', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
