import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../index"

interface JwtPayload {
  userId: string
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
      }
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    req.user = { id: user.id }
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

