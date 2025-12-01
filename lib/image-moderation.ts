/**
 * Servicio de moderación de imágenes usando NSFWJS
 * Detecta contenido inapropiado: pornografía, desnudos, contenido sugestivo
 * 
 * Categorías detectadas:
 * - Porn: Contenido pornográfico explícito
 * - Sexy: Contenido sexualmente sugestivo
 * - Hentai: Anime/dibujos de contenido sexual
 * - Neutral: Contenido seguro
 * - Drawing: Dibujos/arte no sexual
 */

// @ts-ignore - tfjs-node no tiene tipos perfectos
import * as tf from '@tensorflow/tfjs-node';
// @ts-ignore - nsfwjs tipos
import * as nsfwjs from 'nsfwjs';

// Singleton para el modelo (cargarlo una sola vez)
let model: nsfwjs.NSFWJS | null = null;
let modelLoading: Promise<nsfwjs.NSFWJS> | null = null;

// Umbrales de detección (ajustables)
const THRESHOLDS = {
  porn: 0.3,      // Muy estricto con pornografía
  sexy: 0.5,      // Moderado con contenido sugestivo  
  hentai: 0.4,    // Estricto con hentai
};

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  predictions: {
    className: string;
    probability: number;
  }[];
  flaggedCategories: string[];
}

/**
 * Carga el modelo NSFWJS (singleton)
 */
async function loadModel(): Promise<nsfwjs.NSFWJS> {
  if (model) {
    return model;
  }

  if (modelLoading) {
    return modelLoading;
  }

  modelLoading = (async () => {
    console.log('[ImageModeration] Cargando modelo NSFWJS...');
    // Usar el modelo más ligero para mejor rendimiento
    model = await nsfwjs.load('MobileNetV2Mid');
    console.log('[ImageModeration] Modelo cargado correctamente');
    return model;
  })();

  return modelLoading;
}

/**
 * Convierte un Buffer de imagen a tensor de TensorFlow
 */
async function bufferToTensor(buffer: Buffer): Promise<tf.Tensor3D> {
  // Decodificar la imagen usando tfjs-node
  const decoded = tf.node.decodeImage(buffer, 3);
  return decoded as tf.Tensor3D;
}

/**
 * Modera una imagen desde un Buffer
 * @param imageBuffer - Buffer de la imagen a moderar
 * @returns Resultado de la moderación
 */
export async function moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
  try {
    const nsfwModel = await loadModel();
    
    // Convertir buffer a tensor
    const imageTensor = await bufferToTensor(imageBuffer);
    
    // Clasificar la imagen
    const predictions = await nsfwModel.classify(imageTensor);
    
    // Liberar memoria del tensor
    imageTensor.dispose();
    
    // Verificar categorías problemáticas
    const flaggedCategories: string[] = [];
    let isAllowed = true;
    let reason: string | undefined;

    for (const prediction of predictions) {
      const className = prediction.className.toLowerCase();
      const probability = prediction.probability;

      if (className === 'porn' && probability >= THRESHOLDS.porn) {
        flaggedCategories.push('Contenido pornográfico');
        isAllowed = false;
      } else if (className === 'sexy' && probability >= THRESHOLDS.sexy) {
        flaggedCategories.push('Contenido sexualmente sugestivo');
        isAllowed = false;
      } else if (className === 'hentai' && probability >= THRESHOLDS.hentai) {
        flaggedCategories.push('Contenido hentai/anime adulto');
        isAllowed = false;
      }
    }

    if (!isAllowed) {
      reason = `Imagen rechazada: ${flaggedCategories.join(', ')}`;
    }

    return {
      isAllowed,
      reason,
      predictions: predictions.map((p: { className: string; probability: number }) => ({
        className: p.className,
        probability: p.probability,
      })),
      flaggedCategories,
    };
  } catch (error) {
    console.error('[ImageModeration] Error moderando imagen:', error);
    // En caso de error, permitir la imagen pero logear el error
    // Puedes cambiar esto a rechazar por defecto si prefieres más seguridad
    return {
      isAllowed: true,
      reason: 'Error en moderación - imagen permitida por defecto',
      predictions: [],
      flaggedCategories: [],
    };
  }
}

/**
 * Modera una imagen desde una URL base64 (data URL)
 * @param dataUrl - Data URL de la imagen (ej: data:image/jpeg;base64,...)
 * @returns Resultado de la moderación
 */
export async function moderateImageFromDataUrl(dataUrl: string): Promise<ModerationResult> {
  try {
    // Extraer el base64 del data URL
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Data URL inválido');
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    return moderateImage(buffer);
  } catch (error) {
    console.error('[ImageModeration] Error procesando data URL:', error);
    return {
      isAllowed: false,
      reason: 'Error procesando la imagen',
      predictions: [],
      flaggedCategories: ['Error de procesamiento'],
    };
  }
}

/**
 * Modera múltiples imágenes y devuelve los resultados
 * @param imageBuffers - Array de buffers de imágenes
 * @returns Array de resultados de moderación
 */
export async function moderateMultipleImages(imageBuffers: Buffer[]): Promise<ModerationResult[]> {
  const results = await Promise.all(
    imageBuffers.map(buffer => moderateImage(buffer))
  );
  return results;
}

/**
 * Verifica si todas las imágenes pasan la moderación
 * @param imageBuffers - Array de buffers de imágenes
 * @returns true si todas las imágenes son permitidas
 */
export async function allImagesAllowed(imageBuffers: Buffer[]): Promise<{
  allowed: boolean;
  rejectedIndexes: number[];
  reasons: string[];
}> {
  const results = await moderateMultipleImages(imageBuffers);
  
  const rejectedIndexes: number[] = [];
  const reasons: string[] = [];

  results.forEach((result, index) => {
    if (!result.isAllowed) {
      rejectedIndexes.push(index);
      if (result.reason) {
        reasons.push(`Imagen ${index + 1}: ${result.reason}`);
      }
    }
  });

  return {
    allowed: rejectedIndexes.length === 0,
    rejectedIndexes,
    reasons,
  };
}
