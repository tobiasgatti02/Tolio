"use client"

import { useState } from "react"
import { X, Package, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from 'next-intl';

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const router = useRouter()
  const t = useTranslations('common');
  const locale = useLocale();
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 relative animate-in fade-in zoom-in duration-300 my-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3 pr-8">{t('publish.whatToPublish')}</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 md:mb-10">{t('publish.chooseType')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Publicar Herramienta */}
          <button
            onClick={() => {
              onClose()
              router.push(`/${locale}/items/nuevo`)
            }}
            className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 md:space-y-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1 sm:mb-2">{t('publish.thing')}</h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                  {t('publish.thingDesc')}
                </p>
              </div>
            </div>
          </button>

          {/* Publicar Servicio */}
          <button
            onClick={() => {
              onClose()
              router.push(`/${locale}/services/nuevo`)
            }}
            className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 md:space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1 sm:mb-2">{t('publish.service')}</h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                  {t('publish.serviceDesc')}
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 md:mt-8">
          {t('publish.editDelete')}
        </p>
      </div>
    </div>
  )
}
