
import React, { useState, useEffect, useCallback } from 'react';

interface AudioControlsProps {
  textToSpeak: string;
}

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
);


const AudioControls: React.FC<AudioControlsProps> = ({ textToSpeak }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.onstart = () => {
    setIsSpeaking(true);
    setIsPaused(false);
  };

  utterance.onpause = () => {
    setIsSpeaking(false);
    setIsPaused(true);
  };

  utterance.onresume = () => {
    setIsSpeaking(true);
    setIsPaused(false);
  };
  
  utterance.onend = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };
  

  useEffect(() => {
    return () => {
      // Cleanup: stop speech when component unmounts or text changes
      window.speechSynthesis.cancel();
    };
  }, [textToSpeak]);

  const handlePlay = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.cancel(); // Stop any previous utterance
      window.speechSynthesis.speak(utterance);
    }
  }, [isPaused, utterance]);
  
  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center space-x-4">
       <button
        onClick={handlePlay}
        disabled={isSpeaking}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white transition-all duration-200 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Play or Resume"
      >
        <PlayIcon className="w-8 h-8"/>
      </button>
       <button
        onClick={handlePause}
        disabled={!isSpeaking}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-500 text-white transition-all duration-200 hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        aria-label="Pause"
      >
        <PauseIcon className="w-8 h-8"/>
      </button>
       <button
        onClick={handleStop}
        disabled={!isSpeaking && !isPaused}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-500 text-white transition-all duration-200 hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        aria-label="Stop"
      >
        <StopIcon className="w-8 h-8"/>
      </button>
    </div>
  );
};

export default AudioControls;
