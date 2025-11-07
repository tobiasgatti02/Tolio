"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Package, Briefcase, Filter } from "lucide-react"

interface BookingEvent {
  id: string
  title: string
  startDate: Date
  endDate: Date
  type: "item" | "service"
  status: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "item" | "service">("all")

  useEffect(() => {
    fetchBookings()
  }, [currentDate])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const response = await fetch(`/api/dashboard/calendar?year=${year}&month=${month}`)
      const data = await response.json()
      setBookings(
        data.map((b: any) => ({
          ...b,
          startDate: new Date(b.startDate),
          endDate: new Date(b.endDate),
        }))
      )
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getBookingsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return bookings.filter((booking) => {
      const start = new Date(booking.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(booking.endDate)
      end.setHours(23, 59, 59, 999)
      date.setHours(12, 0, 0, 0)
      return date >= start && date <= end
    })
  }

  const filteredBookings = (dayBookings: BookingEvent[]) => {
    if (filterType === "all") return dayBookings
    return dayBookings.filter((b) => b.type === filterType)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDay(day)
      const filtered = filteredBookings(dayBookings)
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()

      days.push(
        <div
          key={day}
          className={`h-32 bg-white rounded-xl border-2 transition-all hover:shadow-lg p-3 ${
            isToday ? "border-orange-500 shadow-md" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-black text-lg ${isToday ? "text-orange-600" : "text-gray-900"}`}
            >
              {day}
            </span>
            {filtered.length > 0 && (
              <span className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className={`text-xs font-semibold px-2 py-1 rounded-lg truncate ${
                  booking.type === "item"
                    ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700"
                    : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700"
                }`}
                title={booking.title}
              >
                {booking.title}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Calendario de Disponibilidad</h1>
          <p className="text-lg text-gray-600">Visualiza tus reservas y disponibilidad</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filterType === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Todos
          </button>
          <button
            onClick={() => setFilterType("item")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filterType === "item"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="w-4 h-4" />
            Herramientas
          </button>
          <button
            onClick={() => setFilterType("service")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filterType === "service"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Servicios
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={previousMonth}
            className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900">
              {currentDate.toLocaleDateString("es-AR", { month: "long" })}
            </h2>
            <p className="text-lg text-gray-600 font-semibold">{currentDate.getFullYear()}</p>
          </div>

          <button
            onClick={nextMonth}
            className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="text-center font-black text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-4 animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">{renderCalendar()}</div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg border border-purple-200 p-8">
        <h3 className="text-xl font-black text-gray-900 mb-4">Leyenda</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg" />
            <span className="font-semibold text-gray-700">Alquiler de Herramientas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg" />
            <span className="font-semibold text-gray-700">Servicios Contratados</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 rounded-lg" />
            <span className="font-semibold text-gray-700">Día Actual</span>
          </div>
        </div>
      </div>
    </div>
  )
}
