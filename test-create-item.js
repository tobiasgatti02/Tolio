// Script para probar la creación de artículos
// Ejecutar en la consola del navegador cuando esté autenticado

const testCreateItem = async () => {
  const formData = new FormData()
  
  // Datos de prueba
  formData.append('title', 'Artículo de prueba')
  formData.append('description', 'Descripción de prueba para verificar la creación')
  formData.append('category', 'Electrónicos')
  formData.append('price', '100')
  formData.append('deposit', '50')
  formData.append('location', 'Buenos Aires')
  formData.append('features', JSON.stringify(['característica 1', 'característica 2']))
  
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', result)
    
    if (!response.ok) {
      console.error('Error:', result)
    } else {
      console.log('¡Artículo creado exitosamente!', result)
    }
  } catch (error) {
    console.error('Error de red:', error)
  }
}

// Llamar la función
// testCreateItem()
