'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, XCircle, Eye, User } from 'lucide-react';

export default function TestFaceMatchPage() {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      alert('Error accediendo a la cámara. Verifica los permisos.');
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCapturing(false);
    }
  };

  // Capturar imagen
  const captureImage = (type: 'selfie' | 'reference') => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1280;
    canvas.height = 720;
    
    ctx?.drawImage(videoRef.current, 0, 0, 1280, 720);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${type}.jpg`, { type: 'image/jpeg' });
        
        if (type === 'selfie') {
          setSelfie(file);
        } else {
          setReferencePhoto(file);
        }
      }
    }, 'image/jpeg', 0.8);
  };

  // Manejar archivos
  const handleFileChange = (type: 'selfie' | 'reference', file: File) => {
    if (type === 'selfie') {
      setSelfie(file);
    } else {
      setReferencePhoto(file);
    }
  };

  // Verificar identidad
  const verifyIdentity = async () => {
    if (!selfie || !referencePhoto) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('selfie', selfie);
      formData.append('referencePhoto', referencePhoto);
      
      const response = await fetch('/api/verification/face-match-simple', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error en verificación:', error);
      setResult({ error: 'Error en la verificación' });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar cámara al desmontar
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎭 Test Face Match + Liveness</h1>
        <p className="text-gray-600">
          Prueba el sistema de face matching con liveness sin necesidad de DNI.
          Perfecto para testing cuando no tienes el DNI a mano.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cámara */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Cámara
            </CardTitle>
            <CardDescription>
              Captura tu selfie y foto de referencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full h-64 object-cover rounded-lg border"
                style={{ display: isCapturing ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!isCapturing && (
                <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <p className="text-gray-500">Cámara no iniciada</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={startCamera} disabled={isCapturing}>
                Iniciar Cámara
              </Button>
              <Button onClick={stopCamera} variant="outline" disabled={!isCapturing}>
                Detener Cámara
              </Button>
            </div>
            
            {isCapturing && (
              <div className="flex gap-2">
                <Button onClick={() => captureImage('selfie')} size="sm">
                  Capturar Selfie
                </Button>
                <Button onClick={() => captureImage('reference')} size="sm" variant="outline">
                  Capturar Referencia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subir archivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Archivos
            </CardTitle>
            <CardDescription>
              O sube archivos desde tu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selfie:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange('selfie', e.target.files[0])}
                className="w-full p-2 border rounded"
              />
              {selfie && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(selfie)} 
                    alt="Selfie" 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Foto de Referencia:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange('reference', e.target.files[0])}
                className="w-full p-2 border rounded"
              />
              {referencePhoto && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(referencePhoto)} 
                    alt="Referencia" 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verificar */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <Button 
            onClick={verifyIdentity}
            disabled={!selfie || !referencePhoto || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Verificando...' : 'Verificar Identidad'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="text-red-600">
                <p>Error: {result.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={result.status === 'APPROVED' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Score: {(result.finalResult?.combinedScore * 100)?.toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Face Match
                    </h4>
                    <div className="flex items-center gap-2">
                      {result.faceMatch?.isMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {result.faceMatch?.isMatch ? 'Coincide' : 'No coincide'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(result.faceMatch?.confidence * 100)?.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Liveness
                    </h4>
                    <div className="flex items-center gap-2">
                      {result.liveness?.isLive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {result.liveness?.isLive ? 'Persona real' : 'No detectado'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(result.liveness?.confidence * 100)?.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                {result.liveness?.checks && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Verificaciones de Liveness:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {result.liveness.checks.eyeBlink ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Parpadeo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.liveness.checks.headMovement ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Movimiento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.liveness.checks.imageQuality ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Calidad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.liveness.checks.antiSpoofing ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Anti-spoofing</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    {result.message || 'Verificación completada'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
