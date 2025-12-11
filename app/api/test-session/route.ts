import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  return NextResponse.json({
    hasSession: !!session,
    session: session,
    userId: session?.user?.id,
    userEmail: session?.user?.email
  })
}
