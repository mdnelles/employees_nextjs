import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = store.dept_managers.map(dm => {
      const emp = store.employees.find(e => e.emp_no === dm.emp_no)
      const dept = store.departments.find(d => d.dept_no === dm.dept_no)
      return {
        emp_no: dm.emp_no,
        dept_no: dm.dept_no,
        from_date: dm.from_date,
        to_date: dm.to_date,
        first_name: emp?.first_name || '',
        last_name: emp?.last_name || '',
        gender: emp?.gender || '',
        hire_date: emp?.hire_date || '',
        dept_name: dept?.dept_name || '',
      }
    }).sort((a, b) => b.to_date.localeCompare(a.to_date) || a.dept_name.localeCompare(b.dept_name))

    return NextResponse.json({ data: rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
