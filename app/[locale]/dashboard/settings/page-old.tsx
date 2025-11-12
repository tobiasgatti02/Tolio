"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { 
  Package, Calendar, Star, Settings, Upload, Loader2, Save, 
  User, Lock, Bell, CreditCard, PenTool, Shield, Eye, EyeOff,
  Camera, MapPin, Phone, Mail, Home, Smartphone, Check,
  AlertCircle, Info, Gift, Trash2, Edit, Plus, MessageCircle,
  TrendingUp
} from "lucide-react"

// Componente de Tab
const TabButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  children 
}: { 
  active: boolean
  onClick: () => void
  icon: any
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all
      ${active 
        ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span>{children}</span>
  </button>
)

// Componente de Switch
const Switch = ({ 
  checked, 
  onChange, 
  disabled = false 
}: { 
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean 
}) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`
      relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
      ${checked ? 'bg-emerald-600' : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
)

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("")

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Perfil
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    location: "",
    
    // Privacidad
    showPhone: true,
    showEmail: false,
    showLocation: true,
    publicProfile: true,
    
    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    messageAlerts: true,
    reviewAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    
    // Seguridad
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    
    // Pagos
    defaultPaymentMethod: "",
    autoWithdraw: false,
    withdrawThreshold: 500
  })

  // Cargar datos del usuario
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user.name?.split(" ")[0] || "",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        email: session.user.email || "",
        // Los demás campos se mantendrán con valores por defecto hasta que implementemos la API
      }))
      
      if (session.user.image) {
        setAvatarPreview(session.user.image)
      }
    }
  }, [session])

  // Manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Manejar cambio de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Guardar configuración
  const handleSave = async (section: string) => {
    setIsSubmitting(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Aquí iría la llamada a la API
      console.log(`Saving ${section}:`, formData)
      
      // Mostrar mensaje de éxito
      alert("Configuración guardada exitosamente")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error al guardar la configuración")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizar contenido de cada tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del perfil</h2>
              
              {/* Avatar */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                        <User className="w-8 h-8 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Foto de perfil</h3>
                  <p className="text-gray-600 text-sm">Una buena foto aumenta la confianza de otros usuarios</p>
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Buenos Aires, Argentina"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    placeholder="Cuéntale a la comunidad un poco sobre ti..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.bio.length}/300 caracteres
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('profile')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de privacidad</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Control de visibilidad</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Controla qué información personal es visible para otros usuarios de Tolio.
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  {
                    key: "publicProfile",
                    title: "Perfil público",
                    description: "Permite que otros usuarios vean tu perfil y información básica",
                    icon: User
                  },
                  {
                    key: "showPhone",
                    title: "Mostrar teléfono",
                    description: "Tu número será visible para usuarios con reservas confirmadas",
                    icon: Phone
                  },
                  {
                    key: "showEmail",
                    title: "Mostrar email",
                    description: "Tu correo será visible en tu perfil público",
                    icon: Mail
                  },
                  {
                    key: "showLocation",
                    title: "Mostrar ubicación",
                    description: "Tu ciudad será visible para otros usuarios",
                    icon: MapPin
                  }
                ].map((setting) => {
                  const Icon = setting.icon
                  return (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{setting.title}</h3>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData[setting.key as keyof typeof formData] as boolean}
                        onChange={(checked) => setFormData(prev => ({ ...prev, [setting.key]: checked }))}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('privacy')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h2>
              
              <div className="space-y-8">
                {/* Métodos de notificación */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de notificación</h3>
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        title: "Notificaciones por email",
                        description: "Recibe notificaciones en tu correo electrónico",
                        icon: Mail
                      },
                      {
                        key: "pushNotifications",
                        title: "Notificaciones push",
                        description: "Alertas instantáneas en tu navegador o app",
                        icon: Smartphone
                      },
                      {
                        key: "smsNotifications",
                        title: "Notificaciones SMS",
                        description: "Mensajes de texto para alertas importantes",
                        icon: Phone
                      }
                    ].map((method) => {
                      const Icon = method.icon
                      return (
                        <div key={method.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Icon className="w-5 h-5 text-gray-600 mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{method.title}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData[method.key as keyof typeof formData] as boolean}
                            onChange={(checked) => setFormData(prev => ({ ...prev, [method.key]: checked }))}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tipos de notificación */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de notificación</h3>
                  <div className="space-y-4">
                    {[
                      {
                        key: "bookingAlerts",
                        title: "Alertas de reservas",
                        description: "Nuevas reservas, confirmaciones y devoluciones",
                        icon: Calendar
                      },
                      {
                        key: "messageAlerts",
                        title: "Nuevos mensajes",
                        description: "Cuando recibas mensajes de otros usuarios",
                        icon: MessageCircle
                      },
                      {
                        key: "reviewAlerts",
                        title: "Nuevas reseñas",
                        description: "Cuando alguien deje una reseña sobre ti",
                        icon: Star
                      },
                      {
                        key: "marketingEmails",
                        title: "Emails promocionales",
                        description: "Ofertas especiales y novedades de Tolio",
                        icon: Gift
                      },
                      {
                        key: "weeklyDigest",
                        title: "Resumen semanal",
                        description: "Estadísticas y actividad de la semana",
                        icon: TrendingUp
                      }
                    ].map((type) => {
                      const Icon = type.icon
                      return (
                        <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Icon className="w-5 h-5 text-gray-600 mt-1" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{type.title}</h4>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData[type.key as keyof typeof formData] as boolean}
                            onChange={(checked) => setFormData(prev => ({ ...prev, [type.key]: checked }))}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('notifications')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Seguridad</h2>
              
              <div className="space-y-8">
                {/* Cambiar contraseña */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar contraseña</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Recomendación de seguridad</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          Usa una contraseña segura con al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Autenticación de dos factores */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Autenticación de dos factores</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Verificación en dos pasos</h4>
                        <p className="text-sm text-gray-600">
                          Añade una capa extra de seguridad a tu cuenta
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled}
                      onChange={(checked) => setFormData(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('security')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 text-sm mt-1">Gestiona tu cuenta y preferencias</p>
              </div>

              <nav className="space-y-2">
                <TabButton
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  icon={User}
                >
                  Perfil
                </TabButton>
                <TabButton
                  active={activeTab === "privacy"}
                  onClick={() => setActiveTab("privacy")}
                  icon={Shield}
                >
                  Privacidad
                </TabButton>
                <TabButton
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  icon={Bell}
                >
                  Notificaciones
                </TabButton>
                <TabButton
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                  icon={Lock}
                >
                  Seguridad
                </TabButton>
              </nav>

              {/* Navegación de retorno */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Volver al dashboard</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
