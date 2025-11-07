import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      itemId,
      serviceId,
      itemTitle,
      itemType,
      reportedUserId,
      reportedUserName,
      reason,
      details
    } = body

    // Configurar el transportador de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Preparar el contenido del email
    const emailContent = `
      <h2>Nueva Denuncia en Tolio</h2>
      
      <h3>Información del Reporte</h3>
      <ul>
        <li><strong>Tipo:</strong> ${itemType === 'item' ? 'Artículo' : 'Servicio'}</li>
        <li><strong>Título:</strong> ${itemTitle}</li>
        <li><strong>ID:</strong> ${itemId || serviceId}</li>
      </ul>

      <h3>Usuario Reportado</h3>
      <ul>
        <li><strong>Nombre:</strong> ${reportedUserName}</li>
        <li><strong>ID:</strong> ${reportedUserId}</li>
      </ul>

      <h3>Usuario que Reporta</h3>
      <ul>
        <li><strong>Nombre:</strong> ${session.user.name || 'No disponible'}</li>
        <li><strong>Email:</strong> ${session.user.email}</li>
        <li><strong>ID:</strong> ${session.user.id}</li>
      </ul>

      <h3>Detalles de la Denuncia</h3>
      <p><strong>Motivo:</strong> ${reason}</p>
      <p><strong>Descripción:</strong></p>
      <p>${details}</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        Este email fue enviado automáticamente desde el sistema de denuncias de Tolio.
        Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
      </p>
    `

    // Enviar el email
    await transporter.sendMail({
      from: `"Sistema de Denuncias Tolio" <${process.env.SMTP_USER}>`,
      to: "tobiasgatti02@gmail.com",
      subject: `[DENUNCIA] ${itemType === 'item' ? 'Artículo' : 'Servicio'}: ${itemTitle}`,
      html: emailContent,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Denuncia enviada exitosamente" 
    })
  } catch (error) {
    console.error('Error processing report:', error)
    return NextResponse.json(
      { message: "Error al procesar la denuncia" }, 
      { status: 500 }
    )
  }
}
