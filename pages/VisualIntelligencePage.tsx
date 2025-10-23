import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageAnalysisService } from '../services/imageAnalysisService';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';

// Figma asset URLs
const imgProfileTab = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";
const imgVector = "http://localhost:3845/assets/b000d29f08e8de2107e6ac60627be28585c51daf.svg";
const imgVector2 = "http://localhost:3845/assets/9fb364bb7abf720d0cdcf9340051bcda0936312f.svg";

interface VisualAnalysisHistory {
  id: string;
  imageUrl: string;
  extractedText: string;
  aiAnalysis: string;
  createdAt: any;
}

const VisualIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<VisualAnalysisHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history when user changes
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    } else {
      setAnalysisHistory([]);
    }
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await firestoreService.getVisualAnalysisHistory(currentUser.uid, 20);
      setAnalysisHistory(history as VisualAnalysisHistory[]);
      console.log('✅ Loaded', history.length, 'visual analysis history items');
    } catch (error) {
      console.error('❌ Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryClick = (item: VisualAnalysisHistory) => {
    setPreviewUrl(item.imageUrl);
    setExtractedText(item.extractedText);
    setAiAnalysis(item.aiAnalysis);
    setSelectedFile(null);
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setExtractedText('');
      setAiAnalysis('');
      
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = imageAnalysisService.createPreviewUrl(file);
      setPreviewUrl(url);
    }
  }, [previewUrl]);

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🔍 Starting image analysis...', { file: selectedFile.name });
      const result = await imageAnalysisService.analyzeImage({
        file: selectedFile
      });
      
      if (result.success) {
        setExtractedText(result.extractedText || '');
        setAiAnalysis(result.aiAnalysis || '');
        
        // Save to Cloudinary + Firestore if user is logged in
        if (currentUser && (result.extractedText || result.aiAnalysis)) {
          try {
            console.log('💾 Saving visual analysis to database...');
            
            // Upload image to Cloudinary
            const imageUrl = await storageService.uploadImage(
              selectedFile,
              currentUser.uid,
              'analysis'
            );
            
            // Save metadata to Firestore
            await firestoreService.saveVisualAnalysis({
              userId: currentUser.uid,
              imageUrl,
              extractedText: result.extractedText || '',
              aiAnalysis: result.aiAnalysis || ''
            });
            
            // Update API usage
            await firestoreService.updateUserApiUsage(currentUser.uid, 'imagesProcessed');
            
            console.log('✅ Visual analysis saved successfully!');
            
            // Reload history
            loadHistory();
          } catch (saveError) {
            console.error('❌ Failed to save analysis:', saveError);
            // Don't show error to user, analysis was successful
          }
        }
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearAll = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setExtractedText('');
    setAiAnalysis('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-1.5 gap-2">
        {/* Logo */}
        <div 
          className="bg-white border border-black flex items-center justify-center h-[89px] px-6 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/visual-intelligence')}
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
            className="bg-[#523bb5] border border-black px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">VISUAL AI</span>
          </button>
          <button
            onClick={() => navigate('/generate-image')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
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
            className="h-[89px] w-[182px] flex items-center justify-center gap-3 px-4 bg-[#FFA500] border-2 border-black"
            style={{ filter: 'drop-shadow(5px 5px 0px #000000)' }}
          >
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-black bg-gray-200 flex-shrink-0">
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
          ) : analysisHistory.length === 0 ? (
            <div className="bg-white border border-black p-3 text-center text-black text-sm">
              No history yet
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {analysisHistory.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-black p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '5px 5px 0px 0px #000000' }}
                  onClick={() => handleHistoryClick(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt="Analysis history" 
                    className="w-full h-[80px] object-cover mb-2 border border-black"
                  />
                  <p className="text-[10px] text-black truncate">
                    {item.extractedText ? item.extractedText.substring(0, 50) + '...' : 'Image analyzed'}
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
              Turn visuals into words. VISORA's Visual AI analyzes your image and generates clear, detailed text descriptions in seconds.
            </p>
          </div>

          {/* Upload and Output Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Upload Card */}
            <div 
              className="bg-[#ffd48e] border border-black p-6 w-full lg:w-[433px] flex flex-col gap-4"
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              {/* Upload Area */}
              <div 
                className="border border-dashed border-black h-[302px] flex flex-col items-center justify-center gap-5 cursor-pointer hover:bg-[#ffe4b0] transition-colors relative"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <>
                    <img src={imgVector} alt="Upload" className="w-[40px] h-[40px]" />
                    <p className="text-[24px] text-black">UPLOAD</p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={analyzeImage}
                disabled={!selectedFile || isAnalyzing}
                className="relative bg-black text-white h-[74px] overflow-hidden hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  boxShadow: '5px 5px 0px 0px #000000',
                  fontFamily: "'Silkscreen', monospace"
                }}
              >
                <span className="relative z-10 text-[36px]">
                  {isAnalyzing ? 'LOADING...' : 'SUBMIT'}
                </span>
                <div 
                  className="absolute top-0 right-0 bottom-0 w-[180px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                  }}
                />
              </button>

              {selectedFile && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black truncate">{selectedFile.name}</p>
                  <button
                    onClick={handleClearAll}
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
              className="bg-white border border-black w-full lg:flex-1 min-h-[466px] p-6 overflow-y-auto"
              style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              {extractedText || aiAnalysis ? (
                <div className="flex flex-col gap-6">
                  {extractedText && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-black">Extracted Text:</h3>
                      <p className="text-black whitespace-pre-wrap leading-relaxed">{extractedText}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(extractedText)}
                        className="mt-3 px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                      >
                        Copy Text
                      </button>
                    </div>
                  )}
                  {aiAnalysis && (
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-black">AI Analysis:</h3>
                      <p className="text-black whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(aiAnalysis)}
                        className="mt-3 px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                      >
                        Copy Analysis
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">
                    Upload an image and click Submit to see the analysis here
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

export default VisualIntelligencePage;
