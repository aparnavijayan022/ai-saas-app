import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function HistoryPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  const history = await prisma.chatHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Chat History</h1>

      {history.length === 0 && (
        <p className="text-gray-500">No conversations yet.</p>
      )}

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
          >
            <p className="font-semibold text-gray-900">You: {item.prompt}</p>
            <div className="mt-2 prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.response}
              </ReactMarkdown>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}