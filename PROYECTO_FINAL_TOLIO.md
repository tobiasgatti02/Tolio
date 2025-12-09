# Tolio: Plataforma Web de Economía Colaborativa para Préstamo de Herramientas y Servicios

**Proyecto Final de Licenciatura en Ciencias de la Computación**  
**Autor:** Tobias Gatti (LU: 136467)  
**Universidad Nacional del Sur**  
**Departamento de Ciencias e Ingeniería de la Computación**  
**Año:** 2024

---

## Índice

1. [Introducción al Marketplace](#1-introducción-al-marketplace)
2. [Mecanismos de Pagos](#2-mecanismos-de-pagos)
3. [Mi Propuesta: Tolio](#3-mi-propuesta-tolio)
4. [Implementación y Consideraciones Técnicas](#4-implementación-y-consideraciones-técnicas)
5. [Conclusiones y Trabajo Futuro](#5-conclusiones-y-trabajo-futuro)

---

## 1. Introducción al Marketplace

### 1.1 Definición y Concepto

Un **marketplace** (mercado digital) es una plataforma en línea que actúa como intermediario entre múltiples vendedores o prestadores de servicios y compradores o usuarios. A diferencia de una tienda en línea tradicional donde una única empresa vende sus propios productos, un marketplace permite que diversos proveedores independientes ofrezcan sus bienes o servicios en un espacio común, beneficiándose de la infraestructura tecnológica, el tráfico y la confianza que proporciona la plataforma.

El marketplace digital representa la evolución natural del concepto milenario de "mercado" físico, donde comerciantes se congregaban en un espacio común para ofrecer sus productos. La transformación digital de este concepto ha democratizado el comercio, permitiendo que cualquier persona con un producto o servicio pueda acceder a una audiencia global sin necesidad de invertir en infraestructura propia.

### 1.2 Historia y Evolución

La historia del marketplace digital moderno comenzó a mediados de la década de 1990 y principios de los 2000, marcando una revolución en la forma en que las personas compran y venden bienes y servicios.

#### Pioneros del Marketplace Digital

**eBay (1995)**  
Fundado por Pierre Omidyar, eBay fue uno de los primeros marketplaces en línea y revolucionó el concepto de subastas en internet. Con más de 25 años de existencia, eBay permitió que particulares vendieran directamente a otros particulares (modelo C2C - Consumer-to-Consumer), creando un ecosistema de comercio electrónico descentralizado. En 2002, la adquisición de PayPal fortaleció significativamente su capacidad de procesamiento de pagos, consolidando su posición como líder del mercado.

**Amazon (2000-2006)**  
Aunque Amazon comenzó como una librería en línea en 1994, su transformación en marketplace ocurrió alrededor del año 2000. Jeff Bezos tuvo la visión de trasladar el modelo de un centro comercial físico al mundo digital, permitiendo que terceros vendieran sus productos en la plataforma de Amazon. Este cambio estratégico permitió que Amazon pasara de ser un minorista a convertirse en una plataforma que integra catálogos de múltiples vendedores, ofreciendo una variedad prácticamente ilimitada de productos.

**Mercado Libre (1999)**  
Fundado en Argentina por Marcos Galperín, Mercado Libre se convirtió en el marketplace líder de América Latina. Comenzando en 1999, la plataforma se expandió rápidamente por toda la región, adaptando el modelo de marketplace a las particularidades del mercado latinoamericano, incluyendo métodos de pago locales y logística adaptada a las necesidades regionales.

**Alibaba (1999)**  
Jack Ma fundó Alibaba observando el éxito de Amazon y eBay, pero enfocándose inicialmente en el comercio B2B (Business-to-Business). Alibaba conectó fabricantes chinos con compradores internacionales, democratizando el acceso al comercio internacional y convirtiéndose en el marketplace más grande del mundo en términos de volumen de transacciones.

### 1.3 Modelos Funcionales de Marketplace

Los marketplaces pueden clasificarse según diferentes criterios, cada uno con características y dinámicas particulares:

#### Por Tipo de Transacción

**B2C (Business-to-Consumer)**  
Empresas o profesionales venden productos o servicios directamente a consumidores finales. Ejemplos: Amazon, Asos, Uber. Este modelo es ideal para negocios establecidos que buscan ampliar su alcance sin invertir en infraestructura propia de e-commerce.

**B2B (Business-to-Business)**  
Transacciones entre empresas. Alibaba.com es el ejemplo más prominente, conectando fabricantes con distribuidores y empresas que necesitan insumos o productos al por mayor.

**C2C (Consumer-to-Consumer)**  
Permite a particulares vender productos a otros particulares. Facebook Marketplace, eBay y Mercado Libre (en su modalidad de venta entre particulares) son ejemplos claros de este modelo, que democratiza el comercio y permite monetizar bienes usados o artesanales.

**Modelos Mixtos**  
Plataformas como Amazon Prime combinan elementos B2C y C2C, permitiendo que tanto empresas establecidas como vendedores individuales ofrezcan productos en la misma plataforma.

#### Por Modelo de Monetización

**Modelo de Comisiones**  
El más popular en la actualidad. El marketplace recibe un porcentaje de cada transacción realizada en la plataforma. Este modelo alinea los incentivos de la plataforma con el éxito de los vendedores, ya que ambos se benefician del volumen de ventas.

**Tarifas por Anuncios**  
Los vendedores pagan por publicitar sus productos o servicios, ya sea por clic (CPC) o por impresiones (CPM). Este modelo es común en marketplaces con alto tráfico donde la visibilidad es valiosa.

**Suscripciones**  
Los vendedores o compradores pagan una tarifa recurrente (mensual o anual) por acceder a la plataforma o a funciones premium. Amazon Seller Central utiliza este modelo para vendedores profesionales.

**Tarifas de Listado**  
Los vendedores pagan por publicar sus productos en la plataforma, independientemente de si se venden o no. Este modelo es menos común en marketplaces modernos debido a que puede desincentivar la participación.

**Modelo Freemium**  
Ofrece acceso básico gratuito con funciones limitadas, cobrando por características avanzadas como mejor posicionamiento, análisis detallados o herramientas de marketing.

#### Por Modelo Operativo

**Marketplace Administrado**  
El intermediario verifica vendedores, gestiona procesos logísticos y de mantenimiento, garantizando calidad y confianza. Amazon FBA (Fulfillment by Amazon) es un ejemplo donde Amazon maneja el almacenamiento y envío.

**Marketplace On Demand**  
Ofrecen servicios bajo demanda inmediata del consumidor. Uber, Rappi y Glovo son ejemplos donde el servicio se solicita y se presta en tiempo real.

**Marketplace de Nicho**  
Se especializan en un sector o grupo demográfico específico. Etsy (artesanías), Airbnb (alojamiento) y Upwork (freelancers) son ejemplos de marketplaces que dominan nichos específicos.

### 1.4 Características Clave de un Marketplace Exitoso

Para que un marketplace funcione efectivamente, debe incorporar ciertos elementos fundamentales:

1. **Efecto de Red**: El valor de la plataforma aumenta exponencialmente con cada nuevo usuario (tanto vendedores como compradores).

2. **Confianza y Seguridad**: Sistemas de verificación, reseñas, calificaciones y garantías que protejan a ambas partes.

3. **Facilidad de Uso**: Interfaz intuitiva que permita a usuarios con diferentes niveles de habilidad técnica participar fácilmente.

4. **Procesamiento de Pagos Seguro**: Integración con pasarelas de pago confiables que protejan la información financiera.

5. **Sistema de Reputación**: Mecanismos que permitan construir confianza a través de historial de transacciones y valoraciones.

6. **Resolución de Disputas**: Procesos claros para manejar conflictos entre compradores y vendedores.

---

## 2. Mecanismos de Pagos

### 2.1 Panorama de Pagos en Argentina 2024

Argentina ha experimentado una transformación digital acelerada en su ecosistema de pagos durante los últimos años. En 2024, el país se caracteriza por una fuerte tendencia hacia la digitalización y la consolidación de las billeteras virtuales como protagonistas principales del sistema de pagos.

#### Estadísticas Clave

- **75%** de los argentinos mayores de 18 años posee al menos una billetera digital, igualando la tenencia de tarjetas de débito.
- **73%** de los adultos utiliza dos o más billeteras digitales.
- Los pagos con código QR crecieron un **53%** en 2024.
- Las transferencias inmediatas aumentaron un **43%** interanual.
- Las tarjetas prepago experimentaron un crecimiento del **97.3%** en cantidad de operaciones.

### 2.2 Métodos de Pago Dominantes

#### Billeteras Digitales (E-wallets)

Las billeteras digitales son el motor de la transformación digital de los pagos en Argentina:

**Mercado Pago**  
La plataforma dominante en Argentina, con la mayor variedad de métodos de pago y fácil integración con plataformas de e-commerce. Ofrece:
- Pagos con tarjetas de crédito y débito
- Transferencias bancarias
- Pagos en cuotas sin interés
- Códigos QR interoperables
- Links de pago
- Integración con múltiples plataformas (WooCommerce, Tienda Nube, Shopify)

**MODO**  
Impulsada por más de 30 bancos argentinos, MODO permite la interoperabilidad entre múltiples entidades bancarias y plataformas. Es la segunda billetera más usada (31.6% de la población) y se destaca por:
- Transferencias gratuitas entre usuarios
- Pagos QR en comercios
- Respaldo del sistema bancario tradicional

**Ualá**  
Con su tarjeta prepaga Mastercard y aplicación móvil, Ualá se enfoca en la inclusión financiera. Es la tercera billetera más utilizada (20.6%) y ofrece:
- Tarjeta prepaga sin costos de mantenimiento
- Inversiones en fondos comunes
- Préstamos personales
- Solución para negocios (Ualá Bis)

**Cuenta DNI y BNA+**  
Billeteras respaldadas por bancos estatales (Banco Provincia y Banco Nación) que buscan promover la inclusión financiera de sectores no bancarizados.

#### Pagos con Código QR

Los pagos QR han revolucionado la experiencia de pago en Argentina. El Banco Central (BCRA) ha impulsado la interoperabilidad de los pagos QR, lo que significa que todos los lectores QR deben aceptar pagos de todas las tarjetas y billeteras digitales. Esto ha eliminado la fragmentación del mercado y facilitado la adopción masiva.

#### Transferencias 3.0 (Pagos A2A)

El sistema de Transferencias 3.0 ha impulsado fuertemente los pagos de cuenta a cuenta (Account-to-Account), facilitando transacciones entre comercios y usuarios mediante códigos QR. El 73.8% de las transferencias inmediatas utilizan CVU (Clave Virtual Uniforme), el identificador de las billeteras digitales.

#### Tarjetas de Crédito y Débito

Aunque las billeteras digitales están ganando terreno, las tarjetas siguen siendo fundamentales:

**En e-commerce:**
- Tarjetas de crédito: 35-39% de las transacciones
- Tarjetas de débito: 13.5-18% de las transacciones
- La preferencia por el pago en cuotas sin interés es un factor clave para el uso de tarjetas de crédito en Argentina

**En puntos de venta físicos:**
- Efectivo: 27%
- Tarjetas de crédito: 25%
- Tarjetas de débito: 25%
- Billeteras digitales: 18%

### 2.3 Pasarelas de Pago Disponibles en Argentina

Las pasarelas de pago son intermediarios esenciales que permiten a los negocios recibir pagos de manera segura y eficiente en línea.

#### Principales Pasarelas

**Mercado Pago**  
- **Ventajas**: Mayor adopción, múltiples opciones de integración, cuotas, links de pago, QR
- **Desventajas**: Comisiones elevadas (pueden llegar al 6-8%), posibles retenciones fiscales
- **Ideal para**: Pequeños y medianos negocios, marketplaces

**Todo Pago (Payway SPS)**  
- **Ventajas**: Respaldada por Prisma/Visa, seguridad antifraude avanzada, promociones bancarias
- **Desventajas**: Proceso de integración más complejo
- **Ideal para**: Negocios establecidos que buscan seguridad y respaldo bancario

**Payway (Decidir)**  
- **Ventajas**: Gateway de alto nivel, costos bajos por transacción, flexibilidad para desarrollos a medida
- **Desventajas**: Requiere mayor conocimiento técnico
- **Ideal para**: Empresas grandes con equipos de desarrollo

**Rebill**  
- **Ventajas**: Integración de diversas formas de pago (tarjetas, transferencias, efectivo, billeteras), pagos en cuotas, Transferencias 3.0
- **Desventajas**: Menor reconocimiento de marca que Mercado Pago
- **Ideal para**: Negocios que buscan flexibilidad en métodos de pago

**PayU**  
- **Ventajas**: Presencia internacional, acepta tarjetas y transferencias
- **Desventajas**: Comisiones variables según el método de pago
- **Ideal para**: Negocios con operaciones internacionales

### 2.4 Consideraciones Legales y Regulatorias

El Banco Central de la República Argentina (BCRA) regula el sistema de pagos y mantiene un registro de Proveedores de Servicios de Pago (PSP), incluyendo adquirentes y proveedores de cuentas de pago. Las principales regulaciones incluyen:

- **Interoperabilidad obligatoria** de códigos QR
- **Límites de comisiones** para ciertos tipos de transacciones
- **Requisitos de seguridad** para el procesamiento de pagos
- **Protección al consumidor** en transacciones digitales
- **Declaración obligatoria** de ingresos por alquileres ante AFIP

---

## 3. Mi Propuesta: Tolio

### 3.1 Identificación del Problema

En la actualidad, existe una paradoja en el consumo de herramientas y equipos: muchas personas necesitan herramientas específicas para proyectos ocasionales, pero la compra de estas herramientas representa una inversión económica significativa para un uso esporádico. Simultáneamente, millones de herramientas permanecen inactivas en garajes y depósitos, representando capital inmovilizado que podría generar valor.

#### Problemas Específicos Identificados:

1. **Barrera Económica**: Herramientas profesionales (taladros, amoladoras, equipos de jardinería) pueden costar entre $50,000 y $500,000 ARS, un gasto difícil de justificar para un uso ocasional.

2. **Desperdicio de Recursos**: Se estima que las herramientas domésticas se utilizan menos del 5% de su vida útil, representando un desperdicio masivo de recursos.

3. **Falta de Acceso a Servicios Profesionales**: Encontrar profesionales confiables para changas (plomería, electricidad, carpintería) es difícil, especialmente sin referencias personales.

4. **Desconfianza en Transacciones P2P**: Las plataformas existentes no ofrecen suficientes garantías de seguridad, verificación de identidad o protección en caso de daños.

5. **Impacto Ambiental**: La producción excesiva de herramientas que se usan mínimamente contribuye significativamente a la huella de carbono global.

### 3.2 Solución Propuesta: Tolio

Tolio es una plataforma web de economía colaborativa que conecta a propietarios de herramientas y prestadores de servicios con usuarios que necesitan acceder temporalmente a estos recursos. La plataforma facilita todo el proceso desde la publicación, búsqueda y reserva, hasta la gestión de transacciones y reputación.

#### Propuesta de Valor

**Para Propietarios/Prestadores:**
- Monetizar herramientas y equipos inactivos
- Generar ingresos pasivos sin esfuerzo adicional
- Contribuir a la economía circular y sostenibilidad
- Control total sobre disponibilidad y precios
- Protección mediante sistema de verificación de usuarios

**Para Usuarios/Solicitantes:**
- Acceso económico a herramientas sin necesidad de comprarlas
- Búsqueda geolocalizada de herramientas cercanas
- Acceso a profesionales verificados para servicios
- Sistema de reseñas para tomar decisiones informadas
- Comunicación directa con propietarios

**Para la Sociedad:**
- Reducción del consumo excesivo y la producción innecesaria
- Optimización del uso de recursos existentes
- Disminución de la huella de carbono
- Fortalecimiento de la economía local y colaborativa
- Generación de confianza en transacciones entre particulares

### 3.3 Modelo de Negocio

Tolio opera bajo un modelo de marketplace bidireccional, donde tanto la oferta (propietarios/prestadores) como la demanda (usuarios/solicitantes) son igualmente importantes para el éxito de la plataforma.

#### Estrategia de Monetización

Actualmente, Tolio se encuentra en fase de desarrollo y validación de mercado, por lo que **no implementa comisiones ni procesamiento de pagos integrado**. Esta decisión estratégica se basa en varios factores:

1. **Enfoque en Adopción**: Priorizar el crecimiento de la base de usuarios sin fricciones económicas adicionales.

2. **Validación del Modelo**: Confirmar que existe demanda real antes de implementar infraestructura de pagos compleja.

3. **Simplicidad Operativa**: Evitar complejidades legales, contables y fiscales en la etapa inicial.

4. **Flexibilidad para Usuarios**: Permitir que usuarios y propietarios acuerden términos de pago que les resulten más convenientes.

**Modelo de Monetización Futuro:**

Una vez validado el producto-mercado fit, Tolio podría implementar:
- **Comisión por transacción**: 5-10% sobre el valor del alquiler
- **Suscripciones premium**: Funcionalidades avanzadas para usuarios frecuentes
- **Publicidad destacada**: Posicionamiento premium de publicaciones
- **Servicios adicionales**: Seguros, verificaciones premium, logística

### 3.4 Diferenciación: ¿Por Qué No Implementar Pagos Integrados?

Esta decisión merece una explicación detallada, ya que es una de las características distintivas de Tolio frente a competidores internacionales como Hygglio.

#### Razones Técnicas y de Producto

**1. Complejidad de Implementación**  
Integrar un sistema de pagos robusto requiere:
- Cumplimiento de normativas PCI-DSS para seguridad de datos de tarjetas
- Integración con múltiples pasarelas de pago
- Manejo de diferentes métodos de pago (tarjetas, transferencias, billeteras)
- Sistema de escrow (retención de fondos) para proteger a ambas partes
- Gestión de reembolsos y disputas
- Infraestructura de reconciliación contable

**2. Consideraciones Legales en Argentina**  
El alquiler de bienes entre particulares en Argentina presenta desafíos legales específicos:

- **Responsabilidad Civil**: Según el Código Civil y Comercial argentino, el locador (propietario) es responsable de conservar el inmueble o bien y reparar deterioros no imputables al inquilino. Sin un seguro de responsabilidad civil adecuado, la plataforma podría enfrentar riesgos legales.

- **Seguros Obligatorios**: Para alquileres formales, se requieren seguros de caución o garantías. Implementar esto para cada transacción de herramientas sería prohibitivamente complejo y costoso.

- **Declaración ante AFIP**: Los contratos de alquiler deben ser declarados ante la Administración Federal de Ingresos Públicos. Esto añade una capa de complejidad administrativa que no es práctica para alquileres de corto plazo de herramientas.

- **Retenciones Fiscales**: Las plataformas que procesan pagos deben actuar como agentes de retención, lo que implica obligaciones fiscales complejas.

**3. Inspiración en Modelos Exitosos: Hygglio**  
Hygglio, la plataforma líder de alquiler P2P en los países nórdicos, procesa pagos internamente y toma una comisión del 20% (50% para drones). Sin embargo, opera en un contexto legal y cultural diferente:

- **Marco Legal Claro**: Los países nórdicos tienen regulaciones claras sobre economía colaborativa
- **Cultura de Confianza**: Alta confianza social que reduce riesgos de fraude
- **Seguros Integrados**: Hygglio Care ofrece seguros automáticos en cada transacción
- **Verificación con BankID**: Sistema de identificación digital gubernamental

En Argentina, estas condiciones no se cumplen completamente, lo que hace más riesgoso procesar pagos sin la infraestructura legal y de seguros adecuada.

**4. Enfoque en el Valor Principal**  
Al no procesar pagos, Tolio puede enfocarse en:
- Perfeccionar la experiencia de búsqueda y descubrimiento
- Construir un sistema de reputación robusto
- Desarrollar funcionalidades de verificación de identidad
- Optimizar la comunicación entre usuarios
- Mejorar la geolocalización y búsqueda por proximidad

**5. Flexibilidad para los Usuarios**  
Permitir que usuarios acuerden pagos directamente ofrece ventajas:
- Pueden usar el método de pago que prefieran (efectivo, transferencia, Mercado Pago, etc.)
- Evitan comisiones de la plataforma
- Mayor flexibilidad en negociaciones de precio
- Posibilidad de acuerdos informales para vecinos o conocidos

### 3.5 Inspiración y Referencias

Tolio se inspira en plataformas exitosas de economía colaborativa:

**Hygglio (Países Nórdicos)**  
- Modelo P2P puro para alquiler de herramientas
- Sistema de seguridad "Hygglio Care"
- Verificación de identidad con BankID
- Comisión del 20% sobre transacciones

**Airbnb**  
- Marketplace bidireccional exitoso
- Sistema de reseñas bidireccional
- Verificación de identidad robusta
- Gestión de confianza en transacciones de alto valor

**Mercado Libre**  
- Adaptación a las particularidades del mercado latinoamericano
- Sistema de reputación basado en calificaciones
- Múltiples métodos de pago locales
- Resolución de disputas

**Wallapop/Facebook Marketplace**  
- Modelo de transacciones directas entre usuarios
- La plataforma facilita la conexión, no procesa pagos
- Enfoque en simplicidad y adopción masiva

---

## 4. Implementación y Consideraciones Técnicas

### 4.1 Arquitectura del Sistema

Tolio está construido sobre una arquitectura moderna de aplicación web full-stack, siguiendo las mejores prácticas de desarrollo de software y priorizando escalabilidad, seguridad y experiencia de usuario.

#### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                     │
│  Next.js 15 (App Router) + React 19 + TypeScript            │
│  - Páginas Server-Side Rendered (SSR)                        │
│  - Componentes Client-Side para interactividad              │
│  - Internacionalización (next-intl)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE LÓGICA                          │
│  API Routes (Next.js) + Server Actions                       │
│  - Autenticación (NextAuth.js)                               │
│  - Validación (Zod)                                          │
│  - Manejo de errores                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                      │
│  Prisma ORM + PostgreSQL                                     │
│  - Modelos de datos relacionales                             │
│  - Migraciones versionadas                                   │
│  - Índices optimizados                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICIOS EXTERNOS                         │
│  - AWS S3 (almacenamiento de imágenes)                       │
│  - Vercel Blob (almacenamiento alternativo)                  │
│  - Resend (emails transaccionales)                           │
│  - Leaflet + OpenStreetMap (mapas)                           │
│  - Face-API.js (verificación facial)                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Stack Tecnológico

#### Frontend

**Next.js 15 (App Router)**  
Framework de React que permite renderizado del lado del servidor (SSR), generación estática (SSG) y rutas API integradas. Beneficios:
- SEO optimizado mediante renderizado del lado del servidor
- Carga inicial rápida con hidratación progresiva
- Optimización automática de imágenes y fuentes
- Code splitting automático para mejor performance

**React 19**  
Biblioteca de JavaScript para construir interfaces de usuario interactivas con un modelo de componentes reutilizables.

**TypeScript**  
Superset de JavaScript que añade tipado estático, reduciendo errores en tiempo de desarrollo y mejorando la mantenibilidad del código.

**Tailwind CSS**  
Framework de CSS utility-first que permite desarrollo rápido con diseño consistente y responsive.

**shadcn/ui**  
Colección de componentes de UI accesibles y personalizables construidos con Radix UI y Tailwind CSS.

**React Hook Form + Zod**  
Gestión de formularios con validación de esquemas, proporcionando una experiencia de usuario fluida con validación en tiempo real.

#### Backend

**Next.js API Routes**  
Endpoints de API serverless integrados en Next.js, permitiendo lógica del lado del servidor sin necesidad de un servidor separado.

**Prisma ORM**  
Object-Relational Mapping moderno que proporciona:
- Type-safety completo en consultas a la base de datos
- Migraciones automáticas y versionadas
- Introspección de esquema
- Cliente de base de datos optimizado

**PostgreSQL**  
Base de datos relacional robusta y escalable, ideal para datos estructurados con relaciones complejas.

**NextAuth.js**  
Solución completa de autenticación para Next.js que soporta:
- Múltiples proveedores OAuth (Google, GitHub, etc.)
- Autenticación con credenciales
- Sesiones seguras
- Protección CSRF

#### Servicios Externos y APIs

**AWS S3 / Vercel Blob**  
Almacenamiento de objetos para imágenes de perfil, fotos de productos y documentos de verificación.

**Resend**  
Servicio de emails transaccionales para notificaciones, confirmaciones de reserva y comunicaciones del sistema.

**Leaflet + React-Leaflet**  
Biblioteca de mapas interactivos de código abierto, integrada con OpenStreetMap para:
- Visualización de ubicaciones de items/servicios
- Búsqueda por proximidad geográfica
- Marcadores personalizados
- Cálculo de distancias

**Face-API.js**  
Biblioteca de reconocimiento facial basada en TensorFlow.js para verificación de identidad mediante comparación de selfies con documentos.

**NSFWJS**  
Modelo de machine learning para detectar contenido inapropiado en imágenes subidas por usuarios.

### 4.3 Modelo de Datos

El esquema de base de datos de Tolio está diseñado para soportar las funcionalidades principales de la plataforma de manera eficiente y escalable.

#### Entidades Principales

**User (Usuario)**  
Almacena información de usuarios, incluyendo:
- Datos personales (nombre, email, teléfono)
- Credenciales de autenticación
- Estado de verificación de identidad
- Imagen de perfil y biografía
- Conexiones con servicios de pago (Stripe, MercadoPago) - preparado para futuro
- Relaciones con items, servicios, reservas, mensajes, notificaciones

**Item (Herramienta/Equipo)**  
Representa herramientas o equipos disponibles para alquiler:
- Información básica (título, descripción, categoría)
- Precio y tipo de precio (por hora/día)
- Depósito de seguridad
- Ubicación geográfica (latitud, longitud)
- Características y fotos
- Estado de disponibilidad

**Service (Servicio Profesional)**  
Representa servicios ofrecidos por profesionales:
- Información del servicio (título, descripción, categoría)
- Precio por hora o personalizado
- Badge de profesional matriculado
- Área de servicio geográfica
- Disponibilidad y características

**Booking (Reserva de Item)**  
Gestiona reservas de herramientas:
- Fechas de inicio y fin
- Precio total
- Estado (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Relaciones con item, borrower (inquilino) y owner (propietario)

**ServiceBooking (Reserva de Servicio)**  
Gestiona contrataciones de servicios:
- Fecha de inicio y fin (opcional)
- Horas estimadas
- Precio personalizado si aplica
- Estado de la reserva
- Relaciones con servicio, cliente y proveedor

**Review (Reseña)**  
Sistema de reputación bidireccional:
- Calificación (1-5 estrellas)
- Comentario textual
- Respuesta del propietario/prestador
- Vinculación con reserva específica para evitar reseñas falsas

**Notification (Notificación)**  
Sistema de notificaciones en tiempo real:
- Tipo de notificación (solicitud de reserva, confirmación, mensaje, etc.)
- Contenido y título
- Estado de lectura
- Enlaces a recursos relacionados
- Metadata adicional en formato JSON

**Message (Mensaje)**  
Sistema de mensajería entre usuarios:
- Contenido del mensaje
- Estado de lectura
- Relación con reserva (opcional)
- Sender y receiver

**Verification (Verificación de Identidad)**  
Gestiona el proceso de verificación de identidad:
- Tipo de verificación (DNI, selfie, etc.)
- Estado (PENDING, APPROVED, REJECTED)
- Datos del documento
- URLs de imágenes (selfie, frente y dorso del documento)
- Scores de coincidencia facial y liveness detection
- Metadata del proceso de verificación

#### Relaciones Clave

El modelo de datos implementa relaciones complejas para garantizar integridad referencial:

- **Un usuario** puede tener múltiples items, servicios, reservas (como borrower y como owner), mensajes y notificaciones
- **Un item** pertenece a un usuario y puede tener múltiples reservas y reseñas
- **Una reserva** está vinculada a un item, un borrower y un owner, y puede tener una reseña
- **Las reseñas** están vinculadas a una reserva específica para garantizar que solo usuarios que completaron una transacción puedan dejar reseñas

### 4.4 Funcionalidades Principales

#### 1. Autenticación y Gestión de Usuarios

**Registro y Login**  
- Registro con email y contraseña
- Autenticación OAuth con Google y GitHub
- Verificación de email mediante tokens
- Recuperación de contraseña
- Sesiones seguras con NextAuth.js

**Verificación de Identidad**  
Proceso de verificación en múltiples pasos:
1. Usuario sube selfie en tiempo real
2. Usuario escanea código PDF417 del DNI argentino
3. Usuario sube fotos del frente y dorso del DNI
4. Sistema extrae datos del PDF417 (nombre, apellido, número de documento, fecha de nacimiento)
5. Face-API.js compara la selfie con la foto del DNI
6. Se calcula un score de coincidencia facial
7. Administrador revisa y aprueba/rechaza la verificación

Este proceso garantiza que los usuarios son quienes dicen ser, aumentando la confianza en la plataforma.

#### 2. Publicación de Items y Servicios

**Creación de Publicaciones**  
Formulario multi-paso para publicar items o servicios:
- Información básica (título, descripción, categoría)
- Precio y condiciones
- Ubicación (opcional, con mapa interactivo)
- Características y especificaciones
- Carga de múltiples imágenes con preview
- Validación de contenido inapropiado con NSFWJS

**Gestión de Publicaciones**  
- Edición de publicaciones existentes
- Activación/desactivación de disponibilidad
- Eliminación con confirmación
- Vista previa de cómo se verá la publicación

#### 3. Búsqueda y Descubrimiento

**Búsqueda Avanzada**  
- Búsqueda por texto (título, descripción, características)
- Filtros por categoría y subcategoría
- Filtro por rango de precio
- Filtro por tipo de precio (hora/día)
- Ordenamiento (más reciente, precio, popularidad)

**Búsqueda Geolocalizada**  
- Mapa interactivo con marcadores de items/servicios
- Búsqueda por radio de distancia
- Cálculo de distancia desde la ubicación del usuario
- Filtros combinados (categoría + ubicación + precio)

**Navegación por Categorías**  
- Categorías principales con iconos visuales
- Subcategorías para refinamiento
- Contadores de items disponibles por categoría

#### 4. Sistema de Reservas

**Flujo de Reserva para Items**  
1. Usuario selecciona fechas de inicio y fin
2. Sistema calcula precio total basado en días/horas
3. Usuario envía solicitud de reserva
4. Propietario recibe notificación
5. Propietario acepta o rechaza la reserva
6. Si se acepta, ambas partes reciben confirmación
7. Al finalizar el período, propietario marca como completada
8. Ambas partes pueden dejar reseñas

**Flujo de Reserva para Servicios**  
1. Usuario describe el trabajo necesario
2. Selecciona fecha preferida y horas estimadas
3. Envía solicitud al prestador
4. Prestador puede proponer precio personalizado
5. Cliente acepta o negocia
6. Se confirma la reserva
7. Al completarse, se marca como completada
8. Sistema de reseñas bidireccional

**Gestión de Disponibilidad**  
- Calendario visual de disponibilidad
- Bloqueo automático de fechas reservadas
- Prevención de reservas superpuestas
- Notificaciones de nuevas solicitudes

#### 5. Sistema de Mensajería

**Chat Integrado**  
- Mensajería en tiempo real entre usuarios
- Vinculación de conversaciones con reservas específicas
- Indicadores de mensajes no leídos
- Historial de conversaciones
- Notificaciones de nuevos mensajes

#### 6. Sistema de Reseñas y Reputación

**Reseñas Verificadas**  
- Solo usuarios que completaron una transacción pueden dejar reseñas
- Calificación de 1 a 5 estrellas
- Comentario textual opcional
- Respuesta del propietario/prestador
- Timestamp de creación

**Cálculo de Reputación**  
- Promedio de calificaciones recibidas
- Número total de reseñas
- Visualización de distribución de calificaciones
- Badge de "verificado" para usuarios con identidad confirmada

#### 7. Panel de Control (Dashboard)

**Para Propietarios/Prestadores**  
- Resumen de ganancias (preparado para futuro)
- Lista de reservas pendientes, confirmadas y completadas
- Gestión de publicaciones
- Estadísticas de visualizaciones
- Calendario de disponibilidad

**Para Usuarios/Solicitantes**  
- Historial de reservas
- Gastos (preparado para futuro)
- Items/servicios favoritos
- Mensajes y notificaciones

#### 8. Sistema de Notificaciones

**Tipos de Notificaciones**  
- Nueva solicitud de reserva
- Reserva confirmada
- Reserva cancelada
- Reserva completada
- Nuevo mensaje recibido
- Nueva reseña recibida
- Recordatorios de devolución

**Canales de Notificación**  
- Notificaciones in-app con contador
- Emails transaccionales (preparado)
- Push notifications (futuro)

### 4.5 Seguridad y Privacidad

#### Medidas de Seguridad Implementadas

**Autenticación y Autorización**  
- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens JWT seguros para sesiones
- Protección CSRF en formularios
- Validación de permisos en cada endpoint
- Rate limiting para prevenir ataques de fuerza bruta

**Protección de Datos**  
- Validación de entrada con Zod en todos los formularios
- Sanitización de datos antes de almacenar en base de datos
- Encriptación de datos sensibles
- HTTPS obligatorio en producción
- Headers de seguridad (CSP, X-Frame-Options, etc.)

**Privacidad**  
- Ubicación exacta opcional (usuarios pueden compartir solo ciudad/barrio)
- Datos de contacto ocultos hasta confirmar reserva
- Opción de eliminar cuenta y datos personales
- Cumplimiento con principios de GDPR (aunque no es obligatorio en Argentina)

**Verificación de Contenido**  
- Detección automática de contenido inapropiado en imágenes con NSFWJS
- Moderación de reseñas para detectar lenguaje ofensivo
- Sistema de reportes de usuarios

### 4.6 Desafíos Técnicos y Soluciones

#### Desafío 1: Verificación de Identidad Confiable

**Problema**: Garantizar que los usuarios son quienes dicen ser sin requerir procesos manuales costosos.

**Solución Implementada**:
- Integración de Face-API.js para reconocimiento facial
- Lectura de código PDF417 del DNI argentino con ZXing
- Comparación automática de selfie con foto del documento
- Cálculo de score de coincidencia facial
- Revisión manual final para casos ambiguos

**Resultado**: Sistema de verificación robusto que balancea automatización con supervisión humana.

#### Desafío 2: Búsqueda Geolocalizada Eficiente

**Problema**: Permitir búsquedas por proximidad geográfica sin comprometer la privacidad ni el rendimiento.

**Solución Implementada**:
- Almacenamiento de coordenadas (latitud, longitud) en base de datos
- Índices en campos de ubicación para consultas rápidas
- Cálculo de distancia usando fórmula de Haversine
- Integración con Leaflet para visualización en mapa
- Geocodificación con OpenStreetMap Nominatim

**Resultado**: Búsquedas geográficas rápidas con visualización intuitiva en mapa.

#### Desafío 3: Prevención de Reservas Conflictivas

**Problema**: Evitar que un item sea reservado por múltiples usuarios en las mismas fechas.

**Solución Implementada**:
- Validación de disponibilidad antes de crear reserva
- Transacciones atómicas en base de datos
- Bloqueo optimista con timestamps
- Actualización en tiempo real del calendario de disponibilidad

**Resultado**: Sistema robusto que previene conflictos de reservas.

#### Desafío 4: Escalabilidad de Imágenes

**Problema**: Almacenar y servir múltiples imágenes de alta calidad sin impactar el rendimiento.

**Solución Implementada**:
- Almacenamiento en AWS S3 / Vercel Blob
- Optimización automática de imágenes con Next.js Image
- Lazy loading de imágenes
- Compresión antes de subir
- CDN para distribución global

**Resultado**: Carga rápida de imágenes con costos de almacenamiento optimizados.

#### Desafío 5: Internacionalización

**Problema**: Preparar la plataforma para múltiples idiomas y regiones.

**Solución Implementada**:
- Integración de next-intl para i18n
- Archivos de traducción en JSON
- Detección automática de idioma del navegador
- Selector de idioma en UI
- Formateo de fechas y monedas según locale

**Resultado**: Plataforma preparada para expansión internacional.

### 4.7 Decisiones de Diseño Clave

#### Decisión 1: Next.js App Router vs Pages Router

**Elección**: App Router (Next.js 15)

**Justificación**:
- Server Components por defecto para mejor performance
- Layouts anidados para mejor organización
- Streaming y Suspense para carga progresiva
- Mejor integración con React 19
- Futuro de Next.js

#### Decisión 2: PostgreSQL vs MongoDB

**Elección**: PostgreSQL

**Justificación**:
- Datos altamente relacionales (usuarios, items, reservas, reseñas)
- Necesidad de integridad referencial
- Consultas complejas con JOINs
- Transacciones ACID para reservas
- Mejor soporte de Prisma para SQL

#### Decisión 3: Prisma vs TypeORM

**Elección**: Prisma

**Justificación**:
- Type-safety superior
- Developer experience excepcional
- Migraciones automáticas
- Prisma Studio para debugging
- Mejor documentación y comunidad

#### Decisión 4: Autenticación Propia vs NextAuth.js

**Elección**: NextAuth.js

**Justificación**:
- Solución battle-tested y segura
- Soporte para múltiples proveedores OAuth
- Gestión de sesiones integrada
- Menor superficie de ataque
- Mantenimiento por la comunidad

#### Decisión 5: Mapas: Google Maps vs Leaflet + OpenStreetMap

**Elección**: Leaflet + OpenStreetMap

**Justificación**:
- Completamente gratuito y open-source
- Sin límites de uso ni costos
- Personalización completa
- Comunidad activa
- Datos de OpenStreetMap de alta calidad

---

## 5. Conclusiones y Trabajo Futuro

### 5.1 Logros Alcanzados

El desarrollo de Tolio ha cumplido exitosamente con los objetivos planteados al inicio del proyecto:

#### Objetivos Técnicos Cumplidos

1. **Plataforma Web Funcional**: Se desarrolló una aplicación web completa y funcional que permite a usuarios publicar, buscar y reservar herramientas y servicios.

2. **Sistema de Autenticación Robusto**: Implementación de NextAuth.js con soporte para múltiples proveedores OAuth y autenticación con credenciales.

3. **Verificación de Identidad**: Sistema de verificación biométrica que combina reconocimiento facial, lectura de PDF417 y validación manual.

4. **Búsqueda Geolocalizada**: Integración de mapas interactivos con búsqueda por proximidad geográfica.

5. **Sistema de Reputación**: Implementación de reseñas verificadas vinculadas a transacciones completadas.

6. **Arquitectura Escalable**: Diseño modular y escalable que permite crecimiento futuro sin refactorización mayor.

#### Aprendizajes Técnicos

**Desarrollo Full-Stack Moderno**  
El proyecto permitió profundizar en tecnologías de vanguardia como Next.js 15, React 19, TypeScript y Prisma, adquiriendo experiencia práctica en desarrollo full-stack moderno.

**Integración de Servicios Externos**  
Experiencia integrando múltiples APIs y servicios externos (AWS S3, Resend, OpenStreetMap, Face-API.js), comprendiendo los desafíos de dependencias externas.

**Diseño de Bases de Datos Relacionales**  
Modelado de datos complejos con múltiples relaciones, índices optimizados y transacciones atómicas.

**Seguridad en Aplicaciones Web**  
Implementación de mejores prácticas de seguridad: autenticación, autorización, validación de entrada, protección CSRF, hashing de contraseñas.

**UX/UI y Accesibilidad**  
Diseño de interfaces intuitivas y accesibles utilizando shadcn/ui, Tailwind CSS y principios de diseño responsive.

### 5.2 Lecciones Aprendidas

#### Lección 1: La Importancia de la Validación de Mercado

Inicialmente, el proyecto contemplaba implementar procesamiento de pagos integrado. Sin embargo, la investigación sobre aspectos legales, fiscales y de seguros en Argentina reveló que esta funcionalidad añadiría complejidad significativa sin validar primero la demanda del mercado.

**Aprendizaje**: Es fundamental validar el producto-mercado fit antes de invertir en funcionalidades complejas. El enfoque MVP (Minimum Viable Product) permite iterar rápidamente basándose en feedback real de usuarios.

#### Lección 2: El Balance entre Automatización y Supervisión Humana

El sistema de verificación de identidad combina automatización (reconocimiento facial, lectura de PDF417) con revisión manual. Inicialmente se consideró un sistema completamente automatizado, pero se identificó que la supervisión humana es necesaria para casos ambiguos.

**Aprendizaje**: La automatización completa no siempre es la mejor solución. Un enfoque híbrido puede ofrecer mejor balance entre eficiencia y precisión.

#### Lección 3: La Complejidad de la Economía Colaborativa

Desarrollar una plataforma de economía colaborativa implica no solo desafíos técnicos, sino también consideraciones legales, de confianza y de diseño de incentivos.

**Aprendizaje**: Las plataformas de dos lados (two-sided marketplaces) requieren equilibrar cuidadosamente las necesidades de ambos grupos de usuarios (oferta y demanda) y construir mecanismos de confianza robustos.

#### Lección 4: Open Source como Ventaja Competitiva

La decisión de usar tecnologías open-source (Leaflet, OpenStreetMap, PostgreSQL) en lugar de alternativas comerciales (Google Maps, MongoDB Atlas) resultó en:
- Cero costos de licenciamiento
- Mayor control y personalización
- Independencia de proveedores
- Comunidad activa para soporte

**Aprendizaje**: Las soluciones open-source de calidad pueden ofrecer ventajas significativas para startups y proyectos con presupuesto limitado.

### 5.3 Trabajo Futuro

#### Corto Plazo (3-6 meses)

**1. Lanzamiento Beta y Validación de Mercado**  
- Lanzar versión beta con usuarios seleccionados
- Recopilar feedback cualitativo y cuantitativo
- Iterar sobre funcionalidades basándose en uso real
- Medir métricas clave: tasa de conversión, retención, NPS

**2. Optimización de Performance**  
- Implementar caching con Redis
- Optimizar consultas a base de datos
- Implementar lazy loading y code splitting adicional
- Monitoreo de performance con Vercel Analytics

**3. Mejoras en Búsqueda**  
- Implementar búsqueda full-text con PostgreSQL o Algolia
- Filtros avanzados (disponibilidad, calificación mínima, distancia)
- Búsqueda por voz
- Recomendaciones personalizadas basadas en historial

**4. Sistema de Notificaciones Mejorado**  
- Implementar push notifications con service workers
- Notificaciones por email con templates personalizados
- Preferencias de notificación granulares
- Resumen diario/semanal de actividad

#### Mediano Plazo (6-12 meses)

**1. Implementación de Pagos Integrados** (si se valida demanda)  
- Integración con Mercado Pago y/o Stripe
- Sistema de escrow para proteger a ambas partes
- Gestión de comisiones de plataforma
- Facturación automática
- Cumplimiento fiscal (retenciones, declaraciones AFIP)

**2. Sistema de Seguros**  
- Asociación con aseguradoras para ofrecer seguros opcionales
- Seguro de responsabilidad civil para propietarios
- Seguro de daños para items de alto valor
- Proceso de reclamos integrado

**3. Aplicación Móvil Nativa**  
- Desarrollo de app iOS y Android con React Native
- Notificaciones push nativas
- Acceso a cámara para verificación de identidad
- Geolocalización en tiempo real
- Modo offline para consultar reservas

**4. Gamificación y Engagement**  
- Sistema de badges y logros
- Programa de referidos con incentivos
- Niveles de usuario (bronce, plata, oro, platino)
- Descuentos por fidelidad
- Comunidad y foros

#### Largo Plazo (1-2 años)

**1. Expansión Geográfica**  
- Lanzamiento en otras ciudades de Argentina
- Expansión a países vecinos (Uruguay, Chile, Paraguay)
- Adaptación a regulaciones locales
- Partnerships con empresas de logística

**2. Categorías Adicionales**  
- Alquiler de espacios (estudios de fotografía, salas de ensayo)
- Alquiler de vehículos entre particulares
- Equipamiento deportivo y recreativo
- Equipos electrónicos y tecnología

**3. Marketplace B2B**  
- Sección para empresas que alquilan equipamiento industrial
- Contratos de largo plazo
- Facturación B2B
- Gestión de flotas de herramientas

**4. Inteligencia Artificial y Machine Learning**  
- Recomendaciones personalizadas con ML
- Detección de fraude con anomaly detection
- Pricing dinámico basado en demanda
- Chatbot de atención al cliente con NLP
- Moderación automática de contenido

**5. Sostenibilidad y Impacto Social**  
- Métricas de impacto ambiental (CO2 ahorrado, productos no fabricados)
- Certificación B Corp
- Programa de donación de herramientas a comunidades
- Educación sobre economía circular

### 5.4 Impacto Potencial

#### Impacto Económico

**Para Usuarios Individuales**  
- **Ahorro estimado**: Un usuario que alquila en lugar de comprar puede ahorrar entre 60-80% del costo de adquisición.
- **Generación de ingresos**: Propietarios pueden generar ingresos pasivos de $10,000-$50,000 ARS mensuales alquilando herramientas inactivas.

**Para la Economía Local**  
- Creación de microemprendimientos
- Optimización del uso de capital existente
- Reducción de barreras de entrada para proyectos de mejora del hogar
- Fomento de la economía colaborativa

#### Impacto Ambiental

**Reducción de Consumo**  
- **Producción evitada**: Si 1000 usuarios alquilan en lugar de comprar, se evita la producción de ~1000 herramientas.
- **Emisiones de CO2**: La producción de herramientas eléctricas genera ~50-100 kg CO2 por unidad. Evitar 1000 producciones = 50-100 toneladas de CO2 ahorradas.
- **Residuos electrónicos**: Reducción de e-waste al extender la vida útil de herramientas existentes.

**Economía Circular**  
- Promoción de modelos de acceso sobre propiedad
- Incentivo para fabricantes de diseñar productos más duraderos
- Conciencia sobre consumo responsable

#### Impacto Social

**Inclusión Económica**  
- Acceso a herramientas profesionales para personas de bajos ingresos
- Oportunidades de emprendimiento sin inversión inicial alta
- Democratización del acceso a servicios profesionales

**Construcción de Comunidad**  
- Fortalecimiento de lazos vecinales
- Confianza en transacciones entre particulares
- Cultura de colaboración sobre competencia

**Educación y Capacitación**  
- Aprendizaje de nuevas habilidades al acceder a herramientas especializadas
- Transferencia de conocimiento entre usuarios
- Empoderamiento para proyectos DIY (Do It Yourself)

### 5.5 Reflexiones Finales

El desarrollo de Tolio ha sido un proyecto ambicioso que integra múltiples áreas de las ciencias de la computación: ingeniería de software, bases de datos, seguridad informática, interfaces de usuario, desarrollo web full-stack e integración de sistemas. Más allá de los desafíos técnicos, el proyecto aborda una problemática real con potencial de impacto social, económico y ambiental significativo.

La decisión de no implementar procesamiento de pagos en la versión inicial, aunque pueda parecer contraintuitiva para un marketplace, refleja un enfoque pragmático que prioriza la validación de mercado, la simplicidad operativa y el cumplimiento legal. Esta decisión está inspirada en el principio de "hacer cosas que no escalan" en las etapas tempranas, permitiendo aprender rápidamente de usuarios reales antes de invertir en infraestructura compleja.

El proyecto Tolio demuestra que es posible crear plataformas tecnológicas sofisticadas utilizando herramientas open-source y modernas, sin depender de grandes inversiones iniciales. La arquitectura escalable y modular permite evolucionar la plataforma basándose en feedback real y necesidades emergentes del mercado.

Finalmente, Tolio representa una oportunidad de contribuir a la transición hacia modelos de consumo más sostenibles y colaborativos, demostrando que la tecnología puede ser un habilitador de cambio social positivo cuando se diseña con propósito y consideración por las necesidades reales de las personas.

---

## Referencias

1. **Marketplaces y Economía Colaborativa**
   - Sviokla, J. (1996). "Marketspace: Creating Value in the Digital Age"
   - Hagiu, A., & Wright, J. (2015). "Multi-sided platforms". International Journal of Industrial Organization
   - Parker, G., Van Alstyne, M., & Choudary, S. P. (2016). "Platform Revolution"

2. **Sistemas de Pago en Argentina**
   - Banco Central de la República Argentina (BCRA). "Registro de Proveedores de Servicios de Pago"
   - PaymentsCMI. (2024). "Argentina Payment Methods Report 2024"
   - Rebill. (2024). "Métodos de Pago en Argentina"

3. **Aspectos Legales**
   - Código Civil y Comercial de la Nación Argentina
   - Ley 27.551 - Ley de Alquileres (modificada por Ley 27.737)
   - Argentina.gob.ar. "Contratos de alquiler: derechos y obligaciones"

4. **Tecnologías Utilizadas**
   - Next.js Documentation. https://nextjs.org/docs
   - Prisma Documentation. https://www.prisma.io/docs
   - NextAuth.js Documentation. https://next-auth.js.org
   - Leaflet Documentation. https://leafletjs.com
   - Face-API.js. https://github.com/justadudewhohacks/face-api.js

5. **Casos de Estudio**
   - Hygglio. "The Nordic Sharing Economy Platform"
   - Airbnb. "Building Trust in a Two-Sided Marketplace"
   - Mercado Libre. "E-commerce in Latin America"

---

**Anexos**

- Anexo A: Diagramas de Arquitectura Detallados
- Anexo B: Esquema Completo de Base de Datos
- Anexo C: Capturas de Pantalla de la Plataforma
- Anexo D: Código de Componentes Clave
- Anexo E: Resultados de Testing y Validación

---

**Agradecimientos**

Agradezco al Departamento de Ciencias e Ingeniería de la Computación de la Universidad Nacional del Sur por la formación académica recibida, a los profesores que guiaron este proyecto, y a la comunidad open-source cuyas herramientas hicieron posible este desarrollo.

---

*Documento generado el 7 de Diciembre de 2024*  
*Tolio - Compartir es Crecer*
