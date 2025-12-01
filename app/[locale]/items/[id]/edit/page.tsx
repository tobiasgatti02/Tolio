import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/utils"
import EditItemForm from "@/components/edit-item-form"

export const metadata = {
  title: "Editar Artículo | Tolio",
  description: "Edita tu herramienta publicada",
}

interface EditItemPageProps {
  params: Promise<{ 
    locale: string
    id: string 
  }>
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const session = await getServerSession(authOptions)
  const { locale, id } = await params
  
  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/items/${id}/edit`)
  }

  // Obtener el item
  const item = await prisma.item.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      price: true,
      deposit: true,
      location: true,
      latitude: true,
      longitude: true,
      features: true,
      images: true,
      ownerId: true,
    },
  })

  if (!item) {
    notFound()
  }

  // Verificar que el usuario es el dueño
  if (item.ownerId !== session.user.id) {
    redirect(`/${locale}/items/${id}`)
  }

  return (
    <EditItemForm 
      item={{
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        category: item.category || "",
        price: item.price,
        deposit: item.deposit || 0,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        features: item.features || [],
        images: item.images || [],
      }} 
    />
  )
}
