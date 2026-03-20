export interface Employee {
  emp_no: number
  birth_date: string
  first_name: string
  last_name: string
  gender: string
  hire_date: string
}

export interface Department {
  dept_no: string
  dept_name: string
}

export interface DeptEmp {
  emp_no: number
  dept_no: string
  from_date: string
  to_date: string
}

export interface DeptManager {
  emp_no: number
  dept_no: string
  from_date: string
  to_date: string
}

export interface Salary {
  emp_no: number
  salary: number
  from_date: string
  to_date: string
}

export interface Title {
  emp_no: number
  title: string
  from_date: string
  to_date: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  admin: number
  last_login: string
  isDeleted: number
  uuid: string
}

export interface Log {
  id: number
  code: string
  filename: string
  fnction: string
  msg_programmer: string
  msg_app: string
  ip: string
  refer: string
  tdate: string
}

export interface EmployeeWithDetails extends Employee {
  dept_name?: string
  dept_no?: string
  title?: string
  salary?: number
}

export interface DeptManagerWithDetails extends DeptManager {
  first_name?: string
  last_name?: string
  dept_name?: string
}

export interface AuthState {
  token: string | null
  email: string | null
  isAdmin: boolean
}

export interface SessionEdits {
  deletedEmployees: Set<number>
  editedEmployees: Map<number, Partial<Employee>>
  deletedDepartments: Set<string>
  editedDepartments: Map<string, Partial<Department>>
  deletedManagers: Set<string>
  editedManagers: Map<string, Partial<DeptManager>>
  deletedTitles: Set<string>
  editedTitles: Map<string, Partial<Title>>
  deletedUsers: Set<number>
  editedUsers: Map<number, Partial<User>>
}
