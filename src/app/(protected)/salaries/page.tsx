'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';

interface SalaryRecord {
  id: number;
  emp_no: number;
  first_name: string;
  last_name: string;
  title: string;
  dept_name: string;
  salary: number;
}

interface Department {
  dept_no: string;
  dept_name: string;
}

interface ApiResponse {
  data: SalaryRecord[];
  total: number;
  page: number;
  limit: number;
}

const ITEMS_PER_PAGE = 50;

export default function SalariesPage() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const minSalary = searchParams.get('min') || '';
  const maxSalary = searchParams.get('max') || '';
  const selectedDept = searchParams.get('dept') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(minSalary && { min_salary: minSalary }),
          ...(maxSalary && { max_salary: maxSalary }),
          ...(selectedDept && { dept_no: selectedDept }),
        });

        const response = await api.get<ApiResponse>(`/api/salaries?${params}`);
        setRecords(response.data.data);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Failed to fetch salaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, minSalary, maxSalary, selectedDept]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get<{ data: Department[] }>('/api/departments');
        setDepartments(response.data.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (minSalary) params.set('min', minSalary);
    if (maxSalary) params.set('max', maxSalary);
    if (selectedDept) params.set('dept', selectedDept);
    params.set('page', '1');
    window.location.search = params.toString();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salaries</h1>
        <p className="text-gray-600 mt-1">Historical salary records with filtering and pagination</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900">
          Showing {records.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, total)} of <strong>{total.toLocaleString()}</strong> records
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              placeholder="e.g., 40000"
              defaultValue={minSalary}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('min', e.target.value);
                } else {
                  params.delete('min');
                }
                params.set('page', '1');
                window.location.search = params.toString();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              placeholder="e.g., 120000"
              defaultValue={maxSalary}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('max', e.target.value);
                } else {
                  params.delete('max');
                }
                params.set('page', '1');
                window.location.search = params.toString();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('dept', e.target.value);
                } else {
                  params.delete('dept');
                }
                params.set('page', '1');
                window.location.search = params.toString();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.dept_no} value={dept.dept_no}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Emp #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Salary</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.emp_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.first_name} {record.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.dept_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                      {formatSalary(record.salary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <Pagination
          page={currentPage}
          total={total}
          totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
          onPageChange={(p) => {
            const params = new URLSearchParams();
            params.set('page', p.toString());
            if (minSalary) params.set('min', minSalary);
            if (maxSalary) params.set('max', maxSalary);
            if (selectedDept) params.set('dept', selectedDept);
            window.location.search = params.toString();
          }}
        />
      </div>
    </div>
  );
}
