import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    customer_email: user.email,
    success_url: `https://ai-saas-app-gold.vercel.app/dashboard?success=true`,
    cancel_url: `https://ai-saas-app-gold.vercel.app/dashboard?canceled=true`,
    metadata: {
      userId: user.id,
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}