import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultImageQuality: 'standard' | 'high' | 'ultra';
  defaultTextLength: 'short' | 'medium' | 'long';
  autoSaveHistory: boolean;
  showSuggestions: boolean;
  language: string;
  voiceSpeed: number;
}

interface HistoryItem {
  id: string;
  type: 'image' | 'text' | 'voice';
  title: string;
  content: string;
  timestamp: Date;
  favorite: boolean;
}

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    defaultImageQuality: 'high',
    defaultTextLength: 'medium',
    autoSaveHistory: true,
    showSuggestions: true,
    language: 'en',
    voiceSpeed: 1.0
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'favorites'>('preferences');

  useEffect(() => {
    loadPreferences();
    loadHistory();
  }, []);

  const loadPreferences = () => {
    const stored = localStorage.getItem('visora_preferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  };

  const loadHistory = () => {
    const stored = localStorage.getItem('visora_history');
    if (stored) {
      const allHistory = JSON.parse(stored);
      setHistory(allHistory);
      setFavorites(allHistory.filter((item: HistoryItem) => item.favorite));
    } else {
      // Mock history data
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          type: 'image',
          title: 'Landscape Analysis',
          content: 'Analyzed mountain landscape photo',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          favorite: true
        },
        {
          id: '2',
          type: 'text',
          title: 'Article Summary',
          content: 'Summarized AI research paper',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          favorite: false
        },
        {
          id: '3',
          type: 'image',
          title: 'Educational Diagram',
          content: 'Generated photosynthesis diagram',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          favorite: true
        }
      ];
      setHistory(mockHistory);
      setFavorites(mockHistory.filter(item => item.favorite));
    }
  };

  const savePreferences = () => {
    localStorage.setItem('visora_preferences', JSON.stringify(preferences));
    alert('✅ Preferences saved successfully!');
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    setHistory(updatedHistory);
    setFavorites(updatedHistory.filter(item => item.favorite));
    localStorage.setItem('visora_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    setFavorites(updatedHistory.filter(item => item.favorite));
    localStorage.setItem('visora_history', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      setFavorites([]);
      localStorage.removeItem('visora_history');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'text': return '💬';
      case 'voice': return '🎙️';
      default: return '📄';
    }
  };

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            ⚙️ Settings & Personalization
          </h1>
          <p className="text-lg text-slate-600">
            Customize your Visora experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-3 mb-8">
          {(['preferences', 'history', 'favorites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:shadow-md'
              }`}
            >
              {tab === 'preferences' ? '⚙️ Preferences' : tab === 'history' ? '📜 History' : '⭐ Favorites'}
            </button>
          ))}
        </div>

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Display Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updatePreference('theme', theme)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferences.theme === theme
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
                        </div>
                        <div className="font-medium capitalize">{theme}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-3">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">AI Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-3">Default Image Quality</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['standard', 'high', 'ultra'] as const).map((quality) => (
                      <button
                        key={quality}
                        onClick={() => updatePreference('defaultImageQuality', quality)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferences.defaultImageQuality === quality
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{quality}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-3">Default Text Length</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['short', 'medium', 'long'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => updatePreference('defaultTextLength', length)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferences.defaultTextLength === length
                            ? 'border-green-600 bg-green-50'
                            : 'border-slate-200 hover:border-green-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{length}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-3">Voice Speed: {preferences.voiceSpeed}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={preferences.voiceSpeed}
                    onChange={(e) => updatePreference('voiceSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                    <span>0.5x (Slower)</span>
                    <span>2x (Faster)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Privacy & Data</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">Auto-save History</div>
                    <div className="text-sm text-slate-600">Automatically save your activity</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoSaveHistory}
                    onChange={(e) => updatePreference('autoSaveHistory', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">Show AI Suggestions</div>
                    <div className="text-sm text-slate-600">Get personalized recommendations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showSuggestions}
                    onChange={(e) => updatePreference('showSuggestions', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={savePreferences}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              💾 Save Preferences
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Activity History</h3>
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-slate-600">No history yet. Start using Visora!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{item.title}</div>
                          <div className="text-sm text-slate-600">{item.content}</div>
                          <div className="text-xs text-slate-500 mt-1">{formatDate(item.timestamp)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.favorite ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'
                          }`}
                        >
                          <i className={`fa-${item.favorite ? 'solid' : 'regular'} fa-star text-xl`}></i>
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Favorite Items</h3>

              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⭐</div>
                  <p className="text-slate-600">No favorites yet. Star items to see them here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{getTypeIcon(item.type)}</div>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="text-yellow-500"
                        >
                          <i className="fa-solid fa-star text-xl"></i>
                        </button>
                      </div>
                      <div className="font-bold text-slate-800 mb-2">{item.title}</div>
                      <div className="text-sm text-slate-600 mb-3">{item.content}</div>
                      <div className="text-xs text-slate-500">{formatDate(item.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
