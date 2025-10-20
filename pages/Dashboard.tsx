import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const features = [
    {
      id: 'image',
      title: 'Image Intelligence',
      icon: '🖼️',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Analyze images, extract insights, generate visuals, and enhance image quality',
      capabilities: [
        'Image-to-Text Analysis',
        'Object Detection',
        'AI Image Generation',
        'Image Enhancement',
        'Visual Search'
      ],
      route: '/image-intelligence',
      stats: { icon: '📸', value: 'Unlimited', label: 'Image Analysis' }
    },
    {
      id: 'text',
      title: 'Text Intelligence',
      icon: '💬',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Summarize text, analyze sentiment, extract entities, and generate content',
      capabilities: [
        'Text Summarization',
        'Sentiment Analysis',
        'Entity Extraction',
        'Content Generation',
        'Keyword Extraction'
      ],
      route: '/text-intelligence',
      stats: { icon: '📝', value: 'Advanced', label: 'NLP Tools' }
    },
    {
      id: 'voice',
      title: 'Voice Intelligence',
      icon: '🎙️',
      gradient: 'from-orange-500 to-red-500',
      description: 'Convert text to natural speech with multiple voices and languages',
      capabilities: [
        'Text-to-Speech',
        'Multiple Voices',
        'Natural Intonation',
        'Audio Controls',
        'Voice Preview'
      ],
      route: '/dashboard',
      stats: { icon: '🔊', value: '10+ Voices', label: 'Available' }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-4 animate-bounce">🎨</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Visora</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Your unified AI platform for visual & app intelligence
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="text-sm text-slate-600">👤 {currentUser?.displayName || 'User'}</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="text-sm text-slate-600">⚡ All Features Unlocked</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(feature.route)}
            >
              <div className={`bg-gradient-to-r ${feature.gradient} p-6 text-white`}>
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/90 text-sm">{feature.description}</p>
              </div>
              
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-3">Capabilities:</h4>
                <ul className="space-y-2 mb-6">
                  {feature.capabilities.map((cap, idx) => (
                    <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-check text-green-500"></i>
                      {cap}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{feature.stats.icon}</span>
                    <div>
                      <div className="font-bold text-slate-800">{feature.stats.value}</div>
                      <div className="text-xs text-slate-500">{feature.stats.label}</div>
                    </div>
                  </div>
                  <button className={`bg-gradient-to-r ${feature.gradient} text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity`}>
                    Launch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-purple-600">99%</div>
              <div className="text-sm text-slate-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-blue-600">&lt;3s</div>
              <div className="text-sm text-slate-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌐</div>
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-slate-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <div className="text-3xl font-bold text-orange-600">10+</div>
              <div className="text-sm text-slate-600">AI Models</div>
            </div>
          </div>
        </div>

        {/* Hackathon Info */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-3">Cognex Hackathon 2025</h2>
          <p className="text-lg text-purple-100 mb-4">
            Problem Statement 3: AI-Powered Visual & App Intelligence Platform
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Image Intelligence</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Text Processing</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Voice Integration</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Real-Time AI</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">✓ Multimodal Platform</span>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;