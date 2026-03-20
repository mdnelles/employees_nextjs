import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

function yearsBetween(d1: string, d2: Date): number {
  const date1 = new Date(d1)
  return Math.floor((d2.getTime() - date1.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const now = new Date()
    const activeSalaries = store.salaries.filter(s => s.to_date === '9999-01-01')
    const activeTitles = store.titles.filter(t => t.to_date === '9999-01-01')
    const activeDeptEmps = store.dept_emps.filter(de => de.to_date === '9999-01-01')

    // Summary
    const avgSal = activeSalaries.length
      ? Math.round(activeSalaries.reduce((s, v) => s + v.salary, 0) / activeSalaries.length) : 0

    // Dept salaries
    const deptSalaries = store.departments.map(d => {
      const empNos = new Set(activeDeptEmps.filter(de => de.dept_no === d.dept_no).map(de => de.emp_no))
      const sals = activeSalaries.filter(s => empNos.has(s.emp_no))
      return {
        dept_name: d.dept_name,
        avg_salary: sals.length ? Math.round(sals.reduce((a, b) => a + b.salary, 0) / sals.length) : 0,
        emp_count: empNos.size,
      }
    }).sort((a, b) => b.avg_salary - a.avg_salary)

    // Gender distribution
    const genderMap = new Map<string, number>()
    store.employees.forEach(e => genderMap.set(e.gender, (genderMap.get(e.gender) || 0) + 1))
    const genderDistribution = [...genderMap.entries()].map(([gender, count]) => ({ gender, count }))

    // Hiring trend
    const hireMap = new Map<number, number>()
    store.employees.forEach(e => {
      const yr = parseInt(e.hire_date.substring(0, 4))
      hireMap.set(yr, (hireMap.get(yr) || 0) + 1)
    })
    const hiringTrend = [...hireMap.entries()].map(([year, hires]) => ({ year, hires })).sort((a, b) => a.year - b.year)

    // Title distribution
    const titleMap = new Map<string, number>()
    activeTitles.forEach(t => titleMap.set(t.title, (titleMap.get(t.title) || 0) + 1))
    const titleDistribution = [...titleMap.entries()].map(([title, count]) => ({ title, count })).sort((a, b) => b.count - a.count)

    // Salary ranges
    const ranges = [
      { label: 'Under 40k', min: 0, max: 39999 },
      { label: '40k-60k', min: 40000, max: 59999 },
      { label: '60k-80k', min: 60000, max: 79999 },
      { label: '80k-100k', min: 80000, max: 99999 },
      { label: '100k-120k', min: 100000, max: 119999 },
      { label: 'Over 120k', min: 120000, max: Infinity },
    ]
    const salaryRanges = ranges.map(r => ({
      range_label: r.label,
      count: activeSalaries.filter(s => s.salary >= r.min && s.salary <= r.max).length,
    }))

    // Tenure distribution
    const tenureBuckets = [
      { label: '0-5 years', min: 0, max: 5 },
      { label: '5-10 years', min: 5, max: 10 },
      { label: '10-15 years', min: 10, max: 15 },
      { label: '15-20 years', min: 15, max: 20 },
      { label: '20-25 years', min: 20, max: 25 },
      { label: '25+ years', min: 25, max: 999 },
    ]
    const tenureDistribution = tenureBuckets.map(b => ({
      tenure_range: b.label,
      count: store.employees.filter(e => {
        const y = yearsBetween(e.hire_date, now)
        return y >= b.min && y < b.max
      }).length,
    }))

    // Dept gender breakdown
    const deptGender: { dept_name: string; gender: string; count: number }[] = []
    store.departments.forEach(d => {
      const empNos = new Set(activeDeptEmps.filter(de => de.dept_no === d.dept_no).map(de => de.emp_no))
      const gMap = new Map<string, number>()
      store.employees.filter(e => empNos.has(e.emp_no)).forEach(e => {
        gMap.set(e.gender, (gMap.get(e.gender) || 0) + 1)
      })
      gMap.forEach((count, gender) => deptGender.push({ dept_name: d.dept_name, gender, count }))
    })

    // Salary by title
    const salaryByTitle = [...titleMap.keys()].map(title => {
      const empNos = new Set(activeTitles.filter(t => t.title === title).map(t => t.emp_no))
      const sals = activeSalaries.filter(s => empNos.has(s.emp_no)).map(s => s.salary)
      return {
        title,
        avg_salary: sals.length ? Math.round(sals.reduce((a, b) => a + b, 0) / sals.length) : 0,
        min_salary: sals.length ? Math.min(...sals) : 0,
        max_salary: sals.length ? Math.max(...sals) : 0,
      }
    }).sort((a, b) => b.avg_salary - a.avg_salary)

    // Age distribution
    const ageBuckets = [
      { label: 'Under 40', min: 0, max: 40 },
      { label: '40-49', min: 40, max: 50 },
      { label: '50-59', min: 50, max: 60 },
      { label: '60-69', min: 60, max: 70 },
      { label: '70+', min: 70, max: 999 },
    ]
    const ageDistribution = ageBuckets.map(b => ({
      age_range: b.label,
      count: store.employees.filter(e => {
        const age = yearsBetween(e.birth_date, now)
        return age >= b.min && age < b.max
      }).length,
    }))

    return NextResponse.json({
      summary: {
        totalEmployees: store.employees.length,
        totalDepartments: store.departments.length,
        avgSalary: avgSal,
      },
      deptSalaries,
      genderDistribution,
      hiringTrend,
      titleDistribution,
      salaryRanges,
      tenureDistribution,
      deptGenderBreakdown: deptGender,
      salaryByTitle,
      ageDistribution,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
