import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { emp_no: string } }) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const empNo = parseInt(params.emp_no)
    const employee = store.employees.find(e => e.emp_no === empNo)
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const salaries = store.salaries.filter(s => s.emp_no === empNo).sort((a, b) => b.from_date.localeCompare(a.from_date))
    const titles = store.titles.filter(t => t.emp_no === empNo).sort((a, b) => b.from_date.localeCompare(a.from_date))
    const departments = store.dept_emps
      .filter(de => de.emp_no === empNo)
      .sort((a, b) => b.from_date.localeCompare(a.from_date))
      .map(de => ({
        ...de,
        dept_name: store.departments.find(d => d.dept_no === de.dept_no)?.dept_name || '',
      }))

    return NextResponse.json({ employee, salaries, titles, departments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
