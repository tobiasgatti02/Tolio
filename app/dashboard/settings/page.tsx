"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Calendar, Star, Settings, Upload, Loader2, Save, User, Lock, Bell, CreditCard } from "lucide-react"

export default function SettingsClientPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Datos de ejemplo del usuario
  const [userData, setUserData] = useState({
    firstName: "Juan",
    lastName: "García",
    email: "juan.garcia@example.com",
    phoneNumber: "+34 612 345 678",
    bio: "Apasionado de la tecnología y el bricolaje. Me gusta compartir mis herramientas cuando no las estoy usando.",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setUserData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }))
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envío de datos
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Perfil actualizado correctamente")
    }, 1500)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envío de datos
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Contraseña actualizada correctamente")

      // Resetear campos
      const form = e.target as HTMLFormElement
      form.reset()
    }, 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de usuario</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                <Package className="h-5 w-5 mr-2" />
                Mis artículos
              </Link>
              <Link
                href="/dashboard/bookings"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Mis reservas
              </Link>
              <Link
                href="/dashboard/reviews"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Star className="h-5 w-5 mr-2" />
                Reseñas
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-3 py-2 text-emerald-600 bg-emerald-50 rounded-md font-medium"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "profile"
                      ? "border-b-2 border-emerald-600 text-emerald-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "password"
                      ? "border-b-2 border-emerald-600 text-emerald-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Lock className="h-4 w-4 inline mr-2" />
                  Contraseña
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "notifications"
                      ? "border-b-2 border-emerald-600 text-emerald-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Bell className="h-4 w-4 inline mr-2" />
                  Notificaciones
                </button>
                <button
                  onClick={() => setActiveTab("payment")}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "payment"
                      ? "border-b-2 border-emerald-600 text-emerald-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Métodos de pago
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                        <Image src={profileImage || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Cambiar foto
                      </button>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Biografía
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={userData.bio}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Guardar cambios
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Lock className="h-5 w-5 mr-2" />
                            Actualizar contraseña
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Preferencias de notificaciones</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notificaciones por email</h4>
                          <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus reservas y mensajes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="email"
                            checked={userData.notifications.email}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notificaciones push</h4>
                          <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="push"
                            checked={userData.notifications.push}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notificaciones SMS</h4>
                          <p className="text-sm text-gray-500">Recibe alertas importantes por SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="sms"
                            checked={userData.notifications.sms}
                            onChange={handleNotificationChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar preferencias
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Métodos de pago</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-md mr-3">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Visa terminada en 4242</h4>
                            <p className="text-xs text-gray-500">Expira 12/2025</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-sm text-gray-600 hover:text-gray-900">Editar</button>
                          <button className="text-sm text-red-600 hover:text-red-900">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Añadir método de pago
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

