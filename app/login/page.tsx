"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Loader2, AlertCircle, Wrench, Briefcase, CheckCircle
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Verificar mensajes en la URL
  useEffect(() => {
    const message = searchParams.get("message")
    const errorParam = searchParams.get("error")
    
    if (message === "EmailVerified") {
      setSuccessMessage("✅ ¡Email verificado exitosamente! Ahora puedes iniciar sesión")
    } else if (message === "AlreadyVerified") {
      setSuccessMessage("✅ Tu email ya está verificado. Puedes iniciar sesión")
    } else if (errorParam === "InvalidToken") {
      setError("❌ Token de verificación inválido o expirado")
    } else if (errorParam === "TokenNotFound") {
      setError("❌ Token de verificación no encontrado")
    } else if (errorParam === "VerificationFailed") {
      setError("❌ Error al verificar el email. Por favor intenta nuevamente")
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        // Manejar diferentes tipos de errores
        if (result.error.includes("verify")) {
          setError("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else {
          setError("Email o contraseña incorrectos")
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Guardar recordarme en localStorage si está activado
        if (rememberMe) {
          localStorage.setItem('rememberEmail', formData.email)
        } else {
          localStorage.removeItem('rememberEmail')
        }
        
        // Esperar un momento para que la sesión se establezca
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Usar window.location para forzar una recarga completa
        window.location.href = "/dashboard"
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Ocurrió un error. Por favor, intenta de nuevo")
      setIsLoading(false)
    }
  }

  // Cargar email guardado si existe
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Logo y volver */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
              Volver al inicio
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Columna Izquierda - Branding */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Tolio</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  La plataforma que conecta profesionales y herramientas en tu comunidad
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Servicios Profesionales</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Encuentra plomeros, electricistas, pintores y más profesionales verificados
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl flex-shrink-0">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Alquiler de Herramientas</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Accede a herramientas y equipos cuando los necesites sin comprarlos
                    </p>
                  </div>
                </div>
              </div>


            </div>

            {/* Columna Derecha - Formulario */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">
                  Ingresa a tu cuenta para continuar
                </p>
              </div>

              {/* Mensaje de éxito */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                </div>
              )}

              {/* Mensaje de error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="ml-2 text-gray-600">Recordarme</span>
                  </label>
                  <Link
                    href="/recuperar-password"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 font-medium">O continúa con</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>

               
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/signup"
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Regístrate gratis
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
