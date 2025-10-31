"use client"

import { SessionProvider } from "next-auth/react"
import { NotificationsProvider } from "@/contexts/notifications-context"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </SessionProvider>
  )
}

