'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/components/AuthProvider'
import { useThemeLanguage } from '@/components/ThemeLanguageProvider'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EmployeeWithDetails, Department, Salary, Title } from '@/types'

interface EmployeeDetail {
  employee: any
  salaries: Salary[]
  titles: Title[]
  departments: any[]
}

export default function EmployeesPage() {
  const { sessionEdits, deleteEmployee, editEmployee } = useAuth()
  const { t } = useThemeLanguage()
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedDetails, setExpandedDetails] = useState<EmployeeDetail | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const ITEMS_PER_PAGE = 50

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      }
      if (search) params.search = search
      if (selectedDept) params.dept = selectedDept

      const response = await api.get('/api/employees', params)
      setEmployees(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, selectedDept])

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('/api/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const fetchEmployeeDetails = async (emp_no: number) => {
    try {
      const response = await api.get(`/api/employees/${emp_no}`)
      setExpandedDetails(response)
    } catch (error) {
      console.error('Failed to fetch employee details:', error)
    }
  }

  const handleExpandRow = async (emp_no: number) => {
    if (expandedId === emp_no) {
      setExpandedId(null)
      setExpandedDetails(null)
    } else {
      setExpandedId(emp_no)
      await fetchEmployeeDetails(emp_no)
    }
  }

  const handleEditClick = (employee: EmployeeWithDetails) => {
    setEditingId(employee.emp_no)
    const edited = sessionEdits.editedEmployees[employee.emp_no] || {}
    setEditFormData({
      first_name: edited.first_name || employee.first_name,
      last_name: edited.last_name || employee.last_name,
      birth_date: edited.birth_date || employee.birth_date,
      gender: edited.gender || employee.gender,
      hire_date: edited.hire_date || employee.hire_date,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingId !== null) {
      editEmployee(editingId, editFormData)
      setIsEditModalOpen(false)
      setEditingId(null)
      setEditFormData({})
    }
  }

  const handleDeleteClick = (emp_no: number) => {
    deleteEmployee(emp_no)
  }

  const getDisplayedEmployee = (employee: EmployeeWithDetails): EmployeeWithDetails => {
    const edited = sessionEdits.editedEmployees[employee.emp_no] || {}
    return {
      ...employee,
      ...edited,
    }
  }

  const visibleEmployees = employees.filter(
    emp => !sessionEdits.deletedEmployees.includes(emp.emp_no)
  ).map(getDisplayedEmployee)

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatSalary = (salary: number) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(salary)
  }

  const isFieldEdited = (emp_no: number, field: string): boolean => {
    const original = employees.find(e => e.emp_no === emp_no)
    const edited = sessionEdits.editedEmployees[emp_no]
    if (!original || !edited) return false
    return edited[field] !== undefined && edited[field] !== original[field]
  }

  const getHighlightClass = (emp_no: number, field: string) => {
    return isFieldEdited(emp_no, field) ? 'bg-yellow-100 font-semibold' : ''
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-gray-100">{t.employees}</h1>
        <p className="text-surface-500 dark:text-gray-400 mt-1">{t.employeesSubtitle}</p>
      </div>

      <div className="card space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">{t.search}</label>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">{t.department}</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t.allDepartments}</option>
              {departments.map(dept => (
                <option key={dept.dept_no} value={dept.dept_no}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 dark:bg-gray-700 border-b border-surface-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100 w-12"></th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.empNo}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.name}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.gender}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.hireDate}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.department}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.title}</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-900 dark:text-gray-100">{t.salary}</th>
                <th className="px-4 py-3 text-center font-semibold text-surface-900 dark:text-gray-100">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-surface-500 dark:text-gray-400">
                    {t.loadingEmployees}
                  </td>
                </tr>
              ) : visibleEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-surface-500 dark:text-gray-400">
                    {t.noEmployeesFound}
                  </td>
                </tr>
              ) : (
                visibleEmployees.map(employee => (
                  <React.Fragment key={employee.emp_no}>
                    <tr
                      className={`border-b border-surface-100 dark:border-gray-700 hover:bg-surface-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        sessionEdits.deletedEmployees.includes(employee.emp_no)
                          ? 'opacity-50 line-through'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleExpandRow(employee.emp_no)}
                          className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          {expandedId === employee.emp_no ? '−' : '+'}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-surface-900 dark:text-gray-100">
                        {employee.emp_no}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium text-surface-900 dark:text-gray-100 ${getHighlightClass(
                          employee.emp_no,
                          'first_name'
                        )} ${getHighlightClass(employee.emp_no, 'last_name')}`}
                      >
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-gray-400">{employee.gender}</td>
                      <td
                        className={`px-4 py-3 text-surface-600 dark:text-gray-400 ${getHighlightClass(
                          employee.emp_no,
                          'hire_date'
                        )}`}
                      >
                        {formatDate(employee.hire_date)}
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-gray-400">{employee.dept_name || '-'}</td>
                      <td className="px-4 py-3 text-surface-600 dark:text-gray-400">{employee.title || '-'}</td>
                      <td className="px-4 py-3 font-mono text-surface-900 dark:text-gray-100">
                        {formatSalary(employee.salary)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(employee)}
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee.emp_no)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === employee.emp_no && expandedDetails && (
                      <tr className="bg-surface-50 dark:bg-gray-700 border-b border-surface-200 dark:border-gray-700">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                              <div>
                                <label className="text-xs font-semibold text-surface-600 dark:text-gray-400 uppercase">
                                  {t.birthDate}
                                </label>
                                <p className="text-surface-900 dark:text-gray-100 font-medium mt-1">
                                  {formatDate(expandedDetails.employee.birth_date)}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-surface-600 dark:text-gray-400 uppercase">
                                  {t.age}
                                </label>
                                <p className="text-surface-900 dark:text-gray-100 font-medium mt-1">
                                  {Math.floor(
                                    (Date.now() - new Date(expandedDetails.employee.birth_date).getTime()) /
                                      (365.25 * 24 * 60 * 60 * 1000)
                                  )}{' '}
                                  {t.years}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-surface-600 dark:text-gray-400 uppercase">
                                  {t.tenure}
                                </label>
                                <p className="text-surface-900 dark:text-gray-100 font-medium mt-1">
                                  {Math.floor(
                                    (Date.now() - new Date(expandedDetails.employee.hire_date).getTime()) /
                                      (365.25 * 24 * 60 * 60 * 1000)
                                  )}{' '}
                                  {t.years}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-surface-600 dark:text-gray-400 uppercase">
                                  {t.currentSalary}
                                </label>
                                <p className="text-surface-900 dark:text-gray-100 font-medium mt-1">
                                  {expandedDetails.salaries.length > 0
                                    ? formatSalary(expandedDetails.salaries[0].salary)
                                    : '-'}
                                </p>
                              </div>
                            </div>

                            {expandedDetails.salaries.length > 1 && (
                              <div>
                                <h4 className="font-semibold text-surface-900 dark:text-gray-100 mb-3">
                                  {t.salaryHistory}
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                  <LineChart
                                    data={expandedDetails.salaries
                                      .slice()
                                      .reverse()
                                      .map((s: Salary) => ({
                                        date: formatDate(s.from_date),
                                        salary: s.salary,
                                      }))}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                      formatter={(value: any) => formatSalary(value)}
                                      labelFormatter={(label) => `Date: ${label}`}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="salary"
                                      stroke="#3b82f6"
                                      dot={false}
                                      isAnimationActive={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}

                            {expandedDetails.titles.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-surface-900 dark:text-gray-100 mb-4">
                                  {t.titleHistory}
                                </h4>
                                <div className="space-y-3">
                                  {expandedDetails.titles.map((title: Title, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-primary-600 rounded-full" />
                                        {idx < expandedDetails.titles.length - 1 && (
                                          <div className="w-0.5 h-12 bg-surface-300" />
                                        )}
                                      </div>
                                      <div className="pt-0.5">
                                        <p className="font-semibold text-surface-900 dark:text-gray-100">{title.title}</p>
                                        <p className="text-xs text-surface-500 dark:text-gray-400">
                                          {formatDate(title.from_date)} to{' '}
                                          {title.to_date === '9999-01-01'
                                            ? t.present
                                            : formatDate(title.to_date)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {expandedDetails.departments.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-surface-900 dark:text-gray-100 mb-4">
                                  {t.departmentHistory}
                                </h4>
                                <div className="space-y-3">
                                  {expandedDetails.departments.map((dept: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                                        {idx < expandedDetails.departments.length - 1 && (
                                          <div className="w-0.5 h-12 bg-surface-300" />
                                        )}
                                      </div>
                                      <div className="pt-0.5">
                                        <p className="font-semibold text-surface-900 dark:text-gray-100">
                                          {dept.dept_name}
                                        </p>
                                        <p className="text-xs text-surface-500 dark:text-gray-400">
                                          {formatDate(dept.from_date)} to{' '}
                                          {dept.to_date === '9999-01-01'
                                            ? t.present
                                            : formatDate(dept.to_date)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
        />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingId(null)
          setEditFormData({})
        }}
        title={t.editEmployee}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">
                {t.firstName}
              </label>
              <input
                type="text"
                value={editFormData.first_name || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, first_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">
                {t.lastName}
              </label>
              <input
                type="text"
                value={editFormData.last_name || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, last_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">
                {t.birthDate}
              </label>
              <input
                type="date"
                value={editFormData.birth_date || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, birth_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">
                {t.gender}
              </label>
              <select
                value={editFormData.gender || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t.selectGender}</option>
                <option value="M">{t.male}</option>
                <option value="F">{t.female}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-gray-300 mb-1">
              {t.hireDate}
            </label>
            <input
              type="date"
              value={editFormData.hire_date || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, hire_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-surface-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingId(null)
                setEditFormData({})
              }}
              className="btn-secondary"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn-primary flex items-center gap-2"
            >
              {t.save}
              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-200 text-amber-800">
                {t.sessionOnly}
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
