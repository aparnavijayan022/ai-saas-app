import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Your AI Assistant, Ready When You Are
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Ask questions, get instant answers, and keep a history of every
          conversation — powered by AI, built for you.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}