'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  daily_word_reminder: boolean;
  quiz_reminder: boolean;
  challenge_reminder: boolean;
  achievement_notifications: boolean;
  community_updates: boolean;
  reminder_time: string;
}

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    daily_word_reminder: true,
    quiz_reminder: true,
    challenge_reminder: true,
    achievement_notifications: true,
    community_updates: false,
    reminder_time: '09:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      // In a real app, this would fetch from the database
      // For now, we'll use localStorage
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to the database
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      setMessage('Instellingen opgeslagen!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Fout bij opslaan van instellingen');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setMessage('Push notificaties zijn ingeschakeld!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Push notificaties zijn uitgeschakeld');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Inloggen vereist</h1>
            <p className="text-gray-600 mb-6">Je moet ingelogd zijn om notificatie instellingen te beheren.</p>
            <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Inloggen
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Instellingen laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificatie Instellingen</h1>
            <p className="text-gray-600">Beheer je notificatie voorkeuren voor Stratalia</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('Fout') 
                ? 'bg-red-50 border border-red-200 text-red-600' 
                : 'bg-green-50 border border-green-200 text-green-600'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Algemene Instellingen</h2>
            
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Notificaties</h3>
                  <p className="text-sm text-gray-600">Ontvang notificaties via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Push Notificaties</h3>
                  <p className="text-sm text-gray-600">Ontvang push notificaties in je browser</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.push_notifications}
                      onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <button
                    onClick={requestNotificationPermission}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Toestemming
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Specifieke Notificaties</h2>
            
            <div className="space-y-6">
              {/* Daily Word Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Woord van de Dag</h3>
                  <p className="text-sm text-gray-600">Herinnering voor het dagelijkse woord</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.daily_word_reminder}
                    onChange={(e) => handleSettingChange('daily_word_reminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Quiz Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quiz Herinnering</h3>
                  <p className="text-sm text-gray-600">Herinnering om dagelijks een quiz te doen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quiz_reminder}
                    onChange={(e) => handleSettingChange('quiz_reminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Challenge Reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Challenge Herinnering</h3>
                  <p className="text-sm text-gray-600">Notificaties over nieuwe challenges</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.challenge_reminder}
                    onChange={(e) => handleSettingChange('challenge_reminder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Achievement Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Prestatie Notificaties</h3>
                  <p className="text-sm text-gray-600">Notificaties bij level ups en achievements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.achievement_notifications}
                    onChange={(e) => handleSettingChange('achievement_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Community Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Community Updates</h3>
                  <p className="text-sm text-gray-600">Notificaties over goedgekeurde community bijdragen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.community_updates}
                    onChange={(e) => handleSettingChange('community_updates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Herinnering Tijd</h2>
            
            <div className="flex items-center space-x-4">
              <label htmlFor="reminder-time" className="text-lg font-medium text-gray-900">
                Dagelijkse herinnering om:
              </label>
              <input
                id="reminder-time"
                type="time"
                value={settings.reminder_time}
                onChange={(e) => handleSettingChange('reminder_time', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Opslaan...' : 'Instellingen Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
