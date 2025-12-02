import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from "@/lib/prisma"
import { Mail, Phone, MapPin, Award, Clock, DollarSign, Star, Calendar, Shield, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ReportButton from '@/components/report-button'
import BookingFormFree from '@/components/booking-form-free'
import MapView from '@/components/map-view'
import { typography } from '@/lib/design-system'



interface ServicePageProps {
  params: Promise<{ id: string }>
}

async function getService(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          profileImage: true,
          createdAt: true,
        }
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  })

  if (!service) return null

  const averageRating = service.reviews.length > 0
    ? service.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / service.reviews.length
    : 0

  return {
    ...service,
    averageRating,
    reviewCount: service.reviews.length
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const service = await getService(resolvedParams.id)

  if (!service) {
    notFound()
  }

  const isOwnService = session?.user?.id === service.provider.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-blue-600 transition-colors">Servicios</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Service Images */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {service.images && service.images.length > 0 ? (
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50">
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-200 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-gray-500 font-medium">Sin imagen</p>
                  </div>
                </div>
              )}
              
              {/* Thumbnail Gallery */}
              {service.images && service.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-3">
                  {service.images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
                      <Image
                        src={img}
                        alt={`${service.title} ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: typography.fontFamily.sans }}>
                    {service.title}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    {service.averageRating != null && service.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{service.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({service.reviewCount} reseñas)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">•</span>
                      <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {service.category}
                      </span>
                    </div>
                    {service.subcategory && (
                      <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {service.subcategory}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <ReportButton
                    serviceId={service.id}
                    itemTitle={service.title}
                    itemType="service"
                    reportedUserId={service.provider.id}
                    reportedUserName={`${service.provider.firstName} ${service.provider.lastName}`}
                  />
                </div>
              </div>

              <div className="mt-6">
                {service.isProfessional && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-full">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">Profesional Verificado</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción del servicio</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{service.description}</p>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Precio</h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <span className="text-4xl font-bold text-gray-900">
                      ${service.pricePerHour ? service.pricePerHour.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-xl text-gray-600">
                      {service.priceType === 'hour' ? '/ hora' : service.priceType === 'custom' ? '/ servicio' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              {(service.location || (service.latitude && service.longitude)) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Ubicación
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 mb-4">{service.location || 'Ubicación disponible'}</p>
                    {service.latitude && service.longitude && (
                      <MapView
                        latitude={service.latitude}
                        longitude={service.longitude}
                        title={service.title}
                        location={service.location || undefined}
                        height="300px"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {service.reviews && service.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas de clientes</h2>
                <div className="space-y-6">
                  {service.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0">
                          {review.reviewer.profileImage ? (
                            <Image
                              src={review.reviewer.profileImage}
                              alt={`${review.reviewer.firstName} ${review.reviewer.lastName}` || 'Usuario'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                              {(review.reviewer.firstName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {`${review.reviewer.firstName} ${review.reviewer.lastName}`.trim() || 'Usuario'}
                            </h3>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(review.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Provider Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestador del servicio</h3>
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0">
                    {service.provider.profileImage ? (
                      <Image
                        src={service.provider.profileImage}
                        alt={`${service.provider.firstName} ${service.provider.lastName}` || 'Prestador'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {(service.provider.firstName || 'P')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {`${service.provider.firstName} ${service.provider.lastName}`.trim()}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Miembro desde {new Date(service.provider.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {service.provider.email && (
                    <a
                      href={`mailto:${service.provider.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                        {service.provider.email}
                      </span>
                    </a>
                  )}
                  {service.provider.phoneNumber && (
                    <>
                      <a
                        href={`tel:${service.provider.phoneNumber}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          {service.provider.phoneNumber}
                        </span>
                      </a>
                      <a
                        href={`https://wa.me/${service.provider.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa tu servicio "${service.title}" que vi en Tolio.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors font-medium">
                          Contactar por WhatsApp
                        </span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Contact/Booking CTA */}
              {!isOwnService && session && (
                <>
                  <BookingFormFree
                    serviceId={service.id}
                    itemTitle={service.title}
                    ownerName={`${service.provider.firstName} ${service.provider.lastName}`.trim()}
                    ownerAddress={service.location}
                    price={service.pricePerHour}
                    type="service"
                  />
                  
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-3">¿Tienes dudas?</h3>
                    <p className="text-blue-100 mb-6 text-sm">
                      Contacta al prestador antes de reservar
                    </p>
                    <Link
                      href={`/messages/${service.provider.id}`}
                      className="block w-full py-3 px-4 bg-white text-blue-600 rounded-xl font-semibold text-center hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      Enviar mensaje
                    </Link>
                  </div>
                </>
              )}

              {isOwnService && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Este es tu servicio</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    Puedes editar la información o desactivar el servicio desde tu panel
                  </p>
                  <Link
                    href={`/dashboard/my-services`}
                    className="block w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    Ir a mis servicios
                  </Link>
                </div>
              )}

              {!session && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Interesado?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Inicia sesión o crea una cuenta para contactar al prestador
                  </p>
                  <Link
                    href="/login"
                    className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors mb-2"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium text-center transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}

             
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
