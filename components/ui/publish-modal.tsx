"use client"

import { useState } from "react"
import { X, Package, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-4xl font-black text-gray-900 mb-3">¿Qué quieres publicar?</h2>
        <p className="text-lg text-gray-600 mb-10">Elige qué tipo de publicación deseas crear</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Publicar Herramienta */}
          <button
            onClick={() => {
              onClose()
              router.push("/items/nuevo")
            }}
            className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-2xl p-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                <Package className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Herramienta</h3>
                <p className="text-gray-600 leading-relaxed">
                  Alquila tus taladros, escaleras, equipos y más
                </p>
              </div>
            </div>
          </button>

          {/* Publicar Servicio */}
          <button
            onClick={() => {
              onClose()
              router.push("/services/nuevo")
            }}
            className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Servicio</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ofrece tus servicios como plomero, electricista, pintor...
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Puedes editar o eliminar tu publicación en cualquier momento desde tu dashboard
        </p>
      </div>
    </div>
  )
}
