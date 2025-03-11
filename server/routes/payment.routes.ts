import express from "express"
import { prisma } from "../index"
import { AppError } from "../middleware/errorHandler"
import Stripe from "stripe"
import { createNotification } from "../utils/notifications"

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Create payment intent
router.post("/create-intent", async (req, res, next) => {
  try {
    const { bookingId } = req.body

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: true,
        payment: true,
      },
    })

    if (!booking) {
      throw new AppError("Booking not found", 404)
    }

    // Check if user is the borrower
    if (booking.borrowerId !== req.user!.id) {
      throw new AppError("Not authorized to pay for this booking", 403)
    }

    // Check if booking is confirmed
    if (booking.status !== "CONFIRMED") {
      throw new AppError("Cannot pay for a booking that is not confirmed", 400)
    }

    // Check if payment already exists
    if (booking.payment && booking.payment.status === "COMPLETED") {
      throw new AppError("Payment already completed for this booking", 400)
    }

    // Calculate amount (in cents)
    const amount = Math.round(booking.totalPrice * 100)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        bookingId: booking.id,
        itemId: booking.itemId,
        userId: req.user!.id,
      },
    })

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: {
        bookingId,
      },
      update: {
        amount: booking.totalPrice,
        paymentMethod: "card",
        stripePaymentId: paymentIntent.id,
        status: "PENDING",
      },
      create: {
        amount: booking.totalPrice,
        paymentMethod: "card",
        stripePaymentId: paymentIntent.id,
        booking: {
          connect: { id: bookingId },
        },
      },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      payment,
    })
  } catch (error) {
    next(error)
  }
})

// Webhook to handle payment events
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Update payment status
    try {
      const bookingId = paymentIntent.metadata.bookingId

      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: paymentIntent.id,
        },
        include: {
          booking: {
            include: {
              item: true,
            },
          },
        },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
          },
        })

        // Create notification for owner
        await createNotification({
          userId: payment.booking.ownerId,
          type: "PAYMENT_RECEIVED",
          content: `Payment received for "${payment.booking.item.title}"`,
        })
      }
    } catch (error) {
      console.error("Error processing payment success:", error)
    }
  }

  res.json({ received: true })
})

// Get payment by booking ID
router.get("/booking/:bookingId", async (req, res, next) => {
  try {
    const { bookingId } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      throw new AppError("Booking not found", 404)
    }

    // Check if user is authorized
    if (booking.borrowerId !== req.user!.id && booking.ownerId !== req.user!.id) {
      throw new AppError("Not authorized to view this payment", 403)
    }

    const payment = await prisma.payment.findUnique({
      where: {
        bookingId,
      },
    })

    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    res.json(payment)
  } catch (error) {
    next(error)
  }
})

export default router

