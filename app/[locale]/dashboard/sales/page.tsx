"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Package, Briefcase, Calendar, Filter } from "lucide-react"

interface SalesData {
  totalRevenue: number
  itemsRevenue: number
  servicesRevenue: number
  totalSales: number
  itemsSales: number
  servicesSales: number
  monthlySales: { month: string; items: number; services: number }[]
  topItems: { name: string; revenue: number }[]
  topServices: { name: string; revenue: number }[]
}

export default function SalesPanel() {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    fetchSalesData()
  }, [timeRange])

  const fetchSalesData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/sales?range=${timeRange}`)
      const data = await response.json()
      setSalesData(data)
    } catch (error) {
      console.error("Error fetching sales data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-44 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!salesData) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Panel de Ventas</h1>
          <p className="text-lg text-gray-600">Análisis de ingresos por herramientas y servicios</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? "bg-[hsl(25_95%_53%)] text-white shadow-md"
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
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[hsl(25_95%_53%)] to-[hsl(25_95%_43%)] rounded-3xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            <TrendingUp className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-5xl font-black mb-2">
            ${salesData.totalRevenue.toLocaleString()}
          </div>
          <p className="text-white/90 font-semibold text-lg">Ingresos Totales</p>
          <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4" />
            <span>+12% vs período anterior</span>
          </div>
        </div>

        {/* Items Revenue */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl">
              <Package className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-2">
            ${salesData.itemsRevenue.toLocaleString()}
          </div>
          <p className="text-gray-600 font-semibold">Herramientas</p>
          <div className="mt-4 text-sm text-gray-500">
            {salesData.itemsSales} alquileres completados
          </div>
        </div>

        {/* Services Revenue */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-2">
            ${salesData.servicesRevenue.toLocaleString()}
          </div>
          <p className="text-gray-600 font-semibold">Servicios</p>
          <div className="mt-4 text-sm text-gray-500">
            {salesData.servicesSales} servicios completados
          </div>
        </div>
      </div>

      {/* Monthly Chart (Simple Bars) */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Ventas Mensuales</h2>
        <div className="space-y-4">
          {salesData.monthlySales.map((data, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{data.month}</span>
                <span className="text-sm font-bold text-gray-900">
                  ${(data.items + data.services).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-1 h-12">
                {/* Items bar */}
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-500 hover:scale-105 flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{
                    width: `${(data.items / (data.items + data.services)) * 100}%`,
                  }}
                >
                  {data.items > 0 && `$${data.items}`}
                </div>
                {/* Services bar */}
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-all duration-500 hover:scale-105 flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{
                    width: `${(data.services / (data.items + data.services)) * 100}%`,
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

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl shadow-lg border border-emerald-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Top Herramientas</h2>
          <div className="space-y-4">
            {salesData.topItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <span className="font-semibold text-gray-900">{item.name}</span>
                </div>
                <span className="text-lg font-black text-emerald-600">
                  ${item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Top Servicios</h2>
          <div className="space-y-4">
            {salesData.topServices.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <span className="font-semibold text-gray-900">{service.name}</span>
                </div>
                <span className="text-lg font-black text-blue-600">
                  ${service.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
