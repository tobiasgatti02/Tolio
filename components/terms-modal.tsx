"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  paymentMethod: 'stripe' | 'mercadopago'
}

export function TermsModal({ open, onOpenChange, onAccept, paymentMethod }: TermsModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedLiability, setAcceptedLiability] = useState(false)
  const [acceptedDNI, setAcceptedDNI] = useState(false)

  const handleAccept = () => {
    if (acceptedTerms && acceptedLiability && acceptedDNI) {
      onAccept()
      // Reset checkboxes
      setAcceptedTerms(false)
      setAcceptedLiability(false)
      setAcceptedDNI(false)
    }
  }

  const canAccept = acceptedTerms && acceptedLiability && acceptedDNI

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-600" />
            Términos y Condiciones del Alquiler
          </DialogTitle>
          <DialogDescription>
            Por favor, lee cuidadosamente y acepta los siguientes términos antes de continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Advertencia sobre método de pago */}
          {paymentMethod === 'mercadopago' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Pago Directo sin Retención:</strong> Con MercadoPago, el pago se
                realizará directamente al propietario del artículo. La plataforma NO retiene
                el dinero como garantía.
              </AlertDescription>
            </Alert>
          )}

          {paymentMethod === 'stripe' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Pago con Garantía:</strong> Con Stripe, el pago se retendrá hasta
                que el propietario confirme la entrega del artículo. Esto protege a ambas partes.
              </AlertDescription>
            </Alert>
          )}

          {/* Términos de uso */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">1. Términos de Uso</h3>
            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p>• El arrendatario se compromete a usar el artículo de forma responsable</p>
              <p>• El artículo debe ser devuelto en las mismas condiciones en que fue entregado</p>
              <p>• El depósito de garantía se retendrá en caso de daños o pérdida del artículo</p>
              <p>• Ambas partes deben cumplir con las fechas acordadas de entrega y devolución</p>
              <p>
                • Una vez confirmada la reserva, recibirás una notificación con los datos de
                contacto del propietario
              </p>
            </div>
          </div>

          {/* Responsabilidad legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">2. Límite de Responsabilidad</h3>
            <div className="text-sm text-gray-600 space-y-2 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium text-red-800">
                IMPORTANTE: La plataforma Prestar NO se hace responsable por:
              </p>
              <p>• Robo, pérdida o daño del artículo alquilado</p>
              <p>• Daños personales o materiales causados por el uso del artículo</p>
              <p>• Disputas entre arrendador y arrendatario</p>
              <p>• Calidad, estado o funcionamiento del artículo alquilado</p>
              <p className="pt-2 font-medium text-red-900">
                Prestar actúa únicamente como intermediario para conectar a usuarios.
                Cada transacción es responsabilidad exclusiva de las partes involucradas.
              </p>
            </div>
          </div>

          {/* Retención de información */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">3. Retención de Información para Disputas</h3>
            <div className="text-sm text-gray-600 space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800">
                Para protección de ambas partes, Prestar retiene:
              </p>
              <p>• Información de identificación (DNI/Documento de identidad) de ambas partes</p>
              <p>• Datos de contacto (email, teléfono)</p>
              <p>• Detalles de la transacción (fechas, precios, artículo)</p>
              <p>• Historial de mensajes entre las partes</p>
              <p className="pt-2 font-medium text-blue-900">
                Esta información se utilizará únicamente en caso de disputas legales y será
                compartida con autoridades competentes si fuera necesario.
              </p>
            </div>
          </div>

          {/* Proceso de confirmación */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">4. Proceso de Confirmación</h3>
            <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p>
                • <strong>Confirmación de Reserva:</strong> Al aceptar estos términos y completar
                el pago, se enviará una notificación al propietario
              </p>
              <p>
                • <strong>Notificación de Aprobación:</strong> Recibirás una notificación cuando
                el propietario apruebe o rechace tu solicitud
              </p>
              <p>
                • <strong>Información de Contacto:</strong> Una vez aprobada, podrás ver los
                datos de contacto del propietario para coordinar la entrega
              </p>
              {paymentMethod === 'stripe' && (
                <p className="text-green-700 font-medium">
                  • <strong>Liberación de Pago:</strong> El pago se liberará al propietario
                  cuando confirme que te entregó el artículo
                </p>
              )}
              {paymentMethod === 'mercadopago' && (
                <p className="text-yellow-700 font-medium">
                  • <strong>Pago Inmediato:</strong> El propietario recibirá el pago de
                  inmediato (sin retención de garantía)
                </p>
              )}
            </div>
          </div>

          {/* Checkboxes de aceptación */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                He leído y acepto los <strong>Términos de Uso</strong> y comprendo mis
                responsabilidades como {paymentMethod === 'stripe' ? 'arrendatario' : 'usuario'}
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="liability"
                checked={acceptedLiability}
                onCheckedChange={(checked) => setAcceptedLiability(checked as boolean)}
              />
              <Label htmlFor="liability" className="text-sm font-normal cursor-pointer leading-relaxed">
                Entiendo y acepto que <strong>Prestar NO se hace responsable</strong> por robos,
                daños o pérdidas del artículo alquilado
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="dni"
                checked={acceptedDNI}
                onCheckedChange={(checked) => setAcceptedDNI(checked as boolean)}
              />
              <Label htmlFor="dni" className="text-sm font-normal cursor-pointer leading-relaxed">
                Autorizo la <strong>retención de mi información personal</strong> (DNI, datos de
                contacto) para uso en caso de disputas legales
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setAcceptedTerms(false)
              setAcceptedLiability(false)
              setAcceptedDNI(false)
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleAccept} disabled={!canAccept}>
            {canAccept ? 'Aceptar y Confirmar Reserva' : 'Debes aceptar todos los términos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
