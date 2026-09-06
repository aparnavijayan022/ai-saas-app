# AI SaaS App

A full-stack AI-powered SaaS application with authentication, subscription billing, real-time AI chat, rate limiting, and persistent conversation history.

**Live demo:** [https://ai-saas-app-gold.vercel.app](https://ai-saas-app-gold.vercel.app)

## Overview

This project lets users sign up, chat with an AI assistant (streamed responses in real time), upgrade to a paid Pro plan via Stripe, and view their full conversation history. It's built end-to-end as a production-style SaaS product — covering auth, payments, AI integration, and abuse protection.

## Features

- **Authentication** — Email/password signup and login with hashed passwords (bcrypt) and session-based auth (NextAuth.js)
- **AI Chat** — Real-time, streamed responses from an LLM (Llama 3, via Groq's OpenAI-compatible API), rendered with full Markdown support (headings, tables, bold text)
- **Subscriptions** — Stripe Checkout integration for a $9/month Pro plan, with webhook-driven subscription status updates
- **Rate Limiting** — Redis-backed sliding-window rate limiting (Upstash) to prevent API abuse, enforced per logged-in user
- **Conversation History** — Every chat exchange is saved to the database and viewable per-user on a dedicated history page
- **Protected Routes** — Dashboard, chat, and history pages require authentication and redirect unauthenticated users to login

## Tech Stack

| Layer          | Technology                                                          |
| -------------- | ------------------------------------------------------------------- |
| Frontend       | Next.js 16 (App Router), React, TypeScript, Tailwind CSS            |
| Backend        | Next.js API Routes (Server Actions style)                           |
| Database       | PostgreSQL (Neon), Prisma ORM                                       |
| Authentication | NextAuth.js (Credentials provider), bcrypt                          |
| AI             | Groq API (Llama 3 / GPT-OSS models), OpenAI SDK (compatible client) |
| Payments       | Stripe (Checkout Sessions, Webhooks)                                |
| Rate Limiting  | Upstash Redis, @upstash/ratelimit                                   |
| Deployment     | Vercel                                                              |

## Architecture

```
app/
├── page.tsx                  # Landing page
├── login/, signup/           # Auth pages
├── dashboard/                # Protected dashboard + Stripe upgrade button
├── chat/                     # AI chat interface (streaming)
├── history/                  # Per-user chat history
├── components/Navbar.tsx     # Global navigation
├── providers.tsx             # NextAuth SessionProvider wrapper
└── api/
    ├── signup/                # User registration
    ├── auth/[...nextauth]/    # NextAuth handler
    ├── chat/                  # Auth + rate-limit check → streamed AI response → save to DB
    ├── checkout/              # Creates Stripe Checkout session
    └── webhooks/stripe/       # Verifies Stripe signature, updates subscription status

lib/
├── prisma.ts       # Shared Prisma client
├── stripe.ts       # Shared Stripe client
└── ratelimit.ts    # Redis-backed rate limiter config

prisma/
└── schema.prisma   # User + ChatHistory models
```

### Request flow: sending a chat message

1. User submits a prompt from `/chat`
2. `/api/chat` verifies the user is authenticated (NextAuth session)
3. Redis checks the user hasn't exceeded their daily message limit
4. The prompt is streamed to the Groq API; tokens are streamed back to the client in real time via `ReadableStream`
5. Once streaming completes, the full prompt + response pair is saved to `ChatHistory` in Postgres

### Request flow: upgrading to Pro

1. User clicks "Upgrade to Pro" on `/dashboard`
2. `/api/checkout` creates a Stripe Checkout Session tagged with the user's internal ID (via `metadata`)
3. User completes payment on Stripe's hosted checkout page
4. Stripe sends a `checkout.session.completed` webhook to `/api/webhooks/stripe`
5. The webhook handler verifies the request signature, then updates the user's `plan`, `stripeCustomerId`, and `stripeSubscriptionId` in the database

## Database Schema

**User**

- `id`, `email`, `password` (hashed), `name`, `createdAt`
- `plan` (`free` | `pro`), `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`

**ChatHistory**

- `id`, `userId`, `prompt`, `response`, `createdAt`

## Running Locally

```bash
git clone https://github.com/aparnavijayan022/ai-saas-app.git
cd ai-saas-app
npm install
```

Create a `.env` file with:

```
DATABASE_URL=
AUTH_SECRET=
GROQ_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Visit `http://localhost:3000`.

## Possible Future Improvements

- Higher rate limits for Pro-tier users (currently a flat limit for all users)
- Ability to cancel/manage subscription from within the dashboard
- Delete/search individual history entries
- Multi-model selection (switch between different LLMs)
