// Test script para verificar las APIs del dashboard
import { DashboardService } from './lib/dashboard-service'

async function testDashboardAPIs() {
  try {
    console.log('🧪 Testing Dashboard APIs...')
    
    // ID de usuario de prueba (reemplazar con un ID real de la base de datos)
    const testUserId = 'test-user-id'
    
    console.log('\n📊 Testing getUserStats...')
    try {
      const stats = await DashboardService.getUserStats(testUserId)
      console.log('✅ Stats:', stats)
    } catch (error) {
      console.log('❌ Error en getUserStats:', error.message)
    }
    
    console.log('\n📦 Testing getUserItems...')
    try {
      const items = await DashboardService.getUserItems(testUserId)
      console.log('✅ Items count:', items.length)
    } catch (error) {
      console.log('❌ Error en getUserItems:', error.message)
    }
    
    console.log('\n📅 Testing getUserBookings...')
    try {
      const bookings = await DashboardService.getUserBookings(testUserId)
      console.log('✅ Bookings count:', bookings.length)
    } catch (error) {
      console.log('❌ Error en getUserBookings:', error.message)
    }
    
    console.log('\n⭐ Testing getUserReviews...')
    try {
      const reviews = await DashboardService.getUserReviews(testUserId)
      console.log('✅ Reviews count:', reviews.length)
    } catch (error) {
      console.log('❌ Error en getUserReviews:', error.message)
    }
    
    console.log('\n🔔 Testing getUserNotifications...')
    try {
      const notifications = await DashboardService.getUserNotifications(testUserId)
      console.log('✅ Notifications count:', notifications.length)
    } catch (error) {
      console.log('❌ Error en getUserNotifications:', error.message)
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testDashboardAPIs()
}

export { testDashboardAPIs }
