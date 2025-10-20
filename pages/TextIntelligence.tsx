import React, { useState } from 'react';
import { textIntelligenceService } from '../services/textIntelligenceService';
import LoadingSpinner from '../components/LoadingSpinner';

const TextIntelligence: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [activeFeature, setActiveFeature] = useState<
    'summarize' | 'sentiment' | 'entities' | 'generate' | 'keywords'
  >('summarize');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation options
  const [genStyle, setGenStyle] = useState<'professional' | 'casual' | 'academic' | 'creative'>('professional');
  const [genTone, setGenTone] = useState<'formal' | 'friendly' | 'persuasive' | 'informative'>('informative');
  const [genLength, setGenLength] = useState<'short' | 'medium' | 'long'>('medium');

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      switch (activeFeature) {
        case 'summarize':
          const summary = await textIntelligenceService.summarizeText(inputText);
          setResult(summary);
          break;
        case 'sentiment':
          const sentiment = await textIntelligenceService.analyzeSentiment(inputText);
          setResult(sentiment);
          break;
        case 'entities':
          const entities = await textIntelligenceService.extractEntities(inputText);
          setResult(entities);
          break;
        case 'generate':
          const generated = await textIntelligenceService.generateContent(
            inputText,
            genStyle,
            genTone,
            genLength
          );
          setResult(generated);
          break;
        case 'keywords':
          const keywords = await textIntelligenceService.generateKeywords(inputText);
          setResult({ keywords });
          break;
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process text');
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    { id: 'summarize', icon: '📝', name: 'Summarize', color: 'blue' },
    { id: 'sentiment', icon: '😊', name: 'Sentiment', color: 'green' },
    { id: 'entities', icon: '🏷️', name: 'Entities', color: 'purple' },
    { id: 'generate', icon: '✨', name: 'Generate', color: 'orange' },
    { id: 'keywords', icon: '🔑', name: 'Keywords', color: 'pink' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            💬 Text Intelligence
          </h1>
          <p className="text-lg text-slate-600">
            Advanced NLP tools for text analysis, summarization, and generation
          </p>
        </div>

        {/* Feature Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id as any)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeFeature === feature.id
                    ? `bg-${feature.color}-600 text-white shadow-lg scale-105`
                    : 'bg-white text-slate-700 hover:shadow-md'
                }`}
              >
                <span className="mr-2">{feature.icon}</span>
                {feature.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                {activeFeature === 'generate' ? '💡 Your Prompt' : '📄 Input Text'}
              </h2>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeFeature === 'generate'
                    ? 'Enter your prompt (e.g., "Write about the benefits of AI in education")'
                    : 'Paste or type your text here...'
                }
                className="w-full h-64 p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
              />
              
              <div className="mt-4 text-sm text-slate-500">
                Words: {inputText.split(/\s+/).filter(w => w.length > 0).length} | 
                Characters: {inputText.length}
              </div>

              {/* Generation Options */}
              {activeFeature === 'generate' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Style
                    </label>
                    <select
                      value={genStyle}
                      onChange={(e) => setGenStyle(e.target.value as any)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="academic">Academic</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={genTone}
                      onChange={(e) => setGenTone(e.target.value as any)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="formal">Formal</option>
                      <option value="friendly">Friendly</option>
                      <option value="persuasive">Persuasive</option>
                      <option value="informative">Informative</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Length
                    </label>
                    <select
                      value={genLength}
                      onChange={(e) => setGenLength(e.target.value as any)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="short">Short (100-200 words)</option>
                      <option value="medium">Medium (300-500 words)</option>
                      <option value="long">Long (600-1000 words)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || !inputText.trim()}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Process Text
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 font-semibold">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <div className="space-y-4">
                {/* Summarize Results */}
                {activeFeature === 'summarize' && (
                  <>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        📝 Summary
                      </h3>
                      <p className="text-slate-700 leading-relaxed">{result.summary}</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        🔑 Key Points
                      </h3>
                      <ul className="space-y-2">
                        {result.keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-slate-700 flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1"></i>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        📊 Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.wordCount.original}
                          </div>
                          <div className="text-sm text-slate-600">Original Words</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {result.wordCount.summary}
                          </div>
                          <div className="text-sm text-slate-600">Summary Words</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {result.readingTime.original} min
                          </div>
                          <div className="text-sm text-slate-600">Original Time</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {result.readingTime.summary} min
                          </div>
                          <div className="text-sm text-slate-600">Summary Time</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Sentiment Results */}
                {activeFeature === 'sentiment' && (
                  <>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        😊 Overall Sentiment
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className={`text-5xl ${
                          result.overall === 'positive' ? 'text-green-500' :
                          result.overall === 'negative' ? 'text-red-500' :
                          result.overall === 'mixed' ? 'text-yellow-500' :
                          'text-slate-400'
                        }`}>
                          {result.overall === 'positive' ? '😊' :
                           result.overall === 'negative' ? '😞' :
                           result.overall === 'mixed' ? '😐' : '😶'}
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold capitalize">{result.overall}</div>
                          <div className="text-sm text-slate-500">Score: {result.score.toFixed(2)}</div>
                          <div className="mt-2 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                result.score > 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.abs(result.score) * 50 + 50}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        ❤️ Emotions Detected
                      </h3>
                      <div className="space-y-3">
                        {result.emotions.map((emotion: any, idx: number) => (
                          <div key={idx}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium capitalize">{emotion.name}</span>
                              <span className="text-slate-600">{emotion.intensity}%</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${emotion.intensity}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Entities Results */}
                {activeFeature === 'entities' && (
                  <>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        🏷️ Extracted Entities
                      </h3>
                      <div className="space-y-2">
                        {result.entities.map((entity: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <div className="font-semibold">{entity.text}</div>
                              <div className="text-sm text-slate-500 capitalize">{entity.type}</div>
                            </div>
                            <div className="text-sm font-medium text-purple-600">
                              {entity.relevance}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {result.relationships.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-3">
                          🔗 Relationships
                        </h3>
                        <div className="space-y-2">
                          {result.relationships.map((rel: any, idx: number) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg text-sm">
                              <strong>{rel.entity1}</strong>
                              <span className="mx-2 text-slate-500">→ {rel.relation} →</span>
                              <strong>{rel.entity2}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Generate Results */}
                {activeFeature === 'generate' && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      ✨ Generated Content
                    </h3>
                    <div className="prose max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {result.content}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-slate-500">
                      <span>Style: <strong>{result.style}</strong></span>
                      <span>Tone: <strong>{result.tone}</strong></span>
                      <span>Words: <strong>{result.wordCount}</strong></span>
                    </div>
                  </div>
                )}

                {/* Keywords Results */}
                {activeFeature === 'keywords' && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">
                      🔑 Keywords & Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Ready to Process
                </h3>
                <p className="text-slate-500">
                  Enter your text and click "Process Text" to see AI-powered analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextIntelligence;
