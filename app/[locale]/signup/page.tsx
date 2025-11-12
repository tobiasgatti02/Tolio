"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, User, Phone, CheckCircle
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreeTerms: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Por favor completa todos los campos obligatorios")
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
    if (!formData.agreeTerms) {
      setError("Debes aceptar los términos y condiciones")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la cuenta")
      }

      // Mostrar mensaje de éxito y verificación
      setUserEmail(formData.email)
      setRegistrationSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Si el registro fue exitoso, mostrar mensaje de verificación
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-orange-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-center mb-2">
              ¡Revisa tu email!
            </h1>
            <p className="text-center text-orange-100 text-lg">
              Te enviamos un link de verificación
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-700 mb-3">
                    Hemos enviado un email de verificación a:
                  </p>
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    {userEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    Por favor revisa tu bandeja de entrada y haz click en el link de verificación para activar tu cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Instrucciones paso a paso */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Próximos pasos:</h3>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Abre tu email</p>
                  <p className="text-sm text-gray-600">Busca el email de verificación de Tolio</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Haz click en el link</p>
                  <p className="text-sm text-gray-600">El link expira en 24 horas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">¡Listo para empezar!</p>
                  <p className="text-sm text-gray-600">Inicia sesión y comienza a usar Tolio</p>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">💡 ¿No ves el email?</span> Revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <button className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                  Ir al inicio de sesión
                </button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full py-3 px-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all">
                  Volver al inicio
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Columna Izquierda - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo y Header */}
          <div>
            <Link href="/" className="inline-block mb-8">
              <span className="text-4xl font-black text-orange-600">Tolio</span>
            </Link>
            <h1 className="text-5xl font-black text-gray-900 mb-3">
              Crea tu cuenta
            </h1>
            <p className="text-xl text-gray-600">
              Únete a la comunidad de Tolio
            </p>
          </div>

          {/* Alert de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-600">
                Acepto los{" "}
                <Link href="/terms" className="text-orange-600 hover:text-orange-700 font-semibold">
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-700 font-semibold">
                  política de privacidad
                </Link>
              </label>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">O regístrate con</span>
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

          {/* Link a Login */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-bold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Hero Image & Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-5xl font-black mb-6 leading-tight">
            Forma parte de la comunidad
          </h2>
          <p className="text-2xl mb-10 text-white/90 leading-relaxed">
            Miles de personas ya comparten herramientas y servicios en Tolio
          </p>

          {/* Beneficios */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Publica gratis</h3>
                <p className="text-white/80">Sin costos de publicación ni mensualidades</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Comunidad verificada</h3>
                <p className="text-white/80">Usuarios confiables y reseñas reales</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Gana dinero extra</h3>
                <p className="text-white/80">Alquila tus herramientas u ofrece servicios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
