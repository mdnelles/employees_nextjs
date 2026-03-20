'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useThemeLanguage } from '@/components/ThemeLanguageProvider';
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
  const { t } = useThemeLanguage();
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
        <p className="text-lg text-gray-600 dark:text-gray-400">{t.loadingManagers}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t.managers}</h1>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="table-header text-left">{t.name}</th>
                <th className="table-header text-left">{t.department}</th>
                <th className="table-header text-left">{t.from}</th>
                <th className="table-header text-left">{t.to}</th>
                <th className="table-header text-left">{t.status}</th>
                <th className="table-header text-left"></th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => {
                const isCurrent = isCurrentManager(manager);
                return (
                  <tr key={`${manager.emp_no}-${manager.dept_no}`} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <td className="table-cell font-medium text-gray-900 dark:text-gray-100">
                      {manager.first_name} {manager.last_name}
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-400">
                      {manager.dept_name}
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-400">
                      {manager.from_date}
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-400">
                      {manager.to_date}
                    </td>
                    <td className="table-cell">
                      {isCurrent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {t.current}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {t.former}
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(manager);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                      >
                        {t.details}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {selectedManager.first_name} {selectedManager.last_name}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t.department}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedManager.dept_name}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t.gender}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedManager.gender}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t.hireDate}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedManager.hire_date}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t.status}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isCurrentManager(selectedManager) ? (
                      <span className="text-green-600 dark:text-green-400">{t.current}</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">{t.former}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Employment Period */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{t.employmentPeriod}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.fromDate}
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
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {selectedManager.from_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.toDate}
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
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
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
                          {t.saveChanges}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-secondary flex-1"
                        >
                          {t.cancel}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-primary flex-1"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => setIsDeleting(true)}
                          className="btn-danger flex-1"
                        >
                          {t.delete}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-4">
                    <p className="text-red-900 dark:text-red-300 mb-4">
                      {t.deleteConfirmManager}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="btn-danger flex-1"
                      >
                        {t.confirmDelete}
                      </button>
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="btn-secondary flex-1"
                      >
                        {t.cancel}
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
