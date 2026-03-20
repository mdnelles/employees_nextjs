'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'

interface AuthUser {
  email: string
  first_name: string
  last_name: string
  isAdmin: boolean
}

interface SessionEdits {
  deletedEmployees: number[]
  editedEmployees: Record<number, any>
  deletedDepartments: string[]
  editedDepartments: Record<string, any>
  deletedManagers: string[]
  editedManagers: Record<string, any>
  deletedUsers: number[]
  editedUsers: Record<number, any>
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  sessionEdits: SessionEdits
  deleteEmployee: (emp_no: number) => void
  editEmployee: (emp_no: number, data: any) => void
  deleteDepartment: (dept_no: string) => void
  editDepartment: (dept_no: string, data: any) => void
  deleteManager: (key: string) => void
  editManager: (key: string, data: any) => void
  deleteUser: (id: number) => void
  editUser: (id: number, data: any) => void
  isDeleted: (type: string, id: number | string) => boolean
  getEdited: (type: string, id: number | string) => any | null
  resetEdits: () => void
}

const emptyEdits: SessionEdits = {
  deletedEmployees: [],
  editedEmployees: {},
  deletedDepartments: [],
  editedDepartments: {},
  deletedManagers: [],
  editedManagers: {},
  deletedUsers: [],
  editedUsers: {},
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionEdits, setSessionEdits] = useState<SessionEdits>({ ...emptyEdits })

  useEffect(() => {
    const token = api.getToken()
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('emp_user') : null
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        api.setToken(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.post('/api/auth/login', { email, password })
    api.setToken(data.token)
    const userData = { email: data.email, first_name: data.first_name, last_name: data.last_name, isAdmin: data.isAdmin }
    localStorage.setItem('emp_user', JSON.stringify(userData))
    setUser(userData)
    setSessionEdits({ ...emptyEdits })
  }

  const logout = () => {
    api.setToken(null)
    localStorage.removeItem('emp_user')
    setUser(null)
    setSessionEdits({ ...emptyEdits })
  }

  const deleteEmployee = (emp_no: number) => setSessionEdits(prev => ({ ...prev, deletedEmployees: [...prev.deletedEmployees, emp_no] }))
  const editEmployee = (emp_no: number, data: any) => setSessionEdits(prev => ({ ...prev, editedEmployees: { ...prev.editedEmployees, [emp_no]: { ...prev.editedEmployees[emp_no], ...data } } }))
  const deleteDepartment = (dept_no: string) => setSessionEdits(prev => ({ ...prev, deletedDepartments: [...prev.deletedDepartments, dept_no] }))
  const editDepartment = (dept_no: string, data: any) => setSessionEdits(prev => ({ ...prev, editedDepartments: { ...prev.editedDepartments, [dept_no]: { ...prev.editedDepartments[dept_no], ...data } } }))
  const deleteManager = (key: string) => setSessionEdits(prev => ({ ...prev, deletedManagers: [...prev.deletedManagers, key] }))
  const editManager = (key: string, data: any) => setSessionEdits(prev => ({ ...prev, editedManagers: { ...prev.editedManagers, [key]: { ...prev.editedManagers[key], ...data } } }))
  const deleteUser = (id: number) => setSessionEdits(prev => ({ ...prev, deletedUsers: [...prev.deletedUsers, id] }))
  const editUser = (id: number, data: any) => setSessionEdits(prev => ({ ...prev, editedUsers: { ...prev.editedUsers, [id]: { ...prev.editedUsers[id], ...data } } }))

  const isDeleted = useCallback((type: string, id: number | string) => {
    switch (type) {
      case 'employee': return sessionEdits.deletedEmployees.includes(id as number)
      case 'department': return sessionEdits.deletedDepartments.includes(id as string)
      case 'manager': return sessionEdits.deletedManagers.includes(id as string)
      case 'user': return sessionEdits.deletedUsers.includes(id as number)
      default: return false
    }
  }, [sessionEdits])

  const getEdited = useCallback((type: string, id: number | string) => {
    switch (type) {
      case 'employee': return sessionEdits.editedEmployees[id as number] || null
      case 'department': return sessionEdits.editedDepartments[id as string] || null
      case 'manager': return sessionEdits.editedManagers[id as string] || null
      case 'user': return sessionEdits.editedUsers[id as number] || null
      default: return null
    }
  }, [sessionEdits])

  const resetEdits = () => setSessionEdits({ ...emptyEdits })

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, sessionEdits, deleteEmployee, editEmployee, deleteDepartment, editDepartment, deleteManager, editManager, deleteUser, editUser, isDeleted, getEdited, resetEdits }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
