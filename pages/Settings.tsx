import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const imgProfileTab = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";

const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [tab, setTab] = useState('preferences');
  const [aiModel, setAiModel] = useState('gemini-pro-vision');
  const [language, setLanguage] = useState('en');
  const [quality, setQuality] = useState('high');

  const save = () => alert('✅ Saved!');

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-['Silkscreen',_monospace]">
      <header className="bg-white border-b-4 border-black h-[65px]">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div onClick={() => navigate('/')} className="text-2xl font-bold cursor-pointer">VISORA</div>
          <nav className="hidden md:flex gap-3">
            <button onClick={() => navigate('/visual-intelligence')} className="px-5 py-2 bg-[#6b4eff] text-white text-sm font-bold border-4 border-black">VISUAL AI</button>
            <button onClick={() => navigate('/generate')} className="px-5 py-2 bg-[#ff7700] text-white text-sm font-bold border-4 border-black">GENERATE</button>
            <button onClick={() => navigate('/text-intelligence')} className="px-5 py-2 bg-[#ffbb00] text-black text-sm font-bold border-4 border-black">CHAT</button>
          </nav>
          <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full border-4 border-black overflow-hidden">
            <img src={imgProfileTab} alt="Profile" />
          </button>
          {showMenu && (
            <div className="absolute right-4 top-20 w-56 bg-white border-4 border-black z-50">
              <div className="p-3 border-b-2 border-black bg-[#ffbb00]">
                <p className="text-xs font-bold">{currentUser?.email}</p>
              </div>
              <button onClick={async () => { await logout(); navigate('/auth'); }} className="w-full px-4 py-3 text-left font-bold text-red-600">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8">⚙️ SETTINGS</h1>
        
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setTab('preferences')} className={`px-8 py-4 font-bold border-4 border-black ${tab === 'preferences' ? 'bg-[#00ff88]' : 'bg-white'}`}>⚙️ PREFERENCES</button>
          <button onClick={() => setTab('account')} className={`px-8 py-4 font-bold border-4 border-black ${tab === 'account' ? 'bg-[#ff7700] text-white' : 'bg-white'}`}>👤 ACCOUNT</button>
        </div>

        {tab === 'preferences' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border-4 border-black p-8">
              <h3 className="text-3xl font-bold mb-6 bg-[#6b4eff] text-white px-4 py-2 inline-block border-4 border-black">AI MODEL</h3>
              <div className="grid gap-4 mt-6">
                {[
                  { v: 'gemini-pro', l: 'Gemini Pro', d: 'Fast', c: 'bg-blue-400' },
                  { v: 'gemini-pro-vision', l: 'Pro Vision', d: 'Recommended ✨', c: 'bg-green-400' }
                ].map(m => (
                  <button key={m.v} onClick={() => setAiModel(m.v)} className={`p-6 text-left border-4 border-black ${aiModel === m.v ? m.c : 'bg-gray-100'}`}>
                    <div className="font-bold text-xl">{m.l}</div>
                    <div className="text-sm">{m.d}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border-4 border-black p-8">
              <h3 className="text-3xl font-bold mb-6 bg-[#ff7700] text-white px-4 py-2 inline-block border-4 border-black">DISPLAY</h3>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-3 border-4 border-black font-bold">
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Spanish</option>
              </select>
            </div>

            <div className="bg-white border-4 border-black p-8">
              <h3 className="text-3xl font-bold mb-6 bg-[#ffbb00] px-4 py-2 inline-block border-4 border-black">QUALITY</h3>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {['standard', 'high', 'ultra'].map(q => (
                  <button key={q} onClick={() => setQuality(q)} className={`p-6 font-bold border-4 border-black ${quality === q ? 'bg-[#00ff88]' : 'bg-gray-100'}`}>
                    {q.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={save} className="w-full bg-[#00ff88] py-6 font-bold text-2xl border-4 border-black">💾 SAVE</button>
          </div>
        )}

        {tab === 'account' && (
          <div className="max-w-4xl mx-auto bg-white border-4 border-black p-8">
            <h3 className="text-3xl font-bold mb-6 bg-[#ff7700] text-white px-4 py-2 inline-block border-4 border-black">ACCOUNT</h3>
            <div className="p-4 border-4 border-black bg-gray-50">
              <div className="font-bold">Email</div>
              <div>{currentUser?.email}</div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t-4 border-black py-8">
        <p className="text-center font-bold">© 2025 <span className="text-[#6b4eff]">VISORA</span></p>
      </footer>
    </div>
  );
};

export default Settings;