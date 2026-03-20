'use client'

import React, { useState } from 'react'
import { useThemeLanguage } from './ThemeLanguageProvider'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { t } = useThemeLanguage()
  if (dismissed) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">{t.demoMode}</span>
        <span className="text-amber-700 dark:text-amber-300 text-xs">{t.demoBannerText}</span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 text-xs">{t.dismiss}</button>
    </div>
  )
}
