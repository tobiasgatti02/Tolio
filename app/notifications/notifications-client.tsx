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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Notificaciones</h1>
            {unreadCount > 0 ? (
              <p className="text-lg text-gray-600">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-sm font-bold rounded-full mr-2">
                  {unreadCount}
                </span>
                notificación{unreadCount === 1 ? '' : 'es'} sin leer
              </p>
            ) : (
              <p className="text-lg text-gray-600">Estás al día con todas tus notificaciones ✨</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-semibold transition-all"
            >
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-semibold transition-all"
            >
              No leídas ({unreadCount})
            </TabsTrigger>
          </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === "unread" ? "No hay notificaciones sin leer" : "No tienes notificaciones"}
                </h3>
                <p className="text-gray-600">
                  {activeTab === "unread" 
                    ? "¡Perfecto! Estás al día con todas tus notificaciones."
                    : "Las notificaciones sobre tus reservas y artículos aparecerán aquí."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-white rounded-2xl border-2 transition-all hover:shadow-lg ${
                    !notification.read 
                      ? 'border-orange-300 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        !notification.read 
                          ? 'bg-gradient-to-br from-orange-100 to-red-100' 
                          : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`text-base font-bold ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {getNotificationTitle(notification.type)}
                              </h3>
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed mb-3 ${
                              !notification.read ? 'text-gray-800' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1.5" />
                              Marcar como leída
                            </button>
                          )}
                          {notification.relatedBookingId && (
                            <Link href={`/dashboard/bookings/${notification.relatedBookingId}`}>
                              <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                                Ver reserva
                              </button>
                            </Link>
                          )}
                          {notification.relatedItemId && (
                            <Link href={`/items/${notification.relatedItemId}`}>
                              <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                                Ver artículo
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
