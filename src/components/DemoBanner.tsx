'use client'

import React, { useState } from 'react'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 text-sm font-medium">Demo Mode</span>
        <span className="text-amber-700 text-xs">Edits and deletes are session-only and won&apos;t persist to the database.</span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 text-xs">Dismiss</button>
    </div>
  )
}
