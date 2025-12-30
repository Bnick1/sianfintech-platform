// src/pages/admin/Database.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Database = () => {
  const [backupStatus, setBackupStatus] = useState('idle');
  const [restoreStatus, setRestoreStatus] = useState('idle');
  const [selectedBackup, setSelectedBackup] = useState('');

  const backups = [
    {
      id: 1,
      name: 'backup_2024_01_15_103000.zip',
      size: '2.4 GB',
      createdAt: '2024-01-15T10:30:00Z',
      type: 'automatic'
    },
    {
      id: 2,
      name: 'backup_2024_01_14_103000.zip',
      size: '2.3 GB',
      createdAt: '2024-01-14T10:30:00Z',
      type: 'automatic'
    },
    {
      id: 3,
      name: 'backup_2024_01_13_103000.zip',
      size: '2.3 GB',
      createdAt: '2024-01-13T10:30:00Z',
      type: 'automatic'
    },
    {
      id: 4,
      name: 'manual_backup_2024_01_12.zip',
      size: '2.2 GB',
      createdAt: '2024-01-12T15:45:00Z',
      type: 'manual'
    }
  ];

  const handleBackup = async () => {
    setBackupStatus('in-progress');
    // Simulate backup process
    setTimeout(() => {
      setBackupStatus('completed');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }, 3000);
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    
    setRestoreStatus('in-progress');
    // Simulate restore process
    setTimeout(() => {
      setRestoreStatus('completed');
      setTimeout(() => setRestoreStatus('idle'), 3000);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-lg">Sian</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Database Management</h1>
                <p className="text-sm text-gray-600">Backup, restore, and maintain system data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Warning Alert */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Critical System Operation</p>
              <p className="text-red-700 text-sm">Database operations can affect system availability. Proceed with caution.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backup Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Backup</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Last Backup:</strong> Today at 10:30 AM
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Next Automatic Backup:</strong> Tomorrow at 10:30 AM
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Backup Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="full">Full System Backup</option>
                  <option value="database">Database Only</option>
                  <option value="files">Files Only</option>
                </select>
              </div>

              <button
                onClick={handleBackup}
                disabled={backupStatus === 'in-progress'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              >
                {backupStatus === 'in-progress' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Backup...
                  </>
                ) : backupStatus === 'completed' ? (
                  '✓ Backup Created Successfully'
                ) : (
                  'Create Manual Backup'
                )}
              </button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restore Backup</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Restoring a backup will overwrite current data. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Backup
                </label>
                <select
                  value={selectedBackup}
                  onChange={(e) => setSelectedBackup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a backup file...</option>
                  {backups.map(backup => (
                    <option key={backup.id} value={backup.id}>
                      {backup.name} ({backup.size}) - {new Date(backup.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRestore}
                disabled={!selectedBackup || restoreStatus === 'in-progress'}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              >
                {restoreStatus === 'in-progress' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Restoring Backup...
                  </>
                ) : restoreStatus === 'completed' ? (
                  '✓ Backup Restored Successfully'
                ) : (
                  'Restore Selected Backup'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Backups</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {backup.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.type === 'automatic' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Download
                      </button>
                      <button 
                        onClick={() => setSelectedBackup(backup.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Restore
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">2.4 GB</div>
            <p className="text-sm text-gray-600">Database Size</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">12</div>
            <p className="text-sm text-gray-600">Available Backups</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">98%</div>
            <p className="text-sm text-gray-600">Storage Health</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Database;