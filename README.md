# 🔧 Tolio - Plataforma de Servicios y Herramientas

**Tolio** es la plataforma donde conectás con profesionales para changas y encontrás herramientas en tu zona.

## ✨ **Características Principales**

- �️ **Publicación de Servicios**: Plomeros, electricistas, y todo tipo de oficios
- � **Préstamo de Herramientas**: Compartí y pedí herramientas en tu comunidad
- 🎨 **Diseño Moderno**: UI cálida y amigable con Tailwind CSS
- 📱 **100% Responsive**: Funciona perfectamente en móvil y desktop
- � **Paleta Vibrante**: Colores naranja-melón, azul y verde natural
- 🔒 **Autenticación Segura**: NextAuth con verificación de identidad

---

## 🚀 **Inicio Rápido**

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar variables de entorno**
Crea `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
MARKETPLACE_FEE_PERCENTAGE=5
```

### **3. Configurar la base de datos**
```bash
cd server
npx prisma migrate dev
npx prisma generate
cd ..
```

### **4. Iniciar el servidor**
```bash
npm run dev
```

### **5. Probar el sistema**
Abre: [http://localhost:3000/test-stripe](http://localhost:3000/test-stripe)

---

## 📚 **Documentación**

- 📖 **[INDEX.md](./INDEX.md)** - Índice completo de documentación
- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Inicio rápido en 5 minutos
- 🧪 **[TESTING.md](./TESTING.md)** - Guía completa de testing
- 📋 **[STRIPE_ESCROW.md](./STRIPE_ESCROW.md)** - Documentación técnica
- ✅ **[SUMMARY.md](./SUMMARY.md)** - Resumen ejecutivo
- 📝 **[TODO.md](./TODO.md)** - Tareas pendientes

---

## 💳 **Sistema de Pagos**

### **Flujo de Escrow:**

```
1. Renter autoriza el pago
   └─► Dinero RETENIDO (no cobrado)
   └─► Status: requires_capture

2. Owner entrega el artículo
   └─► Owner captura el pago
   └─► Dinero COBRADO

3. Distribución automática
   ├─► 95% → Owner (Transfer)
   └─► 5% → Marketplace (Fee)
```

### **Endpoints de API:**

- `POST /api/stripe/create-connected-account` - Crear cuenta Connect
- `POST /api/stripe/create-payment-intent` - Retener pago
- `POST /api/stripe/capture-payment` - Capturar y transferir
- `POST /api/stripe/refund-payment` - Reembolsar

---

## 🎨 **Stack Tecnológico**

- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js
- **Pagos**: Stripe + Stripe Connect
- **UI**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod

---

## 🧪 **Testing**

### **Tarjetas de Prueba:**
```
Éxito:   4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### **Página de Testing:**
```bash
npm run dev
# Abre: http://localhost:3000/test-stripe
```

Ver guía completa: **[TESTING.md](./TESTING.md)**

---

## 📂 **Estructura del Proyecto**

```
prestar/
├── app/
│   ├── api/stripe/              # API de Stripe
│   ├── test-stripe/             # Página de testing
│   └── ...
├── components/
│   ├── stripe-payment-form.tsx  # Formulario de pago
│   └── ui/                      # Componentes de shadcn/ui
├── lib/
│   ├── stripe.ts                # Configuración de Stripe
│   └── ...
├── server/
│   └── prisma/
│       └── schema.prisma        # Schema de la base de datos
├── docs/
│   ├── INDEX.md                 # Índice de documentación
│   ├── QUICKSTART.md            # Inicio rápido
│   ├── TESTING.md               # Guía de testing
│   ├── STRIPE_ESCROW.md         # Documentación técnica
│   ├── SUMMARY.md               # Resumen
│   └── TODO.md                  # Tareas
└── README.md                    # Este archivo
```

---

## 🔐 **Seguridad**

- ✅ Autenticación requerida en todos los endpoints
- ✅ Validación de ownership (borrower/owner)
- ✅ Verificación de onboarding de Stripe
- ✅ Transacciones atómicas en la base de datos
- ✅ Idempotencia en pagos
- ✅ PCI Compliance (Stripe maneja datos de tarjetas)

---

## 🎯 **Uso del Sistema**

### **Para Owners (Propietarios):**
1. Crear cuenta Connect de Stripe
2. Completar onboarding
3. Publicar artículos
4. Confirmar entregas para recibir pagos

### **Para Renters (Inquilinos):**
1. Buscar artículos
2. Crear reserva
3. Autorizar pago (escrow)
4. Recibir el artículo
5. (Opcional) Solicitar reembolso

---

## 📊 **Dashboard de Stripe**

Monitorea tus pagos en:
- [Stripe Dashboard (Test)](https://dashboard.stripe.com/test)

**¿Qué ver?**
- **Payments → Payment Intents**: Pagos en escrow
- **Connect → Transfers**: Transferencias a owners
- **Balance**: Fees del marketplace

---

## 🚀 **Deploy a Producción**

### **Checklist:**
- [ ] Cambiar a claves Live de Stripe
- [ ] Configurar webhooks en producción
- [ ] Configurar SSL/HTTPS
- [ ] Probar con dinero real (pequeñas cantidades)
- [ ] Configurar emails transaccionales
- [ ] Monitoreo de errores (Sentry, etc.)
- [ ] Backup de base de datos

Ver más: **[STRIPE_ESCROW.md](./STRIPE_ESCROW.md)** → Sección "Deployment"

---

## 🤝 **Contribuir**

¿Encontraste un bug? ¿Tienes una mejora?

1. Abre un issue
2. Crea un PR con tests
3. Documenta los cambios

---

## 📞 **Soporte**

- 📖 **Documentación**: Ver [INDEX.md](./INDEX.md)
- 🐛 **Bugs**: Abrir un issue en GitHub
- 💡 **Ideas**: Abrir un discussion en GitHub

---

## 📝 **Licencia**

Este proyecto es privado y propietario.

---

## 🎉 **Estado del Proyecto**

```
✅ Sistema de pagos con escrow: FUNCIONAL
✅ Stripe Connect: IMPLEMENTADO
✅ UI/UX moderna: COMPLETADA
✅ Documentación: COMPLETA
✅ Testing: DOCUMENTADO

Estado: 🟢 LISTO PARA DESARROLLO
```

---

## 🔗 **Enlaces Útiles**

- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Made with ❤️ using Stripe + Next.js**
