import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiImageService } from '../services/aiImageService';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';

// Figma assets
const imgVector2 = "http://localhost:3845/assets/9fb364bb7abf720d0cdcf9340051bcda0936312f.svg";
const imgProfileTab = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";

interface GeneratedImageHistory {
  id: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  quality?: string;
  createdAt: any;
}

const GenerateImagePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageHistory, setImageHistory] = useState<GeneratedImageHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history when user changes
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    } else {
      setImageHistory([]);
    }
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await firestoreService.getGeneratedImages(currentUser.uid, 20);
      setImageHistory(history as GeneratedImageHistory[]);
      console.log('✅ Loaded', history.length, 'generated image history items');
    } catch (error) {
      console.error('❌ Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryClick = (item: GeneratedImageHistory) => {
    setGeneratedImage(item.imageUrl);
    setPrompt(item.prompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      console.log('🎨 Generating image...', { prompt });
      const result = await aiImageService.generateImage({
        prompt: prompt,
        style: 'artistic',
        quality: 'high'
      });
      
      if (result.success && result.url) {
        setGeneratedImage(result.url);
        
        // Save to Cloudinary + Firestore if user is logged in
        if (currentUser) {
          try {
            console.log('💾 Saving generated image to database...');
            
            // Convert data URL to blob
            const response = await fetch(result.url);
            const blob = await response.blob();
            
            // Upload to Cloudinary
            const imageUrl = await storageService.uploadBlob(
              blob,
              currentUser.uid,
              'generated',
              `generated_${Date.now()}.png`
            );
            
            // Save metadata to Firestore
            await firestoreService.saveGeneratedImage({
              userId: currentUser.uid,
              prompt: prompt,
              imageUrl,
              style: 'artistic',
              quality: 'high'
            });
            
            // Update API usage
            await firestoreService.updateUserApiUsage(currentUser.uid, 'imagesGenerated');
            
            console.log('✅ Generated image saved successfully!');
            
            // Reload history
            loadHistory();
          } catch (saveError) {
            console.error('❌ Failed to save generated image:', saveError);
            // Don't show error to user, generation was successful
          }
        }
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
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
          className="bg-white border border-black flex items-center justify-center h-[65px] px-6 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/visual-intelligence')}
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h1 className="text-[30px] font-bold text-black">VISORA</h1>
        </div>

        {/* Navigation Bar */}
        <nav 
          className="bg-[#e07400] border border-black flex items-center justify-center gap-0 h-[65px] flex-1 overflow-hidden"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <button
            onClick={() => navigate('/visual-intelligence')}
            className="border border-black px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">VISUAL AI</span>
          </button>
          <button
            onClick={() => navigate('/generate-image')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">AI STUDIO</span>
          </button>
          <button
            onClick={() => navigate('/text-intelligence')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">CHAT</span>
          </button>
        </nav>

        {/* Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-[65px] w-[150px] flex items-center justify-center gap-2 px-3 bg-[#FFA500] border-2 border-black"
            style={{ filter: 'drop-shadow(5px 5px 0px #000000)' }}
          >
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-black bg-gray-200 flex-shrink-0">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#ffb7ce]">
                  <span className="text-2xl text-black" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    {currentUser?.displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path d="M7 10L12 15L17 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  navigate('/auth');
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
          className="bg-[#d8d8d8] border border-black w-full lg:w-[239px] p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-150px)]"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000', paddingRight: '20px', paddingBottom: '20px' }}
        >
          <h2 className="text-[20px] text-black text-center">HISTORY</h2>
          
          {isLoadingHistory ? (
            <div className="text-center text-black">Loading...</div>
          ) : imageHistory.length === 0 ? (
            <div className="bg-white border border-black p-3 text-center text-black text-sm">
              No history yet
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {imageHistory.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-black p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '5px 5px 0px 0px #000000' }}
                  onClick={() => handleHistoryClick(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt="Generated image" 
                    className="w-full h-[80px] object-cover mb-2 border border-black"
                  />
                  <p className="text-[10px] text-black truncate">
                    {item.prompt.substring(0, 50) + (item.prompt.length > 50 ? '...' : '')}
                  </p>
                  <p className="text-[8px] text-gray-600 mt-1">
                    {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                  </p>
                </div>
              ))}
            </div>
          )}
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
              className="bg-white border border-black w-full lg:flex-1 p-6 overflow-hidden flex items-center justify-center"
              style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '5px 5px 0px 0px #000000', maxHeight: 'calc(100vh - 200px)' }}
            >
              {generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    crossOrigin="anonymous"
                    className="max-w-full max-h-[calc(100vh-300px)] object-contain"
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
