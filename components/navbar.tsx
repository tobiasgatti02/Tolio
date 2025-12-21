"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, Menu, X, Bell } from "lucide-react";
import MessageBadge from "./ui/message-badge";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBadge from "./ui/notification-badge";
import NotificationsPanel from "./ui/notifications-panel";
import PublishModal from "./ui/publish-modal";
import { useLocale, useTranslations } from 'next-intl';
import { useUserMode } from "@/contexts/user-mode-context";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');
  const { userMode, toggleUserMode } = useUserMode();

  const isSellerMode = pathname.startsWith(`/${locale}/dashboard`);
  const isBuyerDashboardContext = userMode === 'buyer'

  const handleToggleUserMode = () => {
    toggleUserMode(); // Toggle the mode
    if (!isSellerMode) {
      if (!session) {
        router.push(`/${locale}/login`);
        return;
      }
      router.push(userMode === 'buyer' ? `/${locale}/dashboard/bookings` : `/${locale}/dashboard`);
    }
    // If in dashboard, just toggle mode
  }
  
  function changeLocale(newLocale: string) {
    // Mantener la ruta actual pero cambiar el locale
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(es|en)/, '');
    router.replace(`/${newLocale}${pathWithoutLocale}${window.location.search}`);
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <span className="text-3xl font-extrabold tracking-wider text-orange-600 hover:text-orange-700 transition-colors">
                {t('brand')}
              </span>
            </Link>
          </div>

          {/* Servicios y Herramientas - Centro (desktop) */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {!isSellerMode && (
              <>
                <Link
                  href={`/${locale}/items`}
                  className="group relative px-4 py-2 text-base font-semibold text-[#111827] hover:text-[#f97316] transition-colors"
                >
                  <span className="relative z-10">Herramientas</span>
                  <span className="absolute inset-0 rounded-lg bg-[#d1fae5] scale-0 group-hover:scale-100 transition-transform duration-200" />
                </Link>
                <Link
                  href={`/${locale}/services`}
                  className="group relative px-4 py-2 text-base font-semibold text-[#111827] hover:text-[#f97316] transition-colors"
                >
                  <span className="relative z-10">Servicios</span>
                  <span className="absolute inset-0 rounded-lg bg-[#dbeafe] scale-0 group-hover:scale-100 transition-transform duration-200" />
                </Link>
              </>
            )}
          </nav>

          {/* Grupos de acción - Derecho (desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              type="button"
              onClick={handleToggleUserMode}
              className="hidden sm:flex items-center gap-2 border-2 border-[#f97316] text-[#f97316] hover:bg-[#fff4e9] font-semibold bg-transparent px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" />
              {userMode === 'seller' ? "Cambiar a comprador" : "Cambiar a vendedor"}
            </button>

            {/* Reservas - grupo independiente */}
            {session && (
              <div className="flex items-center">
                <Link
                  href={`/${locale}/dashboard/bookings`}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Mis Reservas
                </Link>
              </div>
            )}

            {/* Mensajes y Notificaciones - grupo conjunto */}
            <div className="flex items-center space-x-3">
              {session && (
                <div>
                  <MessageBadge onClick={() => router.push(`/${locale}/messages`)} />
                </div>
              )}

              {session && session.user?.id && (
                <div>
                  <NotificationBadge userId={session.user.id} onClick={() => setIsNotificationsOpen(true)} />
                </div>
              )}
            </div>

            {/* Cuenta / Publicar / Login etc. */}
            <div className="flex items-center space-x-3">
              {session && (
                <Link
                  href={isBuyerDashboardContext ? `/${locale}/dashboard/bookings` : `/${locale}/dashboard`}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t('myPanel')}
                </Link>
              )}

              {session && !isBuyerDashboardContext && (
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium"
                >
                  {t('publish.label')}
                </button>
              )}

              {session ? (
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await signOut({ callbackUrl: "/" });
                  }}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {t('logout')}
                </button>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/signup`}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
{/*
              <button
                onClick={() => changeLocale(locale === 'es' ? 'en' : 'es')}
                className="ml-2 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-200"
                title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                {locale === 'es' ? 'EN' : 'ES'}
              </button>

*/}
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 p-2"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {/* User Mode Toggle */}
            <div className="pb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  toggleUserMode();
                }}
                className="w-full flex items-center justify-center gap-2 border-2 border-[#f97316] text-[#f97316] hover:bg-[#fff4e9] font-semibold bg-transparent px-4 py-3 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4" />
                {userMode === 'seller' ? "Cambiar a comprador" : "Cambiar a vendedor"}
              </button>
            </div>

            {/* Main Navigation - Only when not in dashboard */}
            {!isSellerMode && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                  Explorar
                </h3>
                <div className="space-y-1">
                  <Link
                    href={`/${locale}/services`}
                    className="flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Servicios
                  </Link>
                  <Link
                    href={`/${locale}/items`}
                    className="flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Herramientas
                  </Link>
                </div>
              </div>
            )}

            {/* User Account Section */}
            {session && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                  Mi Cuenta
                </h3>
                <div className="space-y-1">
                  <Link
                    href={isBuyerDashboardContext ? `/${locale}/dashboard/bookings` : `/${locale}/dashboard`}
                    className="flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('myPanel')}
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/bookings`}
                    className="flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Reservas
                  </Link>
                  <Link
                    href={`/${locale}/messages`}
                    className="flex items-center gap-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageBadge />
                    <span>Mensajes</span>
                  </Link>
                  {session.user?.id && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsNotificationsOpen(true);
                      }}
                      className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                    >
                      <Bell className="h-5 w-5" />
                      <span>Notificaciones</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {session && !isBuyerDashboardContext && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsPublishModalOpen(true);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all text-base font-semibold flex items-center justify-center gap-2"
                >
                  {t('publish.label')}
                </button>
              </div>
            )}

            {/* Authentication */}
            <div className="pt-2 border-t border-gray-200">
              {session ? (
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-3 text-base font-medium transition-colors rounded-lg"
                >
                  {t('logout')}
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={`/${locale}/login`}
                    className="block border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg text-base font-semibold transition-all text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/signup`}
                    className="block bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
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

      {/* Modal de publicar */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </header>
  );
}
