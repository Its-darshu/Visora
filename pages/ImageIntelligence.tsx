import React, { useState, useCallback } from 'react';
import { visionService, type ImageAnalysisResult } from '../services/visionService';
import LoadingSpinner from '../components/LoadingSpinner';

const ImageIntelligence: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis'>('upload');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setAnalysis(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setAnalysis(null);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setError('Please drop a valid image file');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const analyzeImage = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await visionService.analyzeImage(selectedFile);
      setAnalysis(result);
      setActiveTab('analysis');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setActiveTab('upload');
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            🖼️ Image Intelligence
          </h1>
          <p className="text-lg text-slate-600">
            Upload any image and get instant AI-powered insights
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                📤 Upload Image
              </h2>
              
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-4 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className="cursor-pointer">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Drop your image here
                    </p>
                    <p className="text-slate-500 mb-4">or click to browse</p>
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                      Choose Image
                    </button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden shadow-md">
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-contain bg-slate-100"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-brain"></i>
                          Analyze Image
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={clearImage}
                      className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    <p><strong>File:</strong> {selectedFile.name}</p>
                    <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> {selectedFile.type}</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 font-semibold">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {analysis ? (
              <div className="space-y-4">
                {/* Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                    Summary
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-slate-500">Confidence:</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {analysis.confidence}%
                    </span>
                  </div>
                </div>

                {/* Scene Description */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-blue-500"></i>
                    Scene Description
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{analysis.sceneDescription}</p>
                </div>

                {/* Detected Objects */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-cube text-purple-500"></i>
                    Detected Objects ({analysis.detectedObjects.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detectedObjects.map((obj, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-palette text-pink-500"></i>
                    Dominant Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-heart text-red-500"></i>
                    Mood & Atmosphere
                  </h3>
                  <p className="text-slate-700">{analysis.mood}</p>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-tags text-green-500"></i>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-orange-500"></i>
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-slate-700 flex items-start gap-2">
                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-slate-500">
                  Upload an image and click "Analyze Image" to see detailed insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageIntelligence;
