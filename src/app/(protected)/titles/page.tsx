'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TitleData {
  title: string;
  current_count: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
}

interface ApiResponse {
  data: TitleData[];
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
];

export default function TitlesPage() {
  const [titles, setTitles] = useState<TitleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse>('/api/titles');
        setTitles(response.data.data);
      } catch (error) {
        console.error('Failed to fetch titles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, []);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const countChartData = titles.map((title) => ({
    title: title.title,
    employees: title.current_count,
  }));

  const salaryChartData = titles.map((title) => ({
    title: title.title,
    min: title.min_salary,
    avg: title.avg_salary,
    max: title.max_salary,
  }));

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Titles</h1>
        <p className="text-gray-600 mt-1">Job titles with employee counts and salary analysis</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee Count by Title</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="employees" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Salary Range by Title</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value as number)
                    }
                  />
                  <Legend />
                  <Bar dataKey="min" fill={COLORS[4]} />
                  <Bar dataKey="avg" fill={COLORS[0]} />
                  <Bar dataKey="max" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Current Employees
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Avg Salary
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Min Salary
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Max Salary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {titles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No titles found
                      </td>
                    </tr>
                  ) : (
                    titles.map((title, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {title.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                          {title.current_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatSalary(title.avg_salary)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatSalary(title.min_salary)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatSalary(title.max_salary)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
