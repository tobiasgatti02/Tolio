import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

async function setupTestAccounts() {
  console.log('🚀 Configurando cuentas de prueba...\n')

  // 1. Crear Usuario Comprador (A)
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  let comprador = await prisma.user.upsert({
    where: { email: 'comprador@test.com' },
    update: {},
    create: {
      email: 'comprador@test.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Comprador',
      bio: 'Usuario que alquila artículos'
    }
  })
  console.log('✅ Comprador creado:', comprador.email)

  // 2. Crear Usuario Vendedor 1 (B1) con cuenta Stripe
  let vendedor1 = await prisma.user.upsert({
    where: { email: 'vendedor1@test.com' },
    update: {},
    create: {
      email: 'vendedor1@test.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'Vendedora',
      bio: 'Dueña de artículos para alquilar'
    }
  })

  // Crear cuenta de Stripe Connect para vendedor1
  if (!vendedor1.stripeAccountId) {
    const stripeAccount1 = await stripe.accounts.create({
      type: 'express',
      country: 'MX',
      email: 'vendedor1@test.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: vendedor1.id,
        email: vendedor1.email,
      },
    })

    vendedor1 = await prisma.user.update({
      where: { id: vendedor1.id },
      data: { stripeAccountId: stripeAccount1.id }
    })
    console.log('✅ Vendedor 1 creado con Stripe:', vendedor1.email, '→', stripeAccount1.id)
  } else {
    console.log('✅ Vendedor 1 ya existe:', vendedor1.email, '→', vendedor1.stripeAccountId)
  }

  // 3. Crear Usuario Vendedor 2 (B2) con cuenta Stripe
  let vendedor2 = await prisma.user.upsert({
    where: { email: 'vendedor2@test.com' },
    update: {},
    create: {
      email: 'vendedor2@test.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Vendedor',
      bio: 'Otro dueño de artículos'
    }
  })

  // Crear cuenta de Stripe Connect para vendedor2
  if (!vendedor2.stripeAccountId) {
    const stripeAccount2 = await stripe.accounts.create({
      type: 'express',
      country: 'MX',
      email: 'vendedor2@test.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: vendedor2.id,
        email: vendedor2.email,
      },
    })

    vendedor2 = await prisma.user.update({
      where: { id: vendedor2.id },
      data: { stripeAccountId: stripeAccount2.id }
    })
    console.log('✅ Vendedor 2 creado con Stripe:', vendedor2.email, '→', stripeAccount2.id)
  } else {
    console.log('✅ Vendedor 2 ya existe:', vendedor2.email, '→', vendedor2.stripeAccountId)
  }

  console.log('\n🎉 ¡Listo! Ahora puedes:\n')
  console.log('1️⃣ Login como COMPRADOR:')
  console.log('   Email: comprador@test.com')
  console.log('   Password: password123')
  console.log('   → Ve a /payments-admin → Tab "Como Comprador (A)"\n')

  console.log('2️⃣ Login como VENDEDOR 1:')
  console.log('   Email: vendedor1@test.com')
  console.log('   Password: password123')
  console.log('   → Ve a /payments-admin → Tab "Como Vendedor (B)"')
  console.log('   → Crea artículos, confirma entregas\n')

  console.log('3️⃣ Login como VENDEDOR 2:')
  console.log('   Email: vendedor2@test.com')
  console.log('   Password: password123')
  console.log('   → Otro vendedor con cuenta de Stripe diferente\n')

  console.log('4️⃣ Ver MARKETPLACE (C):')
  console.log('   → Login con cualquier usuario')
  console.log('   → Ve a /payments-admin → Tab "Como Marketplace (C)"')
  console.log('   → Verás todas las transacciones y comisiones\n')

  console.log('💳 Tarjeta de prueba: 4242 4242 4242 4242')
  console.log('📅 Fecha: cualquier fecha futura')
  console.log('🔐 CVV: cualquier 3 dígitos\n')
}

setupTestAccounts()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
