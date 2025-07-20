import React, { ReactElement } from 'react';

export const categoryIcons: { [key: string]: ReactElement } = {
  // Tecnología
  "tecnologia": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 20h8" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 16v4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  // Electrónicos
  "electronicos": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Herramientas
  "herramientas": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Deportes
  "deportes": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 4.85m11.05-3.2c-.74 4.19-3.5 7.63-10.1 9.45" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Música
  "musica": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="5.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="17.5" cy="15.5" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 17V5l12-2v12" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Vehículos
  "vehiculos": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M5 17h-2v-4m-1 -8h15l2 7h2v4h-2m-4 0h-6m-6 -6h15l-1 -7h-13z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Casa y Jardín
  "casa": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M3 21h18" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9v.01" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12v.01" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 15v.01" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Ropa y Accesorios
  "ropa": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M8.5 8.5L6 22h12l-2.5-13.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7 8.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 7.5V6a4 4 0 0 1 8 0v1.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Libros y Educación
  "libros": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 7h8" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 11h6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Salud y Belleza
  "salud": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Juguetes
  "juguetes": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="8" cy="10" r="1" fill="currentColor"/>
      <circle cx="16" cy="10" r="1" fill="currentColor"/>
      <path d="M8 16s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Mascotas
  "mascotas": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="11" cy="4" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="18" cy="8" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="20" cy="16" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  // Icono por defecto
  "default": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

// Función para obtener el icono basado en el nombre de la categoría
export function getCategoryIcon(categoryName: string): ReactElement {
  const normalizedName = categoryName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]/g, ""); // Remover caracteres especiales

  // Mapeo de palabras clave a iconos
  const keywordMap: { [key: string]: string } = {
    tecnologia: "tecnologia",
    electronico: "electronicos",
    electronica: "electronicos",
    computadora: "electronicos",
    laptop: "electronicos",
    telefono: "electronicos",
    movil: "electronicos",
    herramienta: "herramientas",
    construccion: "herramientas",
    bricolaje: "herramientas",
    deporte: "deportes",
    fitness: "deportes",
    ejercicio: "deportes",
    futbol: "deportes",
    musica: "musica",
    instrumento: "musica",
    audio: "musica",
    vehiculo: "vehiculos",
    auto: "vehiculos",
    coche: "vehiculos",
    moto: "vehiculos",
    bicicleta: "vehiculos",
    casa: "casa",
    hogar: "casa",
    jardin: "casa",
    mueble: "casa",
    ropa: "ropa",
    vestimenta: "ropa",
    accesorio: "ropa",
    zapato: "ropa",
    libro: "libros",
    educacion: "libros",
    estudio: "libros",
    lectura: "libros",
    salud: "salud",
    belleza: "salud",
    cuidado: "salud",
    medicina: "salud",
    juguete: "juguetes",
    juego: "juguetes",
    nino: "juguetes",
    mascota: "mascotas",
    animal: "mascotas",
    perro: "mascotas",
    gato: "mascotas",
  };

  // Buscar coincidencias de palabras clave
  for (const [keyword, iconKey] of Object.entries(keywordMap)) {
    if (normalizedName.includes(keyword)) {
      return categoryIcons[iconKey] || categoryIcons.default;
    }
  }

  // Si hay un icono específico para el nombre exacto
  if (categoryIcons[normalizedName]) {
    return categoryIcons[normalizedName];
  }

  // Retornar icono por defecto
  return categoryIcons.default;
}
