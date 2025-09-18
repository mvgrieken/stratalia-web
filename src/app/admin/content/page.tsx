'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import RequireAdmin from '@/components/RequireAdmin';
import { canModerateContent } from '@/lib/auth-roles';
import LoadingSpinner from '@/components/LoadingSpinner';
import OptimizedImage from '@/components/OptimizedImage';

interface ContentProposal {
  id: string;
  proposal_type: 'new' | 'update' | 'metadata_change';
  proposed_data: any;
  source_type: 'auto_discovery' | 'community' | 'admin';
  contributor_id?: string;
  contributor_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  priority_score: number;
  created_at: string;
  existing_item?: {
    id: string;
    title: string;
    type: string;
  };
}

export default function AdminContentPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ContentProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadProposals();
  }, [filter]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? '' : `&status=${filter}`;
      const response = await fetch(`/api/admin/content-proposals?limit=50${statusFilter}`);
      
      if (!response.ok) {
        throw new Error('Failed to load content proposals');
      }
      
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError('Fout bij laden van content voorstellen');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    setActionLoading(proposalId);
    
    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          action: 'approve',
          notes: 'Approved via admin interface'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve content');
      }

      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, status: 'approved' as const, moderated_at: new Date().toISOString() }
          : p
      ));

      setError(null);
      
    } catch (err) {
      console.error('Error approving content:', err);
      setError(err instanceof Error ? err.message : 'Fout bij goedkeuren van content');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: string, reason?: string) => {
    setActionLoading(proposalId);
    
    try {
      const response = await fetch('/api/admin/moderate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          action: 'reject',
          notes: reason || 'Rejected via admin interface'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject content');
      }

      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, status: 'rejected' as const, moderated_at: new Date().toISOString() }
          : p
      ));

      setError(null);
      
    } catch (err) {
      console.error('Error rejecting content:', err);
      setError(err instanceof Error ? err.message : 'Fout bij afwijzen van content');
    } finally {
      setActionLoading(null);
    }
  };

  const getProposalTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return '✨';
      case 'update': return '🔄';
      case 'metadata_change': return '📝';
      default: return '📄';
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'auto_discovery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'book': return '📚';
      case 'podcast': return '🎧';
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'music': return '🎵';
      default: return '📄';
    }
  };

  if (!user || !canModerateContent(user.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Geen toegang
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen rechten voor content moderatie
          </p>
        </div>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Content Moderatie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Beheer content voorstellen en goedkeuringen
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
                    {status === 'pending' && proposals.filter(p => p.status === 'pending').length > 0 && (
                      <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 py-0.5 px-2 rounded-full text-xs">
                        {proposals.filter(p => p.status === 'pending').length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

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
              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Geen content voorstellen gevonden voor filter: {filter}
                  </p>
                </div>
              ) : (
                proposals.map((proposal) => (
                  <div key={proposal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">
                            {getProposalTypeIcon(proposal.proposal_type)}
                          </span>
                          <span className="text-lg">
                            {getContentTypeIcon(proposal.proposed_data.content_type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(proposal.source_type)}`}>
                            {proposal.source_type === 'auto_discovery' && 'Automatisch gevonden'}
                            {proposal.source_type === 'community' && 'Community voorstel'}
                            {proposal.source_type === 'admin' && 'Admin toevoeging'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Prioriteit: {proposal.priority_score}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {proposal.proposed_data.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {proposal.proposed_data.description}
                        </p>

                        {proposal.proposed_data.thumbnail_url && (
                          <div className="mb-4">
                            <OptimizedImage
                              src={proposal.proposed_data.thumbnail_url}
                              alt={proposal.proposed_data.title}
                              width={200}
                              height={150}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <strong>Type:</strong> {proposal.proposed_data.content_type}
                          </div>
                          <div>
                            <strong>Bron:</strong> {proposal.proposed_data.source_url ? (
                              <a 
                                href={proposal.proposed_data.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Bekijk bron
                              </a>
                            ) : 'Geen URL'}
                          </div>
                          {proposal.contributor_name && (
                            <div>
                              <strong>Voorgesteld door:</strong> {proposal.contributor_name}
                            </div>
                          )}
                          <div>
                            <strong>Datum:</strong> {new Date(proposal.created_at).toLocaleDateString('nl-NL')}
                          </div>
                        </div>

                        {proposal.existing_item && (
                          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              <strong>Update voor bestaand item:</strong> {proposal.existing_item.title}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {proposal.status === 'pending' && (
                        <div className="flex flex-col gap-2 ml-6">
                          <button
                            onClick={() => handleApprove(proposal.id)}
                            disabled={actionLoading === proposal.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === proposal.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              '✅ Goedkeuren'
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = window.prompt('Reden voor afwijzing (optioneel):');
                              if (reason !== null) { // null means cancelled
                                handleReject(proposal.id, reason);
                              }
                            }}
                            disabled={actionLoading === proposal.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                          >
                            ❌ Afwijzen
                          </button>
                        </div>
                      )}

                      {proposal.status !== 'pending' && (
                        <div className="ml-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            proposal.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {proposal.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                          </span>
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
              onClick={loadProposals}
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
      </div>
    </RequireAdmin>
  );
}
