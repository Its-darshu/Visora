import React, { useState, useRef } from 'react';
import { visionService } from '../services/visionService';
import { textIntelligenceService } from '../services/textIntelligenceService';
import Header from '../components/Header';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  hasAudio?: boolean;
  timestamp: Date;
}

const AppIntelligencePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to Visora. Upload an image, ask a question, or use your voice to begin.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Use text intelligence for response
      const response = await textIntelligenceService.generateContent(
        inputText,
        'professional',
        'friendly',
        'medium'
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        hasAudio: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: 'Can you describe this image for me?',
      imageUrl,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const analysis = await visionService.analyzeImage(file);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: analysis.summary,
        hasAudio: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-[#EAEAEA] font-['Inter']" style={{
      background: 'radial-gradient(circle at top left, rgba(157,0,255,0.2), transparent 40%), radial-gradient(circle at bottom right, rgba(0,255,255,0.2), transparent 40%), #121212'
    }}>
      <Header />

      <div className="flex-1 flex justify-center p-4 sm:p-6 md:p-8 overflow-hidden pt-20">
        <div className="flex flex-col max-w-[960px] w-full rounded-xl glassmorphism">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-3 p-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'ai' && (
                  <div className="w-10 h-10 rounded-full border-2 border-[#9D00FF] bg-gradient-to-br from-purple-600 to-indigo-600 shrink-0"></div>
                )}

                <div className={`flex flex-1 flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <p className="text-[#ad92c9] text-sm font-medium">{message.type === 'ai' ? 'Visora' : 'You'}</p>
                  
                  <div className="flex flex-col gap-2 max-w-md">
                    <p className={`text-base leading-relaxed px-4 py-3 rounded-lg ${
                      message.type === 'ai'
                        ? 'bg-[#362348]/60 text-white'
                        : 'bg-[#00FFFF]/80 text-black'
                    }`}>
                      {message.content}
                    </p>

                    {message.imageUrl && (
                      <div className="w-full max-w-md rounded-lg overflow-hidden">
                        <img src={message.imageUrl} alt="Uploaded" className="w-full h-auto" />
                      </div>
                    )}

                    {message.hasAudio && message.type === 'ai' && (
                      <button
                        onClick={() => playAudio(message.content)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#362348]/80 hover:bg-[#362348] transition-colors w-fit"
                      >
                        <span className="material-symbols-outlined text-[#00FFFF] text-lg">play_arrow</span>
                        Play Audio
                      </button>
                    )}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0"></div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-end gap-3 p-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#9D00FF] bg-gradient-to-br from-purple-600 to-indigo-600 shrink-0"></div>
                <div className="flex flex-1 flex-col gap-1 items-start">
                  <p className="text-[#ad92c9] text-sm font-medium">Visora</p>
                  <div className="flex items-center space-x-2 rounded-lg px-4 py-3 bg-[#362348]/60">
                    <div className="w-2 h-2 bg-[#9D00FF] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#9D00FF] rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-[#9D00FF] rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 gap-3 mt-auto border-t border-solid border-t-[#362348]/50">
            <label className="flex w-full items-center gap-3">
              <div className="relative flex w-full flex-1 items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full h-12 px-6 pr-24 rounded-full bg-[#362348]/60 border-none text-white placeholder:text-[#ad92c9] focus:outline-none focus:ring-2 focus:ring-[#00FFFF] text-base"
                  placeholder="Ask Visora anything..."
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Upload Image"
                  >
                    <span className="material-symbols-outlined text-[#00FFFF]">image</span>
                  </button>
                  <button
                    className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Use Voice Input"
                  >
                    <span className="material-symbols-outlined text-[#00FFFF]">mic</span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="flex items-center justify-center rounded-full w-12 h-12 bg-[#00FFFF] text-black hover:bg-opacity-80 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                <span className="material-symbols-outlined text-2xl font-bold">send</span>
              </button>
            </label>
          </div>
        </div>
      </div>

      <style>{`
        .glassmorphism {
          background-color: rgba(30, 17, 34, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(54, 35, 72, 0.5);
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default AppIntelligencePage;
