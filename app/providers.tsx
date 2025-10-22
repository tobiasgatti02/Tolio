"use client"

import { SessionProvider } from "next-auth/react"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { Web3Provider } from "@/components/web3-provider"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Web3Provider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </Web3Provider>
    </SessionProvider>
  )
}

