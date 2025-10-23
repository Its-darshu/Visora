import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiImageService } from '../services/aiImageService';

// Figma assets
const imgVector2 = "http://localhost:3845/assets/9fb364bb7abf720d0cdcf9340051bcda0936312f.svg";
const imgProfileTab = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";

const GenerateImagePage: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      const result = await aiImageService.generateImage({
        prompt: prompt,
        style: 'artistic',
        quality: 'high'
      });
      
      if (result.success && result.url) {
        setGeneratedImage(result.url);
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setError('An error occurred while generating the image.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-1.5 gap-2">
        {/* Logo */}
        <div 
          className="bg-white border border-black flex items-center justify-center h-[89px] px-6 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h1 className="text-[40px] font-bold text-black">VISORA</h1>
        </div>

        {/* Navigation Bar */}
        <nav 
          className="bg-[#e07400] border border-black flex items-center justify-center gap-0 h-[89px] flex-1 overflow-hidden"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <button
            onClick={() => navigate('/visual-intelligence')}
            className="border border-black px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">VISUAL AI</span>
          </button>
          <button
            onClick={() => navigate('/generate-image')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">AI STUDIO</span>
          </button>
          <button
            onClick={() => navigate('/text-intelligence')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">CHAT</span>
          </button>
        </nav>

        {/* Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-[89px] w-[182px] flex items-center justify-center"
            style={{ filter: 'drop-shadow(5px 5px 0px #000000)' }}
          >
            <img src={imgProfileTab} alt="Profile" className="w-full h-full object-contain" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-black z-50 min-w-[180px]" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-black text-black"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // Add logout logic here
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 text-black"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-4 p-4 mt-4">
        {/* Left Sidebar - History */}
        <aside 
          className="bg-[#d8d8d8] border border-black w-full lg:w-[239px] p-4 flex flex-col gap-4"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h2 className="text-[20px] text-black text-center">HISTORY</h2>
          <div className="bg-white border border-black h-[44px]" style={{ boxShadow: '5px 5px 0px 0px #000000' }}></div>
          {/* Add more history items here as needed */}
        </aside>

        {/* Center Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Description Banner */}
          <div 
            className="bg-[#79d7a8] border border-black p-4"
            style={{ fontFamily: "'Product Sans', sans-serif", fontWeight: 300, boxShadow: '5px 5px 0px 0px #000000' }}
          >
            <p className="text-[18px] md:text-[24px] text-black">
              Describe what you want to see, and VISORA's Image Generator will transform your words into beautiful visuals.
            </p>
          </div>

          {/* Prompt Input and Output Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Prompt Input Card */}
            <div 
              className="bg-[#ffd48e] border border-black p-6 w-full lg:w-[433px] flex flex-col gap-4"
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              {/* Prompt Textarea */}
              <div 
                className="border border-dashed border-black h-[302px] flex flex-col items-center justify-center p-4 relative"
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="ENTER THE PROMPT"
                  className="w-full h-full bg-transparent text-black text-center resize-none focus:outline-none placeholder:text-black"
                  style={{ fontFamily: "'Product Sans', sans-serif", fontSize: '18px' }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="relative bg-black text-white h-[74px] overflow-hidden hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  boxShadow: '5px 5px 0px 0px #000000',
                  fontFamily: "'Silkscreen', monospace"
                }}
              >
                <span className="relative z-10 text-[36px]">
                  {isGenerating ? 'LOADING...' : 'SUBMIT'}
                </span>
                <div 
                  className="absolute top-0 right-0 bottom-0 w-[180px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                  }}
                />
              </button>

              {prompt && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black truncate max-w-[250px]">{prompt.substring(0, 30)}...</p>
                  <button
                    onClick={handleClear}
                    className="text-sm text-black underline hover:no-underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-500 p-3" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Output Region */}
            <div 
              className="bg-white border border-black w-full lg:flex-1 min-h-[466px] p-6 overflow-hidden flex items-center justify-center"
              style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              {generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    crossOrigin="anonymous"
                    className="max-w-full max-h-[400px] object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', generatedImage);
                      setError('Failed to load the generated image.');
                      setGeneratedImage(null);
                    }}
                  />
                  <div className="flex gap-3">
                    <a
                      href={generatedImage}
                      download="visora-generated.png"
                      className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage);
                        alert('Image URL copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">
                    {isGenerating ? 'Generating your image...' : 'Enter a prompt and click Submit to generate an image'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Product+Sans:wght@300;400;500;700&display=swap');
      `}</style>
    </div>
  );
};

export default GenerateImagePage;
