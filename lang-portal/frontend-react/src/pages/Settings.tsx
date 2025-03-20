import React, { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, Globe, Volume2, BookOpen, Shield, Trash2, Download, Upload, Loader2 } from 'lucide-react';
import { getUserPreferences, updateUserPreferences, exportUserData, importUserData, resetUserProgress, APIError } from '../lib/api';

interface PreferenceSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function Settings() {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    audioEnabled: true,
    showTransliteration: true,
    autoAdvance: false,
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserPreferences();
      setPreferences({
        theme: data.theme,
        notifications: data.notifications,
        audioEnabled: data.audio_enabled,
        showTransliteration: data.show_transliteration,
        autoAdvance: data.auto_advance,
        language: data.language
      });
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateUserPreferences({
        theme: preferences.theme,
        notifications: preferences.notifications,
        audio_enabled: preferences.audioEnabled,
        show_transliteration: preferences.showTransliteration,
        auto_advance: preferences.autoAdvance,
        language: preferences.language
      });
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arabic-learning-data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importUserData(file);
      await loadPreferences(); // Reload preferences after import
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to import data');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      return;
    }

    try {
      await resetUserProgress();
      await loadPreferences(); // Reload preferences after reset
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to reset progress');
    }
  };

  const sections: PreferenceSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize how the application looks',
      icon: <Sun className="h-6 w-6 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: <Bell className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Enable Notifications</h4>
              <p className="text-sm text-gray-500">Receive study reminders and updates</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
              className={`${
                preferences.notifications ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'language',
      title: 'Language & Region',
      description: 'Set your preferred language and regional settings',
      icon: <Globe className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Interface Language
            </label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'study',
      title: 'Study Preferences',
      description: 'Customize your learning experience',
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Audio Pronunciation</h4>
              <p className="text-sm text-gray-500">Play audio for vocabulary words</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, audioEnabled: !preferences.audioEnabled })}
              className={`${
                preferences.audioEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.audioEnabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show Transliteration</h4>
              <p className="text-sm text-gray-500">Display pronunciation guide for Arabic text</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, showTransliteration: !preferences.showTransliteration })}
              className={`${
                preferences.showTransliteration ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.showTransliteration ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-advance Cards</h4>
              <p className="text-sm text-gray-500">Automatically move to next card after response</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, autoAdvance: !preferences.autoAdvance })}
              className={`${
                preferences.autoAdvance ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.autoAdvance ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Manage your learning data and progress',
      icon: <Shield className="h-6 w-6 text-red-500" />,
      content: (
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Study Data
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Study Data
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Progress
            </button>
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Settings</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Customize your learning experience and manage your preferences
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <div className="px-4 py-6 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                {section.icon}
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="mt-6">{section.content}</div>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => loadPreferences()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            saving ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}