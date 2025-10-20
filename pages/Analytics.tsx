import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

interface UsageStats {
  totalAnalyses: number;
  totalGenerations: number;
  totalProcessingTime: number;
  favoriteFeature: string;
}

interface ActivityLog {
  id: string;
  type: 'image' | 'text' | 'voice';
  action: string;
  timestamp: Date;
  status: 'success' | 'error';
}

const Analytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UsageStats>({
    totalAnalyses: 0,
    totalGenerations: 0,
    totalProcessingTime: 0,
    favoriteFeature: 'Image Intelligence'
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    // Load stats from localStorage
    loadAnalytics();
    loadActivityLog();
  }, [timeRange]);

  const loadAnalytics = () => {
    const stored = localStorage.getItem('visora_analytics');
    if (stored) {
      setStats(JSON.parse(stored));
    } else {
      // Mock data for demonstration
      setStats({
        totalAnalyses: 127,
        totalGenerations: 89,
        totalProcessingTime: 342,
        favoriteFeature: 'Image Intelligence'
      });
    }
  };

  const loadActivityLog = () => {
    const stored = localStorage.getItem('visora_activity_log');
    if (stored) {
      const logs = JSON.parse(stored);
      setActivityLog(logs.slice(0, 10)); // Show last 10
    } else {
      // Mock activity data
      setActivityLog([
        {
          id: '1',
          type: 'image',
          action: 'Analyzed landscape photo',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          status: 'success'
        },
        {
          id: '2',
          type: 'text',
          action: 'Summarized article',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'success'
        },
        {
          id: '3',
          type: 'image',
          action: 'Generated educational image',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'success'
        },
        {
          id: '4',
          type: 'text',
          action: 'Sentiment analysis',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'success'
        }
      ]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'text': return '💬';
      case 'voice': return '🎙️';
      default: return '📊';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            📊 Analytics Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Track your AI usage, insights, and performance metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:shadow-md'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🔍</div>
              <div className="text-green-500 text-sm font-semibold">+23%</div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalAnalyses}</div>
            <div className="text-slate-600 text-sm">Total Analyses</div>
            <div className="mt-3 bg-green-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">✨</div>
              <div className="text-blue-500 text-sm font-semibold">+18%</div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalGenerations}</div>
            <div className="text-slate-600 text-sm">AI Generations</div>
            <div className="mt-3 bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⚡</div>
              <div className="text-orange-500 text-sm font-semibold">-12%</div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalProcessingTime}s</div>
            <div className="text-slate-600 text-sm">Total Processing Time</div>
            <div className="mt-3 bg-orange-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⭐</div>
              <div className="text-purple-500 text-sm font-semibold">Top</div>
            </div>
            <div className="text-xl font-bold text-slate-800 mb-1">{stats.favoriteFeature}</div>
            <div className="text-slate-600 text-sm">Most Used Feature</div>
            <div className="mt-3 bg-purple-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Usage by Feature */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Usage by Feature</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700 font-medium">🖼️ Image Intelligence</span>
                  <span className="text-slate-600">45%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700 font-medium">💬 Text Intelligence</span>
                  <span className="text-slate-600">35%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700 font-medium">🎙️ Voice Intelligence</span>
                  <span className="text-slate-600">20%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Performance Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700">Avg Response Time</span>
                  <span className="text-green-600 font-semibold">2.1s</span>
                </div>
                <div className="text-sm text-slate-500">↓ 15% from last week</div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700">Success Rate</span>
                  <span className="text-green-600 font-semibold">98.5%</span>
                </div>
                <div className="text-sm text-slate-500">↑ 2% from last week</div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700">AI Accuracy</span>
                  <span className="text-green-600 font-semibold">99.2%</span>
                </div>
                <div className="text-sm text-slate-500">Consistent performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getTypeIcon(log.type)}</div>
                  <div>
                    <div className="font-semibold text-slate-800">{log.action}</div>
                    <div className="text-sm text-slate-500">{formatTimeAgo(log.timestamp)}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  log.status === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {log.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="text-5xl">💡</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">AI Insights & Recommendations</h3>
              <div className="space-y-2">
                <p className="text-purple-100">• You're most productive with Image Intelligence between 2-4 PM</p>
                <p className="text-purple-100">• Consider exploring Text Summarization for long documents</p>
                <p className="text-purple-100">• Your AI accuracy has improved 5% this month - great work!</p>
                <p className="text-purple-100">• Try voice narration for better content accessibility</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
