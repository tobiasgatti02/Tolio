import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategorias: {
          orderBy: {
            nombre: 'asc'
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, imagen, subcategorias } = body

    const category = await prisma.category.create({
      data: {
        nombre,
        descripcion,
        imagen,
        subcategorias: subcategorias ? {
          create: subcategorias.map((sub: any) => ({
            nombre: sub.nombre,
            descripcion: sub.descripcion
          }))
        } : undefined
      },
      include: {
        subcategorias: true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
}

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
