'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface VerificationStatus {
  email: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  last_sign_in: string | null;
  hours_since_registration: number;
  can_resend: boolean;
  needs_verification: boolean;
}

interface EmailVerificationStatusProps {
  email: string;
  onVerified?: () => void;
  onResendSuccess?: () => void;
  className?: string;
}

export default function EmailVerificationStatus({ 
  email, 
  onVerified, 
  onResendSuccess,
  className = '' 
}: EmailVerificationStatusProps) {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      checkVerificationStatus();
    }
  }, [email]);

  const checkVerificationStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/verification-status?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        
        // If user is verified, call the onVerified callback
        if (data.is_verified && onVerified) {
          onVerified();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Kon verificatiestatus niet ophalen');
      }
    } catch (err) {
      logger.error('Error checking verification status:', err);
      setError('Er is een fout opgetreden bij het controleren van de verificatiestatus');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        if (onResendSuccess) {
          onResendSuccess();
        }
        // Refresh status after successful resend
        setTimeout(() => {
          checkVerificationStatus();
        }, 1000);
      } else {
        setError(data.error || 'Verificatiemail kon niet worden verzonden');
      }
    } catch (err) {
      logger.error('Error resending verification:', err);
      setError('Er is een fout opgetreden bij het verzenden van de verificatiemail');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-blue-700">Verificatiestatus controleren...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700">Kon verificatiestatus niet ophalen</p>
      </div>
    );
  }

  if (status.is_verified) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="text-green-600 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-green-800 font-medium">E-mailadres bevestigd</p>
            <p className="text-green-600 text-sm">
              Bevestigd op {new Date(status.verified_at!).toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="text-yellow-600 mr-3 mt-0.5">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-yellow-800 font-medium mb-2">E-mailadres nog niet bevestigd</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Je moet je e-mailadres bevestigen voordat je kunt inloggen. Controleer je inbox voor een verificatielink.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={resendVerification}
              disabled={resending || !status.can_resend}
              className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? 'Verzenden...' : 'Verificatielink opnieuw verzenden'}
            </button>
            
            {!status.can_resend && (
              <p className="text-yellow-600 text-xs">
                Je kunt over {60 - status.hours_since_registration} minuten een nieuwe verificatielink aanvragen.
              </p>
            )}
            
            <div className="text-yellow-600 text-xs space-y-1">
              <p>• Controleer je spamfolder</p>
              <p>• Verificatielinks verlopen na 24 uur</p>
              <p>• Je kunt elke 60 minuten een nieuwe link aanvragen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
