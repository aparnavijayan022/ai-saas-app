import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const subscriptionId = session.subscription as string

    if (userId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'pro',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),        },
      })
    }
  }

  return NextResponse.json({ received: true })
}