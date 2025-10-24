import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { compareFacesForBackend } from '@/lib/face-matching';
import { detectLiveness } from '@/lib/liveness-detection';

/**
 * POST /api/verification/face-match-debug
 * Face matching con liveness SIN autenticación para debugging
 * Logs ultra detallados para entender por qué no matchea
 */
export async function POST(req: NextRequest) {
  console.log('🔍 [FACE-MATCH-DEBUG] Iniciando verificación de debugging...');
  console.log('🔍 [FACE-MATCH-DEBUG] ===========================================');
  
  try {
    const formData = await req.formData();
    const selfieFile = formData.get('selfie') as File;
    const referencePhotoFile = formData.get('referencePhoto') as File;

    if (!selfieFile || !referencePhotoFile) {
      console.log('❌ [FACE-MATCH-DEBUG] Datos incompletos');
      return NextResponse.json(
        { error: 'Se requiere selfie y foto de referencia' },
        { status: 400 }
      );
    }

    console.log('📄 [FACE-MATCH-DEBUG] Archivos recibidos:');
    console.log('  - Selfie:', selfieFile.name, selfieFile.size, 'bytes');
    console.log('  - Foto de referencia:', referencePhotoFile.name, referencePhotoFile.size, 'bytes');

    // Crear directorio para almacenar las imágenes
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'debug');
    console.log('📁 [FACE-MATCH-DEBUG] Creando directorio:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ [FACE-MATCH-DEBUG] Directorio creado/verificado');
    } catch (error) {
      console.error('❌ [FACE-MATCH-DEBUG] Error creando directorio:', error);
    }

    // Guardar selfie
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const selfieFilename = `selfie-debug-${Date.now()}.jpg`;
    const selfiePath = path.join(uploadsDir, selfieFilename);
    console.log('💾 [FACE-MATCH-DEBUG] Guardando selfie:', selfiePath);
    await writeFile(selfiePath, selfieBuffer);
    console.log('✅ [FACE-MATCH-DEBUG] Selfie guardada');

    // Guardar foto de referencia
    const referenceBuffer = Buffer.from(await referencePhotoFile.arrayBuffer());
    const referenceFilename = `reference-debug-${Date.now()}.jpg`;
    const referencePath = path.join(uploadsDir, referenceFilename);
    console.log('💾 [FACE-MATCH-DEBUG] Guardando foto de referencia:', referencePath);
    await writeFile(referencePath, referenceBuffer);
    console.log('✅ [FACE-MATCH-DEBUG] Foto de referencia guardada');

    // URLs públicas
    const selfieUrl = `/uploads/debug/${selfieFilename}`;
    const referenceUrl = `/uploads/debug/${referenceFilename}`;

    console.log('🔗 [FACE-MATCH-DEBUG] URLs generadas:');
    console.log('  - Selfie:', selfieUrl);
    console.log('  - Referencia:', referenceUrl);

    // Convertir imágenes a base64 para comparación facial
    const referenceBase64 = `data:image/jpeg;base64,${referenceBuffer.toString('base64')}`;
    const selfieBase64 = `data:image/jpeg;base64,${selfieBuffer.toString('base64')}`;

    console.log('🎭 [FACE-MATCH-DEBUG] Iniciando comparación facial...');
    console.log('🔍 [FACE-MATCH-DEBUG] ===========================================');

    // Detección de liveness en la selfie - LOGGING ULTRA DETALLADO
    console.log('👁️ [FACE-MATCH-DEBUG] Verificando liveness...');
    console.log('🔍 [LIVENESS-DEBUG] Iniciando análisis de liveness...');
    console.log('🔍 [LIVENESS-DEBUG] Tamaño de imagen selfie:', {
      width: 'calculando...',
      height: 'calculando...',
      size: selfieBuffer.length + ' bytes'
    });
    
    const livenessResult = await detectLiveness(selfieBase64);
    
    console.log('📊 [FACE-MATCH-DEBUG] Resultado liveness:', {
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

    console.log('📊 [FACE-MATCH-DEBUG] Resultado comparación facial:', {
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

    console.log('🎯 [FACE-MATCH-DEBUG] Resultado final combinado:', {
      faceMatch: faceMatchResult.isMatch,
      liveness: livenessResult.isLive,
      finalMatch,
      combinedScore: (combinedScore * 100).toFixed(1) + '%'
    });

    console.log('🔍 [FACE-MATCH-DEBUG] ===========================================');
    console.log('🎉 [FACE-MATCH-DEBUG] Proceso completado exitosamente');

    return NextResponse.json({
      success: true,
      status: finalMatch ? 'APPROVED' : 'REJECTED',
      faceMatch: {
        isMatch: faceMatchResult.isMatch,
        confidence: faceMatchScore,
        scoreCategory: scoreCategory,
        thresholds: thresholds
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
      debug: {
        selfieUrl: selfieUrl,
        referenceUrl: referenceUrl,
        logs: 'Revisa la consola del servidor para logs detallados'
      },
      message: finalMatch 
        ? 'Verificación exitosa - Face match y liveness aprobados' 
        : 'Verificación fallida - Revisar face match o liveness'
    });

  } catch (error) {
    console.error('❌ [FACE-MATCH-DEBUG] Error en el proceso:', error);
    console.error('❌ [FACE-MATCH-DEBUG] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Error en el proceso de verificación', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
