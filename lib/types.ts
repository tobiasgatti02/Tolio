// Dashboard types
export interface DashboardStats {
  totalItems: number;
  activeBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  trustScore: number;
  notifications: number;
  todayEarnings: number;
  monthlyEarnings: number;
  // Campos adicionales para compatibilidad
  totalSpent?: number;
  averageRating?: number;
}

export interface DashboardItem {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precioPorDia: number;
  status: ItemStatus;
  imagenes: string[];
  ubicacion?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardBooking {
  id: string;
  item: {
    id: string;
    nombre: string;
    imagenes: string[];
    precioPorDia: number;
  };
  borrower?: {
    id: string;
    name: string;
    email: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  fechaInicio: string;
  fechaFin: string;
  total: number;
  status: BookingStatus;
  createdAt: string;
  canReview: boolean;
  hasReviewed: boolean;
  userRole: 'borrower' | 'owner';
}

export interface DashboardReview {
  id: string;
  rating: number;
  comment?: string;
  item: {
    id: string;
    nombre: string;
    imagenes: string[];
  };
  reviewer: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedBookingId?: string;
  relatedItemId?: string;
}

// Enums
export type ItemStatus = 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'PAUSADO';

export type BookingStatus = 'PENDIENTE' | 'CONFIRMADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';

export type NotificationType = 
  | 'BOOKING_REQUEST'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_COMPLETED'
  | 'REVIEW_REQUEST'
  | 'REVIEW_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'GENERAL';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  items: DashboardItem[];
  bookings: DashboardBooking[];
  reviews: DashboardReview[];
  notifications: DashboardNotification[];
}

// Filter types
export type BookingFilter = 'all' | 'active' | 'completed';
export type ItemFilter = 'all' | 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'PAUSADO';

// Form types
export interface ReviewFormData {
  rating: number;
  comment?: string;
}

export interface NotificationFormData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  relatedBookingId?: string;
  relatedItemId?: string;
}
