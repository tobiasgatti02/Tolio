#!/usr/bin/env python3
"""
Sistema de Face Matching gratuito para DNI argentino
Usa face_recognition (basado en dlib) para comparación facial robusta
"""

import face_recognition
import cv2
import numpy as np
from PIL import Image
import json
import sys
import os
from pyzbar import pyzbar
import base64
from io import BytesIO

class DNIProcessor:
    def __init__(self):
        self.face_encoding = None
        self.face_locations = None
        
    def decode_pdf417(self, image_path):
        """
        Decodifica el código PDF417 del dorso del DNI argentino
        """
        try:
            # Cargar imagen
            image = cv2.imread(image_path)
            if image is None:
                return None
                
            # Decodificar códigos de barras
            codes = pyzbar.decode(image)
            
            for code in codes:
                if code.type == 'PDF417':
                    # El PDF417 del DNI argentino contiene datos estructurados
                    data = code.data.decode('utf-8')
                    return self.parse_dni_data(data)
                    
            return None
        except Exception as e:
            print(f"Error decodificando PDF417: {e}")
            return None
    
    def parse_dni_data(self, raw_data):
        """
        Parsea los datos del PDF417 del DNI argentino
        """
        try:
            # El formato del PDF417 argentino es específico
            # Buscamos patrones comunes en los datos
            lines = raw_data.split('\n')
            
            data = {
                'documentNumber': '',
                'firstName': '',
                'lastName': '',
                'birthDate': '',
                'gender': '',
                'expirationDate': '',
                'rawData': raw_data
            }
            
            # Buscar número de documento (patrón: números al inicio)
            for line in lines:
                if line.strip().isdigit() and len(line.strip()) >= 7:
                    data['documentNumber'] = line.strip()
                    break
            
            # Buscar nombres (líneas que no son números ni fechas)
            name_lines = []
            for line in lines:
                line = line.strip()
                if (line and 
                    not line.isdigit() and 
                    not self.is_date_format(line) and
                    len(line) > 2):
                    name_lines.append(line)
            
            if len(name_lines) >= 2:
                data['firstName'] = name_lines[0]
                data['lastName'] = name_lines[1]
            
            # Buscar fechas (patrón DD/MM/YYYY o similar)
            for line in lines:
                if self.is_date_format(line):
                    if not data['birthDate']:
                        data['birthDate'] = line
                    elif not data['expirationDate']:
                        data['expirationDate'] = line
            
            return data
        except Exception as e:
            print(f"Error parseando datos DNI: {e}")
            return None
    
    def is_date_format(self, text):
        """Verifica si el texto tiene formato de fecha"""
        import re
        date_patterns = [
            r'\d{2}/\d{2}/\d{4}',
            r'\d{2}-\d{2}-\d{4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        for pattern in date_patterns:
            if re.match(pattern, text):
                return True
        return False
    
    def detect_and_crop_face(self, image_path, face_index=0):
        """
        Detecta y recorta el rostro más prominente de una imagen
        """
        try:
            # Cargar imagen
            image = face_recognition.load_image_file(image_path)
            
            # Detectar ubicaciones de rostros
            face_locations = face_recognition.face_locations(
                image, 
                model='hog',  # 'hog' para CPU, 'cnn' para GPU
                number_of_times_to_upsample=1
            )
            
            if not face_locations:
                print("No se detectó ningún rostro")
                return None, None
            
            # Seleccionar el rostro más grande
            face_areas = []
            for (top, right, bottom, left) in face_locations:
                area = (bottom - top) * (right - left)
                face_areas.append(area)
            
            # Obtener el índice del rostro más grande
            largest_face_idx = np.argmax(face_areas)
            face_location = face_locations[largest_face_idx]
            
            # Recortar el rostro
            top, right, bottom, left = face_location
            face_image = image[top:bottom, left:right]
            
            # Convertir a PIL Image
            face_pil = Image.fromarray(face_image)
            
            return face_pil, face_location
            
        except Exception as e:
            print(f"Error detectando rostro: {e}")
            return None, None
    
    def get_face_encoding(self, image_path):
        """
        Obtiene el encoding facial de una imagen
        """
        try:
            # Cargar imagen
            image = face_recognition.load_image_file(image_path)
            
            # Detectar rostros y obtener encodings
            face_encodings = face_recognition.face_encodings(
                image,
                model='small',  # 'small' es más rápido, 'large' más preciso
                num_jitters=1   # Más jitters = más preciso pero más lento
            )
            
            if not face_encodings:
                print("No se pudo extraer encoding facial")
                return None
            
            # Retornar el primer encoding (rostro más prominente)
            return face_encodings[0]
            
        except Exception as e:
            print(f"Error obteniendo encoding: {e}")
            return None
    
    def compare_faces(self, dni_image_path, selfie_image_path):
        """
        Compara dos rostros y retorna el resultado
        """
        try:
            print("🔍 Iniciando comparación facial...")
            
            # Obtener encodings
            dni_encoding = self.get_face_encoding(dni_image_path)
            selfie_encoding = self.get_face_encoding(selfie_image_path)
            
            if dni_encoding is None or selfie_encoding is None:
                return {
                    'success': False,
                    'error': 'No se pudo extraer encoding de una o ambas imágenes',
                    'distance': float('inf'),
                    'confidence': 0.0,
                    'isMatch': False
                }
            
            # Calcular distancia euclidiana
            distance = face_recognition.face_distance([dni_encoding], selfie_encoding)[0]
            
            # Convertir distancia a confianza (0-1)
            # Umbral típico: < 0.4 = muy similar, 0.4-0.6 = similar, > 0.6 = diferente
            confidence = max(0, min(1, 1 - (distance / 0.6)))
            
            # Determinar si es match (umbral ajustable)
            is_match = distance < 0.5  # Umbral conservador
            
            print(f"📊 Resultado: distancia={distance:.4f}, confianza={confidence:.2f}, match={is_match}")
            
            return {
                'success': True,
                'distance': float(distance),
                'confidence': float(confidence),
                'isMatch': is_match,
                'threshold': 0.5
            }
            
        except Exception as e:
            print(f"Error en comparación: {e}")
            return {
                'success': False,
                'error': str(e),
                'distance': float('inf'),
                'confidence': 0.0,
                'isMatch': False
            }
    
    def process_dni_verification(self, dni_front_path, dni_back_path, selfie_path):
        """
        Proceso completo de verificación de DNI
        """
        result = {
            'success': False,
            'faceMatch': None,
            'pdf417Data': None,
            'errors': []
        }
        
        try:
            print("🆔 Iniciando verificación completa de DNI...")
            
            # 1. Decodificar PDF417 del dorso
            if dni_back_path and os.path.exists(dni_back_path):
                print("📄 Decodificando PDF417...")
                pdf417_data = self.decode_pdf417(dni_back_path)
                result['pdf417Data'] = pdf417_data
                if pdf417_data:
                    print(f"✅ PDF417 decodificado: {pdf417_data.get('documentNumber', 'N/A')}")
                else:
                    result['errors'].append("No se pudo decodificar PDF417")
            
            # 2. Comparación facial
            if dni_front_path and selfie_path:
                print("🎭 Realizando comparación facial...")
                face_match = self.compare_faces(dni_front_path, selfie_path)
                result['faceMatch'] = face_match
                
                if face_match['success']:
                    print(f"✅ Comparación facial completada: {face_match['isMatch']}")
                else:
                    result['errors'].append(f"Error en comparación facial: {face_match.get('error', 'Unknown')}")
            
            result['success'] = len(result['errors']) == 0
            
            return result
            
        except Exception as e:
            print(f"Error en verificación: {e}")
            result['errors'].append(str(e))
            return result

def main():
    """
    Función principal para testing
    """
    if len(sys.argv) < 3:
        print("Uso: python face_match_dni.py <dni_front.jpg> <selfie.jpg> [dni_back.jpg]")
        sys.exit(1)
    
    dni_front = sys.argv[1]
    selfie = sys.argv[2]
    dni_back = sys.argv[3] if len(sys.argv) > 3 else None
    
    processor = DNIProcessor()
    result = processor.process_dni_verification(dni_front, dni_back, selfie)
    
    print("\n" + "="*50)
    print("RESULTADO DE VERIFICACIÓN")
    print("="*50)
    print(f"Éxito: {result['success']}")
    
    if result['faceMatch']:
        fm = result['faceMatch']
        print(f"Face Match: {fm['isMatch']}")
        print(f"Distancia: {fm['distance']:.4f}")
        print(f"Confianza: {fm['confidence']:.2f}")
    
    if result['pdf417Data']:
        pdf = result['pdf417Data']
        print(f"DNI: {pdf.get('documentNumber', 'N/A')}")
        print(f"Nombre: {pdf.get('firstName', 'N/A')} {pdf.get('lastName', 'N/A')}")
    
    if result['errors']:
        print("Errores:")
        for error in result['errors']:
            print(f"  - {error}")

if __name__ == "__main__":
    main()
