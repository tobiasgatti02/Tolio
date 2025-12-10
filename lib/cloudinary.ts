import { v2 as cloudinary } from 'cloudinary';

// Cloudinary se configura automáticamente con CLOUDINARY_URL
cloudinary.config({
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Sube una imagen base64 a Cloudinary
 */
export async function uploadImage(
  base64Image: string,
  folder: string = 'prestar'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto:good' }, // Optimización automática
        { fetch_format: 'auto' }, // WebP/AVIF según el navegador
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Sube múltiples imágenes a Cloudinary
 */
export async function uploadImages(
  base64Images: string[],
  folder: string = 'prestar'
): Promise<UploadResult[]> {
  const results = await Promise.all(
    base64Images.map((img) => uploadImage(img, folder))
  );
  return results;
}

/**
 * Elimina una imagen de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}

/**
 * Genera una URL optimizada para thumbnails
 */
export function getThumbnailUrl(url: string, width: number = 400): string {
  // Si ya es una URL de Cloudinary, transformarla
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`);
  }
  return url;
}

export default cloudinary;
