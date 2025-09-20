import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface GenerationOptions {
    text: boolean;
    image: boolean;
    voice: boolean;
}

interface TopicInputFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  generationOptions: GenerationOptions;
  setGenerationOptions: (options: GenerationOptions) => void;
}

const TopicInputForm: React.FC<TopicInputFormProps> = ({ topic, setTopic, onSubmit, isLoading, generationOptions, setGenerationOptions }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topic);
    setIsOptionsOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
            setIsOptionsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionChange = (option: keyof GenerationOptions) => {
    const newOptions = { ...generationOptions };
    newOptions[option] = !newOptions[option];

    // Voice requires text. If voice is enabled, force text to be enabled.
    if (option === 'voice' && newOptions.voice) {
        newOptions.text = true;
    }
    // If text is disabled, voice must also be disabled.
    if (option === 'text' && !newOptions.text) {
        newOptions.voice = false;
    }

    setGenerationOptions(newOptions);
  };

  const handleSelectAllChange = () => {
    const isAllSelected = generationOptions.text && generationOptions.image && generationOptions.voice;
    setGenerationOptions({
        text: !isAllSelected,
        image: !isAllSelected,
        voice: !isAllSelected,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative shadow-lg rounded-xl">
      <div className="flex items-center bg-white rounded-xl p-2 border-2 border-transparent focus-within:border-indigo-500 transition-all duration-300">
        <div className="relative" ref={optionsRef}>
          <button
            type="button"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="p-3 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-haspopup="true"
            aria-expanded={isOptionsOpen}
            aria-label="Generation options"
          >
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
          {isOptionsOpen && (
            <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-10">
              <p className="font-semibold text-slate-700 mb-3">Generation Options</p>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationOptions.text && generationOptions.image && generationOptions.voice}
                    onChange={handleSelectAllChange}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-700">All Options</span>
                </label>
                <hr className="border-slate-200" />
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationOptions.text}
                    onChange={() => handleOptionChange('text')}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-600">Lesson Text</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationOptions.image}
                    onChange={() => handleOptionChange('image')}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-600">Generate Image</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationOptions.voice}
                    onChange={() => handleOptionChange('voice')}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`text-slate-600 ${!generationOptions.text ? 'opacity-50' : ''}`}>Voice Narration</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What do you want to learn about today?"
          className="w-full p-3 bg-white text-lg text-slate-800 placeholder-slate-400 focus:outline-none"
          aria-label="Topic to learn"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-wait transition duration-200 flex items-center gap-2"
          aria-label="Generate lesson"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-bolt"></i>
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TopicInputForm;