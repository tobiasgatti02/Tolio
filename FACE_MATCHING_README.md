# Verificación de Identidad con Face Matching Gratuito

## ¿Cómo funciona?

El sistema de verificación de identidad ahora incluye **comparación facial real y gratuita** usando `face-api.js`.

## Componentes

### 1. Detección de Rostros (`lib/face-matching.ts`)
- Usa `face-api.js` (librería gratuita de JavaScript)
- Modelos pre-entrenados descargados desde CDN público
- Funciona tanto en navegador como en servidor

### 2. Flujo de Verificación
1. **Escaneo de DNI**: Lee código PDF417 para extraer datos personales
2. **Captura de Selfie**: Toma foto del usuario
3. **Comparación Facial**: Compara rostro del DNI con selfie usando IA
4. **Verificación**: Aprueba/rechaza basado en similitud facial

## Tecnología Gratuita Usada

- **face-api.js**: Detección y comparación facial
- **TensorFlow.js**: Motor de machine learning subyacente
- Modelos pre-entrenados de reconocimiento facial

## Cómo Funciona Técnicamente

1. **Carga de Modelos**: Se descargan automáticamente modelos de TinyFaceDetector, FaceLandmarks y FaceRecognition
2. **Extracción de Descriptores**: Cada imagen genera un vector de 128 dimensiones que representa el rostro
3. **Comparación**: Se calcula distancia euclidiana entre descriptores
4. **Umbral de Decisión**: Score > 80% = match aprobado

## Costos

- ✅ **Completamente gratuito** - No requiere APIs pagas
- ✅ **Sin límites de uso** - Corre localmente
- ✅ **Offline** - No necesita internet para funcionar

## Limitaciones

- Requiere buena iluminación y ángulos frontales
- Más lento que servicios cloud (pero gratuito)
- Menos preciso que modelos comerciales entrenados

## Testing

Para probar el sistema:

```bash
# Ejecutar test básico
node test-face-matching.js

# O probar en el navegador visitando
/verification/identity
```

## Configuración

No requiere configuración adicional. Los modelos se descargan automáticamente la primera vez que se usan.