"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Star, 
  MessageCircle, 
  DollarSign,
  Package,
  User,
  Trash2,
  Check
} from "lucide-react";
import Link from "next/link";
import { DashboardNotification, NotificationType } from "@/lib/types";

interface NotificationsClientProps {
  userId: string;
}

export default function NotificationsClient({ userId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = activeTab === "unread";
      const response = await fetch(`/api/notifications?unreadOnly=${unreadOnly}`);
      if (!response.ok) {
        throw new Error("Error al cargar las notificaciones");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error("Error al marcar como leída");
      }

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al marcar todas como leídas");
      }

      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING_REQUEST":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "BOOKING_CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "BOOKING_COMPLETED":
        return <Check className="h-5 w-5 text-green-600" />;
      case "REVIEW_REQUEST":
      case "REVIEW_RECEIVED":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "PAYMENT_RECEIVED":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "GENERAL":
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "BOOKING_REQUEST":
        return "bg-blue-100 text-blue-800";
      case "BOOKING_CONFIRMED":
      case "BOOKING_COMPLETED":
        return "bg-green-100 text-green-800";
      case "REVIEW_REQUEST":
      case "REVIEW_RECEIVED":
        return "bg-yellow-100 text-yellow-800";
      case "PAYMENT_RECEIVED":
        return "bg-green-100 text-green-800";
      case "GENERAL":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationTitle = (type: NotificationType) => {
    switch (type) {
      case "BOOKING_REQUEST":
        return "Nueva solicitud de reserva";
      case "BOOKING_CONFIRMED":
        return "Reserva confirmada";
      case "BOOKING_COMPLETED":
        return "Reserva completada";
      case "REVIEW_REQUEST":
        return "Solicitud de calificación";
      case "REVIEW_RECEIVED":
        return "Nueva calificación recibida";
      case "PAYMENT_RECEIVED":
        return "Pago recibido";
      case "GENERAL":
        return "Notificación";
      default:
        return "Notificación";
    }
  };

  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notificaciones</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
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
              <Button onClick={fetchNotifications} variant="outline" className="mt-4">
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
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">
              {unreadCount} notificación{unreadCount === 1 ? '' : 'es'} sin leer
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === "unread" ? "No hay notificaciones sin leer" : "No tienes notificaciones"}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === "unread" 
                      ? "¡Perfecto! Estás al día con todas tus notificaciones."
                      : "Las notificaciones sobre tus reservas y artículos aparecerán aquí."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''} transition-all hover:shadow-md`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {getNotificationTitle(notification.type)}
                              </h3>
                              <Badge className={getNotificationColor(notification.type)} variant="secondary">
                                {notification.type.replace(/_/g, ' ').toLowerCase()}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.relatedBookingId && (
                              <Link href={`/dashboard/bookings/${notification.relatedBookingId}`}>
                                <Button size="sm" variant="outline">
                                  Ver reserva
                                </Button>
                              </Link>
                            )}
                            {notification.relatedItemId && (
                              <Link href={`/items/${notification.relatedItemId}`}>
                                <Button size="sm" variant="outline">
                                  Ver artículo
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
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
