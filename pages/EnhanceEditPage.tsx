import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeBackground, enhanceImageQuality, upscaleImage } from '../services/imageEditingService';

// Figma assets
const imgProfileTab = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";
const imgVector = "http://localhost:3845/assets/b000d29f08e8de2107e6ac60627be28585c51daf.svg";
const imgVector2 = "http://localhost:3845/assets/9fb364bb7abf720d0cdcf9340051bcda0936312f.svg";

type EditMode = 'upscale' | 'background-remover' | 'enhancing';

const EnhanceEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EditMode>('upscale');
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 3 | 4>(2);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setEditedUrl(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingMessage('');

    try {
      let result;
      
      switch (selectedMode) {
        case 'upscale':
          setProcessingMessage(`Upscaling image ${upscaleFactor}x with AI...`);
          result = await upscaleImage(selectedFile, {
            scaleFactor: upscaleFactor,
            enhanceQuality: true
          });
          if (result.editedImageUrl) {
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image upscaled successfully!');
          }
          break;
          
        case 'background-remover':
          setProcessingMessage('Removing background with AI...');
          const bgResult = await removeBackground(selectedFile);
          if (bgResult.imageUrl) {
            setEditedUrl(bgResult.imageUrl);
            setProcessingMessage(bgResult.message);
          }
          break;
          
        case 'enhancing':
          setProcessingMessage('Enhancing image quality with AI...');
          result = await enhanceImageQuality(selectedFile, {
            autoEnhance: true
          });
          if (result.editedImageUrl) {
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image enhanced successfully!');
          }
          break;
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setError('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setEditedUrl(null);
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
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
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
        </aside>

        {/* Center Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Description Banner */}
          <div 
            className="bg-[#79d7a8] border border-black p-4"
            style={{ fontFamily: "'Product Sans', sans-serif", fontWeight: 300, boxShadow: '5px 5px 0px 0px #000000' }}
          >
            <p className="text-[18px] md:text-[24px] text-black">
              Upload your image and let VISORA's AI Studio handle the magic — from retouching to background edits, all in one place.
            </p>
          </div>

          {/* Mode Selection Buttons */}
          <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
            <button
              onClick={() => setSelectedMode('upscale')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'upscale' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">UPSCALE IMAGE</span>
            </button>
            <button
              onClick={() => setSelectedMode('background-remover')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'background-remover' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">BACKGROUND REMOVER</span>
            </button>
            <button
              onClick={() => setSelectedMode('enhancing')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'enhancing' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">ENHANCING</span>
            </button>
          </div>

          {/* Upscale Factor Selector */}
          {selectedMode === 'upscale' && (
            <div className="flex gap-4 justify-center items-center">
              <span className="text-[18px] text-black" style={{ fontFamily: "'Silkscreen', monospace" }}>
                Scale Factor:
              </span>
              {[2, 3, 4].map((factor) => (
                <button
                  key={factor}
                  onClick={() => setUpscaleFactor(factor as 2 | 3 | 4)}
                  className={`border border-black px-4 py-2 transition-colors ${
                    upscaleFactor === factor ? 'bg-[#79d7a8]' : 'bg-white hover:bg-[#79d7a8]'
                  }`}
                  style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
                >
                  <span className="text-[16px] md:text-[20px] text-black">{factor}x</span>
                </button>
              ))}
            </div>
          )}

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
                onClick={handleSubmit}
                disabled={!selectedFile || isProcessing}
                className="relative bg-black text-white h-[74px] overflow-hidden hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  boxShadow: '5px 5px 0px 0px #000000',
                  fontFamily: "'Silkscreen', monospace"
                }}
              >
                <span className="relative z-10 text-[36px]">
                  {isProcessing ? 'LOADING...' : 'SUBMIT'}
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

              {processingMessage && !error && (
                <div className="bg-green-100 border border-green-500 p-3" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
                  <p className="text-sm text-green-700">{processingMessage}</p>
                </div>
              )}
            </div>

            {/* Output Region */}
            <div 
              className="bg-white border border-black w-full lg:flex-1 min-h-[466px] p-6 overflow-auto flex items-center justify-center"
              style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              {editedUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="max-w-full max-h-[400px] overflow-auto border border-gray-200 bg-gray-50" 
                       style={{ 
                         backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)',
                         backgroundPosition: '0 0, 10px 10px',
                         backgroundSize: '20px 20px'
                       }}>
                    <img
                      src={editedUrl}
                      alt="Processed"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                  
                  {/* Mode-specific info */}
                  <div className="text-center text-sm text-gray-600" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    {selectedMode === 'upscale' && (
                      <p>Upscaled {upscaleFactor}x • Enhanced with AI</p>
                    )}
                    {selectedMode === 'background-remover' && (
                      <p>Background Removed • Transparent PNG</p>
                    )}
                    {selectedMode === 'enhancing' && (
                      <p>AI Enhanced • Improved Clarity & Color</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={editedUrl}
                      download={`visora-${selectedMode}-${Date.now()}.png`}
                      className="px-4 py-2 bg-black text-white border border-black hover:bg-gray-800 transition-colors"
                      style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
                    >
                      DOWNLOAD
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(editedUrl);
                        alert('Image URL copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-white text-black border border-black hover:bg-gray-100 transition-colors"
                      style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
                    >
                      COPY URL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                      <p className="text-gray-600 text-center" style={{ fontFamily: "'Silkscreen', monospace" }}>
                        {processingMessage || 'Processing your image...'}
                      </p>
                    </>
                  ) : (
                    <>
                      <img src={imgVector2} alt="Output" className="w-[60px] h-[60px] opacity-30" />
                      <p className="text-gray-400 text-center" style={{ fontFamily: "'Product Sans', sans-serif" }}>
                        Upload an image and click Submit to see the result
                      </p>
                      {selectedMode === 'upscale' && (
                        <p className="text-sm text-gray-500 text-center max-w-md" style={{ fontFamily: "'Product Sans', sans-serif" }}>
                          AI Upscaling will enhance your image resolution up to {upscaleFactor}x while preserving quality, texture, and sharpness.
                        </p>
                      )}
                      {selectedMode === 'background-remover' && (
                        <p className="text-sm text-gray-500 text-center max-w-md" style={{ fontFamily: "'Product Sans', sans-serif" }}>
                          AI Background Remover will automatically detect and remove the background, creating a transparent PNG.
                        </p>
                      )}
                      {selectedMode === 'enhancing' && (
                        <p className="text-sm text-gray-500 text-center max-w-md" style={{ fontFamily: "'Product Sans', sans-serif" }}>
                          AI Image Enhancer will automatically fix lighting, color balance, contrast, and clarity for professional results.
                        </p>
                      )}
                    </>
                  )}
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

export default EnhanceEditPage;
