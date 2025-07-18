import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')
  
  // Categorías para Tolio
  const categories = [
    {
      name: "Electrónicos",
      icon: "📱",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="15" x2="13" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    {
      name: "Vehículos",
      icon: "🚗",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m3 17 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="m3 7 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 6h8l-2 6-2 4H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="18" cy="18" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Deportes",
      icon: "⚽",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="m8.5 8.5 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="m15.5 8.5-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    {
      name: "Hogar",
      icon: "🏠",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Libros",
      icon: "📚",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Música",
      icon: "🎵",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Cámara",
      icon: "📷",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Camping",
      icon: "⛺",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 21 14 3l.5 18 5.5-18L23 21z" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M12 6v15" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    {
      name: "Cocina",
      icon: "🍴",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M7 2v20" stroke="currentColor" stroke-width="2"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M18 15v7" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    {
      name: "Arte",
      icon: "🎨",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    },
    {
      name: "Computadoras",
      icon: "💻",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    {
      name: "Herramientas",
      icon: "🔧",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>`
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
