"use client"

import { useState } from "react"
import { Check, AlertTriangle, FileText, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsAndConditionsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  required?: boolean
  title?: string
}

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
  onAccept,
  required = true,
  title = "Términos y Condiciones"
}: TermsAndConditionsModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [hasReadLiability, setHasReadLiability] = useState(false)

  const handleAccept = () => {
    if (required && (!hasAccepted || !hasReadTerms || !hasReadLiability)) {
      return
    }
    onAccept()
    onClose()
  }

  const allRequirementsmet = hasAccepted && hasReadTerms && hasReadLiability

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <FileText className="w-6 h-6 mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              
              {/* Aviso importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">
                      AVISO LEGAL IMPORTANTE
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Al utilizar la plataforma Tolio, usted acepta estos términos y condiciones. 
                      Es importante que lea y comprenda completamente este documento antes de proceder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Términos Generales */}
              <section>
                <div className="flex items-center mb-3">
                  <Checkbox 
                    id="terms-read"
                    checked={hasReadTerms}
                    onCheckedChange={(checked) => setHasReadTerms(checked === true)}
                    className="mr-3"
                  />
                  <h3 className="font-semibold text-lg">1. Términos Generales de Uso</h3>
                </div>
                
                <div className="pl-8 space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>1.1.</strong> Tolio es una plataforma digital que facilita el alquiler de objetos entre particulares. 
                    Actuamos únicamente como intermediarios entre propietarios e inquilinos.
                  </p>
                  
                  <p>
                    <strong>1.2.</strong> Al registrarse en nuestra plataforma, usted declara ser mayor de edad y tener capacidad 
                    legal para contratar según las leyes de la República Argentina.
                  </p>
                  
                  <p>
                    <strong>1.3.</strong> El usuario se compromete a proporcionar información veraz y actualizada, 
                    y a mantener la confidencialidad de sus credenciales de acceso.
                  </p>
                  
                  <p>
                    <strong>1.4.</strong> Nos reservamos el derecho de suspender o cancelar cuentas que incumplan 
                    estos términos o realicen actividades fraudulentas.
                  </p>
                </div>
              </section>

              {/* Limitación de Responsabilidad */}
              <section>
                <div className="flex items-center mb-3">
                  <Checkbox 
                    id="liability-read"
                    checked={hasReadLiability}
                    onCheckedChange={(checked) => setHasReadLiability(checked === true)}
                    className="mr-3"
                  />
                  <h3 className="font-semibold text-lg text-red-700">
                    2. Limitación de Responsabilidad (CRÍTICO)
                  </h3>
                </div>
                
                <div className="pl-8 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="space-y-3 text-sm text-red-800">
                    <p>
                      <strong>2.1. EXENCIÓN DE RESPONSABILIDAD:</strong> De conformidad con los artículos 1749, 1750 y 1757 
                      del Código Civil y Comercial de la Nación Argentina, TOLIO NO SE HACE RESPONSABLE por:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Pérdida, robo, daño o destrucción de objetos alquilados</li>
                      <li>Daños causados por el mal uso de los objetos</li>
                      <li>Accidentes o lesiones derivadas del uso de los objetos</li>
                      <li>Incumplimiento de acuerdos entre propietarios e inquilinos</li>
                      <li>Falsedad en la información proporcionada por los usuarios</li>
                    </ul>
                    
                    <p>
                      <strong>2.2. RESPONSABILIDAD DEL USUARIO:</strong> Cada usuario es plenamente responsable de:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Verificar el estado y funcionamiento de los objetos antes del alquiler</li>
                      <li>Utilizar los objetos de manera apropiada y cuidadosa</li>
                      <li>Contratar seguros adicionales si lo considera necesario</li>
                      <li>Resolver disputas directamente con la otra parte</li>
                    </ul>
                    
                    <p>
                      <strong>2.3. CASO FORTUITO Y FUERZA MAYOR:</strong> Conforme al artículo 1730 del CCC, 
                      no nos hacemos responsables por eventos imprevisibes e inevitables como desastres naturales, 
                      actos de terceros, etc.
                    </p>
                  </div>
                </div>
              </section>

              {/* Depósitos de Seguridad */}
              <section>
                <h3 className="font-semibold text-lg mb-3">3. Depósitos de Seguridad</h3>
                <div className="pl-4 space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>3.1.</strong> Los depósitos de seguridad son opcionales y establecidos por cada propietario.
                  </p>
                  
                  <p>
                    <strong>3.2.</strong> Los depósitos se procesan a través de Mercado Pago y se retendrán durante 
                    el período de alquiler más 48 horas adicionales.
                  </p>
                  
                  <p>
                    <strong>3.3.</strong> El depósito será devuelto automáticamente si no hay reclamaciones válidas 
                    en el período establecido.
                  </p>
                  
                  <p>
                    <strong>3.4.</strong> En caso de daños, el propietario debe reportarlo dentro de las 24 horas 
                    posteriores a la devolución del objeto con evidencia fotográfica.
                  </p>
                </div>
              </section>

              {/* Sistema de Confianza */}
              <section>
                <h3 className="font-semibold text-lg mb-3">4. Sistema de Confianza</h3>
                <div className="pl-4 space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>4.1.</strong> Nuestro sistema de "confianza" reemplaza las calificaciones tradicionales 
                    y se basa en reviews honestas de experiencias reales.
                  </p>
                  
                  <p>
                    <strong>4.2.</strong> Las reviews son mutuales y se solicitan a ambas partes al finalizar cada alquiler.
                  </p>
                  
                  <p>
                    <strong>4.3.</strong> Los usuarios con baja confianza pueden ver limitadas sus opciones de alquiler.
                  </p>
                </div>
              </section>

              {/* Ley Aplicable */}
              <section>
                <h3 className="font-semibold text-lg mb-3">5. Ley Aplicable y Jurisdicción</h3>
                <div className="pl-4 space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>5.1.</strong> Estos términos se rigen por las leyes de la República Argentina.
                  </p>
                  
                  <p>
                    <strong>5.2.</strong> Para cualquier controversia, las partes se someten a la jurisdicción 
                    de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.
                  </p>
                </div>
              </section>

              {/* Contacto */}
              <section>
                <h3 className="font-semibold text-lg mb-3">6. Contacto</h3>
                <div className="pl-4 space-y-2 text-sm text-gray-700">
                  <p>Para consultas sobre estos términos: legal@tolio.com.ar</p>
                  <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
                </div>
              </section>

            </div>
          </ScrollArea>
        </div>

        {/* Aceptación */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-start space-x-3 mb-4">
            <Checkbox 
              id="accept-terms"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked === true)}
              required={required}
            />
            <label htmlFor="accept-terms" className="text-sm text-gray-700 cursor-pointer">
              <strong>He leído y acepto los términos y condiciones</strong>, incluyendo la limitación de responsabilidad. 
              Entiendo que Tolio no se hace responsable por pérdida, robo o daño de objetos alquilados.
            </label>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={required}
            >
              {required ? "Debo aceptar para continuar" : "Cancelar"}
            </Button>
            
            <Button
              onClick={handleAccept}
              disabled={required && !allRequirementsmet}
              className={`
                ${allRequirementsmet 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              <Shield className="w-4 h-4 mr-2" />
              {allRequirementsmet ? "Acepto los términos" : "Debe leer y aceptar todo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
