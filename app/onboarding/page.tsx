"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { 
  ArrowRight, ArrowLeft, Check, MapPin, Camera, 
  Sparkles, Heart, Shield, Users, Bell, Mail, 
  Smartphone, Upload, User, Home, Briefcase,
  Star, Gift, Handshake, TrendingUp, Phone
} from "lucide-react"

// Componente de indicador de progreso mejorado
const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center mb-8">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div key={step} className="flex items-center">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
            ${step < currentStep 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : step === currentStep 
                ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-200' 
                : 'bg-gray-100 text-gray-400'
            }
          `}
        >
          {step < currentStep ? <Check className="w-5 h-5" /> : step}
        </div>
        {step < totalSteps && (
          <div 
            className={`
              w-12 h-1 mx-2 rounded-full transition-all duration-300
              ${step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}
            `} 
          />
        )}
      </div>
    ))}
  </div>
)

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Estados para los diferentes pasos
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    phoneNumber: "",
    interests: [] as string[],
    avatar: null as File | null,
    avatarPreview: "",
    notifications: {
      email: true,
      push: true,
      bookingUpdates: true,
      newMessages: true,
      marketingEmails: false,
    },
    trustLevel: "beginner" as "beginner" | "intermediate" | "expert",
  })

  // Cargar categorías al inicializar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categorias")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar toggle de intereses
  const handleInterestToggle = (categoryId: string) => {
    setUserData((prev) => {
      const interests = [...prev.interests]
      if (interests.includes(categoryId)) {
        return { ...prev, interests: interests.filter((i) => i !== categoryId) }
      } else {
        return { ...prev, interests: [...interests, categoryId] }
      }
    })
  }

  // Manejar cambios en notificaciones
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setUserData((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: checked },
    }))
  }

  // Manejar cambio de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUserData((prev) => ({ ...prev, avatar: file }))
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserData((prev) => ({ ...prev, avatarPreview: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Navegación
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  // Enviar datos finales
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push("/dashboard?onboarding=complete")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setLoading(false)
    }
  }

  // Validación por paso
  const isStepValid = () => {
    switch (step) {
      case 1:
        return userData.firstName.trim() && userData.lastName.trim()
      case 2:
        return userData.location.trim() && userData.phoneNumber.trim()
      case 3:
        return userData.interests.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  // Render de cada paso
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Bienvenido a Tolio!</h2>
              <p className="text-gray-600 text-lg">Comenzemos conociendo un poco sobre ti</p>
            </div>

            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {userData.avatarPreview ? (
                      <Image
                        src={userData.avatarPreview}
                        alt="Avatar preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                        <Camera className="w-8 h-8 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Sube tu foto de perfil</p>
              </div>

              {/* Nombre */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuéntanos sobre ti
                </label>
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Ej: Me gusta la tecnología y compartir herramientas que no uso frecuentemente..."
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Dónde estás ubicado?</h2>
              <p className="text-gray-600 text-lg">Esto nos ayuda a conectarte con personas cercanas</p>
            </div>

            <div className="space-y-6">
              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad o ubicación *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={userData.location}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Ej: Buenos Aires, Argentina"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Tu número será visible solo para personas con reservas confirmadas
                </p>
              </div>

              {/* Trust Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Cómo te describes como prestamista?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      value: "beginner", 
                      label: "Principiante", 
                      description: "Es mi primera vez prestando objetos",
                      icon: Star
                    },
                    { 
                      value: "intermediate", 
                      label: "Intermedio", 
                      description: "Tengo algo de experiencia compartiendo",
                      icon: Gift
                    },
                    { 
                      value: "expert", 
                      label: "Experto", 
                      description: "Soy experimentado en préstamos y sharing economy",
                      icon: TrendingUp
                    }
                  ].map((level) => {
                    const Icon = level.icon
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setUserData(prev => ({ ...prev, trustLevel: level.value as any }))}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all hover:scale-105
                          ${userData.trustLevel === level.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                          }
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="w-6 h-6 text-emerald-500 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{level.label}</h3>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Qué te interesa?</h2>
              <p className="text-gray-600 text-lg">Selecciona las categorías que más te gusten para personalizar tu experiencia</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleInterestToggle(category.id.toString())}
                  className={`
                    p-6 rounded-xl border-2 transition-all hover:scale-105 text-center
                    ${userData.interests.includes(category.id.toString())
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                </button>
              ))}
            </div>

            {userData.interests.length > 0 && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                <p className="text-emerald-800 text-center">
                  ¡Perfecto! Has seleccionado {userData.interests.length} categoría{userData.interests.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Configurar notificaciones</h2>
              <p className="text-gray-600 text-lg">Elige cómo quieres que te mantengamos informado</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  key: "email",
                  title: "Notificaciones por email",
                  description: "Recibe actualizaciones importantes por correo",
                  icon: Mail
                },
                {
                  key: "push",
                  title: "Notificaciones push",
                  description: "Alertas instantáneas en tu dispositivo",
                  icon: Smartphone
                },
                {
                  key: "bookingUpdates",
                  title: "Actualizaciones de reservas",
                  description: "Cuando alguien reserva o devuelve tus objetos",
                  icon: Handshake
                },
                {
                  key: "newMessages",
                  title: "Nuevos mensajes",
                  description: "Cuando recibas mensajes de otros usuarios",
                  icon: Users
                },
                {
                  key: "marketingEmails",
                  title: "Emails promocionales",
                  description: "Ofertas especiales y novedades de Tolio",
                  icon: Gift
                }
              ].map((notification) => {
                const Icon = notification.icon
                return (
                  <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 text-emerald-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={notification.key}
                        checked={userData.notifications[notification.key as keyof typeof userData.notifications]}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-2">Tu privacidad es importante</h3>
                  <p className="text-sm text-emerald-800">
                    Puedes cambiar estas configuraciones en cualquier momento desde tu panel de configuración.
                    Nunca compartiremos tu información personal con terceros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ProgressIndicator currentStep={step} totalSteps={4} />
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`
                flex items-center px-6 py-3 rounded-xl font-semibold transition-all
                ${step === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className={`
                flex items-center px-8 py-3 rounded-xl font-semibold transition-all
                ${!isStepValid() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completando...
                </>
              ) : step === 4 ? (
                <>
                  ¡Comenzar!
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
