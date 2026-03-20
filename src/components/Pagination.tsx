'use client'

import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
}

export default function Pagination({ page = 1, totalPages = 1, onPageChange, total = 0 }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
      <span className="text-sm text-surface-500">{total.toLocaleString()} total records</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Previous
        </button>
        <span className="text-sm text-surface-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Next
        </button>
      </div>
    </div>
  )
}
