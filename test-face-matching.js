#!/usr/bin/env node

/**
 * Script de prueba para verificar que face-api.js funciona correctamente
 * Este script prueba la funcionalidad básica de comparación facial
 */

const { compareFacesForBackend } = require('../lib/face-matching.ts');

// Imágenes de prueba (base64 de imágenes simples para testing)
const testImage1 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
const testImage2 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

async function testFaceMatching() {
  console.log('🧪 [TEST] Iniciando prueba de face matching...');

  try {
    const result = await compareFacesForBackend(testImage1, testImage2);
    console.log('✅ [TEST] Resultado:', result);

    if (result.score >= 0 && result.score <= 1) {
      console.log('✅ [TEST] Score válido');
    } else {
      console.log('❌ [TEST] Score inválido');
    }

  } catch (error) {
    console.error('❌ [TEST] Error:', error.message);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  testFaceMatching();
}

module.exports = { testFaceMatching };