import React, { useState, useCallback } from 'react';
import { imageAnalysisService } from '../services/imageAnalysisService';
import Header from '../components/Header';

const VisualIntelligencePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await imageAnalysisService.analyzeImage({
        file: selectedFile,
        customPrompt: customPrompt.trim() || undefined
      });
      
      if (result.success) {
        setExtractedText(result.extractedText || '');
        setAiAnalysis(result.aiAnalysis || '');
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err) {
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
    setCustomPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Inter']">
      <Header />
      
      <main className="flex-1 mt-24 px-4 sm:px-10 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-[#00FFFF] to-[#BF00FF] bg-clip-text text-transparent">
            Image → Text Analysis
          </h1>
          <p className="text-white/60">Extract text from images and get AI-powered analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Upload Section */}
            <div className="flex flex-col gap-6 p-6 rounded-xl glassmorphism">
              <h2 className="text-xl font-bold">Upload Image</h2>
              
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-[#4d3267] px-6 py-10 hover:border-[#7f13ec] transition-colors">
                <span className="material-symbols-outlined text-6xl text-[#7f13ec]">
                  upload_file
                </span>
                <div className="text-center">
                  <p className="text-sm text-white/80 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-white/60">PNG, JPG, GIF, BMP, WEBP (Max 16MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="px-6 h-10 bg-[#7f13ec] text-white text-sm font-bold rounded-lg hover:bg-[#7f13ec]/90 transition-colors cursor-pointer flex items-center justify-center"
                >
                  Browse Files
                </label>
              </div>

              {selectedFile && (
                <div className="text-sm text-white/80 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00FFFF]">image</span>
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="relative w-full rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain rounded-lg border border-white/10" />
                </div>
              )}

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Custom Analysis Prompt (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., 'Describe this image in detail' or 'Extract all text from this document'"
                  className="w-full px-4 py-3 rounded-lg bg-[#261933]/50 border border-[#4d3267] focus:border-[#7f13ec] focus:outline-none text-white placeholder:text-[#ad92c9] resize-none transition-all"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={analyzeImage}
                  disabled={!selectedFile || isAnalyzing}
                  className="flex-1 h-12 bg-[#00FFFF] text-black text-base font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_awesome</span>
                      <span>Analyze</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClearAll}
                  disabled={!selectedFile && !extractedText && !aiAnalysis}
                  className="px-4 h-12 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400">error</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-medium">Error</p>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {(extractedText || aiAnalysis) ? (
              <>
                {/* Extracted Text */}
                {extractedText && (
                  <div className="flex flex-col gap-4 p-6 rounded-xl glassmorphism">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00FFFF]">text_snippet</span>
                      <h2 className="text-xl font-bold">Extracted Content</h2>
                    </div>
                    <div className="p-4 rounded-lg bg-[#261933]/50 border border-[#4d3267]">
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {extractedText}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(extractedText)}
                      className="self-start px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                      Copy Text
                    </button>
                  </div>
                )}

                {/* AI Analysis */}
                {aiAnalysis && (
                  <div className="flex flex-col gap-4 p-6 rounded-xl glassmorphism">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#BF00FF]">psychology</span>
                      <h2 className="text-xl font-bold">AI Analysis</h2>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#BF00FF]/10 to-[#7f13ec]/10 border border-[#BF00FF]/30">
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiAnalysis)}
                      className="self-start px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                      Copy Analysis
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-6 p-12 rounded-xl glassmorphism items-center justify-center min-h-[500px]">
                <div className="w-24 h-24 rounded-full bg-[#7f13ec]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-[#7f13ec]">image_search</span>
                </div>
                <div className="text-center max-w-md">
                  <h3 className="text-2xl font-bold mb-2">Ready to Analyze</h3>
                  <p className="text-white/60 text-sm">
                    Upload an image to extract text and get AI-powered insights. 
                    Supports OCR, object detection, and intelligent content analysis.
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Text Extraction
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    AI Analysis
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Image Description
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .glassmorphism {
          background: rgba(43, 27, 61, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(128, 19, 236, 0.2);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default VisualIntelligencePage;
