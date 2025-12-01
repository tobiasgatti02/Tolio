"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Package, Edit3, Trash2, Star, MapPin } from "lucide-react";
import Link from "next/link";
import { DashboardItem, ItemStatus } from "@/lib/types";

interface MyItemsClientProps {
  userId: string;
}

export default function MyItemsClient({ userId }: MyItemsClientProps) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/items");
      if (!response.ok) {
        throw new Error("Error al cargar los artículos");
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Error al cargar los artículos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el artículo");
      }

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error al eliminar el artículo");
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case "DISPONIBLE":
        return "bg-green-100 text-green-800";
      case "PRESTADO":
        return "bg-yellow-100 text-yellow-800";
      case "MANTENIMIENTO":
        return "bg-red-100 text-red-800";
      case "PAUSADO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ItemStatus) => {
    switch (status) {
      case "DISPONIBLE":
        return "Disponible";
      case "PRESTADO":
        return "Prestado";
      case "MANTENIMIENTO":
        return "Mantenimiento";
      case "PAUSADO":
        return "Pausado";
      default:
        return status;
    }
  };

  const filterItems = (status: string) => {
    if (status === "all") return items;
    return items.filter(item => item.status === status);
  };

  const filteredItems = filterItems(activeTab);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mis Publicaciones</h1>
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
              <Button onClick={fetchItems} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Publicaciones</h1>
        <Link href="/items/nuevo">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Agregar Artículo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">
                  {items.filter(item => item.status === "DISPONIBLE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prestados</p>
                <p className="text-2xl font-bold">
                  {items.filter(item => item.status === "PRESTADO").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold">
                  {items.length > 0 
                    ? (items.reduce((acc, item) => acc + (item.averageRating || 0), 0) / items.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="DISPONIBLE">Disponibles</TabsTrigger>
          <TabsTrigger value="PRESTADO">Prestados</TabsTrigger>
          <TabsTrigger value="MANTENIMIENTO">Mantenimiento</TabsTrigger>
          <TabsTrigger value="PAUSADO">Pausados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === "all" ? "No tienes artículos" : `No hay artículos ${getStatusText(activeTab as ItemStatus).toLowerCase()}`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === "all" 
                      ? "Comienza agregando tu primer artículo para prestarlo"
                      : `No tienes artículos en estado ${getStatusText(activeTab as ItemStatus).toLowerCase()}`
                    }
                  </p>
                  {activeTab === "all" && (
                    <Link href="/items/nuevo">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Agregar Primer Artículo
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.nombre}</CardTitle>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.categoria}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.imagenes && item.imagenes.length > 0 && (
                      <div className="mb-4">
                        <img
                          src={item.imagenes[0]}
                          alt={item.nombre}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.descripcion}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          ${item.precioPorDia}/día
                        </p>
                        {item.averageRating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{item.averageRating.toFixed(1)}</span>
                            {item.reviewCount && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({item.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/items/${item.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/items/${item.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
}
