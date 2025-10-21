import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

interface PredictionCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  iconColor: string;
  chartType: 'line' | 'bar' | 'circle';
  chartData?: number[];
}

const RealTimePredictionsPage: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionCard[]>([
    {
      title: 'Real-Time User Engagement',
      value: '8,492',
      change: '+2.5%',
      changeType: 'positive',
      icon: 'group',
      iconColor: '#00FFFF',
      chartType: 'line',
      chartData: [50, 70, 30, 40, 70, 60, 20, 30]
    },
    {
      title: 'Personalization Score',
      value: '92.7%',
      change: '+1.2%',
      changeType: 'positive',
      icon: 'insights',
      iconColor: '#00FFFF',
      chartType: 'line',
      chartData: [60, 40, 70, 60, 20, 30, 70, 50]
    },
    {
      title: 'Live Conversion Predictions',
      value: '88%',
      change: '-0.5%',
      changeType: 'negative',
      icon: 'model_training',
      iconColor: '#9400D3',
      chartType: 'line',
      chartData: [20, 30, 10, 20, 60, 50, 30, 40]
    },
    {
      title: 'Content Reach Forecast',
      value: '1.2M',
      change: '+5%',
      changeType: 'positive',
      icon: 'trending_up',
      iconColor: '#00FFFF',
      chartType: 'line',
      chartData: [70, 60, 40, 30, 10, 20, 30, 10]
    },
    {
      title: 'App Performance Index',
      value: '99.8%',
      change: '+0.1%',
      changeType: 'positive',
      icon: 'speed',
      iconColor: '#00FFFF',
      chartType: 'bar',
      chartData: [25, 50, 75, 40, 80, 100]
    },
    {
      title: 'AI Model Confidence',
      value: '95%',
      change: '-1%',
      changeType: 'negative',
      icon: 'psychology',
      iconColor: '#9400D3',
      chartType: 'circle'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions(prev => prev.map(card => ({
        ...card,
        value: card.title.includes('User')
          ? `${Math.floor(Math.random() * 1000 + 8000)}`
          : card.value
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderChart = (card: PredictionCard) => {
    if (card.chartType === 'line' && card.chartData) {
      const points = card.chartData.map((val, idx) => {
        const x = (idx / (card.chartData!.length - 1)) * 300;
        const y = 80 - (val / 100) * 80;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 300 80">
          <polyline
            points={points}
            fill="none"
            stroke={card.iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (card.chartType === 'bar' && card.chartData) {
      return (
        <div className="h-20 w-full flex items-end gap-2">
          {card.chartData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-sm transition-all duration-500"
              style={{
                height: `${val}%`,
                backgroundColor: card.iconColor
              }}
            ></div>
          ))}
        </div>
      );
    }

    if (card.chartType === 'circle') {
      const percentage = parseInt(card.value);
      const circumference = 264;
      const offset = circumference - (percentage / 100) * circumference;

      return (
        <div className="h-20 w-full flex items-center justify-center">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="#4B5563" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke={card.iconColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#101018] text-white font-['Inter']">
      {/* Aurora Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1]" style={{
        backgroundImage: 'radial-gradient(ellipse at top left, #9400D340, transparent 50%), radial-gradient(ellipse at bottom right, #00FFFF30, transparent 50%)',
        backgroundSize: '150% 150%',
        animation: 'aurora 20s infinite linear'
      }}></div>

      <Header />

      <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pt-20">
        <h1 className="text-4xl font-bold pt-8 pb-6">Real-Time AI Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-10">
          {predictions.map((card, idx) => (
            <div
              key={idx}
              className="glassmorphism rounded-xl p-6 flex flex-col gap-4 hover:border-secondary transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[#A0A0A0] font-medium">{card.title}</h3>
                <span className="material-symbols-outlined" style={{ color: card.iconColor }}>
                  {card.icon}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-white">{card.value}</p>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  card.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    card.changeType === 'positive' ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  {card.change}
                </span>
              </div>

              {renderChart(card)}
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default RealTimePredictionsPage;
