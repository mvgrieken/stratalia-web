'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

interface PinLoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  onSwitchToPassword?: () => void;
}

export default function PinLoginForm({ 
  onSuccess, 
  onError, 
  onSwitchToPassword 
}: PinLoginFormProps) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStep('pin');
      // Focus first PIN input
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only single digits
    if (value && !/^\d$/.test(value)) return; // Only numbers

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-advance to next input
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }

    // Auto-submit when PIN is complete
    if (index === 5 && value) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        handlePinSubmit(fullPin);
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Move to previous input on backspace
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinSubmit = async (fullPin?: string) => {
    const pinCode = fullPin || pin.join('');
    
    if (pinCode.length !== 6) {
      onError?.('Voer een complete 6-cijferige PIN in');
      return;
    }

    setLoading(true);

    try {
      // First verify PIN with backend
      const verifyResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          pin: pinCode
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          onError?.('Te veel mislukte pogingen. Gebruik je wachtwoord om in te loggen.');
          // Clear stored refresh tokens for security
          localStorage.removeItem('supabase.auth.token');
          setTimeout(() => {
            onSwitchToPassword?.();
          }, 2000);
          return;
        }
        
        onError?.(verifyData.error || 'Ongeldige PIN. Probeer opnieuw.');
        
        // Clear PIN inputs
        setPin(['', '', '', '', '', '']);
        pinRefs.current[0]?.focus();
        return;
      }

      // PIN verified, now restore session if refresh token available
      const supabase = getSupabaseClient();
      
      if (verifyData.refresh_token) {
        // Use provided refresh token to establish session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: verifyData.access_token,
          refresh_token: verifyData.refresh_token
        });

        if (sessionError) {
          logger.error(`Session restoration error: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`);
          onError?.('Sessie herstellen mislukt. Log opnieuw in met je wachtwoord.');
          return;
        }

        if (sessionData.session) {
          logger.info('PIN login successful');
          onSuccess?.(sessionData.session.user);
          router.push('/dashboard');
        }
      } else {
        onError?.('Geen geldige sessie gevonden. Log opnieuw in met je wachtwoord.');
      }

    } catch (error) {
          logger.error(`PIN login error: ${error instanceof Error ? error.message : String(error)}`);
      onError?.('Er is een fout opgetreden bij PIN inloggen');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            E-mailadres
          </label>
          <input
            id="pin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@email.com"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            autoComplete="email"
          />
        </div>
        
        <button
          type="submit"
          disabled={!email.trim()}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors font-medium"
        >
          Volgende
        </button>
        
        <button
          type="button"
          onClick={onSwitchToPassword}
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
        >
          Inloggen met wachtwoord
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Voer je PIN-code in
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Voer de 6-cijferige PIN in die je hebt ingesteld voor {email}
        </p>
      </div>

      <div className="flex justify-center space-x-3">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { pinRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handlePinChange(index, e.target.value)}
            onKeyDown={(e) => handlePinKeyDown(index, e)}
            className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            aria-label={`PIN cijfer ${index + 1}`}
          />
        ))}
      </div>

      {attempts > 0 && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          {attempts === 1 && 'Ongeldige PIN. Nog 2 pogingen.'}
          {attempts === 2 && 'Ongeldige PIN. Nog 1 poging.'}
          {attempts >= 3 && 'Te veel mislukte pogingen. Je wordt doorgestuurd naar wachtwoord login.'}
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <button
          type="button"
          onClick={() => handlePinSubmit()}
          disabled={loading || pin.join('').length !== 6}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Inloggen...
            </div>
          ) : (
            'Inloggen met PIN'
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setStep('email')}
          disabled={loading}
          className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm"
        >
          ← Ander e-mailadres
        </button>
        
        <button
          type="button"
          onClick={onSwitchToPassword}
          disabled={loading}
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
        >
          PIN vergeten? Inloggen met wachtwoord
        </button>
      </div>
    </div>
  );
}
