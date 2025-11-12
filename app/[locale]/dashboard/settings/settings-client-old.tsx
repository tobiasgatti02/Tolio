"use client"

import { useState, useEffect } from "react"
import { 
  User, CreditCard, Bell, Shield, MapPin, Phone, 
  Mail, Camera, Edit, Save, Eye, EyeOff, Check, X 
} from "lucide-react"

interface SettingsClientProps {
  user: any
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || ''
  })

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
  ]

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al guardar los cambios')
      }

      const result = await response.json()
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
      setIsEditing(false)
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Mensaje de éxito/error */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Profile picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Foto de perfil</h3>
          <p className="text-sm text-gray-600">Sube una foto para personalizar tu perfil</p>
          <div className="flex items-center space-x-3 mt-3">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Cambiar foto
            </button>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Información personal</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : ''
                }`}
              />
              <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : ''
                }`}
              />
              <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : ''
                }`}
              />
              <Mail className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+54 9 11 1234-5678"
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : ''
                }`}
              />
              <Phone className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografía
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Cuéntanos algo sobre ti..."
            disabled={!isEditing}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !isEditing ? 'bg-gray-50 text-gray-500' : ''
            }`}
          />
        </div>
      </div>

      {/* Account security */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Seguridad de la cuenta</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Contraseña</p>
                <p className="text-sm text-gray-600">Última actualización: hace 3 meses</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Cambiar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Verificación por email</p>
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Verificado
                </p>
              </div>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
              Configurar
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Verificación por SMS</p>
                <p className="text-sm text-yellow-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  Pendiente
                </p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Activar
            </button>
          </div>
        </div>
      </div>

      {/* Verification status */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Estado de verificación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-900">Email verificado</span>
            </div>
            <p className="text-xs text-green-700">Tu email está confirmado</p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-900">Teléfono pendiente</span>
            </div>
            <p className="text-xs text-yellow-700">Agrega tu número de teléfono</p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">DNI pendiente</span>
            </div>
            <p className="text-xs text-gray-700">Verifica tu identidad</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      {isEditing && (
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      )}
    </div>
  )

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Métodos de pago</h3>
      <p className="text-gray-600">Configura cómo quieres recibir tus pagos</p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Esta sección está en desarrollo</p>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Preferencias de notificación</h3>
      <p className="text-gray-600">Configura qué notificaciones quieres recibir</p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Esta sección está en desarrollo</p>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Configuración de privacidad</h3>
      <p className="text-gray-600">Controla quién puede ver tu información</p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Esta sección está en desarrollo</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      {/* Settings tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>
      </div>
    </div>
  )
}
