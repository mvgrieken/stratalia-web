'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import EmailVerificationStatus from './EmailVerificationStatus';

interface EmailVerificationBannerProps {
  className?: string;
}

export default function EmailVerificationBanner({ className = '' }: EmailVerificationBannerProps) {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    if (user?.email) {
      checkEmailVerificationStatus();
    }
  }, [user]);

  const checkEmailVerificationStatus = async () => {
    try {
      const response = await fetch(`/api/auth/verification-status?email=${encodeURIComponent(user!.email)}`);
      if (response.ok) {
        const data = await response.json();
        setEmailVerified(data.is_verified);
        setShowBanner(!data.is_verified);
      }
    } catch (error) {
      console.error('Error checking email verification status:', error);
    }
  };

  if (!showBanner || !user?.email || emailVerified) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            E-mailadres nog niet bevestigd
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Je moet je e-mailadres bevestigen om alle functies te kunnen gebruiken. 
              Controleer je inbox voor een verificatielink.
            </p>
          </div>
          <div className="mt-3">
            <EmailVerificationStatus 
              email={user.email}
              onVerified={() => {
                setEmailVerified(true);
                setShowBanner(false);
              }}
              className="mt-2"
            />
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Sluiten</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
