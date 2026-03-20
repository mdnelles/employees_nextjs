'use client'

import React from 'react'
import { useThemeLanguage } from './ThemeLanguageProvider'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
}

export default function Pagination({ page = 1, totalPages = 1, onPageChange, total = 0 }: PaginationProps) {
  const { t } = useThemeLanguage()
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-gray-700">
      <span className="text-sm text-surface-500 dark:text-gray-400">{total.toLocaleString()} {t.totalRecords}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {t.previous}
        </button>
        <span className="text-sm text-surface-600 dark:text-gray-300">
          {t.page} {page} {t.of} {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {t.next}
        </button>
      </div>
    </div>
  )
}
