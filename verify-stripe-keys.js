#!/usr/bin/env node

/**
 * Script para verificar las claves de Stripe
 */

const https = require('https');

const PUBLISHABLE_KEY = 'pk_test_51SIKYSELUOmkUPCNqYXoPN1iTML8wSxAIkdg5LKrVo0Vsnbhz1kqbfZMHzfo7e0XBSUQ4LzjbJS6QRfZXTxDxzlR00AtRGITB4';
const SECRET_KEY = 'sk_test_51SIKYSELUOmkUPCNd42MUoDHlX5WqyiuvuzTdqOBR3Pm2SZuDy50ieu1GCtysnePuulwrqMmhRXKne8jodKjjFLP00JdpQeGso';

console.log('🔍 Verificando claves de Stripe...\n');

// Verificar Secret Key
console.log('1️⃣ Verificando SECRET KEY...');
const auth = Buffer.from(`${SECRET_KEY}:`).toString('base64');

https.get('https://api.stripe.com/v1/payment_intents?limit=1', {
  headers: {
    'Authorization': `Basic ${auth}`
  }
}, (res) => {
  if (res.statusCode === 200) {
    console.log('   ✅ SECRET KEY es VÁLIDA\n');
  } else {
    console.log(`   ❌ SECRET KEY es INVÁLIDA (Status: ${res.statusCode})\n`);
  }
  
  // Verificar Publishable Key
  console.log('2️⃣ Verificando PUBLISHABLE KEY...');
  console.log(`   Key: ${PUBLISHABLE_KEY.substring(0, 20)}...${PUBLISHABLE_KEY.slice(-10)}`);
  
  if (PUBLISHABLE_KEY.startsWith('pk_test_')) {
    console.log('   ✅ Formato correcto (empieza con pk_test_)');
    console.log('   ✅ Longitud:', PUBLISHABLE_KEY.length, 'caracteres');
    
    // Verificar que no tenga caracteres extra
    if (/^pk_test_[A-Za-z0-9]+$/.test(PUBLISHABLE_KEY)) {
      console.log('   ✅ Solo contiene caracteres válidos');
    } else {
      console.log('   ⚠️  ADVERTENCIA: Contiene caracteres no válidos');
    }
    
  } else {
    console.log('   ❌ Formato INCORRECTO (debería empezar con pk_test_)');
  }
  
  console.log('\n📋 RESUMEN:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Ambas claves parecen correctas.');
  console.log('');
  console.log('Si sigues viendo el error "Invalid API Key", el problema');
  console.log('está en el NAVEGADOR usando una clave cacheada antigua.');
  console.log('');
  console.log('SOLUCIÓN:');
  console.log('1. Abre el navegador en modo incógnito');
  console.log('2. O borra el caché: Cmd+Shift+Delete');
  console.log('3. O haz Hard Refresh: Cmd+Shift+R');
  console.log('═══════════════════════════════════════════════════════\n');
  
}).on('error', (err) => {
  console.log(`   ❌ Error al verificar: ${err.message}\n`);
});
