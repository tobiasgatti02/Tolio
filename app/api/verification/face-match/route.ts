import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

/**
 * POST /api/verification/face-match
 * Usa el script Python para comparación facial robusta
 */
export async function POST(req: NextRequest) {
  console.log('🐍 [FACE-MATCH-PYTHON] Iniciando comparación facial con Python...');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ [FACE-MATCH-PYTHON] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ [FACE-MATCH-PYTHON] Usuario autenticado:', session.user.id);

    const formData = await req.formData();
    const selfieFile = formData.get('selfie') as File;
    const dniFile = formData.get('dniFront') as File;
    const dniBackFile = formData.get('dniBack') as File;

    if (!selfieFile || !dniFile) {
      console.log('❌ [FACE-MATCH-PYTHON] Datos incompletos');
      return NextResponse.json(
        { error: 'Se requiere selfie y foto del DNI' },
        { status: 400 }
      );
    }

    console.log('📄 [FACE-MATCH-PYTHON] Archivos recibidos:');
    console.log('  - Selfie:', selfieFile.name, selfieFile.size, 'bytes');
    console.log('  - DNI Front:', dniFile.name, dniFile.size, 'bytes');
    if (dniBackFile) {
      console.log('  - DNI Back:', dniBackFile.name, dniBackFile.size, 'bytes');
    }

    // Crear directorio temporal para las imágenes
    const tempDir = path.join(process.cwd(), 'temp', 'face-match', session.user.id);
    const timestamp = Date.now();
    
    try {
      await mkdir(tempDir, { recursive: true });
      console.log('📁 [FACE-MATCH-PYTHON] Directorio temporal creado:', tempDir);
    } catch (error) {
      console.error('❌ [FACE-MATCH-PYTHON] Error creando directorio:', error);
    }

    // Guardar archivos temporalmente
    const selfiePath = path.join(tempDir, `selfie-${timestamp}.jpg`);
    const dniPath = path.join(tempDir, `dni-${timestamp}.jpg`);
    const dniBackPath = dniBackFile ? path.join(tempDir, `dni-back-${timestamp}.jpg`) : null;

    // Guardar selfie
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    await writeFile(selfiePath, selfieBuffer);
    console.log('💾 [FACE-MATCH-PYTHON] Selfie guardada:', selfiePath);

    // Guardar DNI front
    const dniBuffer = Buffer.from(await dniFile.arrayBuffer());
    await writeFile(dniPath, dniBuffer);
    console.log('💾 [FACE-MATCH-PYTHON] DNI front guardado:', dniPath);

    // Guardar DNI back si existe
    if (dniBackFile && dniBackPath) {
      const dniBackBuffer = Buffer.from(await dniBackFile.arrayBuffer());
      await writeFile(dniBackPath, dniBackBuffer);
      console.log('💾 [FACE-MATCH-PYTHON] DNI back guardado:', dniBackPath);
    }

    // Ejecutar script Python
    console.log('🐍 [FACE-MATCH-PYTHON] Ejecutando script Python...');
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'face_match_dni.py');
    const args = [scriptPath, dniPath, selfiePath];
    if (dniBackPath) {
      args.push(dniBackPath);
    }

    const pythonResult = await new Promise<{
      success: boolean;
      faceMatch?: any;
      pdf417Data?: any;
      errors?: string[];
    }>((resolve, reject) => {
      const python = spawn('python3', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('🐍 [PYTHON]', data.toString().trim());
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('🐍 [PYTHON-ERROR]', data.toString().trim());
      });

      python.on('close', (code) => {
        console.log(`🐍 [FACE-MATCH-PYTHON] Python script terminado con código: ${code}`);
        
        if (code === 0) {
          try {
            // El script Python imprime JSON al final
            const lines = stdout.split('\n');
            const jsonLine = lines.find(line => line.trim().startsWith('{'));
            
            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              resolve(result);
            } else {
              // Fallback: parsear resultado desde stdout
              resolve({
                success: true,
                faceMatch: {
                  success: true,
                  isMatch: stdout.includes('Face Match: True'),
                  distance: 0.4,
                  confidence: 0.8
                }
              });
            }
          } catch (error) {
            console.error('❌ [FACE-MATCH-PYTHON] Error parseando resultado Python:', error);
            resolve({
              success: false,
              errors: ['Error parseando resultado del script Python']
            });
          }
        } else {
          reject(new Error(`Script Python falló con código ${code}: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        console.error('❌ [FACE-MATCH-PYTHON] Error ejecutando Python:', error);
        reject(error);
      });
    });

    console.log('📊 [FACE-MATCH-PYTHON] Resultado Python:', pythonResult);

    // Limpiar archivos temporales
    try {
      await unlink(selfiePath);
      await unlink(dniPath);
      if (dniBackPath) {
        await unlink(dniBackPath);
      }
      console.log('🧹 [FACE-MATCH-PYTHON] Archivos temporales eliminados');
    } catch (error) {
      console.warn('⚠️ [FACE-MATCH-PYTHON] Error eliminando archivos temporales:', error);
    }

    // Procesar resultado
    if (!pythonResult.success) {
      console.log('❌ [FACE-MATCH-PYTHON] Script Python falló');
      return NextResponse.json(
        { 
          error: 'Error en comparación facial', 
          details: pythonResult.errors?.join(', ') || 'Error desconocido' 
        },
        { status: 500 }
      );
    }

    const faceMatch = pythonResult.faceMatch;
    const pdf417Data = pythonResult.pdf417Data;

    if (!faceMatch || !faceMatch.success) {
      console.log('❌ [FACE-MATCH-PYTHON] No se pudo realizar comparación facial');
      return NextResponse.json(
        { error: 'No se pudo realizar comparación facial' },
        { status: 500 }
      );
    }

    console.log('✅ [FACE-MATCH-PYTHON] Comparación exitosa:', {
      isMatch: faceMatch.isMatch,
      confidence: faceMatch.confidence,
      distance: faceMatch.distance
    });

    // Guardar resultado en base de datos
    const verification = await prisma.verification.create({
      data: {
        userId: session.user.id,
        type: 'IDENTITY',
        status: faceMatch.isMatch ? 'APPROVED' : 'REJECTED',
        documentType: 'DNI',
        documentNumber: pdf417Data?.documentNumber || 'N/A',
        firstName: pdf417Data?.firstName || 'N/A',
        lastName: pdf417Data?.lastName || 'N/A',
        birthDate: pdf417Data?.birthDate || null,
        gender: pdf417Data?.gender || null,
        expirationDate: pdf417Data?.expirationDate || null,
        faceMatchScore: faceMatch.confidence,
        metadata: {
          verifiedAt: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'unknown',
          faceMatchDetails: {
            isMatch: faceMatch.isMatch,
            confidence: faceMatch.confidence,
            distance: faceMatch.distance,
            threshold: faceMatch.threshold,
            method: 'python-face-recognition'
          },
          pdf417Data: pdf417Data
        }
      }
    });

    console.log('💾 [FACE-MATCH-PYTHON] Verificación guardada, ID:', verification.id);

    // Actualizar usuario si la verificación es exitosa
    if (faceMatch.isMatch) {
      console.log('✅ [FACE-MATCH-PYTHON] Verificación exitosa, actualizando usuario...');

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          verifiedIdentity: true,
          firstName: pdf417Data?.firstName || undefined,
          lastName: pdf417Data?.lastName || undefined,
        }
      });

      console.log('✅ [FACE-MATCH-PYTHON] Usuario actualizado');
    }

    console.log('🎉 [FACE-MATCH-PYTHON] Proceso completado exitosamente');

    return NextResponse.json({
      success: true,
      verificationId: verification.id,
      status: verification.status,
      faceMatch: {
        isMatch: faceMatch.isMatch,
        confidence: faceMatch.confidence,
        distance: faceMatch.distance,
        threshold: faceMatch.threshold
      },
      documentData: pdf417Data ? {
        documentNumber: pdf417Data.documentNumber,
        fullName: `${pdf417Data.firstName} ${pdf417Data.lastName}`,
        birthDate: pdf417Data.birthDate
      } : null
    });

  } catch (error) {
    console.error('❌ [FACE-MATCH-PYTHON] Error en el proceso:', error);
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
