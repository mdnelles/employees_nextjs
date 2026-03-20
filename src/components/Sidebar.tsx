'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { useThemeLanguage } from './ThemeLanguageProvider'

const navIcons = {
  dashboard: '📊',
  employees: '👥',
  departments: '🏢',
  managers: '👔',
  salaries: '💰',
  titles: '🏷️',
}

const navItems = [
  { href: '/dashboard', key: 'navDashboard' as const, icon: navIcons.dashboard },
  { href: '/employees', key: 'navEmployees' as const, icon: navIcons.employees },
  { href: '/departments', key: 'navDepartments' as const, icon: navIcons.departments },
  { href: '/managers', key: 'navManagers' as const, icon: navIcons.managers },
  { href: '/salaries', key: 'navSalaries' as const, icon: navIcons.salaries },
  { href: '/titles', key: 'navTitles' as const, icon: navIcons.titles },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, sessionEdits, resetEdits } = useAuth()
  const { theme, toggleTheme, locale, setLocale, t } = useThemeLanguage()

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
        <h1 className="text-lg font-bold tracking-tight">{t.appName}</h1>
        <p className="text-xs text-surface-400 mt-1">{t.demoMode}</p>
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
              {t[item.key]}
            </Link>
          )
        })}
      </nav>

      {/* Theme & Language toggles */}
      <div className="px-4 py-3 border-t border-surface-700 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          )}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button
          onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
        >
          {locale === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
        </button>
      </div>

      {editCount > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">{editCount} {editCount !== 1 ? t.sessionEditsPlural : t.sessionEdits}</span>
            <button onClick={resetEdits} className="text-xs text-amber-400 hover:text-amber-300 underline">{t.reset}</button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-surface-700">
        <div className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</div>
        <div className="text-xs text-surface-400 truncate">{user?.email}</div>
        <button onClick={logout} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
          {t.signOut}
        </button>
      </div>
    </aside>
  )
}
