'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { type Locale, getTranslations } from '@/lib/i18n'

type Theme = 'light' | 'dark'

interface ThemeLanguageContextType {
  theme: Theme
  toggleTheme: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | null>(null)

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const savedTheme = localStorage.getItem('emp_theme') as Theme | null
    const savedLocale = localStorage.getItem('emp_locale') as Locale | null
    if (savedTheme) setTheme(savedTheme)
    if (savedLocale) setLocaleState(savedLocale)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('emp_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('emp_locale', l)
  }, [])

  const t = getTranslations(locale)

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, locale, setLocale, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  )
}

export function useThemeLanguage() {
  const ctx = useContext(ThemeLanguageContext)
  if (!ctx) throw new Error('useThemeLanguage must be used within ThemeLanguageProvider')
  return ctx
}
