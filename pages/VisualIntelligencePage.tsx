import React, { useState, useCallback } from 'react';
import { visionService, type ImageAnalysisResult } from '../services/visionService';
import Header from '../components/Header';

const VisualIntelligencePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const analyzeImage = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await visionService.analyzeImage(selectedFile);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Inter']">
      <Header />
      
      <main className="flex-1 mt-8 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 max-w-7xl mx-auto">
          {/* Left Column - Upload & Preview */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#4d3267] px-6 py-14 glassmorphism">
              <div className="flex max-w-[480px] flex-col items-center gap-2 text-center">
                <p className="text-xl font-bold">Upload Your Visual</p>
                <p className="text-white/80 text-sm">Drag & drop an image here, or click to browse</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <button className="px-4 h-10 bg-[#362348] text-white text-sm font-bold rounded-lg hover:bg-[#4d3267] transition-colors cursor-pointer">
                  Browse Files
                </button>
              </label>
            </div>

            {previewUrl && (
              <div className="relative w-full rounded-xl overflow-hidden glassmorphism">
                <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" />
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!selectedFile || isAnalyzing}
              className="w-full h-12 bg-[#00FFFF] text-black text-base font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Summarize Visual'}
            </button>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="flex flex-col gap-6">
            <p className="text-4xl font-black min-w-72">Visual Intelligence Analysis</p>

            {analysis ? (
              <div className="flex flex-col gap-6 p-6 rounded-xl glassmorphism">
                {/* Tags */}
                <div>
                  <h2 className="text-[22px] font-bold pb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, idx) => (
                      <span key={idx} className={`py-1.5 px-3 rounded-full text-sm font-medium border ${
                        idx % 2 === 0 
                          ? 'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30'
                          : 'bg-[#BF00FF]/10 text-[#BF00FF] border-[#BF00FF]/30'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detected Objects */}
                <div>
                  <h2 className="text-[22px] font-bold pb-3">Detected Objects</h2>
                  <ul className="space-y-3">
                    {analysis.detectedObjects.map((obj, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <span className="material-symbols-outlined text-[#00FFFF]">category</span>
                        <span className="text-sm">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div>
                  <h2 className="text-[22px] font-bold pb-3">Summary</h2>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-white/90 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 p-6 rounded-xl glassmorphism items-center justify-center min-h-[400px]">
                <div className="text-6xl">🔍</div>
                <p className="text-xl text-center text-white/60">Upload an image and click "Summarize Visual" to see AI insights</p>
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
