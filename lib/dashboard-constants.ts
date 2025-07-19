// Constantes para el Dashboard

// Estados de los items
export const ITEM_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  NO_DISPONIBLE: 'NO_DISPONIBLE',
  PRESTADO: 'PRESTADO'
} as const

// Estados de las reservas/bookings
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  REVIEW: 'review',
  MESSAGE: 'message'
} as const

// Mensajes de error estándar
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  INVALID_USER_ID: 'User ID is required and must be a string',
  STATS_FETCH_ERROR: 'Failed to fetch user stats',
  ITEMS_FETCH_ERROR: 'Error al cargar los artículos del usuario',
  BOOKINGS_FETCH_ERROR: 'Failed to fetch user bookings',
  REVIEWS_FETCH_ERROR: 'Failed to fetch user reviews',
  NOTIFICATIONS_FETCH_ERROR: 'Failed to fetch user notifications',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  DASHBOARD_LOAD_ERROR: 'Error al cargar los datos del dashboard.',
  SESSION_EXPIRED: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
} as const

// Límites y configuraciones
export const DASHBOARD_CONFIG = {
  MAX_RECENT_ACTIVITIES: 5,
  MAX_NOTIFICATIONS_PER_PAGE: 10,
  DEFAULT_TRUST_SCORE: 0,
  MAX_TRUST_SCORE: 5.0,
  TRUST_SCORE_WEIGHTS: {
    RATING: 0.7,
    REVIEW_COUNT: 0.2,
    BOOKING_COUNT: 0.1
  }
} as const

// Colores para los estados
export const STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
} as const
