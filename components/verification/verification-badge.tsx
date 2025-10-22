"use client"

import { ShieldCheck, ShieldAlert, Clock } from "lucide-react"

interface VerificationBadgeProps {
  verifiedIdentity: boolean
  status?: 'APPROVED' | 'PENDING' | 'REJECTED' | null
  className?: string
}

export default function VerificationBadge({ 
  verifiedIdentity, 
  status = null,
  className = "" 
}: VerificationBadgeProps) {
  if (!verifiedIdentity && !status) return null

  const getStatusInfo = () => {
    if (verifiedIdentity || status === 'APPROVED') {
      return {
        icon: ShieldCheck,
        text: "Identidad verificada",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
        iconColor: "text-emerald-600"
      }
    }

    if (status === 'PENDING') {
      return {
        icon: Clock,
        text: "Verificación pendiente",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        iconColor: "text-yellow-600"
      }
    }

    if (status === 'REJECTED') {
      return {
        icon: ShieldAlert,
        text: "Verificación rechazada",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        iconColor: "text-red-600"
      }
    }

    return null
  }

  const statusInfo = getStatusInfo()
  if (!statusInfo) return null

  const Icon = statusInfo.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} text-sm font-medium ${className}`}>
      <Icon className={`h-4 w-4 ${statusInfo.iconColor}`} />
      <span>{statusInfo.text}</span>
    </div>
  )
}
