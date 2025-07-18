import { Metadata } from "next"
import { getItemById } from "@/app/api/items/[itemId]/items/route"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import EditItemForm from "@/components/edit-item-form"

export const metadata: Metadata = {
  title: "Editar Artículo | Tolio",
  description: "Modifica los detalles de tu artículo publicado",
}

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect(`/signin?callbackUrl=/items/${params.id}/edit`)
  }
  
  // Get the item data
  const items = await getItemById(params.id)
  const item = Array.isArray(items) && items.length > 0 ? items[0] : null
  
  // Check if the item exists
  if (!item) {
    notFound()
  }
  
  // Check if the current user is the owner
  if (item.ownerId !== session.user.id) {
    redirect('/my-items')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/my-items" className="flex items-center text-emerald-600 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a mis artículos
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Editar Artículo</h1>
      
      <EditItemForm item={item} />
    </div>
  )
}