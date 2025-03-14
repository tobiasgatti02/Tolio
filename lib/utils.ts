import { PrismaClient } from '@prisma/client'
import path from 'path'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma




export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}