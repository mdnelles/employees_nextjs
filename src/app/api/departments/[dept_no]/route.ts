import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { dept_no: string } }) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const dept_no = params.dept_no
    const dept = store.departments.find(d => d.dept_no === dept_no)
    if (!dept) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const deptEmps = store.dept_emps.filter(de => de.dept_no === dept_no && de.to_date === '9999-01-01')
    const empNos = new Set(deptEmps.map(de => de.emp_no))

    const employees = store.employees
      .filter(e => empNos.has(e.emp_no))
      .slice(0, 200)
      .map(e => {
        const title = store.titles.find(t => t.emp_no === e.emp_no && t.to_date === '9999-01-01')
        const salary = store.salaries.find(s => s.emp_no === e.emp_no && s.to_date === '9999-01-01')
        return { ...e, title: title?.title || null, salary: salary?.salary || null }
      })
      .sort((a, b) => a.last_name.localeCompare(b.last_name))

    const managers = store.dept_managers
      .filter(dm => dm.dept_no === dept_no)
      .map(dm => {
        const emp = store.employees.find(e => e.emp_no === dm.emp_no)
        return { ...dm, first_name: emp?.first_name || '', last_name: emp?.last_name || '' }
      })
      .sort((a, b) => b.from_date.localeCompare(a.from_date))

    const activeSalaries = store.salaries.filter(s => empNos.has(s.emp_no) && s.to_date === '9999-01-01')
    const salaryStats = {
      min_salary: activeSalaries.length ? Math.min(...activeSalaries.map(s => s.salary)) : 0,
      max_salary: activeSalaries.length ? Math.max(...activeSalaries.map(s => s.salary)) : 0,
      avg_salary: activeSalaries.length ? Math.round(activeSalaries.reduce((s, v) => s + v.salary, 0) / activeSalaries.length) : 0,
      emp_with_salary: activeSalaries.length,
    }

    const titleMap = new Map<string, number>()
    store.titles.filter(t => empNos.has(t.emp_no) && t.to_date === '9999-01-01').forEach(t => {
      titleMap.set(t.title, (titleMap.get(t.title) || 0) + 1)
    })
    const titleDistribution = [...titleMap.entries()].map(([title, count]) => ({ title, count })).sort((a, b) => b.count - a.count)

    const genderMap = new Map<string, number>()
    store.employees.filter(e => empNos.has(e.emp_no)).forEach(e => {
      genderMap.set(e.gender, (genderMap.get(e.gender) || 0) + 1)
    })
    const genderDistribution = [...genderMap.entries()].map(([gender, count]) => ({ gender, count }))

    return NextResponse.json({ department: dept, employees, managers, salaryStats, titleDistribution, genderDistribution })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
