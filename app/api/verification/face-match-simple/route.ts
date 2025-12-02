import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from "@/lib/prisma";
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { compareFacesForBackend } from '@/lib/face-matching';
import { detectLiveness } from '@/lib/liveness-detection';



/**
 * POST /api/verification/face-match-simple
 * Face matching con liveness SIN necesidad de DNI
 * Perfecto para testing y cuando no tienes DNI a mano
 */
export async function POST(req: NextRequest) {
  console.log('🎭 [FACE-MATCH-SIMPLE] Iniciando verificación sin DNI...');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ [FACE-MATCH-SIMPLE] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ [FACE-MATCH-SIMPLE] Usuario autenticado:', session.user.id);

    const formData = await req.formData();
    const selfieFile = formData.get('selfie') as File;
    const referencePhotoFile = formData.get('referencePhoto') as File; // Foto de referencia (cualquier foto tuya)

    if (!selfieFile || !referencePhotoFile) {
      console.log('❌ [FACE-MATCH-SIMPLE] Datos incompletos');
      return NextResponse.json(
        { error: 'Se requiere selfie y foto de referencia' },
        { status: 400 }
      );
    }

    console.log('📄 [FACE-MATCH-SIMPLE] Archivos recibidos:');
    console.log('  - Selfie:', selfieFile.name, selfieFile.size, 'bytes');
    console.log('  - Foto de referencia:', referencePhotoFile.name, referencePhotoFile.size, 'bytes');

    // Crear directorio para almacenar las imágenes
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'verification', session.user.id);
    console.log('📁 [FACE-MATCH-SIMPLE] Creando directorio:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ [FACE-MATCH-SIMPLE] Directorio creado/verificado');
    } catch (error) {
      console.error('❌ [FACE-MATCH-SIMPLE] Error creando directorio:', error);
    }

    // Guardar selfie
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const selfieFilename = `selfie-${Date.now()}.jpg`;
    const selfiePath = path.join(uploadsDir, selfieFilename);
    console.log('💾 [FACE-MATCH-SIMPLE] Guardando selfie:', selfiePath);
    await writeFile(selfiePath, selfieBuffer);
    console.log('✅ [FACE-MATCH-SIMPLE] Selfie guardada');

    // Guardar foto de referencia
    const referenceBuffer = Buffer.from(await referencePhotoFile.arrayBuffer());
    const referenceFilename = `reference-${Date.now()}.jpg`;
    const referencePath = path.join(uploadsDir, referenceFilename);
    console.log('💾 [FACE-MATCH-SIMPLE] Guardando foto de referencia:', referencePath);
    await writeFile(referencePath, referenceBuffer);
    console.log('✅ [FACE-MATCH-SIMPLE] Foto de referencia guardada');

    // URLs públicas
    const selfieUrl = `/uploads/verification/${session.user.id}/${selfieFilename}`;
    const referenceUrl = `/uploads/verification/${session.user.id}/${referenceFilename}`;

    console.log('🔗 [FACE-MATCH-SIMPLE] URLs generadas:');
    console.log('  - Selfie:', selfieUrl);
    console.log('  - Referencia:', referenceUrl);

    // Convertir imágenes a base64 para comparación facial
    const referenceBase64 = `data:image/jpeg;base64,${referenceBuffer.toString('base64')}`;
    const selfieBase64 = `data:image/jpeg;base64,${selfieBuffer.toString('base64')}`;

    console.log('🎭 [FACE-MATCH-SIMPLE] Iniciando comparación facial...');

    // Detección de liveness en la selfie - LOGGING ULTRA DETALLADO
    console.log('👁️ [FACE-MATCH-SIMPLE] Verificando liveness...');
    console.log('🔍 [LIVENESS-DEBUG] Iniciando análisis de liveness...');
    console.log('🔍 [LIVENESS-DEBUG] Tamaño de imagen selfie:', {
      width: 'calculando...',
      height: 'calculando...',
      size: selfieBuffer.length + ' bytes'
    });
    
    const livenessResult = await detectLiveness(selfieBase64);
    
    console.log('📊 [FACE-MATCH-SIMPLE] Resultado liveness:', {
      isLive: livenessResult.isLive,
      confidence: (livenessResult.confidence * 100).toFixed(1) + '%',
      checks: livenessResult.checks
    });

    // LOGGING ULTRA DETALLADO DE LIVENESS
    console.log('🔍 [LIVENESS-DEBUG] Análisis detallado de liveness:');
    console.log('  - isLive:', livenessResult.isLive);
    console.log('  - confidence:', livenessResult.confidence);
    console.log('  - checks.eyeBlink:', livenessResult.checks?.eyeBlink);
    console.log('  - checks.headMovement:', livenessResult.checks?.headMovement);
    console.log('  - checks.imageQuality:', livenessResult.checks?.imageQuality);
    console.log('  - checks.antiSpoofing:', livenessResult.checks?.antiSpoofing);
    
    if (livenessResult.details) {
      console.log('  - details:', JSON.stringify(livenessResult.details, null, 2));
    }

    // Comparación facial usando face-api.js mejorado - LOGGING ULTRA DETALLADO
    console.log('🎭 [FACE-MATCH-DEBUG] Iniciando comparación facial...');
    console.log('🔍 [FACE-MATCH-DEBUG] Imágenes a comparar:');
    console.log('  - Selfie size:', selfieBuffer.length + ' bytes');
    console.log('  - Reference size:', referenceBuffer.length + ' bytes');
    
    const faceMatchResult = await compareFacesForBackend(referenceBase64, selfieBase64);
    const faceMatchScore = faceMatchResult.score;

    console.log('📊 [FACE-MATCH-SIMPLE] Resultado comparación facial:', {
      score: (faceMatchScore * 100).toFixed(1) + '%',
      isMatch: faceMatchResult.isMatch
    });

    // LOGGING ULTRA DETALLADO DE FACE MATCH
    console.log('🔍 [FACE-MATCH-DEBUG] Análisis detallado de face match:');
    console.log('  - isMatch:', faceMatchResult.isMatch);
    console.log('  - score:', faceMatchScore);
    console.log('  - confidence:', (faceMatchScore * 100).toFixed(1) + '%');
    
    // Análisis de umbrales
    const thresholds = {
      excellent: 0.9,
      good: 0.8,
      fair: 0.7,
      poor: 0.6,
      very_poor: 0.5
    };
    
    let scoreCategory = 'very_poor';
    if (faceMatchScore >= thresholds.excellent) scoreCategory = 'excellent';
    else if (faceMatchScore >= thresholds.good) scoreCategory = 'good';
    else if (faceMatchScore >= thresholds.fair) scoreCategory = 'fair';
    else if (faceMatchScore >= thresholds.poor) scoreCategory = 'poor';
    
    console.log('  - scoreCategory:', scoreCategory);
    console.log('  - threshold analysis:', {
      excellent: faceMatchScore >= thresholds.excellent,
      good: faceMatchScore >= thresholds.good,
      fair: faceMatchScore >= thresholds.fair,
      poor: faceMatchScore >= thresholds.poor,
      very_poor: faceMatchScore >= thresholds.very_poor
    });

    // Combinar resultados: debe pasar tanto face match como liveness
    const finalMatch = faceMatchResult.isMatch && livenessResult.isLive;
    const combinedScore = (faceMatchScore + livenessResult.confidence) / 2;

    console.log('🎯 [FACE-MATCH-SIMPLE] Resultado final combinado:', {
      faceMatch: faceMatchResult.isMatch,
      liveness: livenessResult.isLive,
      finalMatch,
      combinedScore: (combinedScore * 100).toFixed(1) + '%'
    });

    // Guardar verificación en la base de datos
    console.log('💾 [FACE-MATCH-SIMPLE] Guardando en base de datos...');
    
    const verification = await prisma.verification.create({
      data: {
        userId: session.user.id,
        type: 'FACE_MATCH_SIMPLE',
        status: finalMatch ? 'APPROVED' : 'REJECTED',
        documentType: 'REFERENCE_PHOTO',
        documentNumber: 'N/A',
        firstName: 'N/A',
        lastName: 'N/A',
        selfieUrl: selfieUrl,
        documentFrontUrl: referenceUrl,
        faceMatchScore: combinedScore,
        metadata: {
          verifiedAt: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'unknown',
          faceMatchDetails: {
            isMatch: faceMatchResult.isMatch,
            confidence: faceMatchScore,
            liveness: livenessResult.isLive,
            livenessConfidence: livenessResult.confidence,
            livenessChecks: livenessResult.checks,
            finalMatch: finalMatch,
            combinedScore: combinedScore,
            method: 'simple-face-match'
          }
        }
      }
    });

    console.log('✅ [FACE-MATCH-SIMPLE] Verificación guardada, ID:', verification.id);

    // Actualizar usuario si la verificación es exitosa
    if (finalMatch) {
      console.log('✅ [FACE-MATCH-SIMPLE] Verificación exitosa, actualizando usuario...');

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          verifiedIdentity: true,
          // No actualizamos nombre porque no tenemos datos del DNI
        }
      });

      console.log('✅ [FACE-MATCH-SIMPLE] Usuario actualizado');
    } else {
      console.log('⚠️ [FACE-MATCH-SIMPLE] Verificación fallida:', {
        faceMatch: faceMatchResult.isMatch,
        liveness: livenessResult.isLive,
        reason: !faceMatchResult.isMatch ? 'Face match falló' : 'Liveness falló'
      });
    }

    console.log('🎉 [FACE-MATCH-SIMPLE] Proceso completado exitosamente');

    return NextResponse.json({
      success: true,
      verificationId: verification.id,
      status: verification.status,
      faceMatch: {
        isMatch: faceMatchResult.isMatch,
        confidence: faceMatchScore
      },
      liveness: {
        isLive: livenessResult.isLive,
        confidence: livenessResult.confidence,
        checks: livenessResult.checks
      },
      finalResult: {
        isMatch: finalMatch,
        combinedScore: combinedScore
      },
      message: finalMatch 
        ? 'Verificación exitosa - Face match y liveness aprobados' 
        : 'Verificación fallida - Revisar face match o liveness'
    });

  } catch (error) {
    console.error('❌ [FACE-MATCH-SIMPLE] Error en el proceso:', error);
    return NextResponse.json(
      { 
        error: 'Error en el proceso de verificación', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
