"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "lucide-react"

interface BookingFormProps {
  itemId: string
  price: number
}

export default function BookingForm({ itemId, price }: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)

  const handleDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setTotalDays(diffDays || 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the booking request
    console.log("Booking request submitted", { itemId, startDate, endDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Comienzo del alquiler
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="start-date"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                handleDateChange()
              }}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fin del alquiler
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="end-date"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                handleDateChange()
              }}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>
            ${price} × {totalDays} días
          </span>
          <span>${price * totalDays}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Comisión</span>
          <span>${Math.round(price * totalDays * 0.1)}</span>
        </div>
        <div className="border-t pt-2 mt-2 font-bold flex justify-between">
          <span>Total</span>
          <span>${price * totalDays + Math.round(price * totalDays * 0.1)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
      >
        Pedir prestado
      </button>
    </form>
  )
}

