"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBadge from "./ui/notification-badge";
import NotificationsPanel from "./ui/notifications-panel";
import PublishModal from "./ui/publish-modal";
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white relative">
      <Link href={`/${locale}`} className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center z-10">
        <Image
          src="/logo-tolio-circle.png"
          alt="Tolio"
          width={70}
          height={70}
          className="h-20 w-20 object-contain"
        />
      </Link>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between pl-24">

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-12 md:flex ml-16">
            <Link
              href={`/${locale}/items`}
              className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-[#FF5722]"
            >
              <Image
                src="/icons/herramientas.svg"
                alt="Herramientas"
                width={40}
                height={40}
                className="object-contain"
              />
              <span>{t('tools')}</span>
            </Link>

            <Link
              href={`/${locale}/services`}
              className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-[#FF5722]"
            >
              <Image src="/icons/servicios.svg" alt="Servicios" width={40} height={40} className="object-contain" />
              <span>{t('services')}</span>
            </Link>

            {session && (
              <Link
                href={`/${locale}/dashboard/bookings`}
                className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-[#FF5722]"
              >
                <Image src="/icons/reservas.svg" alt="Reservas" width={40} height={40} className="object-contain" />
                <span>Reservas</span>
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-8 md:flex">
            {session && session.user?.id && (
              <NotificationBadge
                userId={session.user.id}
                onClick={() => setIsNotificationsOpen(true)}
              />
            )}

            {session && (
              <Link
                href={`/${locale}/messages`}
                className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-[#FF5722]"
              >
                <Image src="/icons/mensajes.svg" alt="Mensajes" width={40} height={40} className="object-contain" />
              </Link>
            )}

            {session && (
              <Button
                onClick={() => setIsPublishModalOpen(true)}
                className="bg-[#FF5722] text-white hover:bg-[#E64A19]"
              >
                {t('publish.label')}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Image src="/icons/perfil.svg" alt="Perfil" width={40} height={40} className="object-contain" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard`} className="w-full">
                    {t('myPanel')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/how-it-works`} className="w-full">
                    {t('howItWorks')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* SELECTOR DE IDIOMA - Botón pequeño y sutil */}
            <button
              onClick={() => changeLocale(locale === 'es' ? 'en' : 'es')}
              className="ml-2 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors border border-gray-200"
              title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              {locale === 'es' ? 'EN' : 'ES'}
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {session && session.user?.id && (
              <NotificationBadge
                userId={session.user.id}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}

            {session && (
              <Link
                href={`/${locale}/messages`}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-[#FF5722]"
              >
                <Image src="/icons/mensajes.svg" alt="Mensajes" width={40} height={40} className="object-contain" />
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Image src="/icons/perfil.svg" alt="Perfil" width={40} height={40} className="object-contain" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard`} className="w-full">
                    {t('myPanel')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/how-it-works`} className="w-full">
                    {t('howItWorks')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu Hamburguesa */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href={`/${locale}/items`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/icons/herramientas.svg"
                alt="Herramientas"
                width={40}
                height={40}
                className="object-contain"
              />
              <span>{t('tools')}</span>
            </Link>
            <Link
              href={`/${locale}/services`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image src="/icons/servicios.svg" alt="Servicios" width={40} height={40} className="object-contain" />
              <span>{t('services')}</span>
            </Link>
            {session && (
              <Link
                href={`/${locale}/dashboard/bookings`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image src="/icons/reservas.svg" alt="Reservas" width={40} height={40} className="object-contain" />
                <span>Mis Reservas</span>
              </Link>
            )}
            <div className="my-2 border-t border-neutral-200" />
            <Link
              href={`/${locale}/how-it-works`}
              className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('howItWorks')}
            </Link>
            {session && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPublishModalOpen(true);
                }}
                className="block w-full rounded-lg bg-[#FF5722] px-3 py-2 text-base font-medium text-white hover:bg-[#E64A19]"
              >
                {t('publish.label')}
              </button>
            )}
            {!session && (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="block rounded-lg bg-[#FF5722] px-3 py-2 text-base font-medium text-white hover:bg-[#E64A19] text-center"
                  onClick={() => setMobileMenuOpen(false)}
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
    </nav>
  );
}
