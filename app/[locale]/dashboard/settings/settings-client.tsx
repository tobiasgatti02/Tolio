"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Save, X, Wallet, CheckCircle, AlertCircle, Loader2, Camera, Trash2, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import StripeAccountStatus from "@/components/stripe-account-status"
import StripeConnectOnboarding from "@/components/stripe-connect-onboarding"
import MercadoPagoConnect from "@/components/mercadopago-connect"
import MercadoPagoStatus from "@/components/mercadopago-status"
import DLocalOnboarding from "@/components/dlocal-onboarding"

interface SettingsClientProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    bio: string | null
    profileImage: string | null
    stripeAccountId: string | null
    stripeOnboarded: boolean
    mercadopagoAccessToken: string | null
    mercadopagoUserId: string | null
    mercadopagoConnected: boolean
    mercadopagoConnectedAt: Date | null
  }
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeAccountComplete, setStripeAccountComplete] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || ''
  })

  useEffect(() => {
    if (user?.stripeAccountId) {
      checkStripeAccount()
    }
  }, [user?.stripeAccountId])

  const checkStripeAccount = async () => {
    setStripeLoading(true)
    try {
      const res = await fetch('/api/stripe/check-account')
      const data = await res.json()
      setStripeAccountComplete(data.isComplete)
    } catch (error) {
      console.error('Error checking Stripe:', error)
    } finally {
      setStripeLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setMessage({ type: 'error', text: 'Formato no soportado. Solo se aceptan JPG, PNG y WebP.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen debe ser menor a 10MB.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.profileImage)
        setMessage({ type: 'success', text: 'Foto de perfil actualizada' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir imagen')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al subir la imagen' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setImageLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async () => {
    setImageLoading(true)
    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'DELETE',
      })

      if (response.ok) {
        setProfileImage(null)
        setMessage({ type: 'success', text: 'Foto de perfil eliminada' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Error al eliminar imagen')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar la imagen' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setImageLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Información actualizada exitosamente' })
        setIsEditing(false)
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Error al actualizar')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la información' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Card className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Sube o actualiza tu foto de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {profileImage ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              {profileImage && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteImage}
                  disabled={imageLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar foto
                </Button>
              )}
              <p className="text-xs text-gray-500">
                JPG, PNG o WebP. Máximo 10MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tus datos de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Teléfono (WhatsApp)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={(e) => {
                let value = e.target.value
                // Si el usuario intenta borrar el prefijo, lo mantenemos
                if (!value.startsWith('+54 9 ')) {
                  if (value === '+54 9' || value === '+54 ' || value === '+54') {
                    value = '+54 9 '
                  } else if (value.length < 6) {
                     // Si borra todo, permitimos que quede vacío o reseteamos
                     value = '+54 9 '
                  }
                }
                setFormData({ ...formData, phoneNumber: value })
              }}
              onFocus={() => {
                if (!formData.phoneNumber) {
                  setFormData({ ...formData, phoneNumber: '+54 9 ' })
                }
              }}
              disabled={!isEditing}
              placeholder="+54 9 11 1234 5678"
            />
          </div>

          <div>
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Cuéntanos sobre ti..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Editar Información
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    phoneNumber: user?.phoneNumber || '',
                    bio: user?.bio || ''
                  })
                }}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
{/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Configuración de Pagos
          </CardTitle>
          <CardDescription>
            Configura cómo recibes pagos cuando alquilas tus artículos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.stripeAccountId ? (
            <>
              {stripeAccountComplete ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          Cuenta de pagos configurada
                        </h3>
                        <p className="text-sm text-green-800 mt-1">
                          Tu cuenta está lista para recibir pagos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                        <div className="w-full">
                          <h3 className="font-semibold text-yellow-900">
                            Configuración pendiente
                          </h3>
                          <p className="text-sm text-yellow-800 mt-1">
                            Completa tu configuración de pagos
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <StripeAccountStatus stripeAccountId={user.stripeAccountId} />
                </>
              )}
            </>
          ) : (
            <StripeConnectOnboarding />
          )}

          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">Stripe - Pago con Garantía</h4>
              <p className="text-sm text-gray-600">
                Con Stripe, el pago se retiene hasta que confirmes la entrega del artículo.
                Esto protege a ambas partes. Recibes el <strong>95% del precio</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DLocal Paynt Configuration - Para Servicios 
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            Pagos de Servicios (DLocal)
          </CardTitle>
          <CardDescription>
            Configura tu cuenta para recibir pagos por servicios y materiales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DLocalOnboarding onSuccess={() => {
            setMessage({ type: 'success', text: 'Cuenta de pagos configurada exitosamente' })
            setTimeout(() => setMessage(null), 3000)
          }} />

          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">Para Proveedores de Servicios</h4>
              <p className="text-sm text-gray-600">
                Recibe pagos por materiales (100% para ti) y por servicios completados
                (98% para ti, 2% comisión de la plataforma).
              </p>
              <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-2 rounded">
                💡 Los clientes pueden pagarte materiales por adelantado y el servicio
                una vez completado el trabajo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* MercadoPago Payment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            MercadoPago - Pago Directo
          </CardTitle>
          <CardDescription>
            Recibe pagos directos sin retención (sin garantía de escrow)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.mercadopagoConnected ? (
            <MercadoPagoStatus
              isConnected={user.mercadopagoConnected}
              mercadopagoUserId={user.mercadopagoUserId}
              connectedAt={user.mercadopagoConnectedAt}
            />
          ) : (
            <MercadoPagoConnect />
          )}

          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">MercadoPago - Pago Inmediato</h4>
              <p className="text-sm text-gray-600">
                Con MercadoPago, el dinero llega directamente a tu cuenta sin retención.
                No hay garantía de escrow. Recibes el <strong>95% del precio</strong>.
              </p>
              <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
                ⚠️ El comprador paga de inmediato y tú recibes el dinero sin esperar confirmación
                de entrega.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
