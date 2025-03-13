"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Bell } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-emerald-600">Prestar</span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/items" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                Buscar Objetos
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                ¿Cómo funciona?
              </Link>
              <Link href="/lend" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                Presta tus cosas
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/notifications" className="text-gray-700 hover:text-emerald-600 p-1 rounded-full">
              <Bell className="h-6 w-6" />
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
              Ingresar
            </Link>
            <Link
              href="/signup"
              className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Registrarse
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-emerald-600 p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-4 space-y-1 px-4 sm:px-6 lg:px-8">
            <Link
              href="/items"
              className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Items
            </Link>
            <Link
              href="/how-it-works"
              className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/lend"
              className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Lend Your Items
            </Link>
            <Link
              href="/login"
              className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="block bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

