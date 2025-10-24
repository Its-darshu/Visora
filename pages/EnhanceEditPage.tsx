import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useImageHistory } from '../services/useHistory';
import { ImageHistoryItem } from '../services/firestoreService';
import { 
  removeBackground, 
  enhanceImageQuality, 
  upscaleImage,
  applyFilterAndAdjustments,
  smartCrop,
  rotateFlipImage
} from '../services/imageEditingService';

// Local icons from public folder
const imgUploadIcon = "/images/upload icon.svg";

type EditMode = 'upscale' | 'background-remover' | 'enhancing' | 'filters' | 'crop-resize' | 'adjustments';
type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cool' | 'warm' | 'invert' | 'blur';
type AspectRatio = 'original' | '1:1' | '16:9' | '9:16' | '4:3' | '4:5';

const EnhanceEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { history, loading: historyLoading, saveToHistory } = useImageHistory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EditMode>('upscale');
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 3 | 4>(2);
  
  // New feature states
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);

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
      let processedDataUrl: string | null = null;
      
      switch (selectedMode) {
        case 'upscale':
          setProcessingMessage(`Upscaling image ${upscaleFactor}x with AI...`);
          result = await upscaleImage(selectedFile, {
            scaleFactor: upscaleFactor,
            enhanceQuality: true
          });
          if (result.editedImageUrl) {
            processedDataUrl = result.editedImageUrl;
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image upscaled successfully!');
          }
          break;
          
        case 'background-remover':
          const hasRemoveBgKey = import.meta.env.VITE_REMOVEBG_API_KEY && 
                                 import.meta.env.VITE_REMOVEBG_API_KEY !== 'your_removebg_api_key_here';
          setProcessingMessage(
            hasRemoveBgKey 
              ? 'Removing background with Remove.bg API...' 
              : 'Removing background with local AI algorithm...'
          );
          const bgResult = await removeBackground(selectedFile);
          if (bgResult.imageUrl) {
            processedDataUrl = bgResult.imageUrl;
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
            processedDataUrl = result.editedImageUrl;
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image enhanced successfully!');
          }
          break;
          
        case 'filters':
          setProcessingMessage('Applying filter and adjustments...');
          result = await applyFilterAndAdjustments(selectedFile, {
            filter: selectedFilter,
            brightness,
            contrast,
            saturation
          });
          if (result.editedImageUrl) {
            processedDataUrl = result.editedImageUrl;
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Filter applied successfully!');
          }
          break;
          
        case 'crop-resize':
          setProcessingMessage('Cropping image...');
          result = await smartCrop(selectedFile, aspectRatio);
          if (result.editedImageUrl) {
            processedDataUrl = result.editedImageUrl;
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image cropped successfully!');
          }
          break;
          
        case 'adjustments':
          setProcessingMessage('Applying transformations...');
          result = await rotateFlipImage(selectedFile, {
            rotation,
            flipHorizontal,
            flipVertical
          });
          if (result.editedImageUrl) {
            processedDataUrl = result.editedImageUrl;
            setEditedUrl(result.editedImageUrl);
            setProcessingMessage(result.message || 'Image transformed successfully!');
          }
          break;
      }

      // Save to history if processing was successful
      if (processedDataUrl && currentUser) {
        try {
          console.log('📸 Starting save to history...', { mode: selectedMode, user: currentUser.uid });
          setProcessingMessage('Saving to history...');
          
          // Convert data URL to blob
          const response = await fetch(processedDataUrl);
          const blob = await response.blob();
          console.log('✅ Blob created:', { size: blob.size, type: blob.type });
          
          // Map mode to history type
          const modeToTypeMap: Record<EditMode, ImageHistoryItem['type']> = {
            'upscale': 'upscale',
            'background-remover': 'background-remove',
            'enhancing': 'enhance',
            'filters': 'filter',
            'crop-resize': 'crop',
            'adjustments': 'transform'
          };
          
          console.log('💾 Saving to Cloudinary + Firestore...');
          // Save to Cloudinary + Firestore
          await saveToHistory(
            selectedFile,
            blob,
            modeToTypeMap[selectedMode],
            {
              scaleFactor: upscaleFactor,
              filter: selectedFilter,
              brightness,
              contrast,
              saturation,
              rotation,
              flipHorizontal,
              flipVertical,
              aspectRatio
            }
          );
          
          console.log('🎉 Successfully saved to history!');
          setProcessingMessage('Saved successfully!');
        } catch (saveError) {
          console.error('❌ Failed to save to history:', saveError);
          setError('Processing complete, but failed to save to history. Check console for details.');
        }
      } else {
        console.warn('⚠️ Skipping save:', { 
          hasDataUrl: !!processedDataUrl, 
          hasUser: !!currentUser 
        });
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setError('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyQuickTransform = async (transform: 'rotate-90' | 'rotate-180' | 'rotate-270' | 'flip-h' | 'flip-v') => {
    if (!selectedFile) return;
    
    let newRotation = rotation;
    let newFlipH = flipHorizontal;
    let newFlipV = flipVertical;
    
    switch (transform) {
      case 'rotate-90':
        newRotation = (rotation + 90) % 360;
        break;
      case 'rotate-180':
        newRotation = (rotation + 180) % 360;
        break;
      case 'rotate-270':
        newRotation = (rotation + 270) % 360;
        break;
      case 'flip-h':
        newFlipH = !flipHorizontal;
        break;
      case 'flip-v':
        newFlipV = !flipVertical;
        break;
    }
    
    setRotation(newRotation);
    setFlipHorizontal(newFlipH);
    setFlipVertical(newFlipV);
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
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
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
          className="bg-[#d8d8d8] border border-black w-full lg:w-[239px] p-4 flex flex-col gap-4 max-h-[calc(100vh-140px)] overflow-y-auto"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h2 className="text-[20px] text-black text-center">HISTORY</h2>
          
          {historyLoading ? (
            <div className="bg-white border border-black p-4 text-center" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
              <p className="text-sm">Loading...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white border border-black p-4 text-center" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
              <p className="text-xs">No history yet</p>
            </div>
          ) : (
            history.slice(0, 10).map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-black p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ boxShadow: '3px 3px 0px 0px #000000' }}
                onClick={() => window.open(item.processedImageUrl, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={item.processedImageUrl} 
                    alt={item.type}
                    className="w-12 h-12 object-cover border border-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.type.toUpperCase()}</p>
                    <p className="text-[10px] text-gray-600">
                      {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
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
            <button
              onClick={() => setSelectedMode('filters')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'filters' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">FILTERS</span>
            </button>
            <button
              onClick={() => setSelectedMode('crop-resize')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'crop-resize' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">CROP & RESIZE</span>
            </button>
            <button
              onClick={() => setSelectedMode('adjustments')}
              className={`border border-black px-4 py-2 transition-colors ${
                selectedMode === 'adjustments' ? 'bg-[#ffb7ce]' : 'bg-white hover:bg-[#ffb7ce]'
              }`}
              style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
            >
              <span className="text-[18px] md:text-[24px] text-black whitespace-nowrap">TRANSFORM</span>
            </button>
          </div>

          {/* Mode-specific controls */}
          
          {/* Upscale Factor Selector */}
          {selectedMode === 'upscale' && (
            <div className="flex gap-4 justify-center items-center flex-wrap">
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

          {/* Filter Controls */}
          {selectedMode === 'filters' && (
            <div className="bg-white border border-black p-4" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
              <div className="flex flex-wrap gap-3 mb-4">
                {(['none', 'grayscale', 'sepia', 'vintage', 'cool', 'warm', 'invert', 'blur'] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`border border-black px-3 py-1 text-sm transition-colors ${
                      selectedFilter === filter ? 'bg-[#79d7a8]' : 'bg-white hover:bg-gray-100'
                    }`}
                    style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '2px 2px 0px 0px #000000' }}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm block mb-1" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    Brightness: {brightness}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    Contrast: {contrast}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    Saturation: {saturation}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Crop & Resize Controls */}
          {selectedMode === 'crop-resize' && (
            <div className="flex gap-3 justify-center flex-wrap">
              <span className="text-[16px] text-black self-center" style={{ fontFamily: "'Silkscreen', monospace" }}>
                Aspect Ratio:
              </span>
              {(['original', '1:1', '16:9', '9:16', '4:3', '4:5'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`border border-black px-3 py-2 transition-colors ${
                    aspectRatio === ratio ? 'bg-[#79d7a8]' : 'bg-white hover:bg-[#79d7a8]'
                  }`}
                  style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
                >
                  <span className="text-[14px] md:text-[16px] text-black">{ratio}</span>
                </button>
              ))}
            </div>
          )}

          {/* Transform Controls */}
          {selectedMode === 'adjustments' && (
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => applyQuickTransform('rotate-90')}
                className="border border-black px-4 py-2 bg-white hover:bg-[#79d7a8] transition-colors"
                style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
              >
                ↻ 90°
              </button>
              <button
                onClick={() => applyQuickTransform('rotate-180')}
                className="border border-black px-4 py-2 bg-white hover:bg-[#79d7a8] transition-colors"
                style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
              >
                ↻ 180°
              </button>
              <button
                onClick={() => applyQuickTransform('rotate-270')}
                className="border border-black px-4 py-2 bg-white hover:bg-[#79d7a8] transition-colors"
                style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
              >
                ↻ 270°
              </button>
              <button
                onClick={() => applyQuickTransform('flip-h')}
                className={`border border-black px-4 py-2 transition-colors ${
                  flipHorizontal ? 'bg-[#79d7a8]' : 'bg-white hover:bg-[#79d7a8]'
                }`}
                style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
              >
                ↔ FLIP H
              </button>
              <button
                onClick={() => applyQuickTransform('flip-v')}
                className={`border border-black px-4 py-2 transition-colors ${
                  flipVertical ? 'bg-[#79d7a8]' : 'bg-white hover:bg-[#79d7a8]'
                }`}
                style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '3px 3px 0px 0px #000000' }}
              >
                ↕ FLIP V
              </button>
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
                    <img src={imgUploadIcon} alt="Upload" className="w-[40px] h-[40px]" />
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
              className="bg-white border border-black w-full lg:flex-1 p-6 overflow-auto flex items-center justify-center"
              style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '5px 5px 0px 0px #000000', maxHeight: 'calc(100vh - 200px)' }}
            >
              {editedUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="max-w-full max-h-[calc(100vh-300px)] overflow-auto border border-gray-200 bg-gray-50" 
                       style={{ 
                         backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)',
                         backgroundPosition: '0 0, 10px 10px',
                         backgroundSize: '20px 20px'
                       }}>
                    <img
                      src={editedUrl}
                      alt="Processed"
                      className="max-w-full max-h-[calc(100vh-300px)] object-contain"
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
                  {isProcessing && (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                      <p className="text-gray-600 text-center" style={{ fontFamily: "'Silkscreen', monospace" }}>
                        {processingMessage || 'Processing your image...'}
                      </p>
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
