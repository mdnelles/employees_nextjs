import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import store from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const activeTitles = store.titles.filter(t => t.to_date === '9999-01-01')
    const titleMap = new Map<string, { count: number; salaries: number[] }>()

    for (const t of activeTitles) {
      if (!titleMap.has(t.title)) titleMap.set(t.title, { count: 0, salaries: [] })
      const entry = titleMap.get(t.title)!
      entry.count++
      const sal = store.salaries.find(s => s.emp_no === t.emp_no && s.to_date === '9999-01-01')
      if (sal) entry.salaries.push(sal.salary)
    }

    const rows = [...titleMap.entries()].map(([title, data]) => ({
      title,
      current_count: data.count,
      avg_salary: data.salaries.length ? Math.round(data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length) : 0,
      min_salary: data.salaries.length ? Math.min(...data.salaries) : 0,
      max_salary: data.salaries.length ? Math.max(...data.salaries) : 0,
    })).sort((a, b) => b.current_count - a.current_count)

    return NextResponse.json({ data: rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
