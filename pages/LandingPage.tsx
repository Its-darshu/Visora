import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: 'photo_library',
      title: 'Images Processed',
      value: '1,234',
      change: '+12%'
    },
    {
      icon: 'lightbulb',
      title: 'Insights Generated',
      value: '567',
      change: '+8%'
    },
    {
      icon: 'timer',
      title: 'Time Saved',
      value: '89 Hrs',
      change: '+5%'
    }
  ];

  const features = [
    {
      icon: 'trending_up',
      title: 'Trending Visual Styles',
      description: 'Discover the latest design trends and apply them to your projects.',
      buttonText: 'Explore Templates'
    },
    {
      icon: 'tips_and_updates',
      title: 'High-Performing App Icons',
      description: 'Get AI-powered suggestions for app icons that boost engagement.',
      buttonText: 'Analyze App'
    },
    {
      icon: 'auto_fix_high',
      title: 'Quickly Remove Background',
      description: 'Instantly remove the background from any image with a single click.',
      buttonText: 'Upload Image'
    },
    {
      icon: 'add_photo_alternate',
      title: 'Social Media Post Generation',
      description: 'Create stunning social media graphics tailored to your brand.',
      buttonText: 'Create with AI'
    }
  ];

  const recentActivity = [
    { title: 'Mobile App UI Analysis', time: '2 minutes ago', image: 'https://via.placeholder.com/80/9D00FF/FFFFFF?text=UI' },
    { title: 'Product Shot Enhancement', time: '15 minutes ago', image: 'https://via.placeholder.com/80/00FFFF/000000?text=Product' },
    { title: 'Social Media Post', time: '1 hour ago', image: 'https://via.placeholder.com/80/7f13ec/FFFFFF?text=Social' },
    { title: 'Icon Set Generation', time: '3 hours ago', image: 'https://via.placeholder.com/80/00FFFF/000000?text=Icons' },
    { title: 'Website Banner Ad', time: 'Yesterday', image: 'https://via.placeholder.com/80/9D00FF/FFFFFF?text=Banner' }
  ];

  return (
    <div className="min-h-screen bg-[#191022] text-white font-['Inter']">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-10 lg:px-20 xl:px-40 py-3 glassmorphism rounded-xl mx-4 md:mx-10 lg:mx-20 xl:mx-40 mt-5">
        <div className="flex items-center gap-4 text-white">
          <div className="w-6 h-6 text-[#7f13ec]">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Visora</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#00ffff] text-[#191022] text-sm font-bold shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:shadow-none transition-shadow"
          >
            <span>Sign Up</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-10 lg:px-20 xl:px-40 mt-8">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 p-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 glassmorphism">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ffff]">{stat.icon}</span>
                <p className="text-white text-base font-medium">{stat.title}</p>
              </div>
              <p className="text-white text-4xl font-bold">{stat.value}</p>
              <p className="text-[#0bda73] text-base font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Platform Activity & Recent Activity */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8 px-4">
          {/* Left Column */}
          <div className="flex flex-col flex-1 gap-6">
            {/* Platform Activity Chart */}
            <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl p-6 glassmorphism">
              <p className="text-white text-xl font-bold">Platform Activity</p>
              <p className="text-white text-4xl font-bold">2,345</p>
              <div className="flex gap-1">
                <p className="text-[#ad92c9] text-base">Last 30 Days</p>
                <p className="text-[#0bda73] text-base font-medium">+15%</p>
              </div>
              <div className="flex min-h-[220px] flex-1 flex-col gap-8 py-4">
                <svg fill="none" height="180" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear)"/>
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#00ffff" strokeLinecap="round" strokeWidth="3"/>
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="236" x2="236" y1="1" y2="149">
                      <stop stopColor="#00ffff" stopOpacity="0.5"/>
                      <stop offset="1" stopColor="#191022" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-around">
                  <p className="text-[#ad92c9] text-[13px] font-bold">Week 1</p>
                  <p className="text-[#ad92c9] text-[13px] font-bold">Week 2</p>
                  <p className="text-[#ad92c9] text-[13px] font-bold">Week 3</p>
                  <p className="text-[#ad92c9] text-[13px] font-bold">Week 4</p>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col gap-4 rounded-xl p-6 glassmorphism items-start">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#7f13ec] text-2xl">{feature.icon}</span>
                    <h3 className="text-white text-lg font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-[#ad92c9]">{feature.description}</p>
                  <button className="mt-auto flex items-center justify-center rounded-lg h-9 px-3 bg-[#7f13ec]/20 text-[#7f13ec] text-sm font-bold hover:bg-[#7f13ec]/40 transition-colors">
                    {feature.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="flex flex-col gap-5 w-full lg:w-80">
            <h2 className="text-white text-[22px] font-bold px-4 pb-3 pt-5 border-b border-b-[#362348]">Recent Activity</h2>
            <div className="flex flex-col gap-4 px-4 overflow-y-auto max-h-[700px]">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 rounded-lg p-4 glassmorphism">
                  <div className="flex flex-col gap-1 flex-[2_2_0px]">
                    <p className="text-white text-base font-bold">{activity.title}</p>
                    <p className="text-[#ad92c9] text-sm">{activity.time}</p>
                  </div>
                  <div className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-lg" style={{backgroundImage: `url(${activity.image})`}}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .glassmorphism {
          background: rgba(25, 16, 34, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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

export default LandingPage;
