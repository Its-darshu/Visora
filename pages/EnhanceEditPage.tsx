import React, { useState } from 'react';
import { removeBackground, outpaintImage, enhanceImageQuality } from '../services/imageEditingService';
import Header from '../components/Header';

const EnhanceEditPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [enhancementLevel, setEnhancementLevel] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setEditedUrl(null);
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      const result = await enhanceImageQuality(selectedFile, {
        brightness: enhancementLevel / 2 - 25,
        contrast: enhancementLevel / 2 - 25,
        saturation: enhancementLevel / 2 - 25,
        sharpen: enhancementLevel > 50
      });
      setEditedUrl(result.editedImageUrl);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      const result = await removeBackground(selectedFile);
      setEditedUrl(result.imageUrl);
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOutpaint = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      const result = await outpaintImage(selectedFile, {
        direction: 'all',
        extensionPixels: 100,
        fillStyle: 'smart',
        seamBlending: true
      });
      setEditedUrl(result.editedImageUrl);
    } catch (error) {
      console.error('Outpaint failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-['Inter']">
      <Header />

      <main className="flex-1 flex pt-20">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col p-6 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black">AI Image Studio</h1>
            <p className="text-white/60 text-base">Upload an image to enhance, remove background, upscale, and more.</p>
          </div>

          {originalUrl ? (
            <div className="flex-1 flex items-center justify-center rounded-xl overflow-hidden relative glassmorphism group">
              {/* Before/After Comparison */}
              <div className="relative w-full h-full">
                {/* Before Image */}
                <div className="absolute inset-0 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: `url(${originalUrl})` }}>
                  <div className="absolute inset-0 bg-black/30"></div>
                  <span className="absolute top-4 left-4 text-white font-bold bg-black/50 px-3 py-1 rounded-md">Before</span>
                </div>
                
                {/* After Image (if available) */}
                {editedUrl && (
                  <div 
                    className="absolute inset-0 bg-center bg-no-repeat bg-contain" 
                    style={{ 
                      backgroundImage: `url(${editedUrl})`,
                      clipPath: `inset(0 0 0 ${sliderPosition}%)`
                    }}
                  >
                    <span className="absolute top-4 right-4 text-white font-bold bg-black/50 px-3 py-1 rounded-md">After</span>
                  </div>
                )}

                {/* Comparison Slider */}
                {editedUrl && (
                  <>
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-[#00FFFF] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00FFFF] rounded-full flex items-center justify-center cursor-ew-resize shadow-[0_0_15px_rgba(0,255,255,0.7)]"
                      style={{ left: `${sliderPosition}%`, transform: 'translate(-50%, -50%)' }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                        const handleMove = (e: MouseEvent) => {
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          setSliderPosition(Math.max(0, Math.min(100, x)));
                        };
                        const handleUp = () => {
                          document.removeEventListener('mousemove', handleMove);
                          document.removeEventListener('mouseup', handleUp);
                        };
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('mouseup', handleUp);
                      }}
                    >
                      <div className="w-1 h-3 bg-[#121212] absolute left-1"></div>
                      <div className="w-1 h-3 bg-[#121212] absolute right-1"></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#4d3267] w-full max-w-4xl py-24">
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-xl font-bold text-center">Drag & Drop Your Image Here</p>
                  <p className="text-white/70 text-sm text-center">or click the button below to select a file from your computer.</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <button className="px-4 h-10 bg-[#362348] text-white text-sm font-bold rounded-lg hover:bg-[#7f13ec] transition-colors cursor-pointer">
                    Upload Image
                  </button>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Controls */}
        <aside className="w-[380px] h-full flex flex-col p-6">
          <div className="flex-1 flex flex-col gap-6 p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold">Controls</h3>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleEnhance}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-3 w-full h-12 px-5 bg-[#00FFFF] text-[#121212] text-base font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed justify-center"
              >
                <span className="material-symbols-outlined">auto_fix_high</span>
                <span>Enhance</span>
              </button>

              <button
                onClick={handleRemoveBackground}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-3 w-full h-12 px-5 bg-white/10 text-white text-base font-bold rounded-lg hover:bg-[#9400D3]/80 transition-colors justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">flip_to_back</span>
                <span>Remove Background</span>
              </button>

              <button
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-3 w-full h-12 px-5 bg-white/10 text-white text-base font-bold rounded-lg hover:bg-[#9400D3]/80 transition-colors justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">zoom_in_map</span>
                <span>Upscale</span>
              </button>

              <button
                onClick={handleOutpaint}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-3 w-full h-12 px-5 bg-white/10 text-white text-base font-bold rounded-lg hover:bg-[#9400D3]/80 transition-colors justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">open_in_full</span>
                <span>Outpaint</span>
              </button>
            </div>

            <div className="border-t border-white/10 my-2"></div>

            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-white/80">Enhancement Level</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={enhancementLevel}
                  onChange={(e) => setEnhancementLevel(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FFFF]"
                />
                <span className="text-[#00FFFF] font-bold text-sm">{enhancementLevel}%</span>
              </div>
            </div>

            <div className="flex-1 flex items-end">
              {isProcessing && (
                <div className="w-full flex items-center justify-center p-4 border-2 border-dashed border-white/20 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3 text-white/60">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      <style>{`
        .glassmorphism {
          background: rgba(25, 16, 34, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(54, 35, 72, 0.3);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default EnhanceEditPage;
