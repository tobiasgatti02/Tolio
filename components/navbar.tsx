"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBadge from "./ui/notification-badge";
import NotificationsPanel from "./ui/notifications-panel";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { data: session } = useSession();
  const Router = useRouter();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-emerald-600">
                Tolio
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/items"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium"
              >
                Buscar Objetos
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium"
              >
                ¿Cómo funciona?
              </Link>

            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {session && session.user?.id && (
              <NotificationBadge 
                userId={session.user.id}
                onClick={() => setIsNotificationsOpen(true)}
              />
            )}

            {session && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium"
              >
                Mi panel
              </Link>
            )}
            {session && (
              <Link
                href="/items/nuevo"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium"
              >
                Crear publicación
              </Link>
            )}
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium"
              >
                Salir
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-emerald-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
              Buscar Objetos
            </Link>
            <Link
              href="/how-it-works"
              className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              ¿Cómo funciona?
            </Link>

            {session && (
              <Link
                href="/items/nuevo"
                className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
              >
                Crear publicación
              </Link>
            )}
            {session ? (
              <>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-emerald-600 px-3 py-2 text-base font-medium"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Panel de notificaciones */}
      {session && session.user?.id && (
        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          userId={session.user.id}
        />
      )}
    </header>
  );
}
