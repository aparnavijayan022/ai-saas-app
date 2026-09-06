'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/chat', label: 'Chat' },
    { href: '/history', label: 'History' },
  ]

  if (!session) return null

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">AI SaaS</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}