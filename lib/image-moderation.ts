/**
 * Servicio de moderación de imágenes
 * Detecta contenido inapropiado: pornografía, desnudos, contenido sugestivo
 * 
 * Opciones disponibles:
 * 1. Sightengine API (500 ops/mes gratis) - Recomendado
 * 2. Moderatecontent.com (gratis, ilimitado)
 * 
 * Para activar, configura las variables de entorno:
 * - SIGHTENGINE_API_USER
 * - SIGHTENGINE_API_SECRET
 * 
 * O usa Moderatecontent (gratis):
 * - MODERATECONTENT_API_KEY
 */

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  predictions: {
    className: string;
    probability: number;
  }[];
  flaggedCategories: string[];
}

// Umbrales de detección
const THRESHOLDS = {
  nudity: 0.5,
  adult: 0.5,
  violence: 0.6,
};

/**
 * Modera una imagen usando Sightengine API
 * Configurar: SIGHTENGINE_API_USER y SIGHTENGINE_API_SECRET
 */
async function moderateWithSightengine(imageBuffer: Buffer): Promise<ModerationResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    console.log('[ImageModeration] Sightengine no configurado, imagen permitida por defecto');
    return {
      isAllowed: true,
      reason: 'Moderación no configurada',
      predictions: [],
      flaggedCategories: [],
    };
  }

  try {
    const formData = new FormData();
    // Convertir Buffer a Uint8Array para crear el Blob
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    formData.append('media', blob, 'image.jpg');
    formData.append('models', 'nudity-2.1,weapon,recreational_drug,gore-2.0');
    formData.append('api_user', apiUser);
    formData.append('api_secret', apiSecret);

    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sightengine API error: ${response.status}`);
    }

    const result = await response.json();
    const flaggedCategories: string[] = [];
    const predictions: { className: string; probability: number }[] = [];

    // Verificar nudity
    if (result.nudity) {
      const nudityScore = Math.max(
        result.nudity.sexual_activity || 0,
        result.nudity.sexual_display || 0,
        result.nudity.erotica || 0
      );
      predictions.push({ className: 'nudity', probability: nudityScore });
      if (nudityScore > THRESHOLDS.nudity) {
        flaggedCategories.push('Contenido con desnudez o sexual');
      }
    }

    // Verificar armas
    if (result.weapon && result.weapon.classes) {
      const weaponScore = Math.max(
        result.weapon.classes.firearm || 0,
        result.weapon.classes.knife || 0
      );
      predictions.push({ className: 'weapon', probability: weaponScore });
      if (weaponScore > 0.5) {
        flaggedCategories.push('Armas detectadas');
      }
    }

    // Verificar drogas
    if (result.recreational_drug) {
      const drugScore = result.recreational_drug.prob || 0;
      predictions.push({ className: 'drugs', probability: drugScore });
      if (drugScore > 0.5) {
        flaggedCategories.push('Contenido relacionado con drogas');
      }
    }

    // Verificar gore/violencia
    if (result.gore) {
      const goreScore = result.gore.prob || 0;
      predictions.push({ className: 'gore', probability: goreScore });
      if (goreScore > THRESHOLDS.violence) {
        flaggedCategories.push('Contenido violento/gore');
      }
    }

    const isAllowed = flaggedCategories.length === 0;

    return {
      isAllowed,
      reason: isAllowed ? undefined : `Imagen rechazada: ${flaggedCategories.join(', ')}`,
      predictions,
      flaggedCategories,
    };
  } catch (error) {
    console.error('[ImageModeration] Error con Sightengine:', error);
    // En caso de error, permitir la imagen
    return {
      isAllowed: true,
      reason: 'Error en moderación - imagen permitida por defecto',
      predictions: [],
      flaggedCategories: [],
    };
  }
}

/**
 * Modera una imagen usando Moderatecontent.com (gratis, ilimitado)
 * Configurar: MODERATECONTENT_API_KEY (obtener en moderatecontent.com)
 */
async function moderateWithModeratecontent(imageBuffer: Buffer): Promise<ModerationResult> {
  const apiKey = process.env.MODERATECONTENT_API_KEY;

  if (!apiKey) {
    console.log('[ImageModeration] Moderatecontent no configurado');
    return {
      isAllowed: true,
      reason: 'Moderación no configurada',
      predictions: [],
      flaggedCategories: [],
    };
  }

  try {
    // Convertir a base64
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch(`https://api.moderatecontent.com/moderate/?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=data:image/jpeg;base64,${base64Image}`,
    });

    if (!response.ok) {
      throw new Error(`Moderatecontent API error: ${response.status}`);
    }

    const result = await response.json();
    const flaggedCategories: string[] = [];
    const predictions: { className: string; probability: number }[] = [];

    // rating_index: 1 = everyone, 2 = teen, 3 = adult
    const ratingIndex = result.rating_index || 1;
    predictions.push({ className: 'adult_content', probability: ratingIndex / 3 });

    if (ratingIndex >= 3) {
      flaggedCategories.push('Contenido para adultos');
    }

    const isAllowed = flaggedCategories.length === 0;

    return {
      isAllowed,
      reason: isAllowed ? undefined : `Imagen rechazada: ${flaggedCategories.join(', ')}`,
      predictions,
      flaggedCategories,
    };
  } catch (error) {
    console.error('[ImageModeration] Error con Moderatecontent:', error);
    return {
      isAllowed: true,
      reason: 'Error en moderación - imagen permitida por defecto',
      predictions: [],
      flaggedCategories: [],
    };
  }
}

/**
 * Modera una imagen desde un Buffer
 * Usa Sightengine si está configurado, sino Moderatecontent, sino permite todo
 * @param imageBuffer - Buffer de la imagen a moderar
 * @returns Resultado de la moderación
 */
export async function moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
  // Intentar con Sightengine primero (más completo)
  if (process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET) {
    return moderateWithSightengine(imageBuffer);
  }

  // Fallback a Moderatecontent
  if (process.env.MODERATECONTENT_API_KEY) {
    return moderateWithModeratecontent(imageBuffer);
  }

  // Si no hay API configurada, permitir por defecto
  console.log('[ImageModeration] No hay servicio de moderación configurado. Imagen permitida.');
  return {
    isAllowed: true,
    reason: 'Sin servicio de moderación configurado',
    predictions: [],
    flaggedCategories: [],
  };
}

/**
 * Modera una imagen desde una URL base64 (data URL)
 * @param dataUrl - Data URL de la imagen (ej: data:image/jpeg;base64,...)
 * @returns Resultado de la moderación
 */
export async function moderateImageFromDataUrl(dataUrl: string): Promise<ModerationResult> {
  try {
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
