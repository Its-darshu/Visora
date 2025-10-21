import React, { useState } from 'react';
import { aiImageService } from '../services/aiImageService';
import Header from '../components/Header';

const GenerateImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
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

  return (
    <div className="min-h-screen bg-[#121212] text-white font-['Inter']">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto pt-28 px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6 p-6 rounded-xl glassmorphism">
            <div>
              <label className="flex flex-col">
                <p className="text-base font-medium pb-2">Prompt</p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full min-h-48 p-4 rounded-lg bg-[#261933]/50 border border-[#4d3267] focus:border-[#7f13ec] focus:outline-none text-white placeholder:text-[#ad92c9] resize-none transition-all"
                  placeholder="A futuristic cyberpunk city skyline at night, with neon signs reflecting on wet streets, cinematic lighting, hyper-detailed..."
                />
              </label>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-14 bg-[#7f13ec] text-white text-lg font-bold rounded-lg hover:bg-[#7f13ec]/90 transition-all hover:shadow-[0_0_15px_rgba(191,0,255,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#7f13ec] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          </div>

          {/* Right Column: Image Preview */}
          <div className="lg:col-span-2 flex items-center justify-center p-6 rounded-xl glassmorphism group relative overflow-hidden">
            {error ? (
              <div className="text-center text-red-400">
                <span className="material-symbols-outlined text-6xl mb-4">error</span>
                <p className="text-lg">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-6 py-2 bg-[#7f13ec] text-white rounded-lg hover:bg-[#7f13ec]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img
                  src={generatedImage}
                  alt="Generated"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Image failed to load:', generatedImage);
                    setError('Failed to load the generated image.');
                    setGeneratedImage(null);
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <a
                    href={generatedImage}
                    download="visora-generated.png"
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl">download</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImage);
                      alert('Image URL copied to clipboard!');
                    }}
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl">share</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-4 mx-auto"></div>
                    <p className="text-lg">Generating your masterpiece...</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-2">✨ Your generated image will appear here</p>
                    <p className="text-sm">Enter a prompt and click "Generate Image" to start</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .glassmorphism {
          background: rgba(38, 25, 51, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(77, 50, 103, 0.3);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default GenerateImagePage;
