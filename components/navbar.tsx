"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBadge from "./ui/notification-badge";
import NotificationsPanel from "./ui/notifications-panel";
import PublishModal from "./ui/publish-modal";
import { useLocale, useTranslations } from 'next-intl';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');
  
  function changeLocale(newLocale: string) {
    // Mantener la ruta actual pero cambiar el locale
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(es|en)/, '');
    router.replace(`/${newLocale}${pathWithoutLocale}${window.location.search}`);
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
                {t('brand')}
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href={`/${locale}/items`}
                className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('tools')}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('services')}
              </Link>
              <Link
                href={`/${locale}/how-it-works`}
                className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('howItWorks')}
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
                href={`/${locale}/dashboard`}
                className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('myPanel')}
              </Link>
            )}
            {session && (
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
            {/* SELECTOR DE IDIOMA - Botón pequeño y sutil */}
            <button
              onClick={() => changeLocale(locale === 'es' ? 'en' : 'es')}
              className="ml-2 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-200"
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              {locale === 'es' ? 'EN' : 'ES'}
            </button>
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
          <div className="pt-2 pb-4 space-y-1 px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/items`}
              className="block text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('tools')}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="block text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('services')}
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className="block text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('howItWorks')}
            </Link>

            {session && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsPublishModalOpen(true);
                }}
                className="block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-base font-medium mt-2 w-full text-center"
              >
                {t('publish.label')}
              </button>
            )}
            {session ? (
              <>
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await signOut({ callbackUrl: "/" });
                  }}
                  className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="block border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-base font-semibold transition-all text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold mt-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('signup')}
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

      {/* Modal de publicar */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </header>
  );
}
