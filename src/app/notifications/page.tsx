'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'daily_word' | 'streak' | 'achievement' | 'quiz' | 'community';
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkNotificationPermission();
    fetchNotifications();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        // Show welcome notification
        new Notification('Straatpraat Notificaties', {
          body: 'Je ontvangt nu meldingen voor nieuwe woorden en prestaties!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Woord van de Dag',
          message: 'Het woord van vandaag is "skeer" - arm, weinig geld hebben',
          type: 'daily_word',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Streak Alert!',
          message: 'Je streak van 7 dagen is bijna voorbij. Speel een quiz om je streak te behouden!',
          type: 'streak',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          title: 'Nieuwe Achievement!',
          message: 'Gefeliciteerd! Je hebt de "Woordkenner" badge verdiend.',
          type: 'achievement',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          title: 'Quiz Resultaat',
          message: 'Geweldig! Je hebt 4/5 vragen correct beantwoord in je laatste quiz.',
          type: 'quiz',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '5',
          title: 'Community Update',
          message: 'Je ingediende woord "flexen" is goedgekeurd! Je ontvangt 50 punten.',
          type: 'community',
          read: true,
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'daily_word': return '📅';
      case 'streak': return '🔥';
      case 'achievement': return '🏆';
      case 'quiz': return '🧠';
      case 'community': return '👥';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'daily_word': return 'border-blue-200 bg-blue-50';
      case 'streak': return 'border-orange-200 bg-orange-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      case 'quiz': return 'border-purple-200 bg-purple-50';
      case 'community': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Notificaties worden geladen...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Notificaties {unreadCount > 0 && `(${unreadCount})`}
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Alles als gelezen markeren
              </button>
            )}
          </div>

          {/* Notification Permission */}
          {permission === 'default' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Push Notificaties</h3>
                  <p className="text-blue-800 text-sm">
                    Ontvang meldingen voor nieuwe woorden, prestaties en herinneringen.
                  </p>
                </div>
                <button
                  onClick={requestNotificationPermission}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Inschakelen
                </button>
              </div>
            </div>
          )}

          {permission === 'granted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <p className="text-green-800 text-sm">
                  Push notificaties zijn ingeschakeld. Je ontvangt meldingen voor nieuwe woorden en prestaties.
                </p>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <p className="text-red-800 text-sm">
                  Push notificaties zijn uitgeschakeld. Je kunt ze inschakelen in je browser instellingen.
                </p>
              </div>
            </div>
          )}

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    notification.read 
                      ? 'bg-white border-gray-200' 
                      : `${getNotificationColor(notification.type)} border-opacity-50`
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${
                        notification.read ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">Geen notificaties</p>
              <p className="text-gray-400 text-sm mt-2">
                Je ontvangt hier meldingen voor nieuwe woorden en prestaties
              </p>
            </div>
          )}

          {/* Notification Settings */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificatie Instellingen</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Woord van de Dag</h4>
                  <p className="text-sm text-gray-600">Dagelijkse herinnering om het nieuwe woord te bekijken</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Streak Herinneringen</h4>
                  <p className="text-sm text-gray-600">Waarschuwing wanneer je streak bijna voorbij is</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Achievement Meldingen</h4>
                  <p className="text-sm text-gray-600">Notificaties wanneer je een nieuwe badge verdient</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
