"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MutualReviewModal from "@/components/mutual-review-modal"
import CancelBookingButton from "@/components/cancelBookingButton"
import { toast } from "@/hooks/use-toast"

interface BookingActionsProps {
  booking: {
    id: string
    status: string
    borrowerId: string
    ownerId: string
    item: {
      id: string
      title: string
      images: string[]
    }
    borrower: {
      id: string
      firstName: string
      lastName: string
      profileImage: string | null
    }
    owner: {
      id: string
      firstName: string
      lastName: string
      profileImage: string | null
    }
  }
  userId: string
  isOwner: boolean
  isBorrower: boolean
}

interface ReviewData {
  rating: number
  comment: string
  trustFactors: string[]
  bookingId: string
  revieweeId: string
}

export default function BookingActions({
  booking,
  userId,
  isOwner,
  isBorrower
}: BookingActionsProps) {
  const [showMutualReviewModal, setShowMutualReviewModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCompleteBooking = async () => {
    try {
      setIsSubmitting(true)
      
      // Actualizar el estado de la reserva a completado
      const response = await fetch(`/api/booking/${booking.id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al completar la reserva")
      }

      // Mostrar el modal de review mutuo
      setShowMutualReviewModal(true)
      
      toast({
        title: "Reserva completada",
        description: "La reserva ha sido marcada como completada exitosamente",
      })

    } catch (error) {
      console.error("Error completing booking:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/booking/${booking.id}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al confirmar la reserva")
      }

      toast({
        title: "Reserva confirmada",
        description: "La reserva ha sido confirmada exitosamente",
      })

      window.location.reload()

    } catch (error) {
      console.error("Error confirming booking:", error)
      toast({
        title: "Error",
        description: "No se pudo confirmar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectBooking = async () => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/booking/${booking.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al rechazar la reserva")
      }

      toast({
        title: "Reserva rechazada",
        description: "La reserva ha sido rechazada",
      })

      window.location.reload()

    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitMutualReview = async (reviewData: ReviewData) => {
    try {
      const response = await fetch("/api/reviews/mutual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        throw new Error("Error al enviar la reseña")
      }

      toast({
        title: "Reseña enviada",
        description: "Tu reseña ha sido enviada exitosamente",
      })

      setShowMutualReviewModal(false)

    } catch (error) {
      console.error("Error submitting review:", error)
      throw error
    }
  }

  const otherUser = isOwner ? booking.borrower : booking.owner

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Show different actions based on booking status */}
        {booking.status === "PENDING" && isBorrower && (
          <CancelBookingButton bookingId={booking.id} />
        )}
        
        {booking.status === "PENDING" && isOwner && (
          <div className="flex gap-3">
            <Button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
            </Button>
            <Button
              onClick={handleRejectBooking}
              disabled={isSubmitting}
              variant="destructive"
              className="flex-1"
            >
              {isSubmitting ? "Rechazando..." : "Rechazar"}
            </Button>
          </div>
        )}
        
        {booking.status === "CONFIRMED" && (
          <Button
            onClick={handleCompleteBooking}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? "Completando..." : "Marcar como completado"}
          </Button>
        )}
        
        {booking.status === "COMPLETED" && isBorrower && (
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href={`/reviews/create?bookingId=${booking.id}`}>
              Dejar reseña
            </Link>
          </Button>
        )}
      </div>

      {/* Modal de review mutuo */}
      <MutualReviewModal
        isOpen={showMutualReviewModal}
        onClose={() => setShowMutualReviewModal(false)}
        bookingId={booking.id}
        isOwner={isOwner}
        otherUser={{
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          image: otherUser.profileImage || undefined,
        }}
        item={{
          title: booking.item.title,
          image: booking.item.images[0] || "/placeholder.svg",
        }}
        onSubmit={handleSubmitMutualReview}
      />
    </>
  )
}
