"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, CheckCircle, Sparkles,
  Shield, Users, Heart, User, Phone, Check,
  Calendar, MapPin, FileText
} from "lucide-react"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  agreeTerms: boolean
}

interface Stats {
  totalUsers: number
  totalItems: number
  totalBookings: number
  avgRating: number
  activeUsers: number
}

interface Testimonial {
  rating: number
  comment: string
  author: string
  date: Date
}

interface Benefit {
  icon: string
  title: string
  description: string
}

interface StatsData {
  stats: Stats
  testimonials: Testimonial[]
  benefits: Benefit[]
}

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center mb-8">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div key={step} className="flex items-center">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
            ${step < currentStep 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : step === currentStep 
                ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500' 
                : 'bg-gray-100 text-gray-400'
            }
          `}
        >
          {step < currentStep ? <Check className="w-4 h-4" /> : step}
        </div>
        {step < totalSteps && (
          <div 
            className={`
              w-8 h-1 mx-2 rounded-full transition-all duration-300
              ${step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}
            `} 
          />
        )}
      </div>
    ))}
  </div>
)

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false
  })

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStatsData(data)
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles className="w-6 h-6" />
      case 'users': return <Users className="w-6 h-6" />
      case 'heart': return <Heart className="w-6 h-6" />
      default: return <Sparkles className="w-6 h-6" />
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError("")
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError("Por favor completa todos los campos")
          return false
        }
        if (formData.password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Las contraseñas no coinciden")
          return false
        }
        break
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.phone) {
          setError("Por favor completa todos los campos")
          return false
        }
        if (!formData.agreeTerms) {
          setError("Debes aceptar los términos y condiciones")
          return false
        }
        break
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError("")  // Limpiar errores
      setCurrentStep(prev => Math.min(prev + 1, 2))  // Solo 2 pasos
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la cuenta')
      }

      setSuccess("¡Cuenta creada exitosamente!")
      setCurrentStep(3)
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (error: any) {
      setError(error.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
              <p className="text-gray-600">Comienza tu viaje en la economía del compartir</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Información personal</h2>
              <p className="text-gray-600">Ayúdanos a conocerte mejor</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Solo visible para usuarios con reservas confirmadas
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Acepto los{" "}
                <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
                  Términos de Servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
                  Política de Privacidad
                </Link>
              </label>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Cuenta creada!</h2>
            <p className="text-gray-600 text-lg mb-8">
              Bienvenido a Tolio, {formData.firstName}. Te redirigiremos a tu dashboard.
            </p>
            <div className="flex items-center justify-center space-x-2 text-emerald-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirigiendo...</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex">
      {/* Panel izquierdo - Información */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">¡Únete a Tolio!</h1>
            <p className="text-xl text-emerald-100 mb-8">
              {statsData ? 
                `Únete a ${statsData.stats.totalUsers.toLocaleString()} personas que ya transformaron lo que no usan en oportunidades` :
                "Convierte lo que no usas en una oportunidad"
              }
            </p>
            {statsData && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">${(statsData.stats.totalBookings * 850).toLocaleString()}</div>
                  <div className="text-sm text-emerald-100">Generados en ingresos</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{statsData.stats.activeUsers}</div>
                  <div className="text-sm text-emerald-100">Usuarios activos</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {statsLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-white/20 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-white/20 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              statsData?.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {getIcon(benefit.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-emerald-100">{benefit.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-white/20 rounded w-24"></div>
              </div>
            ) : statsData?.testimonials && statsData.testimonials.length > 0 ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className="text-yellow-300">⭐</span>
                    ))}
                  </div>
                  <span className="text-emerald-100 font-semibold">{statsData.stats.avgRating}</span>
                </div>
                <p className="text-sm text-emerald-100 italic">
                  "{statsData.testimonials[0].comment}"
                </p>
                <p className="text-sm font-semibold mt-3">- {statsData.testimonials[0].author}</p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className="text-yellow-300">⭐</span>
                    ))}
                  </div>
                  <span className="text-emerald-100 font-semibold">5.0</span>
                </div>
                <p className="text-sm text-emerald-100 italic">
                  "En mi primer mes gané $15,000 prestando mi cámara y herramientas que tenía guardadas"
                </p>
                <p className="text-sm font-semibold mt-3">- Lucas M., Córdoba</p>
              </>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Progress */}
          {currentStep < 3 && <ProgressIndicator currentStep={currentStep} totalSteps={2} />}

          {/* Error/Success Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Contenido del paso */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {renderStep()}

            {/* Navigation */}
            {currentStep < 3 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${currentStep === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }
                  `}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={currentStep === 1 ? handleNext : handleSubmit}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : currentStep === 1 ? (
                    <>
                      <span>Siguiente</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Login Link */}
          {currentStep < 3 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
