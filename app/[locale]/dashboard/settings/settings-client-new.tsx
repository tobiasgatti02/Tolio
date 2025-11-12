"use client"

import { useState } from "react"
import { 
  User, Camera, Edit, Save, Check, X 
} from "lucide-react"

interface SettingsClientProps {
  user: any
}

export default function SettingsClient({ user }: SettingsClientProps) {
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
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
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Foto de perfil</h3>
                  <p className="text-sm text-gray-600">JPG, GIF o PNG. Máximo 10MB.</p>
                </div>
              </div>

              {/* Personal information */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Información personal</h3>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        // Cancelar - restaurar datos originales
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          email: user?.email || '',
                          phoneNumber: user?.phoneNumber || '',
                          bio: user?.bio || ''
                        })
                      }
                      setIsEditing(!isEditing)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
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
                        disabled={true} // Email no se puede editar
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
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
                    </div>
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

              {/* Save button */}
              {isEditing && (
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Guardando...' : 'Guardar cambios'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
