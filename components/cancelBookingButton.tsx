"use client"

import { useState } from "react"
import { BookingStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

interface CancelBookingButtonProps {
  bookingId: string
}

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
    
  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Llamar a la API usando fetch
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' as BookingStatus }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowModal(false)
        router.refresh()
      } else {
        setError(data.error || "Error al cancelar la reserva")
      }
    } catch (err) {
      setError("Ocurrió un error al cancelar la reserva")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-800 border border-red-600 px-4 py-2 rounded-lg text-sm font-medium"
      >
        Cancelar reserva
      </button>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium">Cancelar reserva</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
            </p>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelando
                  </span>
                ) : (
                  "Sí, cancelar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}