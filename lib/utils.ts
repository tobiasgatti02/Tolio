import { PrismaClient } from '@prisma/client'
import path from 'path'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Cerrar conexiones al terminar el proceso
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})





export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


interface VerificationResult {
  success: boolean
  documentNumber?: string
  error?: string
  metadata?: Record<string, any>
}

/**
 * Verifica un DNI argentino utilizando una API externa
 *
 * @param frontImageUrl URL de la imagen del frente del DNI
 * @param backImageUrl URL de la imagen del dorso del DNI
 * @returns Resultado de la verificación
 */
export async function verifyDniWithApi(frontImageUrl: string, backImageUrl: string): Promise<VerificationResult> {
  try {
    // Aquí implementarías la llamada a la API de verificación
    // Opciones recomendadas:
    // 1. Mati API (https://getmati.com/)
    // 2. Truora (https://www.truora.com/)
    // 3. Jumio (https://www.jumio.com/)

    // Ejemplo con Mati API (necesitarías configurar las credenciales)
    /*
    const response = await axios.post(
      'https://api.getmati.com/v2/verifications',
      {
        document: {
          type: 'national-id',
          country: 'AR',
          images: [frontImageUrl, backImageUrl]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MATI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    // Procesar respuesta
    const verificationId = response.data.id
    
    // Consultar resultado (en un caso real, esto sería asíncrono con webhooks)
    const verificationResult = await axios.get(
      `https://api.getmati.com/v2/verifications/${verificationId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MATI_API_KEY}`
        }
      }
    )
    
    const status = verificationResult.data.status
    const documentData = verificationResult.data.document
    
    return {
      success: status === 'verified',
      documentNumber: documentData?.documentNumber,
      metadata: documentData
    }
    */

    // Para fines de demostración, simulamos una verificación exitosa
    // En un entorno de producción, deberías integrar con una API real

    // Simulamos un tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulamos un 90% de éxito en la verificación
    const isSuccessful = Math.random() < 0.9

    if (isSuccessful) {
      return {
        success: true,
        documentNumber: "12345678", // En un caso real, esto vendría de la API
        metadata: {
          name: "Nombre extraído del DNI",
          lastName: "Apellido extraído del DNI",
          birthDate: "1990-01-01",
          expiryDate: "2030-01-01",
        },
      }
    } else {
      return {
        success: false,
        error: "No se pudo verificar el documento. La imagen no es clara o el documento no es válido.",
      }
    }
  } catch (error) {
    console.error("Error al verificar DNI:", error)
    return {
      success: false,
      error: "Error en el servicio de verificación",
    }
  }
}

