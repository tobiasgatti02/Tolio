import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  isVerified?: boolean
}

export interface AppSession {
  user: SessionUser
  expires: string
}

/**
 * Helper function to get the server session with proper error handling.
 * Returns null if no session exists or if there's an error.
 */
export async function getAppSession(): Promise<AppSession | null> {
  try {
    const session = await getServerSession(authOptions)



    if (!session || !session.user || !session.user.id) {
      return null
    }

    return session as AppSession
  } catch (error) {
    return null
  }
}

/**
 * Helper function to get the current user ID from session.
 * Returns null if no valid session exists.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAppSession()
  return session?.user?.id || null
}
