'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { useThemeLanguage } from '@/components/ThemeLanguageProvider'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
]

const fmt = (n: number) => '$' + (n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })

interface AnalyticsData {
  summary: {
    totalEmployees: number
    totalDepartments: number
    avgSalary: number
  }
  deptSalaries: Array<{ dept_name: string; avg_salary: number; emp_count: number }>
  genderDistribution: Array<{ gender: string; count: number }>
  hiringTrend: Array<{ year: number; hires: number }>
  titleDistribution: Array<{ title: string; count: number }>
  salaryRanges: Array<{ range_label: string; count: number }>
  tenureDistribution: Array<{ tenure_range: string; count: number }>
  deptGenderBreakdown: Array<{ dept_name: string; gender: string; count: number }>
  salaryByTitle: Array<{ title: string; avg_salary: number; min_salary: number; max_salary: number }>
  ageDistribution: Array<{ age_range: string; count: number }>
}

export default function DashboardPage() {
  const { t } = useThemeLanguage()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const result = await api.get('/api/analytics')
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError(t.failedToLoadAnalytics)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t.loadingAnalytics}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <p className="text-lg">{error || t.failedToLoadAnalytics}</p>
      </div>
    )
  }

  // Process department gender data into format for stacked bar chart
  const deptGenderData = Array.from(
    new Map(
      data.deptGenderBreakdown.map((item) => [
        item.dept_name,
        {
          dept_name: item.dept_name,
          M: 0,
          F: 0,
          Other: 0,
        },
      ])
    ).values()
  )

  data.deptGenderBreakdown.forEach((item) => {
    const dept = deptGenderData.find((d) => d.dept_name === item.dept_name)
    if (dept && item.gender === 'M') dept.M = item.count
    else if (dept && item.gender === 'F') dept.F = item.count
    else if (dept) dept.Other = item.count
  })

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{t.analyticsDashboard}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.analyticsSubtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Employees Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t.totalEmployees}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {data.summary.totalEmployees.toLocaleString()}
                </p>
              </div>
              <div className="text-blue-500 text-5xl opacity-20">👥</div>
            </div>
          </div>

          {/* Total Departments Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t.totalDepartments}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {data.summary.totalDepartments}
                </p>
              </div>
              <div className="text-purple-500 text-5xl opacity-20">🏢</div>
            </div>
          </div>

          {/* Average Salary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t.averageSalary}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {fmt(data.summary.avgSalary)}
                </p>
              </div>
              <div className="text-green-500 text-5xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Salary Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.deptSalaryComparison}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.deptSalaries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dept_name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                  formatter={(value) => fmt(value as number)}
                />
                <Bar dataKey="avg_salary" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.genderDistribution}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count, percent }) => `${name}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="gender"
                >
                  {data.genderDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hiring Trend Over Years */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.hiringTrend}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.hiringTrend}>
                <defs>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Area type="monotone" dataKey="hires" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHires)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Title Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.titleDistribution}</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data.titleDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="title" type="category" width={240} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Salary Range Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.salaryRangeDistribution}</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.salaryRanges} margin={{ bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="range_label"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tenure Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.tenureDistribution}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tenureDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="tenure_range"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Size */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.departmentSize}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.deptSalaries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dept_name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="emp_count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.ageDistribution}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="age_range"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Salary by Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.salaryByTitle}</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data.salaryByTitle}
                margin={{ top: 5, right: 30, left: 100, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                  formatter={(value) => fmt(value as number)}
                />
                <Legend />
                <Bar dataKey="min_salary" fill="#ec4899" radius={[8, 0, 0, 0]} />
                <Bar dataKey="avg_salary" fill="#3b82f6" radius={[8, 0, 0, 0]} />
                <Bar dataKey="max_salary" fill="#10b981" radius={[8, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender by Department (Stacked) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t.genderByDepartment}</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={deptGenderData}
                margin={{ top: 5, right: 30, left: 100, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dept_name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="M" stackId="a" fill="#3b82f6" name="Male" />
                <Bar dataKey="F" stackId="a" fill="#ec4899" name="Female" />
                <Bar dataKey="Other" stackId="a" fill="#6366f1" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
