/**
 * Script para migrar imágenes de base64 a Cloudinary
 * 
 * Ejecutar con: npx tsx scripts/migrate-images-to-cloudinary.ts
 */

import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../lib/utils';

// Configurar Cloudinary
cloudinary.config({
  secure: true,
});

async function uploadToCloudinary(base64: string, folder: string): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('  ❌ Error uploading:', error);
    return null;
  }
}

function isBase64(str: string): boolean {
  return str.startsWith('data:image');
}

async function migrateServices() {
  console.log('\n📦 Migrando SERVICIOS...\n');
  
  const services = await prisma.service.findMany({
    select: { id: true, title: true, images: true },
  });

  let migrated = 0;
  let failed = 0;

  for (const service of services) {
    const hasBase64 = service.images.some(isBase64);
    if (!hasBase64) {
      console.log(`⏭️  ${service.title} - Ya migrado`);
      continue;
    }

    console.log(`🔄 Migrando: ${service.title}`);
    const newImages: string[] = [];

    for (let i = 0; i < service.images.length; i++) {
      const img = service.images[i];
      if (isBase64(img)) {
        console.log(`  📤 Subiendo imagen ${i + 1}...`);
        const url = await uploadToCloudinary(img, 'prestar/services');
        if (url) {
          newImages.push(url);
          console.log(`  ✅ Subida: ${url.substring(0, 60)}...`);
        } else {
          failed++;
          newImages.push(img); // Mantener base64 si falla
        }
      } else {
        newImages.push(img); // Ya es URL
      }
    }

    // Actualizar en la base de datos
    await prisma.service.update({
      where: { id: service.id },
      data: { images: newImages },
    });
    
    migrated++;
    console.log(`  ✅ Servicio actualizado\n`);
  }

  console.log(`\n📊 Servicios: ${migrated} migrados, ${failed} errores`);
}

async function migrateItems() {
  console.log('\n📦 Migrando ITEMS (Herramientas)...\n');
  
  const items = await prisma.item.findMany({
    select: { id: true, title: true, images: true },
  });

  let migrated = 0;
  let failed = 0;

  for (const item of items) {
    const hasBase64 = item.images.some(isBase64);
    if (!hasBase64) {
      console.log(`⏭️  ${item.title} - Ya migrado`);
      continue;
    }

    console.log(`🔄 Migrando: ${item.title}`);
    const newImages: string[] = [];

    for (let i = 0; i < item.images.length; i++) {
      const img = item.images[i];
      if (isBase64(img)) {
        console.log(`  📤 Subiendo imagen ${i + 1}...`);
        const url = await uploadToCloudinary(img, 'prestar/items');
        if (url) {
          newImages.push(url);
          console.log(`  ✅ Subida: ${url.substring(0, 60)}...`);
        } else {
          failed++;
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }

    await prisma.item.update({
      where: { id: item.id },
      data: { images: newImages },
    });
    
    migrated++;
    console.log(`  ✅ Item actualizado\n`);
  }

  console.log(`\n📊 Items: ${migrated} migrados, ${failed} errores`);
}

async function migrateUserProfiles() {
  console.log('\n📦 Migrando FOTOS DE PERFIL...\n');
  
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, profileImage: true },
    where: { profileImage: { not: null } },
  });

  let migrated = 0;

  for (const user of users) {
    if (!user.profileImage || !isBase64(user.profileImage)) {
      continue;
    }

    console.log(`🔄 Migrando perfil: ${user.firstName}`);
    const url = await uploadToCloudinary(user.profileImage, 'prestar/profiles');
    
    if (url) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: url },
      });
      migrated++;
      console.log(`  ✅ Actualizado\n`);
    }
  }

  console.log(`\n📊 Perfiles: ${migrated} migrados`);
}

async function main() {
  console.log('🚀 Iniciando migración a Cloudinary...');
  console.log('=====================================\n');

  try {
    // Verificar conexión a Cloudinary
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión a Cloudinary OK\n');

    await migrateServices();
    await migrateItems();
    await migrateUserProfiles();

    console.log('\n=====================================');
    console.log('✅ Migración completada!');
    console.log('=====================================\n');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
