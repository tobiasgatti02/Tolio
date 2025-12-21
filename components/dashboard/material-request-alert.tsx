"use client"

import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MaterialItem {
  name: string
  price: number
}

interface MaterialRequestAlertProps {
  userRole: 'provider' | 'client'
  materials: MaterialItem[]
  totalAmount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  onApprove?: () => void
  onReject?: () => void
  onRequest?: () => void
  isLoading?: boolean
}

export default function MaterialRequestAlert({
  userRole,
  materials,
  totalAmount,
  status,
  onApprove,
  onReject,
  onRequest,
  isLoading = false
}: MaterialRequestAlertProps) {
  
  if (status === 'APPROVED') {
    return (
      <div className="p-5 bg-status-green-bg border-2 border-status-green rounded-xl">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-status-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-green-text mb-1">
              Materiales Aprobados
            </p>
            <p className="text-xs text-status-green-text">
              El pago de materiales (${totalAmount.toLocaleString()}) ha sido aprobado.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'REJECTED') {
    return (
      <div className="p-5 bg-status-red-bg border-2 border-status-red rounded-xl">
        <div className="flex items-start gap-3">
          <XCircle className="h-6 w-6 text-status-red flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-red mb-1">
              Solicitud de Materiales Rechazada
            </p>
            <p className="text-xs text-status-red">
              La solicitud de pago de materiales fue rechazada.
            </p>
          </div>
        </div>
      </div>
    )
  }
  // Para el proveedor cuando ya hay materiales pendientes
  const providerHasPendingMaterials = userRole === 'provider' && materials.length > 0

  return (
    <div className="p-5 bg-gradient-to-br from-tolio-orange-50 to-tolio-orange-100 border-2 border-tolio-orange-500 rounded-xl shadow-md">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-tolio-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <AlertCircle className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-tolio-gray-900 mb-1">
                {userRole === 'provider' 
                  ? (providerHasPendingMaterials ? 'Materiales Solicitados' : 'Solicitar Materiales')
                  : 'Solicitud de Pago de Materiales'}
              </h3>
              <p className="text-sm text-gray-700">
                {userRole === 'provider'
                  ? (providerHasPendingMaterials 
                      ? 'Esperando aprobación del cliente para los materiales solicitados'
                      : 'Solicita pago anticipado para materiales necesarios')
                  : 'El proveedor solicita pago anticipado para materiales'}
              </p>
            </div>
            <span className={`text-xs font-bold text-white px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap ${
              userRole === 'provider' && providerHasPendingMaterials
                ? 'bg-tolio-orange-500'
                : 'bg-status-red'
            }`}>
              {userRole === 'provider' && providerHasPendingMaterials
                ? 'PENDIENTE DE APROBACIÓN'
                : 'ACCIÓN REQUERIDA'}
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <p className="text-sm font-semibold text-tolio-gray-900 mb-3">Materiales requeridos:</p>
            <div className="space-y-2 mb-3">
              {materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{material.name}</span>
                  <span className="text-sm font-bold text-tolio-gray-900">
                    ${material.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-tolio-gray-900">Total:</span>
                <span className="text-2xl font-bold text-tolio-orange-500">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="bg-tolio-orange-50 rounded-lg p-3 flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-tolio-orange-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-tolio-orange-700 mb-1">
                    Pago directo al proveedor
                  </p>
                  <p className="text-xs text-tolio-orange-800">
                    Este pago va 100% al proveedor para comprar los materiales. No se cobra comisión por
                    materiales, solo por el servicio final.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {userRole === 'provider' ? (
              providerHasPendingMaterials ? (
                // Provider already requested materials - show add more option
                <Button
                  size="sm"
                  variant="outline"
                  className="border-tolio-orange-500 text-tolio-orange-500 hover:bg-tolio-orange-50 flex-1 h-11 font-semibold"
                  onClick={onRequest}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Agregar Más Materiales'}
                </Button>
              ) : (
                // Provider hasn't requested yet
                <Button
                  size="sm"
                  className="bg-tolio-orange-500 hover:bg-tolio-orange-600 text-white flex-1 h-11 font-semibold shadow-md"
                  onClick={onRequest}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isLoading ? 'Enviando...' : 'Solicitar Pago'}
                </Button>
              )
            ) : (
              <>
                <Button
                  size="sm"
                  className="bg-tolio-orange-500 hover:bg-tolio-orange-600 text-white flex-1 h-11 font-semibold shadow-md"
                  onClick={onApprove}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isLoading ? 'Procesando...' : 'Aprobar y Pagar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-400 bg-white hover:bg-gray-50 h-11 font-medium"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  Rechazar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
