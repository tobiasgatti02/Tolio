/**
 * Utilidades para cálculos geográficos
 * Usadas para búsqueda por radio y cálculo de distancias
 */

/**
 * Convierte grados a radianes
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radio de la Tierra en kilómetros

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
}

/**
 * Valida si las coordenadas son válidas
 */
export function isValidCoordinates(lat: number | null, lon: number | null): boolean {
    if (lat === null || lon === null) return false;
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Filtra items por radio desde una ubicación
 */
export function filterByRadius<T extends { latitude: number | null; longitude: number | null }>(
    items: T[],
    userLat: number,
    userLon: number,
    radiusKm: number
): (T & { distance: number })[] {
    return items
        .filter(item => isValidCoordinates(item.latitude, item.longitude))
        .map(item => ({
            ...item,
            distance: calculateDistance(userLat, userLon, item.latitude!, item.longitude!)
        }))
        .filter(item => item.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Formatea la distancia para mostrar al usuario
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}
