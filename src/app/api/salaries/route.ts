import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const minSalary = parseInt(url.searchParams.get('min') || '0') || 0
    const maxSalary = parseInt(url.searchParams.get('max') || '0') || 0
    const dept = url.searchParams.get('dept') || ''
    const offset = (page - 1) * limit

    let filtered = store.salaries.filter(s => s.to_date === '9999-01-01')

    if (minSalary) filtered = filtered.filter(s => s.salary >= minSalary)
    if (maxSalary) filtered = filtered.filter(s => s.salary <= maxSalary)
    if (dept) {
      const deptEmpNos = new Set(
        store.dept_emps.filter(de => de.dept_no === dept && de.to_date === '9999-01-01').map(de => de.emp_no)
      )
      filtered = filtered.filter(s => deptEmpNos.has(s.emp_no))
    }

    filtered.sort((a, b) => b.salary - a.salary)
    const total = filtered.length
    const paged = filtered.slice(offset, offset + limit)

    const rows = paged.map(s => {
      const emp = store.employees.find(e => e.emp_no === s.emp_no)
      const de = store.dept_emps.find(d => d.emp_no === s.emp_no && d.to_date === '9999-01-01')
      const department = de ? store.departments.find(d => d.dept_no === de.dept_no) : null
      const title = store.titles.find(t => t.emp_no === s.emp_no && t.to_date === '9999-01-01')
      return {
        emp_no: s.emp_no,
        salary: s.salary,
        from_date: s.from_date,
        to_date: s.to_date,
        first_name: emp?.first_name || '',
        last_name: emp?.last_name || '',
        dept_name: department?.dept_name || null,
        title: title?.title || null,
      }
    })

    return NextResponse.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
