'use client'

import { useState } from 'react'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)

    const res = await fetch('/api/checkout', {
      method: 'POST',
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
    >
      {loading ? 'Redirecting...' : 'Upgrade to Pro - $9/month'}
    </button>
  )
}