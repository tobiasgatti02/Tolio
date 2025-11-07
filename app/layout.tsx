import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Providers from "./providers"
import { Analytics } from "@vercel/analytics/next"
import { inter, manrope, jetbrainsMono, playfair } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Tolio - Tu Plataforma de Oficios y Herramientas",
  description: "Conecta con profesionales para changas y oficios de todo tipo. Publicá tu servicio o encontrá herramientas en tu zona.",
  keywords: ["oficios", "changas", "trabajo", "herramientas", "servicios", "profesionales", "plomero", "electricista", "carpintero"],
  authors: [{ name: "Tolio" }],
  openGraph: {
    title: "Tolio - Tu Plataforma de Oficios y Herramientas",
    description: "Conecta con profesionales para changas y oficios de todo tipo",
    type: "website",
    locale: "es_AR",
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}