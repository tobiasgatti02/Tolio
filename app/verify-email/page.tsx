"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (!token) {
      setStatus("error")
      setMessage("Token de verificación no encontrado")
      return
    }

    // Verificar el token
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // NextAuth redirigió, extraer el mensaje de la URL
          const url = new URL(res.url)
          const message = url.searchParams.get("message")
          const error = url.searchParams.get("error")
          
          if (message === "EmailVerified" || message === "AlreadyVerified") {
            setStatus("success")
            setMessage(message === "EmailVerified" 
              ? "¡Email verificado exitosamente!" 
              : "Tu email ya estaba verificado")
          } else if (error) {
            setStatus("error")
            setMessage(error === "InvalidToken" 
              ? "Token inválido o expirado" 
              : "Error al verificar el email")
          }
        } else {
          const data = await res.json()
          if (res.ok) {
            setStatus("success")
            setMessage(data.message || "Email verificado")
          } else {
            setStatus("error")
            setMessage(data.error || "Error desconocido")
          }
        }
      })
      .catch((err) => {
        console.error("Error verificando email:", err)
        setStatus("error")
        setMessage("Error de conexión")
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verificando email...</CardTitle>
              <CardDescription>
                Por favor espera mientras verificamos tu cuenta
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                ¡Verificación exitosa!
              </CardTitle>
              <CardDescription className="text-base">
                {message}
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Error de verificación
              </CardTitle>
              <CardDescription className="text-base">
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Tu cuenta está activada
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Ahora puedes iniciar sesión y comenzar a usar Tolio
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                size="lg"
                onClick={() => router.push("/login")}
              >
                Ir al inicio de sesión
              </Button>

              <Link href="/" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      No pudimos verificar tu email
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      El link puede haber expirado. Por favor intenta registrarte nuevamente o contacta soporte.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/signup" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  size="lg"
                >
                  Crear nueva cuenta
                </Button>
              </Link>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Intentar iniciar sesión
                </Button>
              </Link>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Esto solo tomará un momento...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
