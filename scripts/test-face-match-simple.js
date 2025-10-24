#!/usr/bin/env node

/**
 * Script de prueba para face matching simple (sin DNI)
 * Perfecto para testing cuando no tienes DNI a mano
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuración
const API_BASE = 'http://localhost:3000';
const TEST_IMAGES_DIR = path.join(__dirname, 'test-images');

/**
 * Función para probar el endpoint de face matching simple
 */
async function testSimpleFaceMatch() {
  console.log('🎭 [TEST] Iniciando prueba de face matching simple...');
  
  try {
    // Crear FormData
    const formData = new FormData();
    
    // Agregar archivos de prueba (si existen)
    const selfiePath = path.join(TEST_IMAGES_DIR, 'selfie.jpg');
    const referencePath = path.join(TEST_IMAGES_DIR, 'reference.jpg');
    
    if (fs.existsSync(selfiePath)) {
      formData.append('selfie', fs.createReadStream(selfiePath));
      console.log('✅ [TEST] Selfie encontrada');
    } else {
      console.log('⚠️ [TEST] Selfie no encontrada, usando datos simulados');
      // Crear imagen dummy
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('selfie', dummyImage, { filename: 'selfie.jpg' });
    }
    
    if (fs.existsSync(referencePath)) {
      formData.append('referencePhoto', fs.createReadStream(referencePath));
      console.log('✅ [TEST] Foto de referencia encontrada');
    } else {
      console.log('⚠️ [TEST] Foto de referencia no encontrada, usando datos simulados');
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('referencePhoto', dummyImage, { filename: 'reference.jpg' });
    }
    
    // Realizar petición
    console.log('📡 [TEST] Enviando petición a la API...');
    
    const response = await fetch(`${API_BASE}/api/verification/face-match-simple`, {
      method: 'POST',
      body: formData,
      headers: {
        // Nota: En producción necesitarías autenticación real
        'Authorization': 'Bearer test-token'
      }
    });
    
    const result = await response.json();
    
    console.log('📊 [TEST] Resultado de la verificación:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ [TEST] Verificación completada exitosamente');
      console.log(`   - Status: ${result.status}`);
      console.log(`   - Face Match: ${result.faceMatch?.isMatch ? '✅' : '❌'}`);
      console.log(`   - Liveness: ${result.liveness?.isLive ? '✅' : '❌'}`);
      console.log(`   - Final Result: ${result.finalResult?.isMatch ? '✅' : '❌'}`);
      console.log(`   - Combined Score: ${(result.finalResult?.combinedScore * 100)?.toFixed(1)}%`);
    } else {
      console.log('❌ [TEST] Verificación falló');
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en la prueba:', error.message);
  }
}

/**
 * Función para crear directorio de imágenes de prueba
 */
function createTestImagesDir() {
  if (!fs.existsSync(TEST_IMAGES_DIR)) {
    fs.mkdirSync(TEST_IMAGES_DIR, { recursive: true });
    console.log('📁 [TEST] Directorio de imágenes de prueba creado:', TEST_IMAGES_DIR);
    console.log('   Coloca tus imágenes de prueba en:');
    console.log('   - selfie.jpg (selfie del usuario)');
    console.log('   - reference.jpg (cualquier foto tuya de referencia)');
  }
}

/**
 * Función para crear imágenes de prueba dummy
 */
function createDummyImages() {
  const selfiePath = path.join(TEST_IMAGES_DIR, 'selfie.jpg');
  const referencePath = path.join(TEST_IMAGES_DIR, 'reference.jpg');
  
  if (!fs.existsSync(selfiePath)) {
    // Crear imagen dummy para selfie
    const dummyImage = Buffer.from('dummy-selfie-data');
    fs.writeFileSync(selfiePath, dummyImage);
    console.log('📸 [TEST] Imagen dummy de selfie creada');
  }
  
  if (!fs.existsSync(referencePath)) {
    // Crear imagen dummy para referencia
    const dummyImage = Buffer.from('dummy-reference-data');
    fs.writeFileSync(referencePath, dummyImage);
    console.log('📸 [TEST] Imagen dummy de referencia creada');
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 [TEST] Iniciando pruebas del sistema de face matching simple');
  console.log('=' * 60);
  
  // Crear directorio de imágenes de prueba
  createTestImagesDir();
  
  // Crear imágenes dummy si no existen
  createDummyImages();
  
  // Verificar que el servidor esté corriendo
  try {
    const healthCheck = await fetch(`${API_BASE}/api/health`);
    if (!healthCheck.ok) {
      console.log('⚠️ [TEST] Servidor no disponible, iniciando pruebas con datos simulados');
    }
  } catch (error) {
    console.log('⚠️ [TEST] No se pudo conectar al servidor, iniciando pruebas con datos simulados');
  }
  
  // Ejecutar pruebas
  console.log('\n🎭 Probando face matching simple (sin DNI)...');
  await testSimpleFaceMatch();
  
  console.log('\n🎉 [TEST] Pruebas completadas');
  console.log('\nPara pruebas reales:');
  console.log('1. Coloca imágenes reales en scripts/test-images/');
  console.log('2. Asegúrate de que el servidor esté corriendo');
  console.log('3. Ejecuta: node test-face-match-simple.js');
  console.log('\nO usa la interfaz web: http://localhost:3000/test-face-match');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSimpleFaceMatch,
  createTestImagesDir,
  createDummyImages
};
