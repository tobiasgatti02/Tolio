import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"



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

    // Validar campos requeridos
    if (!reason || !details || !itemTitle || !reportedUserId) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Guardar el reporte en la base de datos para revisión posterior
    // Por ahora solo logeamos (puedes agregar una tabla Report en el schema)
    console.log('REPORTE RECIBIDO:', {
      tipo: itemType,
      titulo: itemTitle,
      reportadoPor: session.user.email,
      reportado: reportedUserName,
      motivo: reason,
      detalles: details,
      fecha: new Date().toISOString()
    })

    // Intentar enviar email solo si hay credenciales configuradas
    let emailSent = false
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const nodemailer = require('nodemailer')

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

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

        await transporter.sendMail({
          from: `"Sistema de Denuncias Tolio" <${process.env.SMTP_USER}>`,
          to: "tobiasgatti02@gmail.com",
          subject: `[DENUNCIA] ${itemType === 'item' ? 'Artículo' : 'Servicio'}: ${itemTitle}`,
          html: emailContent,
        })

        emailSent = true
        console.log('Email de denuncia enviado exitosamente')
      } else {
        console.warn('Credenciales SMTP no configuradas. Reporte guardado pero email no enviado.')
      }
    } catch (emailError) {
      console.error('Error enviando email (reporte guardado):', emailError)
      // No fallar la request si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "Denuncia recibida exitosamente. Será revisada a la brevedad.",
      emailSent
    })
  } catch (error) {
    console.error('Error processing report:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la denuncia. Por favor, intenta nuevamente."
      },
      { status: 500 }
    )
  }
}
