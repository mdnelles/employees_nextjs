'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/employees', label: 'Employees', icon: '👥' },
  { href: '/departments', label: 'Departments', icon: '🏢' },
  { href: '/managers', label: 'Managers', icon: '👔' },
  { href: '/salaries', label: 'Salaries', icon: '💰' },
  { href: '/titles', label: 'Titles', icon: '🏷️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, sessionEdits, resetEdits } = useAuth()

  const editCount =
    Object.keys(sessionEdits.editedEmployees).length +
    Object.keys(sessionEdits.editedDepartments).length +
    Object.keys(sessionEdits.editedManagers).length +
    sessionEdits.deletedEmployees.length +
    sessionEdits.deletedDepartments.length +
    sessionEdits.deletedManagers.length

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 text-white flex flex-col z-50">
      <div className="p-5 border-b border-surface-700">
        <h1 className="text-lg font-bold tracking-tight">Employee DB</h1>
        <p className="text-xs text-surface-400 mt-1">Demo Mode</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-r-2 border-primary-400'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {editCount > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">{editCount} session edit{editCount !== 1 ? 's' : ''}</span>
            <button onClick={resetEdits} className="text-xs text-amber-400 hover:text-amber-300 underline">Reset</button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-surface-700">
        <div className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</div>
        <div className="text-xs text-surface-400 truncate">{user?.email}</div>
        <button onClick={logout} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
          Sign Out
        </button>
      </div>
    </aside>
  )
}
