import OpenAI from 'openai'
import { auth } from '@/auth'
import { rateLimiter } from '@/lib/ratelimit'
import { prisma } from '@/lib/prisma'

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return new Response('Not logged in', { status: 401 })
  }

  const { success, limit } = await rateLimiter.limit(session.user.email)

  if (!success) {
    return new Response(
      `Rate limit exceeded. You can send ${limit} messages per day. Try again tomorrow.`,
      { status: 429 }
    )
  }

  const { prompt } = await req.json()

  if (!prompt) {
    return new Response('Prompt is required', { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const stream = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  const encoder = new TextEncoder()
  let fullResponse = ''

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) {
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }

      await prisma.chatHistory.create({
        data: {
          userId: user.id,
          prompt,
          response: fullResponse,
        },
      })

      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}