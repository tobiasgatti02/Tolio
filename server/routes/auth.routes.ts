import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../index"
import { AppError } from "../middleware/errorHandler"
import { sendVerificationEmail } from "../utils/email"
import crypto from "crypto"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError("Email already in use", 400)
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
      },
    })

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken)

    // Create token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new AppError("Invalid credentials", 401)
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401)
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Verify email
router.get("/verify/:token", async (req, res, next) => {
  try {
    const { token } = req.params

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      throw new AppError("Invalid verification token", 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    })

    res.json({ message: "Email verified successfully" })
  } catch (error) {
    next(error)
  }
})

// Request password reset
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({ message: "If your email is registered, you will receive a reset link" })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "If your email is registered, you will receive a reset link" })
  } catch (error) {
    next(error)
  }
})

// Reset password
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400)
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    res.json({ message: "Password reset successful" })
  } catch (error) {
    next(error)
  }
})

export default router

