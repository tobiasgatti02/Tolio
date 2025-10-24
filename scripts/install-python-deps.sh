#!/bin/bash

# Script de instalación para dependencias Python del sistema de face matching
echo "🐍 Instalando dependencias Python para face matching..."

# Verificar que Python 3 esté instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

echo "✅ Python 3 encontrado: $(python3 --version)"

# Verificar que pip esté instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está instalado. Por favor instala pip."
    exit 1
fi

echo "✅ pip3 encontrado: $(pip3 --version)"

# Crear entorno virtual (opcional pero recomendado)
echo "📦 Creando entorno virtual..."
python3 -m venv venv-face-match

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv-face-match/bin/activate

# Actualizar pip
echo "⬆️ Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -r requirements.txt

echo "✅ Instalación completada!"
echo ""
echo "Para usar el sistema:"
echo "1. Activa el entorno virtual: source venv-face-match/bin/activate"
echo "2. Ejecuta el script: python3 face_match_dni.py dni.jpg selfie.jpg [dni_back.jpg]"
echo ""
echo "Para desactivar el entorno virtual: deactivate"
