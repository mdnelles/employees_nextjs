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
    const search = (url.searchParams.get('search') || '').toLowerCase()
    const dept = url.searchParams.get('dept') || ''
    const offset = (page - 1) * limit

    let filtered = store.employees

    if (search) {
      const searchNum = parseInt(search) || 0
      filtered = filtered.filter(e =>
        e.first_name.toLowerCase().includes(search) ||
        e.last_name.toLowerCase().includes(search) ||
        e.emp_no === searchNum
      )
    }

    if (dept) {
      const deptEmpNos = new Set(
        store.dept_emps.filter(de => de.dept_no === dept && de.to_date === '9999-01-01').map(de => de.emp_no)
      )
      filtered = filtered.filter(e => deptEmpNos.has(e.emp_no))
    }

    const total = filtered.length
    const paged = filtered.slice(offset, offset + limit)

    const rows = paged.map(e => {
      const de = store.dept_emps.find(d => d.emp_no === e.emp_no && d.to_date === '9999-01-01')
      const department = de ? store.departments.find(d => d.dept_no === de.dept_no) : null
      const title = store.titles.find(t => t.emp_no === e.emp_no && t.to_date === '9999-01-01')
      const salaryRec = store.salaries
        .filter(s => s.emp_no === e.emp_no)
        .sort((a, b) => b.from_date.localeCompare(a.from_date))[0]
      return {
        ...e,
        dept_no: de?.dept_no || null,
        dept_name: department?.dept_name || null,
        title: title?.title || null,
        salary: salaryRec?.salary || null,
      }
    })

    return NextResponse.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
