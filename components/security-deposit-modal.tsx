"use client"

import { useState } from "react"
import { CreditCard, Shield, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TermsAndConditionsModal from "./terms-and-conditions-modal"

interface SecurityDepositModalProps {
  isOpen: boolean
  onClose: () => void
  depositAmount: number
  itemTitle: string
  bookingId: string
  onDepositPaid: () => void
}

export default function SecurityDepositModal({
  isOpen,
  onClose,
  depositAmount,
  itemTitle,
  bookingId,
  onDepositPaid
}: SecurityDepositModalProps) {
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setShowTerms(false)
  }

  const handlePayDeposit = async () => {
    if (!termsAccepted) {
      setShowTerms(true)
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/payments/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          depositAmount,
          description: itemTitle
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear el pago")
      }

      const data = await response.json()
      
      if (data.success) {
        setPaymentUrl(data.initPoint)
        // En una implementación real, redirigirías al usuario a Mercado Pago
        // window.open(data.initPoint, '_blank')
      }

    } catch (error) {
      console.error("Error processing deposit:", error)
      alert("Error al procesar el depósito")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSimulatePayment = () => {
    // Simular pago exitoso para demo
    setTimeout(() => {
      onDepositPaid()
      onClose()
    }, 1000)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold">
              <Shield className="w-6 h-6 mr-2 text-emerald-600" />
              Depósito de Seguridad
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información del depósito */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Protección para ambas partes
                  </h3>
                  <p className="text-emerald-700 text-sm">
                    El depósito de seguridad protege al propietario en caso de daños y 
                    te será devuelto completamente si el objeto se devuelve en las mismas condiciones.
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del pago */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Detalles del depósito</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Artículo:</span>
                  <span className="font-medium">{itemTitle}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto del depósito:</span>
                  <span className="font-bold text-lg">${depositAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de pago:</span>
                  <div className="flex items-center">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiByeD0iMTUiIGZpbGw9IiMwMDlERjciLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik05IDEuNWMzLjQ1IDAgNi4zIDIuNDkgNi45MyA1Ljc5bC0yLjE4LS4wMWMtLjU0LTIuMjEtMi41My0zLjg1LTQuOS0zLjg1cy00LjM2IDEuNjQtNC45IDMuODVMMi4wNyA3LjI5QzIuNyAzLjk5IDUuNTUgMS41IDkgMS41eiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4KPC9zdmc+" 
                      alt="MercadoPago" 
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-sm">Mercado Pago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cómo funciona */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">¿Cómo funciona el depósito?</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <p>Pagás el depósito de forma segura a través de Mercado Pago</p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <p>El dinero queda retenido de forma segura durante el alquiler</p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <p>Al devolver el objeto en buen estado, el depósito se libera automáticamente</p>
                </div>
              </div>
            </div>

            {/* Estado de términos */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              {termsAccepted ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Términos y condiciones aceptados</span>
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    ✓ Aceptado
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-gray-700">Debes aceptar los términos y condiciones</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTerms(true)}
                  >
                    Leer términos
                  </Button>
                </>
              )}
            </div>

            {/* URL de pago (demo) */}
            {paymentUrl && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Pago creado exitosamente</p>
                    <p className="text-sm text-green-700">Serías redirigido a Mercado Pago</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ir a pagar
                  </Button>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              {paymentUrl ? (
                <Button
                  onClick={handleSimulatePayment}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Simular pago exitoso
                </Button>
              ) : (
                <Button
                  onClick={handlePayDeposit}
                  disabled={!termsAccepted || isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing ? "Procesando..." : `Pagar $${depositAmount}`}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de términos y condiciones */}
      <TermsAndConditionsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleAcceptTerms}
        title="Términos y Condiciones - Depósito de Seguridad"
      />
    </>
  )
}
