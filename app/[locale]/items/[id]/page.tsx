import Link from "next/link"
import { MapPin, Star, ArrowLeft, Shield, Mail, Phone, Award, Clock, MessageCircle } from "lucide-react"
import Image from 'next/image'
import ItemGallery from "@/components/item-gallery"
import BookingFormFree from "@/components/booking-form-free"
import ReviewList from "@/components/review-list"
import ReportButton from "@/components/report-button"
import MapView from "@/components/map-view"
import { Suspense } from "react"
import ReviewListSkeleton from "@/components/review-list-skeleton"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { typography } from '@/lib/design-system'
import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ItemPageProps {
  params: Promise<{ id: string }>
}

async function getItem(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      owner: {
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

  return item
}

export default async function ItemPage({ params }: ItemPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const item = await getItem(resolvedParams.id)
  
  if (!item) {
    notFound()
  }

  const isOwnItem = session?.user?.id === item.owner.id
  const averageRating = item.reviews?.length > 0
    ? item.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / item.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/items" className="hover:text-blue-600 transition-colors">Items</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Item Images */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {item.images && item.images.length > 0 ? (
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
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
              {item.images && item.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-3">
                  {item.images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
                      <Image
                        src={img}
                        alt={`${item.title} ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: typography.fontFamily.sans }}>
                    {item.title}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({item.reviews?.length} reseñas)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
                <ReportButton
                  itemId={resolvedParams.id}
                  itemTitle={item.title}
                  itemType="item"
                  reportedUserId={item.owner.id}
                  reportedUserName={`${item.owner.firstName} ${item.owner.lastName}`}
                />
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">${item.price}</span>
                  <span className="text-gray-600 font-medium">/día</span>
                </div>
                {item.deposit > 0 && (
                  <p className="text-sm text-gray-600">
                    Depósito de seguridad: <span className="font-medium">${item.deposit}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              {/* Features */}
              {item.features && item.features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Características</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {item.latitude && item.longitude && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Ubicación
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 mb-4">{item.location}</p>
                    <MapView
                      latitude={item.latitude}
                      longitude={item.longitude}
                      title={item.title}
                      location={item.location}
                      height="300px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            {item.reviews && item.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Reseñas ({item.reviews.length})
                </h2>
                <Suspense fallback={<ReviewListSkeleton />}>
                  <ReviewList itemId={resolvedParams.id} />
                </Suspense>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Owner Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Propietario</h3>
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0">
                    {item.owner.profileImage ? (
                      <Image
                        src={item.owner.profileImage}
                        alt={`${item.owner.firstName} ${item.owner.lastName}` || 'Propietario'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {(item.owner.firstName || 'P')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {`${item.owner.firstName} ${item.owner.lastName}`.trim()}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Miembro desde {new Date(item.owner.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {item.owner.phoneNumber && (
                    <>
                      <a
                        href={`tel:${item.owner.phoneNumber}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          {item.owner.phoneNumber}
                        </span>
                      </a>
                      <a
                        href={`https://wa.me/${item.owner.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa tu item "${item.title}" que vi en Tolio.`)}`}
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

              {/* Booking Form */}
              {!isOwnItem && session && (
                <>
                  <BookingFormFree 
                    itemId={resolvedParams.id}
                    itemTitle={item.title}
                    ownerName={`${item.owner.firstName} ${item.owner.lastName}`}
                    ownerAddress={item.location}
                    price={item.price}
                    type="item"
                  />
                  
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-3">¿Tienes dudas?</h3>
                    <p className="text-blue-100 mb-6 text-sm">
                      Contacta al propietario antes de reservar
                    </p>
                    <Link
                      href={`/messages/${item.owner.id}`}
                      className="block w-full py-3 px-4 bg-white text-blue-600 rounded-xl font-semibold text-center hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      Enviar mensaje
                    </Link>
                  </div>
                </>
              )}

              {isOwnItem && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Este es tu item</h3>
                  <p className="text-sm text-orange-700 mb-4">
                    Puedes editar la información o desactivar el item desde tu panel
                  </p>
                  <Link
                    href={`/dashboard/my-items`}
                    className="block w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-center transition-colors"
                  >
                    Ir a mis items
                  </Link>
                </div>
              )}

              {!session && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Interesado?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Inicia sesión o crea una cuenta para contactar al propietario
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