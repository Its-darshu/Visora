// Image Service Test Component - Demonstrates fixes for URL encoding and content filtering

import React, { useState } from 'react';
import { aiImageService } from '../services/aiImageService';
import ImageDisplay from './ImageDisplay';

const ImageTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testCases = [
    {
      name: "Normal Educational Topic",
      prompt: "photosynthesis in plants, educational diagram"
    },
    {
      name: "Long Prompt (URL Length Test)",
      prompt: "A detailed educational illustration showing the complete process of photosynthesis in plants, including chloroplasts, sunlight absorption, carbon dioxide intake, water absorption through roots, and oxygen release, presented as a clear scientific diagram suitable for high school biology students"
    },
    {
      name: "Sensitive Content (Content Filtering Test)",
      prompt: "Jeffrey Epstein case legal studies"
    },
    {
      name: "Special Characters (URL Encoding Test)",
      prompt: "Mathematics: f(x) = x² + 2x - 1, graph & equation"
    }
  ];

  const runTest = async (testCase: any) => {
    setIsLoading(true);
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const result = await aiImageService.generateImage({
        prompt: testCase.prompt,
        style: 'educational',
        quality: 'high'
      });
      
      setTestResults(prev => [...prev, {
        name: testCase.name,
        prompt: testCase.prompt,
        result: result,
        success: result.success,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: testCase.name,
        prompt: testCase.prompt,
        result: null,
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTest(testCase);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between tests
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Image Service Tests</h2>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testCases.map((testCase, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{testCase.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{testCase.prompt}</p>
            <button
              onClick={() => runTest(testCase)}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Test This Case
            </button>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Test Results</h3>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{result.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">Prompt: {result.prompt}</p>
                
                {result.success && result.result && (
                  <div className="mt-3">
                    <p className="text-sm mb-2">
                      Source: <span className="font-medium">{result.result.source}</span>
                    </p>
                    <div className="w-full max-w-md">
                      <ImageDisplay 
                        imageUrl={result.result.url} 
                        isLoading={false}
                      />
                    </div>
                  </div>
                )}
                
                {!result.success && (
                  <p className="text-red-600 text-sm mt-2">
                    Error: {result.error || 'Unknown error'}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-2">Time: {result.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageTestComponent;