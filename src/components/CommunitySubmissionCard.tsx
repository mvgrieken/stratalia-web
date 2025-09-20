'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface CommunitySubmission {
  id: string;
  word: string;
  definition: string;
  example?: string;
  context?: string;
  source?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string | null;
  submitted_by_name: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  like_count?: number;
  user_has_liked?: boolean;
}

interface CommunitySubmissionCardProps {
  submission: CommunitySubmission;
  showStatus?: boolean;
  onLikeChange?: (submissionId: string, newLikeCount: number, hasLiked: boolean) => void;
  className?: string;
}

export default function CommunitySubmissionCard({
  submission,
  showStatus = true,
  onLikeChange,
  className = ''
}: CommunitySubmissionCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(submission.like_count || 0);
  const [hasLiked, setHasLiked] = useState(submission.user_has_liked || false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Goedgekeurd';
      case 'rejected':
        return '❌ Afgewezen';
      case 'pending':
      default:
        return '⏳ In behandeling';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      const action = hasLiked ? 'unlike' : 'like';
      const response = await fetch('/api/community/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submission.id,
          action
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        const newLikeCount = hasLiked ? likeCount - 1 : likeCount + 1;
        const newHasLiked = !hasLiked;
        
        setLikeCount(newLikeCount);
        setHasLiked(newHasLiked);
        
        // Notify parent component
        onLikeChange?.(submission.id, newLikeCount, newHasLiked);
        
        logger.info(`Like action successful: ${action} on submission ${submission.id}`);
      } else {
        const errorData = await response.json();
        logger.error(`Like action failed: ${errorData.error || 'Unknown error'}`);
        
        // Show error feedback
        const button = document.querySelector(`[data-submission-id="${submission.id}"] .like-button`);
        if (button) {
          const originalText = button.textContent;
          button.textContent = '❌';
          button.className = button.className.replace('hover:bg-blue-100', 'bg-red-100');
          setTimeout(() => {
            button.textContent = originalText;
            button.className = button.className.replace('bg-red-100', 'hover:bg-blue-100');
          }, 2000);
        }
      }
    } catch (error) {
      logger.error(`Error handling like: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {submission.word}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {submission.definition}
          </p>
          {submission.example && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{submission.example}"
            </p>
          )}
        </div>
        {showStatus && (
          <div className="ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
              {getStatusLabel(submission.status)}
            </span>
          </div>
        )}
      </div>

      {/* Like Button and Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            data-submission-id={submission.id}
            className={`like-button flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              hasLiked
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-lg">
              {hasLiked ? '❤️' : '🤍'}
            </span>
            <span className="text-sm font-medium">
              {isLiking ? '...' : likeCount}
            </span>
          </button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          door {submission.submitted_by_name} • {formatDate(submission.created_at)}
        </div>
      </div>

      {/* Rejection Reason */}
      {submission.status === 'rejected' && submission.rejection_reason && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Reden voor afwijzing:
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            {submission.rejection_reason}
          </p>
        </div>
      )}

      {/* Additional Info */}
      {(submission.context || submission.source) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {submission.context && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Context:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{submission.context}</span>
            </div>
          )}
          {submission.source && (
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bron:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{submission.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
