import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = store.departments.map(d => {
      const deptEmps = store.dept_emps.filter(de => de.dept_no === d.dept_no && de.to_date === '9999-01-01')
      const empNos = new Set(deptEmps.map(de => de.emp_no))
      const salaries = store.salaries.filter(s => empNos.has(s.emp_no) && s.to_date === '9999-01-01')
      const avg = salaries.length ? Math.round(salaries.reduce((sum, s) => sum + s.salary, 0) / salaries.length) : 0
      return {
        dept_no: d.dept_no,
        dept_name: d.dept_name,
        emp_count: empNos.size,
        avg_salary: avg,
      }
    }).sort((a, b) => a.dept_name.localeCompare(b.dept_name))

    return NextResponse.json({ data: rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
