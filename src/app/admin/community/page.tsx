'use client';

import { useState, useEffect, useCallback } from 'react';
import RequireAdmin from '@/components/RequireAdmin';
import LoadingSpinner from '@/components/LoadingSpinner';
import { logger } from '@/lib/logger';

interface CommunitySubmission {
  id: string;
  word: string;
  definition: string;
  example: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  submitted_by_name?: string;
  points_awarded: number;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  reviewed_by?: string;
}

export default function AdminCommunityPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [bulkNotes, setBulkNotes] = useState('');

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? '' : `&status=${filter}`;
      const response = await fetch(`/api/admin/community-submissions?limit=50${statusFilter}`);
      
      if (!response.ok) {
        throw new Error('Failed to load community submissions');
      }
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      logger.error(`Error loading submissions: ${err}`);
      setError('Fout bij laden van community inzendingen');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleApprove = async (submissionId: string, points?: number) => {
    setActionLoading(submissionId);
    
    try {
      const response = await fetch('/api/admin/community-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submissionId,
          action: 'approve',
          points_awarded: points || 10,
          notes: 'Approved via admin interface'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve submission');
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId 
          ? { ...s, status: 'approved' as const, reviewed_at: new Date().toISOString(), points_awarded: points || 10 }
          : s
      ));

      setError(null);
      
    } catch (err) {
      logger.error(`Error approving submission: ${err}`);
      setError(err instanceof Error ? err.message : 'Fout bij goedkeuren van inzending');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string, reason?: string) => {
    setActionLoading(submissionId);
    
    try {
      const response = await fetch('/api/admin/community-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submissionId,
          action: 'reject',
          notes: reason || 'Rejected via admin interface'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject submission');
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId 
          ? { ...s, status: 'rejected' as const, reviewed_at: new Date().toISOString() }
          : s
      ));

      setError(null);
      
    } catch (err) {
      logger.error(`Error rejecting submission: ${err}`);
      setError(err instanceof Error ? err.message : 'Fout bij afwijzen van inzending');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    if (selectedSubmissions.length === 0) return;

    setActionLoading('bulk');
    
    try {
      const promises = selectedSubmissions.map(submissionId => 
        fetch('/api/admin/community-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submission_id: submissionId,
            action: bulkAction,
            points_awarded: bulkAction === 'approve' ? 10 : 0,
            notes: bulkNotes || `${bulkAction === 'approve' ? 'Bulk approved' : 'Bulk rejected'} via admin interface`
          })
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} bulk actions failed`);
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        selectedSubmissions.includes(s.id)
          ? { 
              ...s, 
              status: bulkAction as 'approved' | 'rejected', 
              reviewed_at: new Date().toISOString(),
              points_awarded: bulkAction === 'approve' ? 10 : 0
            }
          : s
      ));

      setSelectedSubmissions([]);
      setShowBulkModal(false);
      setBulkNotes('');
      setError(null);
      
    } catch (err) {
      logger.error(`Error in bulk action: ${err}`);
      setError(err instanceof Error ? err.message : 'Fout bij bulk actie');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Goedgekeurd';
      case 'rejected': return 'Afgewezen';
      default: return 'In behandeling';
    }
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Community Moderatie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Beheer community woord inzendingen
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === status
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {status === 'pending' && 'Wachtend'}
                    {status === 'approved' && 'Goedgekeurd'}
                    {status === 'rejected' && 'Afgewezen'}
                    {status === 'all' && 'Alle'}
                    {status === 'pending' && submissions.filter(s => s.status === 'pending').length > 0 && (
                      <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 py-0.5 px-2 rounded-full text-xs">
                        {submissions.filter(s => s.status === 'pending').length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSubmissions.length > 0 && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-200">
                  {selectedSubmissions.length} inzending(en) geselecteerd
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bulk Actie
                  </button>
                  <button
                    onClick={() => setSelectedSubmissions([])}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Selectie wissen
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Geen community inzendingen gevonden voor filter: {filter}
                  </p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.includes(submission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubmissions([...selectedSubmissions, submission.id]);
                              } else {
                                setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {submission.word}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                          {submission.points_awarded > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              +{submission.points_awarded} punten
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Definitie:</span>
                            <p className="text-gray-900 dark:text-white">{submission.definition}</p>
                          </div>
                          
                          {submission.example && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voorbeeld:</span>
                              <p className="text-gray-900 dark:text-white italic">"{submission.example}"</p>
                            </div>
                          )}
                          
                          {submission.review_notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Opmerkingen:</span>
                              <p className="text-gray-900 dark:text-white">{submission.review_notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <strong>Ingediend door:</strong> {submission.submitted_by_name || submission.submitted_by}
                          </div>
                          <div>
                            <strong>Datum:</strong> {new Date(submission.created_at).toLocaleDateString('nl-NL')}
                          </div>
                          {submission.reviewed_at && (
                            <div>
                              <strong>Beoordeeld op:</strong> {new Date(submission.reviewed_at).toLocaleDateString('nl-NL')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {submission.status === 'pending' && (
                        <div className="flex flex-col gap-2 ml-6">
                          <button
                            onClick={() => {
                              const points = window.prompt('Punten toekennen (standaard: 10):', '10');
                              const pointsNum = points ? parseInt(points) : 10;
                              if (!isNaN(pointsNum)) {
                                handleApprove(submission.id, pointsNum);
                              }
                            }}
                            disabled={actionLoading === submission.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === submission.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              '✅ Goedkeuren'
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = window.prompt('Reden voor afwijzing (optioneel):');
                              if (reason !== null) { // null means cancelled
                                handleReject(submission.id, reason);
                              }
                            }}
                            disabled={actionLoading === submission.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                          >
                            ❌ Afwijzen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={loadSubmissions}
              disabled={loading}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Vernieuwen
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Terug naar Admin
            </button>
          </div>
        </div>

        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Bulk Actie
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Je gaat {bulkAction === 'approve' ? 'goedkeuren' : 'afwijzen'} voor {selectedSubmissions.length} inzending(en).
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actie
                  </label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as 'approve' | 'reject')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="approve">Goedkeuren</option>
                    <option value="reject">Afwijzen</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notities (optioneel)
                  </label>
                  <textarea
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Reden voor bulk actie..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBulkAction}
                    disabled={actionLoading === 'bulk'}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'bulk' ? 'Bezig...' : 'Uitvoeren'}
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkNotes('');
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
    </RequireAdmin>
  );
}