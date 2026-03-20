// In-memory data store loaded from seed.json
// No external database needed — perfect for demo mode
import seedData from '@/data/seed.json'

export interface EmployeeRecord {
  emp_no: number; birth_date: string; first_name: string; last_name: string; gender: string; hire_date: string
}
export interface DepartmentRecord { dept_no: string; dept_name: string }
export interface DeptEmpRecord { emp_no: number; dept_no: string; from_date: string; to_date: string }
export interface DeptManagerRecord { emp_no: number; dept_no: string; from_date: string; to_date: string }
export interface SalaryRecord { emp_no: number; salary: number; from_date: string; to_date: string }
export interface TitleRecord { emp_no: number; title: string; from_date: string; to_date: string }
export interface UserRecord {
  id: number; email: string; password: string; first_name: string; last_name: string
  admin: number; last_login: string | null; created_at?: string
}
export interface LogRecord {
  id: number; action: string; details: string; timestamp: string; user_email: string
}

interface Store {
  employees: EmployeeRecord[]
  departments: DepartmentRecord[]
  dept_emps: DeptEmpRecord[]
  dept_managers: DeptManagerRecord[]
  salaries: SalaryRecord[]
  titles: TitleRecord[]
  users: UserRecord[]
  logs: LogRecord[]
}

const store: Store = {
  employees: (seedData as any).employees || [],
  departments: (seedData as any).departments || [],
  dept_emps: (seedData as any).dept_emps || [],
  dept_managers: (seedData as any).dept_managers || [],
  salaries: (seedData as any).salaries || [],
  titles: (seedData as any).titles || [],
  users: (seedData as any).users || [],
  logs: (seedData as any).logs || [],
}

export default store
