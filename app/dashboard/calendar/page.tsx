"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, Briefcase, Filter } from "lucide-react"

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
    const today = new Date()
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50/50" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDay(day)
      const filtered = filteredBookings(dayBookings)
      const isToday = isCurrentMonth && day === today.getDate()

      days.push(
        <div
          key={day}
          className={`min-h-[100px] p-3 border-r border-b transition-all ${
            isToday 
              ? "bg-orange-50 border-orange-300" 
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-bold ${
                isToday 
                  ? "text-orange-600 bg-orange-100 px-2 py-1 rounded-full" 
                  : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {filtered.length > 0 && (
              <span className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {filtered.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className={`text-xs font-medium px-2 py-1 rounded truncate ${
                  booking.type === "item"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
                title={booking.title}
              >
                {booking.title}
              </div>
            ))}
            {filtered.length > 3 && (
              <div className="text-xs text-gray-500 font-medium px-2">
                +{filtered.length - 3} más
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Calendario de Reservas</h1>
          <p className="text-lg text-gray-600">Visualiza todas tus reservas y disponibilidad</p>
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

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 capitalize">
              {currentDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </h2>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
            <div key={day} className="px-3 py-3 text-center font-black text-gray-700 text-sm border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[100px] bg-gray-100 animate-pulse border-r border-b" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 border-l border-t">
            {renderCalendar()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-6">
        <h3 className="text-lg font-black text-gray-900 mb-4">Leyenda</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-emerald-100 border-2 border-emerald-200 rounded" />
            <span className="font-semibold text-gray-700">Alquiler de Herramientas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-200 rounded" />
            <span className="font-semibold text-gray-700">Servicios Contratados</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded" />
            <span className="font-semibold text-gray-700">Día Actual</span>
          </div>
        </div>
      </div>
    </div>
  )
}
