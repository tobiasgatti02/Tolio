"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, User, Phone, CheckCircle
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
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

      // Redirigir al login después del registro exitoso
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
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
