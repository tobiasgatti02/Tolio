# 👥 DEMO DE 3 ACTORES

## 🎯 **¿Qué es esto?**

Una página interactiva que muestra las 3 perspectivas de una transacción en el marketplace:

- **A (Renter)** - Quien paga
- **B (Owner)** - Quien recibe
- **C (Marketplace)** - Quien cobra el fee

---

## 🚀 **Cómo Usar**

### **1. Abrir la demo**
```bash
npm run dev
# Abre: http://localhost:3000/test-3-actors
```

### **2. Ver el flujo visual**
En la parte superior verás el diagrama de flujo en tiempo real:
```
A ($100) → B ($95) → C ($5)
```

### **3. Probar cada perspectiva**

#### **Tab 1: A (Renter)**
1. Ingresa la tarjeta: `4242 4242 4242 4242`
2. Click en "Retener pago"
3. ✅ Verás que tu pago fue autorizado
4. El dinero queda **RETENIDO** (no cobrado aún)

#### **Tab 2: B (Owner)**
1. Verás que hay un pago pendiente
2. Click en "Confirmar Entrega y Recibir $95"
3. ✅ El pago se captura y transfieres a tu cuenta
4. Recibes **$95 MXN** en tu Stripe Connect

#### **Tab 3: C (Marketplace)**
1. Verás el resumen de la transacción
2. El marketplace acumula **$5 MXN** de fee
3. Puedes ver todas las transacciones procesadas

---

## 💰 **Distribución del Dinero**

### **Antes del Pago:**
```
A: $1,000 en banco
B: $0 en Stripe
C: $0 en Stripe
```

### **Después de Autorizar (Escrow):**
```
A: $1,000 (reservados $100)
B: $0 (esperando)
C: $0 (esperando)
```

### **Después de Capturar:**
```
A: $900 (-$100 cobrado)
B: $95 en Stripe Connect
C: $5 en Balance de Stripe
```

---

## 🔍 **Verificar en Stripe Dashboard**

Mientras usas la demo, abre en otra pestaña:

### **[Stripe Dashboard (Test Mode)](https://dashboard.stripe.com/test)**

#### **Ver el PaymentIntent:**
1. Ve a **Payments → Payment Intents**
2. Busca el último PaymentIntent creado
3. Verás el status:
   - `requires_capture` = Retenido ✅
   - `succeeded` = Capturado ✅

#### **Ver el Transfer:**
1. Ve a **Connect → Transfers**
2. Verás el transfer de $95 al Owner
3. Fecha, monto y destino

#### **Ver tu Fee:**
1. Ve a **Balance → Application fees**
2. Verás los $5 acumulados
3. Disponible para payout

---

## 📊 **Timeline Completo**

```
┌──────────────────────────────────────────────────────────┐
│  1. RENTER AUTORIZA PAGO                                 │
└──────────────────────────────────────────────────────────┘
    │
    │ POST /api/stripe/create-payment-intent
    │ - Crea PaymentIntent con capture_method: manual
    │ - Crea Stripe Customer para el renter
    │ - Calcula fee del marketplace (5%)
    │
    ▼
    Status: requires_capture
    Dinero: RETENIDO en Stripe
    
    A: Tarjeta reservada por $100
    B: $0 (esperando)
    C: $0 (esperando)


┌──────────────────────────────────────────────────────────┐
│  2. OWNER CONFIRMA ENTREGA                               │
└──────────────────────────────────────────────────────────┘
    │
    │ POST /api/stripe/capture-payment
    │ - Captura el PaymentIntent
    │ - Crea Transfer al Owner
    │ - Actualiza base de datos
    │
    ▼
    Status: succeeded
    Dinero: COBRADO y DISTRIBUIDO
    
    A: -$100 de su tarjeta
    B: +$95 en Stripe Connect
    C: +$5 en Balance


┌──────────────────────────────────────────────────────────┐
│  3. TODOS RETIRAN A SU BANCO                             │
└──────────────────────────────────────────────────────────┘
    │
    │ Stripe hace payouts automáticos
    │
    ▼
    A: Cargo aparece en su estado de cuenta
    B: Recibe $95 en su banco (configuración de Stripe)
    C: Puede retirar $5 cuando quiera
```

---

## 🎨 **Features de la Demo**

- ✅ **Vista de 3 perspectivas** simultáneas
- ✅ **Flujo visual** con estados en tiempo real
- ✅ **Timeline** de eventos
- ✅ **Badges** de estado (Pendiente/Completado)
- ✅ **Cálculo automático** de fees
- ✅ **UI moderna** con gradientes
- ✅ **Dark mode** compatible
- ✅ **Responsive** design

---

## 🧪 **Testing Rápido**

### **Flujo completo en 2 minutos:**

```bash
# 1. Levantar el servidor
npm run dev

# 2. Abrir la demo
open http://localhost:3000/test-3-actors

# 3. Tab "A (Renter)"
- Tarjeta: 4242 4242 4242 4242
- Fecha: 12/25
- CVC: 123
- Click "Retener"

# 4. Tab "B (Owner)"
- Click "Confirmar Entrega"

# 5. Tab "C (Marketplace)"
- Ver el fee acumulado: $5

# 6. Verificar en Stripe Dashboard
open https://dashboard.stripe.com/test/payments
```

---

## 📱 **Responsive**

La demo funciona en:
- 💻 Desktop (mejor experiencia)
- 📱 Tablet
- 📱 Móvil

---

## 🔐 **Tarjetas de Prueba**

```
✅ Éxito:           4242 4242 4242 4242
❌ Decline:         4000 0000 0000 0002
🔐 3D Secure:       4000 0025 0000 3155
💳 Insufficient:    4000 0000 0000 9995
```

---

## 💡 **Tips**

1. **Abre 3 ventanas:**
   - Ventana 1: Demo en localhost
   - Ventana 2: Stripe Dashboard (Payments)
   - Ventana 3: Stripe Dashboard (Connect → Transfers)

2. **Sigue el flujo en orden:**
   - Primero Tab "A (Renter)"
   - Luego Tab "B (Owner)"
   - Finalmente Tab "C (Marketplace)"

3. **Observa los cambios:**
   - El diagrama superior se actualiza en tiempo real
   - Los badges cambian de "Pendiente" a "Completado"
   - Los balances se actualizan automáticamente

---

## 🎯 **Objetivo de la Demo**

Mostrar claramente:

1. ✅ **Para el Renter (A):** Cómo su pago está protegido en escrow
2. ✅ **Para el Owner (B):** Cómo recibe su dinero después de la entrega
3. ✅ **Para el Marketplace (C):** Cómo se acumula el fee automáticamente

---

## 🚀 **Próximos Pasos**

Después de probar esta demo:

1. Lee: **[TESTING.md](../TESTING.md)** para tests más avanzados
2. Integra: **[STRIPE_ESCROW.md](../STRIPE_ESCROW.md)** en tu app
3. Despliega: Sigue el checklist en **[TODO.md](../TODO.md)**

---

**¡Disfruta explorando el sistema! 🎉**
