'use client';

import { useState, useEffect } from 'react';
import RequireAdmin from '@/components/RequireAdmin';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
}

// _UserManagementProps reserved for future props extension
interface _UserManagementProps {}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateRole, setUpdateRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [updateNotes, setUpdateNotes] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const promises = selectedUsers.map(userId => 
        fetch('/api/admin/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            new_role: updateRole,
            notes: updateNotes
          })
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} role updates failed`);
      }

      // Refresh users list
      await fetchUsers();
      setSelectedUsers([]);
      setShowUpdateModal(false);
      setUpdateNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles');
    }
  };

  const blockUsers = async (ids: string[], reason?: string) => {
    const res = await Promise.all(
      ids.map((id) => fetch('/api/admin/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id, reason })
      }))
    );
    const failed = res.filter(r => !r.ok);
    if (failed.length) throw new Error(`${failed.length} blokkeringen mislukt`);
  };

  const unblockUsers = async (ids: string[]) => {
    const res = await Promise.all(
      ids.map((id) => fetch('/api/admin/unblock-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id })
      }))
    );
    const failed = res.filter(r => !r.ok);
    if (failed.length) throw new Error(`${failed.length} deblokkeringen mislukt`);
  };

  const handleBlockSelected = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const reason = window.prompt('Reden voor blokkeren (optioneel):') || undefined;
      await blockUsers(selectedUsers, reason);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blokkeren mislukt');
    }
  };

  const handleUnblockSelected = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await unblockUsers(selectedUsers);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deblokkeren mislukt');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Gebruikers worden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <RequireAdmin>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gebruikersbeheer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Beheer gebruikersrollen en toegangsrechten
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Zoek gebruikers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Alle rollen</option>
                <option value="user">Gebruiker</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Rollen bijwerken ({selectedUsers.length})
                </button>
                <button
                  onClick={handleBlockSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Blokkeren ({selectedUsers.length})
                </button>
                <button
                  onClick={handleUnblockSelected}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Deblokkeren ({selectedUsers.length})
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Selectie wissen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Fout
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gebruiker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aangemaakt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Laatste login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || 'Geen naam'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'moderator' ? 'Moderator' : 'Gebruiker'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('nl-NL') : 'Nooit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.is_active ? 'Actief' : 'Inactief'}
                        </span>
                        {user.is_active ? (
                          <button
                            onClick={async () => {
                              setActionLoadingId(user.id);
                              try {
                                await blockUsers([user.id]);
                                await fetchUsers();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Blokkeren mislukt');
                              } finally {
                                setActionLoadingId(null);
                              }
                            }}
                            disabled={actionLoadingId === user.id}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoadingId === user.id ? '...' : 'Blokkeer'}
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              setActionLoadingId(user.id);
                              try {
                                await unblockUsers([user.id]);
                                await fetchUsers();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Deblokkeren mislukt');
                              } finally {
                                setActionLoadingId(null);
                              }
                            }}
                            disabled={actionLoadingId === user.id}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoadingId === user.id ? '...' : 'Deblokkeer'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Geen gebruikers gevonden</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Probeer je zoekcriteria aan te passen.
              </p>
            </div>
          )}
        </div>

        {/* Update Role Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Rollen bijwerken
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Je gaat de rol bijwerken voor {selectedUsers.length} gebruiker(s).
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nieuwe rol
                  </label>
                  <select
                    value={updateRole}
                    onChange={(e) => setUpdateRole(e.target.value as 'user' | 'moderator' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">Gebruiker</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notities (optioneel)
                  </label>
                  <textarea
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Reden voor rolwijziging..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRoleUpdate}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bijwerken
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateNotes('');
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RequireAdmin>
  );
}