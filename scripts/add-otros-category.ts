import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('➕ Agregando categoría "Otros"...')

  // Verificar si ya existe
  const existing = await prisma.category.findFirst({
    where: { nombre: 'Otros' }
  })

  if (existing) {
    console.log('✅ La categoría "Otros" ya existe')
    return
  }

  // Crear la categoría
  const category = await prisma.category.create({
    data: {
      nombre: 'Otros',
      descripcion: 'Artículos diversos y misceláneos',
      imagen: '/categories/others.jpg',
      subcategorias: {
        create: [
          { nombre: 'General', descripcion: 'Artículos diversos' },
          { nombre: 'Varios', descripcion: 'Otros artículos no categorizados' }
        ]
      }
    }
  })

  console.log('✅ Categoría "Otros" creada exitosamente:', category.nombre)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
