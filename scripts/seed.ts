import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando el poblado de la base de datos...')

  // Limpiar datos existentes (opcional)
  console.log('🧹 Limpiando datos existentes...')
  await prisma.notification.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.item.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.category.deleteMany({})

  // Crear categorías
  console.log('📁 Creando categorías...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nombre: 'Electrónicos',
        descripcion: 'Dispositivos electrónicos y gadgets tecnológicos',
        imagen: '/categories/electronics.jpg',
        subcategorias: {
          create: [
            { nombre: 'Smartphones', descripcion: 'Teléfonos móviles y accesorios' },
            { nombre: 'Laptops', descripcion: 'Computadoras portátiles' },
            { nombre: 'Cámaras', descripcion: 'Cámaras fotográficas y de video' },
            { nombre: 'Audio', descripcion: 'Auriculares, altavoces y equipos de sonido' },
            { nombre: 'Gaming', descripcion: 'Consolas de videojuegos y accesorios' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Deportes',
        descripcion: 'Equipamiento deportivo y actividades físicas',
        imagen: '/categories/sports.jpg',
        subcategorias: {
          create: [
            { nombre: 'Ciclismo', descripcion: 'Bicicletas y equipamiento ciclista' },
            { nombre: 'Fitness', descripcion: 'Equipos de gimnasio y ejercicio' },
            { nombre: 'Acuáticos', descripcion: 'Deportes náuticos y de agua' },
            { nombre: 'Montaña', descripcion: 'Senderismo, escalada y montañismo' },
            { nombre: 'Colectivos', descripcion: 'Deportes de equipo' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Hogar',
        descripcion: 'Artículos para el hogar y la vida doméstica',
        imagen: '/categories/home.jpg',
        subcategorias: {
          create: [
            { nombre: 'Electrodomésticos', descripcion: 'Aparatos eléctricos para el hogar' },
            { nombre: 'Herramientas', descripcion: 'Herramientas de bricolaje y construcción' },
            { nombre: 'Jardín', descripcion: 'Equipos de jardinería y exterior' },
            { nombre: 'Cocina', descripcion: 'Utensilios y equipos de cocina' },
            { nombre: 'Limpieza', descripcion: 'Equipos de limpieza del hogar' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Transporte',
        descripcion: 'Vehículos y medios de transporte',
        imagen: '/categories/transport.jpg',
        subcategorias: {
          create: [
            { nombre: 'Automóviles', descripcion: 'Coches y vehículos particulares' },
            { nombre: 'Motocicletas', descripcion: 'Motos y scooters' },
            { nombre: 'Bicicletas', descripcion: 'Bicicletas de todo tipo' },
            { nombre: 'Patinetes', descripcion: 'Patinetes eléctricos y manuales' },
            { nombre: 'Náutico', descripcion: 'Embarcaciones y equipos náuticos' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Eventos',
        descripcion: 'Equipamiento para eventos y celebraciones',
        imagen: '/categories/events.jpg',
        subcategorias: {
          create: [
            { nombre: 'Bodas', descripcion: 'Decoración y equipos para bodas' },
            { nombre: 'Fiestas', descripcion: 'Artículos para celebraciones' },
            { nombre: 'Corporativos', descripcion: 'Equipos para eventos empresariales' },
            { nombre: 'Infantiles', descripcion: 'Decoración y juegos para niños' },
            { nombre: 'Audiovisual', descripcion: 'Equipos de sonido e imagen' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Moda',
        descripcion: 'Ropa, accesorios y artículos de moda',
        imagen: '/categories/fashion.jpg',
        subcategorias: {
          create: [
            { nombre: 'Ropa Formal', descripcion: 'Trajes y vestimenta elegante' },
            { nombre: 'Accesorios', descripcion: 'Bolsos, joyas y complementos' },
            { nombre: 'Calzado', descripcion: 'Zapatos y calzado especializado' },
            { nombre: 'Vintage', descripcion: 'Ropa y accesorios vintage' },
            { nombre: 'Disfraces', descripcion: 'Disfraces y vestuario temático' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Ocio',
        descripcion: 'Entretenimiento y actividades de tiempo libre',
        imagen: '/categories/leisure.jpg',
        subcategorias: {
          create: [
            { nombre: 'Juegos', descripcion: 'Juegos de mesa y entretenimiento' },
            { nombre: 'Música', descripcion: 'Instrumentos musicales' },
            { nombre: 'Lectura', descripcion: 'Libros y material de lectura' },
            { nombre: 'Arte', descripcion: 'Materiales artísticos y creativos' },
            { nombre: 'Coleccionables', descripcion: 'Objetos de colección' }
          ]
        }
      }
    }),
    prisma.category.create({
      data: {
        nombre: 'Trabajo',
        descripcion: 'Equipos y herramientas profesionales',
        imagen: '/categories/work.jpg',
        subcategorias: {
          create: [
            { nombre: 'Oficina', descripcion: 'Equipos y muebles de oficina' },
            { nombre: 'Profesional', descripcion: 'Herramientas profesionales especializadas' },
            { nombre: 'Construcción', descripcion: 'Maquinaria y herramientas de construcción' },
            { nombre: 'Salud', descripcion: 'Equipos médicos y de salud' },
            { nombre: 'Educación', descripcion: 'Material educativo y formativo' }
          ]
        }
      }
    })
  ])

  console.log(`✅ Creadas ${categories.length} categorías con sus subcategorías`)

  // Crear usuarios
  console.log('👥 Creando usuarios...')
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'juan@ejemplo.com',
        password: hashedPassword,
        firstName: 'Juan',
        lastName: 'Pérez',
        bio: 'Amante de la tecnología y el deporte',
        phoneNumber: '+34 600 123 456',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria@ejemplo.com',
        password: hashedPassword,
        firstName: 'María',
        lastName: 'García',
        bio: 'Fotógrafa profesional y viajera',
        phoneNumber: '+34 600 234 567',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'carlos@ejemplo.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'López',
        bio: 'Chef y amante de la cocina',
        phoneNumber: '+34 600 345 678',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'ana@ejemplo.com',
        password: hashedPassword,
        firstName: 'Ana',
        lastName: 'Martín',
        bio: 'Diseñadora gráfica y artista',
        phoneNumber: '+34 600 456 789',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'tobiasgatti04@gmail.com',
        password: hashedPassword,
        firstName: 'Tobias',
        lastName: 'Gatti',
        bio: 'Desarrollador Full Stack',
        phoneNumber: '+34 600 567 890',
        isVerified: true,
      }
    })
  ])

  console.log(`✅ Creados ${users.length} usuarios`)

  // Crear artículos
  console.log('📦 Creando artículos...')
  const items = await Promise.all([
    // Artículos de Juan
    prisma.item.create({
      data: {
        title: 'Cámara DSLR Canon EOS 5D Mark IV',
        description: 'Cámara profesional en excelente estado, ideal para fotografía profesional y eventos. Incluye batería extra y tarjeta de memoria.',
        price: 45.0,
        deposit: 200.0,
        category: 'Fotografía',
        location: 'Madrid, España',
        features: ['30.4MP', 'Grabación 4K', 'WiFi', 'GPS'],
        images: ['/placeholder.jpg'],
        ownerId: users[0].id,
        isAvailable: true,
      }
    }),
    prisma.item.create({
      data: {
        title: 'Bicicleta de Montaña Trek',
        description: 'Bicicleta de montaña Trek en perfectas condiciones. Ideal para rutas de montaña y ciclismo urbano.',
        price: 25.0,
        deposit: 150.0,
        category: 'Deportes',
        location: 'Madrid, España',
        features: ['Suspensión delantera', '21 velocidades', 'Frenos de disco'],
        images: ['/placeholder.jpg'],
        ownerId: users[0].id,
        isAvailable: true,
      }
    }),
    // Artículos de María
    prisma.item.create({
      data: {
        title: 'Proyector 4K Epson',
        description: 'Proyector 4K de alta calidad para presentaciones y entretenimiento en casa. Perfecto para eventos.',
        price: 35.0,
        deposit: 180.0,
        category: 'Electrónicos',
        location: 'Barcelona, España',
        features: ['4K Ultra HD', '3000 lúmenes', 'WiFi', 'Bluetooth'],
        images: ['/placeholder.jpg'],
        ownerId: users[1].id,
        isAvailable: true,
      }
    }),
    prisma.item.create({
      data: {
        title: 'Tienda de Campaña 4 Personas',
        description: 'Tienda de campaña resistente al agua para 4 personas. Perfecta para camping y aventuras al aire libre.',
        price: 20.0,
        deposit: 80.0,
        category: 'Camping',
        location: 'Barcelona, España',
        features: ['Resistente al agua', '4 personas', 'Fácil montaje'],
        images: ['/placeholder.jpg'],
        ownerId: users[1].id,
        isAvailable: false,
      }
    }),
    // Artículos de Carlos
    prisma.item.create({
      data: {
        title: 'Robot de Cocina KitchenAid',
        description: 'Robot de cocina profesional KitchenAid. Perfecto para repostería y cocina en general.',
        price: 15.0,
        deposit: 120.0,
        category: 'Cocina',
        location: 'Valencia, España',
        features: ['10 velocidades', 'Accesorios incluidos', 'Motor potente'],
        images: ['/placeholder.jpg'],
        ownerId: users[2].id,
        isAvailable: true,
      }
    }),
    prisma.item.create({
      data: {
        title: 'Taladro Percutor Bosch',
        description: 'Taladro percutor profesional Bosch con maletín y brocas. Ideal para trabajos de bricolaje.',
        price: 12.0,
        deposit: 60.0,
        category: 'Herramientas',
        location: 'Valencia, España',
        features: ['Percutor', 'Maletín incluido', 'Brocas variadas'],
        images: ['/placeholder.jpg'],
        ownerId: users[2].id,
        isAvailable: true,
      }
    }),
    // Artículos de Ana
    prisma.item.create({
      data: {
        title: 'Tablet Gráfica Wacom',
        description: 'Tablet gráfica profesional Wacom para diseño digital. Incluye lápiz digital y software.',
        price: 18.0,
        deposit: 90.0,
        category: 'Diseño',
        location: 'Sevilla, España',
        features: ['Presión 8192 niveles', 'Software incluido', 'Inalámbrica'],
        images: ['/placeholder.jpg'],
        ownerId: users[3].id,
        isAvailable: true,
      }
    }),
    // Artículos de Tobias
    prisma.item.create({
      data: {
        title: 'MacBook Pro 16" M1 Pro',
        description: 'MacBook Pro 16 pulgadas con chip M1 Pro. Ideal para desarrollo, diseño y edición de video.',
        price: 60.0,
        deposit: 800.0,
        category: 'Tecnología',
        location: 'Madrid, España',
        features: ['Chip M1 Pro', '32GB RAM', '1TB SSD', 'Pantalla Retina'],
        images: ['/placeholder.jpg'],
        ownerId: users[4].id,
        isAvailable: true,
      }
    }),
    prisma.item.create({
      data: {
        title: 'Mesa de Ping Pong Profesional',
        description: 'Mesa de ping pong profesional plegable. Incluye red, raquetas y pelotas.',
        price: 30.0,
        deposit: 200.0,
        category: 'Deportes',
        location: 'Madrid, España',
        features: ['Plegable', 'Raquetas incluidas', 'Red profesional'],
        images: ['/placeholder.jpg'],
        ownerId: users[4].id,
        isAvailable: true,
      }
    })
  ])

  console.log(`✅ Creados ${items.length} artículos`)

  // Crear reservas/bookings
  console.log('📅 Creando reservas...')
  const bookings = await Promise.all([
    // María reserva la cámara de Juan
    prisma.booking.create({
      data: {
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        totalPrice: 225.0, // 5 días × 45€
        status: 'COMPLETED',
        itemId: items[0].id,
        borrowerId: users[1].id,
        ownerId: users[0].id,
      }
    }),
    // Carlos reserva el proyector de María
    prisma.booking.create({
      data: {
        startDate: new Date('2025-01-22'),
        endDate: new Date('2025-01-25'),
        totalPrice: 105.0, // 3 días × 35€
        status: 'CONFIRMED',
        itemId: items[2].id,
        borrowerId: users[2].id,
        ownerId: users[1].id,
      }
    }),
    // Ana reserva la bicicleta de Juan
    prisma.booking.create({
      data: {
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-01-28'),
        totalPrice: 75.0, // 3 días × 25€
        status: 'PENDING',
        itemId: items[1].id,
        borrowerId: users[3].id,
        ownerId: users[0].id,
      }
    }),
    // Tobias reserva el robot de cocina de Carlos
    prisma.booking.create({
      data: {
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        totalPrice: 75.0, // 5 días × 15€
        status: 'COMPLETED',
        itemId: items[4].id,
        borrowerId: users[4].id,
        ownerId: users[2].id,
      }
    }),
    // Juan reserva la tablet de Ana
    prisma.booking.create({
      data: {
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        totalPrice: 72.0, // 4 días × 18€
        status: 'PENDING',
        itemId: items[6].id,
        borrowerId: users[0].id,
        ownerId: users[3].id,
      }
    })
  ])

  console.log(`✅ Creadas ${bookings.length} reservas`)

  // Crear reviews
  console.log('⭐ Creando reseñas...')
  const reviews = await Promise.all([
    // María review sobre la cámara de Juan (booking completado)
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excelente cámara, en perfecto estado. Juan muy amable y responsable. ¡Recomendado!',
        itemId: items[0].id,
        reviewerId: users[1].id,
        revieweeId: users[0].id,
        bookingId: bookings[0].id, // Booking completado de María para la cámara
      }
    }),
    // Tobias review sobre el robot de cocina de Carlos (booking completado)
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Robot de cocina muy útil, funcionó perfectamente. Carlos fue muy profesional.',
        itemId: items[4].id,
        reviewerId: users[4].id,
        revieweeId: users[2].id,
        bookingId: bookings[3].id, // Booking completado de Tobias para el robot
      }
    })
    // Eliminé la tercera review que causaba el conflicto
  ])

  console.log(`✅ Creadas ${reviews.length} reseñas`)

  // Crear notificaciones
  console.log('🔔 Creando notificaciones...')
  const notifications = await Promise.all([
    // Notificaciones para Juan
    prisma.notification.create({
      data: {
        type: 'BOOKING_REQUEST',
        content: 'Ana ha solicitado reservar tu bicicleta de montaña',
        isRead: false,
        userId: users[0].id,
      }
    }),
    prisma.notification.create({
      data: {
        type: 'REVIEW_RECEIVED',
        content: 'María te ha dejado una reseña de 5 estrellas',
        isRead: false,
        userId: users[0].id,
      }
    }),
    // Notificaciones para María
    prisma.notification.create({
      data: {
        type: 'BOOKING_CONFIRMED',
        content: 'Carlos ha confirmado tu reserva del proyector 4K',
        isRead: true,
        userId: users[1].id,
      }
    }),
    // Notificaciones para Carlos
    prisma.notification.create({
      data: {
        type: 'PAYMENT_RECEIVED',
        content: 'Has recibido €75 por el alquiler del robot de cocina',
        isRead: false,
        userId: users[2].id,
      }
    }),
    // Notificaciones para Tobias
    prisma.notification.create({
      data: {
        type: 'BOOKING_CONFIRMED',
        content: 'Tu reserva del robot de cocina ha sido completada',
        isRead: false,
        userId: users[4].id,
      }
    })
  ])

  console.log(`✅ Creadas ${notifications.length} notificaciones`)

  console.log('🎉 ¡Base de datos poblada exitosamente!')
  console.log('\n📊 Resumen:')
  console.log(`👥 Usuarios: ${users.length}`)
  console.log(`📦 Artículos: ${items.length}`)
  console.log(`📅 Reservas: ${bookings.length}`)
  console.log(`⭐ Reseñas: ${reviews.length}`)
  console.log(`🔔 Notificaciones: ${notifications.length}`)
  console.log('\n🔑 Credenciales de prueba:')
  console.log('Email: tobiasgatti04@gmail.com')
  console.log('Password: password123')
  console.log('\nOtros usuarios:')
  console.log('juan@ejemplo.com / password123')
  console.log('maria@ejemplo.com / password123')
  console.log('carlos@ejemplo.com / password123')
  console.log('ana@ejemplo.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error poblando la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
