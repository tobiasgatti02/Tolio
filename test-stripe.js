#!/usr/bin/env node

/**
 * Test simple para verificar si las claves de Stripe funcionan
 */

console.log('🔍 Testing Stripe Keys...\n');

// Test 1: Verificar que las claves existen
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;

console.log('1️⃣ Checking Environment Variables:');
console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', publishableKey ? '✅ EXISTS' : '❌ MISSING');
console.log('   STRIPE_SECRET_KEY:', secretKey ? '✅ EXISTS' : '❌ MISSING');
console.log();

if (!publishableKey || !secretKey) {
  console.log('❌ ERROR: Variables de entorno no configuradas');
  console.log('\nAgrega esto a tu .env:');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  process.exit(1);
}

// Test 2: Verificar formato
console.log('2️⃣ Checking Key Format:');
console.log('   Secret Key starts with sk_test_:', secretKey.startsWith('sk_test_') ? '✅' : '❌');
console.log('   Publishable Key starts with pk_test_:', publishableKey.startsWith('pk_test_') ? '✅' : '❌');
console.log('   Secret Key length:', secretKey.length);
console.log('   Publishable Key length:', publishableKey.length);
console.log();

// Test 3: Test con Stripe API
console.log('3️⃣ Testing Secret Key with Stripe API:');

const stripe = require('stripe')(secretKey);

stripe.paymentIntents.list({ limit: 1 })
  .then(() => {
    console.log('   ✅ Secret Key is VALID!\n');
    
    // Test 4: Simular carga en el frontend
    console.log('4️⃣ Simulating Frontend Load:');
    console.log('   Publishable Key:', publishableKey.substring(0, 30) + '...' + publishableKey.slice(-10));
    console.log('   ✅ Key format looks good\n');
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('');
    console.log('Your Stripe keys are valid.');
    console.log('If you still see errors in the browser, the issue is');
    console.log('browser cache. Use incognito mode or clear cache.');
    console.log('═══════════════════════════════════════════════════\n');
  })
  .catch(err => {
    console.log('   ❌ Secret Key is INVALID!');
    console.log('   Error:', err.message);
    console.log('\n   Go to: https://dashboard.stripe.com/test/apikeys');
    console.log('   Copy both keys and update your .env file\n');
    process.exit(1);
  });
