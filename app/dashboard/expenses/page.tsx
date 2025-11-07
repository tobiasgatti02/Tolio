"use client"

import { useState, useEffect } from "react"
import { TrendingDown, DollarSign, Package, Briefcase, Calendar, CreditCard } from "lucide-react"

interface ExpensesData {
  totalExpenses: number
  itemsExpenses: number
  servicesExpenses: number
  totalBookings: number
  itemsBookings: number
  servicesBookings: number
  monthlyExpenses: { month: string; items: number; services: number }[]
  topExpenses: { name: string; amount: number }[]
}

export default function ExpensesPanel() {
  const [expensesData, setExpensesData] = useState<ExpensesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    fetchExpensesData()
  }, [timeRange])

  const fetchExpensesData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/expenses?range=${timeRange}`)
      const data = await response.json()
      setExpensesData(data)
    } catch (error) {
      console.error("Error fetching expenses data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!expensesData) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Panel de Gastos</h1>
          <p className="text-lg text-gray-600">Análisis de reservas realizadas</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {range === "week" && "Semana"}
              {range === "month" && "Mes"}
              {range === "year" && "Año"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <CreditCard className="w-8 h-8" />
            </div>
            <TrendingDown className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-5xl font-black mb-2">
            ${expensesData.totalExpenses.toLocaleString()}
          </div>
          <p className="text-white/90 font-semibold text-lg">Gastos Totales</p>
          <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <span>{expensesData.totalBookings} reservas realizadas</span>
          </div>
        </div>

        {/* Items Expenses */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl">
              <Package className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-2">
            ${expensesData.itemsExpenses.toLocaleString()}
          </div>
          <p className="text-gray-600 font-semibold">Herramientas</p>
          <div className="mt-4 text-sm text-gray-500">
            {expensesData.itemsBookings} alquileres
          </div>
        </div>

        {/* Services Expenses */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-2">
            ${expensesData.servicesExpenses.toLocaleString()}
          </div>
          <p className="text-gray-600 font-semibold">Servicios</p>
          <div className="mt-4 text-sm text-gray-500">
            {expensesData.servicesBookings} servicios contratados
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Gastos Mensuales</h2>
        <div className="space-y-4">
          {expensesData.monthlyExpenses.map((data, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{data.month}</span>
                <span className="text-sm font-bold text-gray-900">
                  ${(data.items + data.services).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-1 h-12">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-500 hover:scale-105 flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{
                    width: `${data.items > 0 ? (data.items / (data.items + data.services)) * 100 : 0}%`,
                  }}
                >
                  {data.items > 0 && `$${data.items}`}
                </div>
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-all duration-500 hover:scale-105 flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{
                    width: `${data.services > 0 ? (data.services / (data.items + data.services)) * 100 : 0}%`,
                  }}
                >
                  {data.services > 0 && `$${data.services}`}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded" />
            <span className="text-sm font-semibold text-gray-700">Herramientas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded" />
            <span className="text-sm font-semibold text-gray-700">Servicios</span>
          </div>
        </div>
      </div>

      {/* Top Expenses */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg border border-purple-200 p-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Mayores Gastos</h2>
        <div className="space-y-4">
          {expensesData.topExpenses.map((expense, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center">
                  #{idx + 1}
                </div>
                <span className="font-semibold text-gray-900">{expense.name}</span>
              </div>
              <span className="text-lg font-black text-purple-600">
                ${expense.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
