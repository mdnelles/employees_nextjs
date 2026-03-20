'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Modal from '@/components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Department {
  dept_no: string;
  dept_name: string;
  emp_count: number;
  avg_salary: number;
}

interface DepartmentDetail {
  dept_no: string;
  dept_name: string;
  emp_count: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  employees: Array<{
    emp_no: number;
    first_name: string;
    last_name: string;
    salary: number;
    from_date: string;
    to_date: string;
  }>;
  managers: Array<{
    emp_no: number;
    first_name: string;
    last_name: string;
    from_date: string;
    to_date: string;
  }>;
  title_distribution: Array<{
    name: string;
    value: number;
  }>;
  gender_distribution: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<DepartmentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/departments');
      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (dept: Department) => {
    try {
      setModalLoading(true);
      const response = await api.get(`/api/departments/${dept.dept_no}`);
      const raw = response.data;
      setSelectedDept({
        dept_no: raw.department?.dept_no || dept.dept_no,
        dept_name: raw.department?.dept_name || dept.dept_name,
        emp_count: raw.employees?.length || 0,
        avg_salary: raw.salaryStats?.avg_salary || 0,
        min_salary: raw.salaryStats?.min_salary || 0,
        max_salary: raw.salaryStats?.max_salary || 0,
        employees: raw.employees || [],
        managers: raw.managers || [],
        title_distribution: (raw.titleDistribution || []).map((t: any) => ({ name: t.title, value: t.count })),
        gender_distribution: (raw.genderDistribution || []).map((g: any) => ({ name: g.gender === 'M' ? 'Male' : 'Female', value: g.count })),
      });
      setEditedName(raw.department?.dept_name || dept.dept_name);
      setIsEditing(false);
      setIsDeleting(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch department details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDept || !editedName.trim()) return;

    try {
      await api.put(`/api/departments/${selectedDept.dept_no}`, {
        dept_name: editedName,
      });

      setSelectedDept({
        ...selectedDept,
        dept_name: editedName,
      });

      setDepartments(
        departments.map((d) =>
          d.dept_no === selectedDept.dept_no
            ? { ...d, dept_name: editedName }
            : d
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit department:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;

    try {
      await api.delete(`/api/departments/${selectedDept.dept_no}`);

      setDepartments(
        departments.filter((d) => d.dept_no !== selectedDept.dept_no)
      );

      setIsModalOpen(false);
      setSelectedDept(null);
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDept(null);
    setIsEditing(false);
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Departments</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <button
              key={dept.dept_no}
              onClick={() => handleCardClick(dept)}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {dept.dept_name}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Employees:</span>
                  <span className="font-semibold text-gray-900">
                    {dept.emp_count}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Avg Salary:</span>
                  <span className="font-semibold text-gray-900">
                    ${dept.avg_salary.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDept && (
        <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
          <div className="space-y-6">
            {modalLoading ? (
              <p className="text-gray-600">Loading department details...</p>
            ) : (
              <>
                {/* Department Info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="input w-full"
                      />
                    ) : (
                      selectedDept.dept_name
                    )}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-100 p-3 rounded">
                      <p className="text-xs text-gray-600">Employees</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedDept.emp_count}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                      <p className="text-xs text-gray-600">Avg Salary</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedDept.avg_salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                      <p className="text-xs text-gray-600">Min Salary</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedDept.min_salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                      <p className="text-xs text-gray-600">Max Salary</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedDept.max_salary.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {user && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleEdit}
                            className="btn-primary flex-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary flex-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setIsDeleting(true)}
                            className="btn-danger flex-1"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 mb-4">
                      Are you sure you want to delete this department? This
                      action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="btn-danger flex-1"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Managers */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Managers
                  </h3>
                  <div className="space-y-2">
                    {selectedDept.managers.length > 0 ? (
                      selectedDept.managers.map((mgr) => (
                        <div
                          key={mgr.emp_no}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <p className="font-medium text-gray-900">
                            {mgr.first_name} {mgr.last_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {mgr.from_date} to {mgr.to_date}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No managers</p>
                    )}
                  </div>
                </div>

                {/* Title Distribution */}
                {selectedDept.title_distribution.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Title Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={selectedDept.title_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {selectedDept.title_distribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gender Distribution */}
                {selectedDept.gender_distribution.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Gender Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={selectedDept.gender_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {selectedDept.gender_distribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Employees Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Employees (showing first 200)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="table-header text-left">Name</th>
                          <th className="table-header text-left">Salary</th>
                          <th className="table-header text-left">From Date</th>
                          <th className="table-header text-left">To Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDept.employees.slice(0, 200).map((emp) => (
                          <tr
                            key={emp.emp_no}
                            className="border-b border-gray-200"
                          >
                            <td className="table-cell">
                              {emp.first_name} {emp.last_name}
                            </td>
                            <td className="table-cell">
                              ${emp.salary.toLocaleString()}
                            </td>
                            <td className="table-cell">{emp.from_date}</td>
                            <td className="table-cell">{emp.to_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
