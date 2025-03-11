import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { PrismaClient } from "@prisma/client"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import itemRoutes from "./routes/item.routes"
import bookingRoutes from "./routes/booking.routes"
import reviewRoutes from "./routes/review.routes"
import paymentRoutes from "./routes/payment.routes"
import { errorHandler } from "./middleware/errorHandler"
import { authenticateToken } from "./middleware/auth"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
export const prisma = new PrismaClient()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/items", itemRoutes) // Some endpoints will be public
app.use("/api/bookings", authenticateToken, bookingRoutes)
app.use("/api/reviews", authenticateToken, reviewRoutes)
app.use("/api/payments", authenticateToken, paymentRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  console.log("Database connection closed")
  process.exit(0)
})

