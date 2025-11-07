"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function EnhancedCreateItemForm() {
  const router = useRouter()
  
  useEffect(() => {
    router.push("/items/nuevo")
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirigiendo...</p>
    </div>
  )
}
