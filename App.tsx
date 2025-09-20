
import React, { useState, useCallback } from 'react';
import type { Lesson } from './types';
import { generateLesson, generateImage } from './services/geminiService';
import Header from './components/Header';
import TopicInputForm from './components/TopicInputForm';
import LessonDisplay from './components/LessonDisplay';
import ImageDisplay from './components/ImageDisplay';
import AudioControls from './components/AudioControls';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationOptions, setGenerationOptions] = useState({
    text: true,
    image: true,
    voice: true,
  });

  const handleGenerateLesson = useCallback(async (currentTopic: string) => {
    if (!currentTopic) {
      setError('Please enter a topic.');
      return;
    }
    if (!generationOptions.text && !generationOptions.image) {
      setError('Please select at least one output type (Text or Image).');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLesson(null);
    setImageUrl(null);
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    try {
      let lessonData: Lesson | null = null;
      // Text is a prerequisite for voice, so this check covers both
      if (generationOptions.text || generationOptions.voice) {
        lessonData = await generateLesson(currentTopic);
        setLesson(lessonData);
      }

      if (generationOptions.image) {
        const imagePrompt = lessonData
          ? `A vibrant and illustrative visual that represents the core idea of: "${lessonData.summary}". The style should be educational and visually appealing, like a modern textbook illustration. Avoid text in the image.`
          : `A vibrant and illustrative visual that represents the core idea of: "${currentTopic}". The style should be educational and visually appealing, like a modern textbook illustration. Avoid text in the image.`;
        const generatedImageUrl = await generateImage(imagePrompt);
        setImageUrl(generatedImageUrl);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate the lesson. Please check your API key and network connection.');
    } finally {
      setIsGenerating(false);
    }
  }, [generationOptions]);
  
  const lessonText = lesson 
    ? `${lesson.title}. ${lesson.introduction} ${lesson.keyConcepts.map(kc => `${kc.concept}. ${kc.explanation}`).join(' ')} ${lesson.summary}`
    : '';

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <TopicInputForm
            topic={topic}
            setTopic={setTopic}
            onSubmit={handleGenerateLesson}
            isLoading={isGenerating}
            generationOptions={generationOptions}
            setGenerationOptions={setGenerationOptions}
          />

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg my-4 flex items-center justify-between gap-4 flex-wrap" role="alert">
              <div>
                <p className="font-bold">An error occurred</p>
                <p>{error}</p>
              </div>
              {/* Only show "Try Again" for API-related errors */}
              {error.includes('Failed to generate') && (
                <button
                  onClick={() => handleGenerateLesson(topic)}
                  className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200 flex items-center gap-2 shrink-0"
                  disabled={isGenerating}
                  aria-label="Try generating the lesson again"
                >
                  <i className="fa-solid fa-arrows-rotate"></i>
                  <span>Try Again</span>
                </button>
              )}
            </div>
          )}


          <div className="mt-8 grid grid-cols-1 gap-8">
            {(isGenerating && generationOptions.text) || lesson ? (
                <LessonDisplay lesson={lesson} isLoading={isGenerating && generationOptions.text} />
             ) : null}
            
            {!isGenerating && (lesson || imageUrl) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {lesson && generationOptions.voice && <AudioControls textToSpeak={lessonText} />}
                <button
                  onClick={() => handleGenerateLesson(topic)}
                  className="w-full sm:w-auto bg-slate-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-200 flex items-center justify-center gap-2"
                  disabled={isGenerating}
                  aria-label="Regenerate"
                >
                  <i className="fa-solid fa-arrows-rotate"></i>
                  <span>Regenerate</span>
                </button>
              </div>
            )}
            
            {(isGenerating && generationOptions.image) || imageUrl ? (
                <ImageDisplay imageUrl={imageUrl} isLoading={isGenerating && generationOptions.image && !imageUrl} />
             ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
