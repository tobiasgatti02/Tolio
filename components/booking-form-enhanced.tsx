"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, CreditCard, X, CheckCircle, Wallet, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createBooking } from "@/app/api/booking/route"
import PaymentButton from "@/components/payment-button"
import { Web3PaymentForm } from "@/components/web3-payment-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface BookingFormProps {
  itemId: string
  itemTitle: string
  ownerName: string
  ownerAddress: string
  price: number
}

export default function BookingFormEnhanced({ itemId, itemTitle, ownerName, ownerAddress, price }: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<{ id: string; totalPrice: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'traditional' | 'crypto'>('traditional')
  
  const router = useRouter()
  const { toast } = useToast()

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setTotalDays(diffDays || 1)
    }
  }, [startDate, endDate])

  // Validate dates when they change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      let yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      today.setHours(0, 0, 0, 0)

      setError("")
      
      if (start < yesterday) {
        setError("Start date cannot be in the past")
      } else if (start >= end) {
        setError("End date must be after start date")
      }
    }
  }, [startDate, endDate])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError("")
    
    formData.append("itemId", itemId)
    
    try {
      const result = await createBooking(formData)
      
      if (result.success && result.bookingId) {
        // Calculate total price
        const totalPrice = price * totalDays + Math.round(price * totalDays * 0.1)
        
        // Save booking information
        setCreatedBooking({
          id: result.bookingId,
          totalPrice: totalPrice
        })
        
        // Show payment modal
        setShowPaymentModal(true)
        
        toast({
          title: "Booking Created",
          description: "Now you can proceed with payment to confirm your booking.",
          variant: "default",
        })
      } else {
        setError(result.error || "There was an error creating the booking")
        toast({
          title: "Error",
          description: result.error || "There was an error creating the booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("Unexpected error. Please try again.")
      toast({
        title: "Error",
        description: "Unexpected error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCryptoPayment = () => {
    // For crypto payments, we don't need to create a traditional booking
    // We'll create the escrow deal directly
    setShowPaymentModal(true)
    setPaymentMethod('crypto')
  }

  const handleCryptoSuccess = (dealId: string) => {
    toast({
      title: "Escrow Deal Created!",
      description: "Your crypto payment has been secured in escrow.",
      variant: "default",
    })
    
    setShowPaymentModal(false)
    router.push('/dashboard/bookings')
  }

  const totalPrice = price * totalDays
  const serviceFee = Math.round(totalPrice * 0.1)
  const grandTotal = totalPrice + serviceFee

  return (
    <div className="space-y-6">
      {/* Date Selection Form */}
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-emerald-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="pl-10 block w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm bg-emerald-50/50 hover:bg-emerald-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-emerald-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="pl-10 block w-full rounded-lg border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors py-3 text-sm bg-emerald-50/50 hover:bg-emerald-50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-700">
              ${price} × {totalDays} days
            </span>
            <span className="font-medium">${totalPrice}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-700">Service fee</span>
            <span className="font-medium">${serviceFee}</span>
          </div>
          <div className="border-t border-emerald-200 pt-2 mt-2 font-bold text-emerald-800 flex justify-between">
            <span>Total</span>
            <span>${grandTotal}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Traditional Payment */}
            <button
              type="submit"
              disabled={isSubmitting || !!error}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                <p className="font-medium">Traditional Payment</p>
                <p className="text-xs text-gray-500">Credit card via MercadoPago</p>
                <Badge variant="outline" className="mt-2">Popular</Badge>
              </div>
              {isSubmitting && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </button>

            {/* Crypto Payment */}
            <button
              type="button"
              onClick={handleCryptoPayment}
              disabled={!!error}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">Crypto Payment</p>
                <p className="text-xs text-gray-500">USDT via Smart Contract</p>
                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800">
                  Secure Escrow
                </Badge>
              </div>
            </button>
          </div>
        </div>
      </form>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {paymentMethod === 'crypto' ? (
                <>
                  <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                  Crypto Payment
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                  Booking Created!
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {paymentMethod === 'crypto' ? (
            // Crypto payment flow
            <div className="space-y-4">
              <Web3PaymentForm
                itemId={itemId}
                itemTitle={itemTitle}
                ownerName={ownerName}
                ownerAddress={ownerAddress}
                pricePerDay={price}
                durationDays={totalDays}
                onSuccess={handleCryptoSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </div>
          ) : (
            // Traditional payment flow
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Your booking has been created successfully. Now proceed with payment to confirm it.
                </p>
              </div>

              {/* Payment summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <span>{startDate} - {endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee:</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-emerald-600">
                    <span>Total:</span>
                    <span>${grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Payment buttons */}
              <div className="space-y-3">
                {createdBooking && (
                  <PaymentButton
                    bookingId={createdBooking.id}
                    amount={createdBooking.totalPrice}
                    onPaymentStart={() => setShowPaymentModal(false)}
                  />
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      if (createdBooking) {
                        router.push(`/dashboard/bookings/${createdBooking.id}`)
                      }
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Pay Later
                  </button>
                  
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                💡 You can complete payment later from your bookings dashboard
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}