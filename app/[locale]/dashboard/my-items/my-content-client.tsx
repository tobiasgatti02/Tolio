"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, Package, Edit3, Trash2, Star, MapPin, 
  Pause, Play, Wrench, Briefcase, Filter, Search
} from "lucide-react";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/delete-confirmation-modal";

interface ContentItem {
  id: string;
  type: 'item' | 'service';
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  price: number | null;
  priceType: string;
  isProfessional?: boolean;
  status: 'DISPONIBLE' | 'PRESTADO' | 'PAUSADO';
  images: string[];
  location: string;
  serviceArea?: string | null;
  averageRating: number | null;
  reviewCount: number;
  bookingsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MyContentClientProps {
  userId: string;
}

export default function MyContentClient({ userId }: MyContentClientProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [services, setServices] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [contentFilter, setContentFilter] = useState<'all' | 'items' | 'services'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'in-use' | 'pending-bookings' | 'confirm-delete';
    itemId: string;
    itemType: 'item' | 'service';
    itemTitle: string;
  } | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/my-content");
      if (!response.ok) {
        throw new Error("Error al cargar el contenido");
      }
      const data = await response.json();
      setItems(data.items || []);
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      setError("Error al cargar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id: string, type: 'item' | 'service', currentStatus: string) => {
    const isAvailable = currentStatus === 'PAUSADO';
    
    try {
      const response = await fetch(`/api/dashboard/my-content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, isAvailable }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar");
      }

      const result = await response.json();
      alert(result.message);
      fetchContent();
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Error al actualizar el estado");
    }
  };

  const handleDelete = async (id: string, type: 'item' | 'service', title: string) => {
    // Mostrar modal de confirmación inicial
    setDeleteModal({
      isOpen: true,
      type: 'confirm-delete',
      itemId: id,
      itemType: type,
      itemTitle: title
    });
  };

  const executeDelete = async () => {
    if (!deleteModal) return;

    const { itemId, itemType } = deleteModal;

    try {
      const response = await fetch(`/api/dashboard/my-content/${itemId}?type=${itemType}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        // Verificar si es error de item en uso
        if (result.code === "IN_USE") {
          setDeleteModal({
            ...deleteModal,
            type: 'in-use'
          });
          return;
        }
        throw new Error(result.message || "Error al eliminar");
      }

      // Éxito - cerrar modal y actualizar lista
      setDeleteModal(null);
      fetchContent();
    } catch (error: any) {
      console.error("Error deleting:", error);
      setDeleteModal(null);
      alert(error.message || "Error al eliminar");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DISPONIBLE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PRESTADO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAUSADO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DISPONIBLE":
        return "Disponible";
      case "PRESTADO":
        return "En uso";
      case "PAUSADO":
        return "Pausado";
      default:
        return status;
    }
  };

  const getAllContent = () => {
    let allContent = [...items, ...services];
    
    // Filtrar por tipo
    if (contentFilter === 'items') {
      allContent = items;
    } else if (contentFilter === 'services') {
      allContent = services;
    }
    
    // Filtrar por estado
    if (activeTab !== "all") {
      allContent = allContent.filter(item => item.status === activeTab);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      allContent = allContent.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return allContent;
  };

  const filteredContent = getAllContent();

  // Estadísticas
  const stats = {
    totalItems: items.length,
    totalServices: services.length,
    total: items.length + services.length,
    available: [...items, ...services].filter(item => item.status === "DISPONIBLE").length,
    inUse: [...items, ...services].filter(item => item.status === "PRESTADO").length,
    paused: [...items, ...services].filter(item => item.status === "PAUSADO").length,
    averageRating: (() => {
      const allContent = [...items, ...services];
      const withRatings = allContent.filter(item => item.averageRating !== undefined);
      if (withRatings.length === 0) return 0;
      return withRatings.reduce((sum, item) => sum + (item.averageRating || 0), 0) / withRatings.length;
    })()
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchContent} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona tus herramientas y servicios publicados</p>
        </div>
        <div className="flex gap-2">
          <Link href="/items/nuevo">
            <Button variant="outline" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Nueva Herramienta
            </Button>
          </Link>
          <Link href="/services/nuevo">
            <Button className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 border-blue-100 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
            <div className="mt-2 flex gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Wrench className="h-3 w-3" /> {stats.totalItems}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> {stats.totalServices}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Uso</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inUse}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pausados</p>
                <p className="text-3xl font-bold text-gray-600">{stats.paused}</p>
              </div>
              <Pause className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-500 opacity-20 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filtro por tipo */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2">
                <Button
                  variant={contentFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={contentFilter === 'items' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentFilter('items')}
                  className="flex items-center gap-1"
                >
                  <Wrench className="h-4 w-4" />
                  Herramientas ({stats.totalItems})
                </Button>
                <Button
                  variant={contentFilter === 'services' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentFilter('services')}
                  className="flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  Servicios ({stats.totalServices})
                </Button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({filteredContent.length})</TabsTrigger>
          <TabsTrigger value="DISPONIBLE">
            Disponibles ({[...items, ...services].filter(i => i.status === "DISPONIBLE").length})
          </TabsTrigger>
          <TabsTrigger value="PRESTADO">
            En Uso ({[...items, ...services].filter(i => i.status === "PRESTADO").length})
          </TabsTrigger>
          <TabsTrigger value="PAUSADO">
            Pausados ({[...items, ...services].filter(i => i.status === "PAUSADO").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay contenido
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? "No se encontraron resultados para tu búsqueda"
                      : activeTab === "all"
                      ? "Comienza agregando tu primera herramienta o servicio"
                      : `No tienes ${activeTab === "DISPONIBLE" ? "contenido disponible" : activeTab === "PRESTADO" ? "contenido en uso" : "contenido pausado"}`
                    }
                  </p>
                  {activeTab === "all" && !searchTerm && (
                    <div className="flex gap-2 justify-center">
                      <Link href="/items/nuevo">
                        <Button variant="outline">
                          <Wrench className="h-4 w-4 mr-2" />
                          Agregar Herramienta
                        </Button>
                      </Link>
                      <Link href="/services/nuevo">
                        <Button>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Agregar Servicio
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((content) => (
                <Card key={content.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate flex items-center gap-2">
                          {content.type === 'item' ? (
                            <Wrench className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          )}
                          <span className="truncate">{content.title}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(content.status)}>
                            {getStatusText(content.status)}
                          </Badge>
                          {content.type === 'service' && content.isProfessional && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Profesional
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{content.category}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Imagen */}
                    {content.images && content.images.length > 0 && (
                      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={content.images[0]}
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    
                    {/* Descripción */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {content.description}
                    </p>
                    
                    {/* Precio y Rating */}
                    <div className="flex justify-between items-center">
                      <div>
                        {content.price !== null ? (
                          <p className="text-xl font-bold text-green-600">
                            ${content.price.toLocaleString()}
                            <span className="text-sm text-gray-500">
                              /{content.priceType === 'hour' ? 'hora' : content.priceType === 'day' ? 'día' : 'custom'}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">Precio a consultar</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {content.bookingsCount} {content.bookingsCount === 1 ? 'reserva' : 'reservas'}
                        </p>
                      </div>
                      {content.averageRating !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{content.averageRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({content.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Link 
                        href={content.type === 'item' ? `/items/${content.id}` : `/services/${content.id}`} 
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Ver
                        </Button>
                      </Link>
                      <Link 
                        href={content.type === 'item' ? `/items/${content.id}/edit` : `/services/${content.id}/edit`} 
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAvailability(content.id, content.type, content.status)}
                        className={content.status === 'PAUSADO' ? 'text-amber-600 hover:text-amber-700' : 'text-gray-600'}
                        title={content.status === 'PAUSADO' ? 'Reactivar' : 'Pausar'}
                      >
                        {content.status === 'PAUSADO' ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(content.id, content.type, content.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal(null)}
          onConfirm={executeDelete}
          type={deleteModal.type}
          itemType={deleteModal.itemType}
          itemTitle={deleteModal.itemTitle}
        />
      )}
    </div>
  );
}
