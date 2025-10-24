#!/usr/bin/env node

/**
 * Script de prueba para el sistema de face matching
 * Demuestra cómo usar la API desde Node.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuración
const API_BASE = 'http://localhost:3000';
const TEST_IMAGES_DIR = path.join(__dirname, 'test-images');

// Datos de prueba (simulados)
const mockPDF417Data = {
  documentNumber: '12345678',
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate: '01/01/1990',
  gender: 'M',
  expirationDate: '01/01/2030',
  rawData: 'Mock PDF417 data for testing'
};

/**
 * Función para probar el endpoint de verificación
 */
async function testIdentityVerification() {
  console.log('🧪 [TEST] Iniciando prueba de verificación de identidad...');
  
  try {
    // Crear FormData
    const formData = new FormData();
    
    // Agregar archivos de prueba (si existen)
    const selfiePath = path.join(TEST_IMAGES_DIR, 'selfie.jpg');
    const dniFrontPath = path.join(TEST_IMAGES_DIR, 'dni_front.jpg');
    const dniBackPath = path.join(TEST_IMAGES_DIR, 'dni_back.jpg');
    
    if (fs.existsSync(selfiePath)) {
      formData.append('selfie', fs.createReadStream(selfiePath));
      console.log('✅ [TEST] Selfie encontrada');
    } else {
      console.log('⚠️ [TEST] Selfie no encontrada, usando datos simulados');
      // Crear imagen dummy
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('selfie', dummyImage, { filename: 'selfie.jpg' });
    }
    
    if (fs.existsSync(dniFrontPath)) {
      formData.append('dniFront', fs.createReadStream(dniFrontPath));
      console.log('✅ [TEST] DNI front encontrado');
    } else {
      console.log('⚠️ [TEST] DNI front no encontrado, usando datos simulados');
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('dniFront', dummyImage, { filename: 'dni_front.jpg' });
    }
    
    if (fs.existsSync(dniBackPath)) {
      formData.append('dniBack', fs.createReadStream(dniBackPath));
      console.log('✅ [TEST] DNI back encontrado');
    }
    
    // Agregar datos PDF417
    formData.append('pdf417Data', JSON.stringify(mockPDF417Data));
    
    // Realizar petición
    console.log('📡 [TEST] Enviando petición a la API...');
    
    const response = await fetch(`${API_BASE}/api/verification/identity`, {
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
    } else {
      console.log('❌ [TEST] Verificación falló');
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en la prueba:', error.message);
  }
}

/**
 * Función para probar el endpoint de face matching con Python
 */
async function testPythonFaceMatch() {
  console.log('🐍 [TEST] Iniciando prueba de face matching con Python...');
  
  try {
    const formData = new FormData();
    
    // Agregar archivos de prueba
    const selfiePath = path.join(TEST_IMAGES_DIR, 'selfie.jpg');
    const dniFrontPath = path.join(TEST_IMAGES_DIR, 'dni_front.jpg');
    const dniBackPath = path.join(TEST_IMAGES_DIR, 'dni_back.jpg');
    
    if (fs.existsSync(selfiePath)) {
      formData.append('selfie', fs.createReadStream(selfiePath));
    } else {
      console.log('⚠️ [TEST] Usando imágenes dummy para prueba');
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('selfie', dummyImage, { filename: 'selfie.jpg' });
    }
    
    if (fs.existsSync(dniFrontPath)) {
      formData.append('dniFront', fs.createReadStream(dniFrontPath));
    } else {
      const dummyImage = Buffer.from('dummy-image-data');
      formData.append('dniFront', dummyImage, { filename: 'dni_front.jpg' });
    }
    
    if (fs.existsSync(dniBackPath)) {
      formData.append('dniBack', fs.createReadStream(dniBackPath));
    }
    
    console.log('📡 [TEST] Enviando petición al endpoint Python...');
    
    const response = await fetch(`${API_BASE}/api/verification/face-match`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    const result = await response.json();
    
    console.log('📊 [TEST] Resultado del face matching Python:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ [TEST] Error en la prueba Python:', error.message);
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
    console.log('   - dni_front.jpg (frente del DNI)');
    console.log('   - dni_back.jpg (dorso del DNI)');
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 [TEST] Iniciando pruebas del sistema de face matching');
  console.log('=' * 60);
  
  // Crear directorio de imágenes de prueba
  createTestImagesDir();
  
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
  console.log('\n1️⃣ Probando verificación de identidad (JS)...');
  await testIdentityVerification();
  
  console.log('\n2️⃣ Probando face matching con Python...');
  await testPythonFaceMatch();
  
  console.log('\n🎉 [TEST] Pruebas completadas');
  console.log('\nPara pruebas reales:');
  console.log('1. Coloca imágenes reales en scripts/test-images/');
  console.log('2. Asegúrate de que el servidor esté corriendo');
  console.log('3. Ejecuta: node test-face-match.js');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testIdentityVerification,
  testPythonFaceMatch,
  createTestImagesDir
};
