import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import ChatClient from "./chat-client"

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function ChatPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const { userId } = await params

  return <ChatClient otherUserId={userId} />
}
