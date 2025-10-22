# Sistema de Verificación de Identidad

Sistema de verificación de identidad con selfie y DNI argentino usando ZXing para leer códigos PDF417.

## 🚀 Características

- ✅ Lectura automática del código PDF417 del DNI argentino
- ✅ Captura de selfie con cuenta regresiva
- ✅ Validación de identidad en el servidor
- ✅ Almacenamiento seguro de imágenes
- ✅ Logs detallados en todo el flujo
- ✅ UI intuitiva y responsiva

## 📋 Flujo de Verificación

1. **Introducción**: El usuario ve qué necesitará y qué hacer
2. **Captura de DNI**: 
   - Escanea automáticamente el código PDF417 del dorso del DNI
   - Extrae datos: nombre, apellido, DNI, fecha de nacimiento, sexo
   - Muestra los datos extraídos antes de confirmar
3. **Captura de Selfie**:
   - Toma una foto frontal con cuenta regresiva
   - Verifica buena iluminación y posición
4. **Procesamiento**:
   - Envía datos al servidor
   - Guarda imágenes en el sistema de archivos
   - Almacena verificación en la base de datos
   - Simula face matching (TODO: implementar real)
5. **Resultado**: Muestra el estado de la verificación

## 🛠️ Stack Técnico

- **Frontend**: Next.js 14 + React + TypeScript
- **Lectura PDF417**: @zxing/library + @zxing/browser
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma
- **Almacenamiento**: Sistema de archivos local

## 📁 Estructura de Archivos

```
app/
├── api/
│   └── verification/
│       └── identity/
│           └── route.ts          # Endpoint de verificación
└── verification/
    └── identity/
        └── page.tsx              # Página de verificación

components/
└── verification/
    ├── identity-verification-form.tsx  # Formulario principal
    ├── dni-pdf417-capture.tsx         # Captura del DNI
    └── selfie-capture.tsx             # Captura de selfie

public/
└── uploads/
    └── verification/             # Imágenes almacenadas
        └── [userId]/
            ├── selfie-*.jpg
            └── dni-*.jpg
```

## 🔐 Seguridad y Privacidad

- Las imágenes se almacenan en directorios privados por usuario
- Los datos biométricos se encriptan en la base de datos
- Las URLs de las imágenes son privadas y no listables
- Se implementan logs detallados para auditoría

## 📊 Modelo de Datos (Prisma)

```prisma
model Verification {
  id                String             @id @default(uuid())
  userId            String
  type              VerificationType
  status            VerificationStatus
  documentType      String?
  documentNumber    String?
  firstName         String?
  lastName          String?
  birthDate         String?
  gender            String?
  expirationDate    String?
  selfieUrl         String?
  documentFrontUrl  String?
  documentBackUrl   String?
  pdf417Data        String?
  faceMatchScore    Float?
  livenessScore     Float?
  verifiedAt        DateTime?
  rejectedAt        DateTime?
  rejectionReason   String?
  metadata          Json?
  createdAt         DateTime
  updatedAt         DateTime
  user              User
}

enum VerificationType {
  IDENTITY
  DNI
  EMAIL
  PHONE
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}
```

## 🔧 Configuración

1. **Instalar dependencias**:
```bash
npm install @zxing/library @zxing/browser --legacy-peer-deps
```

2. **Aplicar migración**:
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

3. **Crear directorio de uploads**:
```bash
mkdir -p public/uploads/verification
```

## 🚧 TODO: Mejoras Futuras

### Face Matching Real
Actualmente el face matching está simulado con un score de 0.95. Para implementar face matching real:

**Opción 1 - face-api.js (Gratis, Local)**
```bash
npm install face-api.js
```
```typescript
import * as faceapi from 'face-api.js'

// Cargar modelos
await faceapi.nets.ssdMobilenetv1.loadFromDisk('/models')
await faceapi.nets.faceLandmark68Net.loadFromDisk('/models')
await faceapi.nets.faceRecognitionNet.loadFromDisk('/models')

// Detectar rostros
const dniDetection = await faceapi.detectSingleFace(dniImage)
  .withFaceLandmarks()
  .withFaceDescriptor()

const selfieDetection = await faceapi.detectSingleFace(selfieImage)
  .withFaceLandmarks()
  .withFaceDescriptor()

// Comparar
const distance = faceapi.euclideanDistance(
  dniDetection.descriptor,
  selfieDetection.descriptor
)
const score = 1 - distance // Score entre 0 y 1
```

**Opción 2 - AWS Rekognition (Pago)**
```typescript
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition"

const client = new RekognitionClient({ region: "us-east-1" })
const command = new CompareFacesCommand({
  SourceImage: { Bytes: dniImageBuffer },
  TargetImage: { Bytes: selfieImageBuffer },
  SimilarityThreshold: 80
})

const response = await client.send(command)
const score = response.FaceMatches[0].Similarity / 100
```

**Opción 3 - Azure Face API (Pago)**
```typescript
import { FaceClient } from "@azure/cognitiveservices-face"

const client = new FaceClient(credentials, endpoint)

const dniFaceId = await client.face.detectWithUrl(dniImageUrl)
const selfieFaceId = await client.face.detectWithUrl(selfieImageUrl)

const result = await client.face.verifyFaceToFace(
  dniFaceId[0].faceId,
  selfieFaceId[0].faceId
)
const score = result.confidence
```

### Liveness Detection
Para detectar si la selfie es de una persona real:

```typescript
// Con face-api.js - verificar movimiento
// Pedir al usuario que gire la cabeza o parpadee
// Capturar múltiples frames y verificar cambios

// O usar servicios como:
// - AWS Rekognition Liveness
// - Azure Face Liveness
// - Onfido
```

### OCR del DNI (Frente)
Para leer el texto del frente del DNI:

```bash
npm install tesseract.js
```

```typescript
import Tesseract from 'tesseract.js'

const { data: { text } } = await Tesseract.recognize(
  dniImageUrl,
  'spa',
  { logger: m => console.log(m) }
)

// Parsear texto para extraer datos
```

## 📝 Logs del Sistema

El sistema registra logs detallados en cada paso:

- `🔐 [IDENTITY-VERIFICATION]` - Logs del endpoint
- `🎥 [DNI-PDF417-CAPTURE]` - Logs de captura de DNI
- `🤳 [SELFIE-CAPTURE]` - Logs de captura de selfie
- `📋 [IDENTITY-VERIFICATION-FORM]` - Logs del formulario

## 🎯 Formato del PDF417 Argentino

El código PDF417 del DNI argentino típicamente contiene:
```
NÚMERO_TRAMITE@APELLIDO@NOMBRE@SEXO@DNI@FECHA_NAC@FECHA_EXP
```

Ejemplo:
```
12345678@GARCÍA@JUAN CARLOS@M@12345678@19/05/1990@19/05/2030
```

## 🧪 Testing

Para probar el sistema:

1. Ve a `/verification/identity`
2. Usa un DNI argentino real (el dorso con el código de barras)
3. Asegúrate de tener buena iluminación
4. Toma la selfie mirando directamente a la cámara

## 📞 Soporte

Si tienes problemas:
- Verifica los logs en la consola del navegador
- Verifica los logs en el terminal del servidor
- Asegúrate de tener permisos de cámara habilitados
- Verifica que el código PDF417 esté visible y sin obstáculos

## 🔄 Integración con Onboarding

Para agregar al flujo de onboarding existente:

```typescript
// En el componente de onboarding
import { useRouter } from 'next/navigation'

const router = useRouter()

// Después de completar otros pasos
router.push('/verification/identity')
```
