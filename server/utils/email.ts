import nodemailer from "nodemailer"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If you didn't sign up for an account, you can safely ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw error
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${email}`)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (
  email: string,
  bookingDetails: {
    itemTitle: string
    startDate: Date
    endDate: Date
    totalPrice: number
  },
) => {
  const { itemTitle, startDate, endDate, totalPrice } = bookingDetails

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Booking Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmation</h2>
        <p>Your booking for "${itemTitle}" has been confirmed!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Item:</strong> ${itemTitle}</p>
          <p><strong>Start Date:</strong> ${startDate.toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${endDate.toLocaleDateString()}</p>
          <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
        </div>
        <p>Thank you for using our platform!</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Booking confirmation email sent to ${email}`)
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    throw error
  }
}

