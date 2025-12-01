"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, Trash2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  type: 'in-use' | 'pending-bookings' | 'confirm-delete'
  itemType: 'item' | 'service'
  itemTitle?: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  itemType,
  itemTitle
}: DeleteConfirmationModalProps) {
  const itemTypeName = itemType === 'item' ? 'artículo' : 'servicio'
  
  const getContent = () => {
    switch (type) {
      case 'in-use':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-600" />,
          title: `${itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1)} en uso`,
          description: `No puedes eliminar este ${itemTypeName} porque actualmente está alquilado o confirmado. Espera a que finalice el alquiler antes de eliminarlo.`,
          showConfirm: false,
          confirmText: '',
          confirmVariant: 'destructive' as const
        }
      case 'pending-bookings':
        return {
          icon: <Info className="h-12 w-12 text-amber-600" />,
          title: '¿Eliminar con reservas pendientes?',
          description: `Este ${itemTypeName} tiene reservas pendientes que aún no han sido confirmadas. Si lo eliminas, todas las peticiones de alquiler pendientes serán canceladas. ¿Deseas continuar?`,
          showConfirm: true,
          confirmText: 'Sí, eliminar',
          confirmVariant: 'destructive' as const
        }
      case 'confirm-delete':
        return {
          icon: <Trash2 className="h-12 w-12 text-gray-600" />,
          title: `¿Eliminar ${itemTypeName}?`,
          description: `¿Estás seguro de que quieres eliminar "${itemTitle}"? Esta acción no se puede deshacer.`,
          showConfirm: true,
          confirmText: 'Eliminar',
          confirmVariant: 'destructive' as const
        }
    }
  }

  const content = getContent()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4">
              {content.icon}
            </div>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <DialogDescription className="text-base">
              {content.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {content.showConfirm ? 'Cancelar' : 'Entendido'}
          </Button>
          {content.showConfirm && (
            <Button
              variant={content.confirmVariant}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="w-full sm:w-auto"
            >
              {content.confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
