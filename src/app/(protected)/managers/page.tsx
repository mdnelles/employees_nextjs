'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Modal from '@/components/Modal';

interface Manager {
  emp_no: number;
  dept_no: string;
  from_date: string;
  to_date: string;
  first_name: string;
  last_name: string;
  gender: string;
  hire_date: string;
  dept_name: string;
}

interface ManagerEditData {
  from_date: string;
  to_date: string;
  dept_name: string;
}

export default function ManagersPage() {
  const { user } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedData, setEditedData] = useState<ManagerEditData>({
    from_date: '',
    to_date: '',
    dept_name: '',
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/managers');
      setManagers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentManager = (manager: Manager) => {
    return manager.to_date === '9999-01-01';
  };

  const handleRowClick = (manager: Manager) => {
    setSelectedManager(manager);
    setEditedData({
      from_date: manager.from_date,
      to_date: manager.to_date,
      dept_name: manager.dept_name,
    });
    setIsEditing(false);
    setIsDeleting(false);
    setIsModalOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedManager) return;

    try {
      const key = `${selectedManager.emp_no}-${selectedManager.dept_no}`;
      await api.put(`/api/managers/${key}`, {
        from_date: editedData.from_date,
        to_date: editedData.to_date,
      });

      const updatedManagers = managers.map((m) =>
        m.emp_no === selectedManager.emp_no && m.dept_no === selectedManager.dept_no
          ? {
              ...m,
              from_date: editedData.from_date,
              to_date: editedData.to_date,
            }
          : m
      );

      setManagers(updatedManagers);
      setSelectedManager({
        ...selectedManager,
        from_date: editedData.from_date,
        to_date: editedData.to_date,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit manager:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedManager) return;

    try {
      const key = `${selectedManager.emp_no}-${selectedManager.dept_no}`;
      await api.delete(`/api/managers/${key}`);

      setManagers(
        managers.filter(
          (m) =>
            !(m.emp_no === selectedManager.emp_no && m.dept_no === selectedManager.dept_no)
        )
      );

      setIsModalOpen(false);
      setSelectedManager(null);
    } catch (error) {
      console.error('Failed to delete manager:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedManager(null);
    setIsEditing(false);
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading managers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Managers</h1>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header text-left">Name</th>
                <th className="table-header text-left">Department</th>
                <th className="table-header text-left">From</th>
                <th className="table-header text-left">To</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left"></th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => {
                const isCurrent = isCurrentManager(manager);
                return (
                  <tr key={`${manager.emp_no}-${manager.dept_no}`} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <td className="table-cell font-medium text-gray-900">
                      {manager.first_name} {manager.last_name}
                    </td>
                    <td className="table-cell text-gray-600">
                      {manager.dept_name}
                    </td>
                    <td className="table-cell text-gray-600">
                      {manager.from_date}
                    </td>
                    <td className="table-cell text-gray-600">
                      {manager.to_date}
                    </td>
                    <td className="table-cell">
                      {isCurrent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Former
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(manager);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedManager && (
        <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
          <div className="space-y-6">
            {/* Manager Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedManager.first_name} {selectedManager.last_name}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-xs text-gray-600">Department</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedManager.dept_name}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-xs text-gray-600">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedManager.gender}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-xs text-gray-600">Hire Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedManager.hire_date}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {isCurrentManager(selectedManager) ? (
                      <span className="text-green-600">Current</span>
                    ) : (
                      <span className="text-gray-600">Former</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Employment Period */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Employment Period</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.from_date}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            from_date: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {selectedManager.from_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.to_date}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            to_date: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {selectedManager.to_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user && (
              <>
                {!isDeleting && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleEdit}
                          className="btn-primary flex-1"
                        >
                          Save Changes
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

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 mb-4">
                      Are you sure you want to delete this manager record? This
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
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
