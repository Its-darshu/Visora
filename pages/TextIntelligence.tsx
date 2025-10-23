import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { textIntelligenceService } from '../services/textIntelligenceService';

// Figma assets
const imgProfile = "http://localhost:3845/assets/b36fb9a23aa0879e9d468c45544441be50dc416b.svg";
const imgMaterialSymbolsMic = "http://localhost:3845/assets/ab77041ce23a001b94fff29d324ed7489a7b576a.svg";
const imgMaterialSymbolsUpload = "http://localhost:3845/assets/557bb38354a7d4486fce8183544baab7eb2b20ad.svg";
const imgMingcuteArrowUpFill = "http://localhost:3845/assets/d70bec6c72191b8579a099650b0e19ac3297b32a.svg";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  image?: string;
}

const TextIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = inputText;
    setInputText('');
    setSelectedImage(null);
    setIsProcessing(true);

    try {
      // Build conversation context from recent messages
      const recentMessages = messages.slice(-6); // Last 3 exchanges
      const conversationContext = recentMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      // Create a conversational prompt with context
      const contextualPrompt = `You are VISORA's friendly AI assistant in a chat conversation. 

Previous conversation:
${conversationContext}

Current user message: ${userPrompt}

IMPORTANT INSTRUCTIONS:
- Keep your response SHORT and CONVERSATIONAL (2-4 sentences max)
- Match the length of the user's message - short question = short answer
- Be natural and friendly like texting a friend
- NO markdown formatting (no ##, **, bullets)
- NO long paragraphs or essays
- If asked something simple, give a simple answer
- If it's a follow-up question, reference the previous conversation
- Use natural language, not formal writing

Respond briefly and naturally:`;

      const response = await textIntelligenceService.generateContent(
        contextualPrompt,
        'casual',
        'friendly',
        'short'
      );
      
      // Clean up any markdown formatting that might slip through
      let cleanResponse = response.content || "I'm here to help! What would you like to know?";
      cleanResponse = cleanResponse.replace(/#{1,6}\s/g, ''); // Remove markdown headers
      cleanResponse = cleanResponse.replace(/\*\*/g, ''); // Remove bold
      cleanResponse = cleanResponse.replace(/\*/g, ''); // Remove italic
      cleanResponse = cleanResponse.replace(/^\d+\.\s/gm, ''); // Remove numbered lists
      cleanResponse = cleanResponse.replace(/^[-•]\s/gm, ''); // Remove bullet points
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response if service fails
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I had trouble processing that. Could you try asking again?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-1.5 gap-2">
        {/* Logo */}
        <div 
          className="bg-white border border-black flex items-center justify-center h-[89px] px-6 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h1 className="text-[40px] font-bold text-black">VISORA</h1>
        </div>

        {/* Navigation Bar */}
        <nav 
          className="bg-[#e07400] border border-black flex items-center justify-center gap-0 h-[89px] flex-1 overflow-hidden"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <button
            onClick={() => navigate('/visual-intelligence')}
            className="border border-black px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">VISUAL AI</span>
          </button>
          <button
            onClick={() => navigate('/generate-image')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">AI STUDIO</span>
          </button>
          <button
            onClick={() => navigate('/text-intelligence')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[20px] md:text-[28px] lg:text-[36px] text-white whitespace-nowrap">CHAT</span>
          </button>
        </nav>

        {/* Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-[89px] w-[182px] flex items-center justify-center"
            style={{ filter: 'drop-shadow(5px 5px 0px #000000)' }}
          >
            <img src={imgProfile} alt="Profile" className="w-full h-full object-contain" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-black z-50 min-w-[180px]" style={{ boxShadow: '5px 5px 0px 0px #000000' }}>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-black text-black"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  // Add logout logic here
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 text-black"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-4 p-4 mt-4">
        {/* Left Sidebar - History */}
        <aside 
          className="bg-[#d8d8d8] border border-black w-full lg:w-[239px] p-4 flex flex-col gap-4"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h2 className="text-[20px] text-black text-center">HISTORY</h2>
          <div className="bg-white border border-black h-[44px]" style={{ boxShadow: '5px 5px 0px 0px #000000' }}></div>
        </aside>

        {/* Center Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Description Banner */}
          <div 
            className="bg-[#79d7a8] border border-black p-4"
            style={{ fontFamily: "'Product Sans', sans-serif", fontWeight: 300, boxShadow: '5px 5px 0px 0px #000000' }}
          >
            <p className="text-[18px] md:text-[24px] text-black">
              Turn visuals into words. VISORA's Visual AI analyzes your image and generates clear, detailed text descriptions in seconds.
            </p>
          </div>

          {/* Chat Container */}
          <div 
            className="bg-white border-4 border-black flex flex-col"
            style={{ boxShadow: '5px 5px 0px 0px #000000', height: '587px' }}
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(587px - 100px)' }}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-[24px] text-gray-400" style={{ fontFamily: "'Silkscreen', monospace" }}>
                      Start a conversation...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 border border-black ${
                          message.sender === 'user' ? 'bg-[#d3e4ff]' : 'bg-[#f0f0f0]'
                        }`}
                        style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '3px 3px 0px 0px #000000' }}
                      >
                        {message.image && (
                          <img src={message.image} alt="Uploaded" className="max-w-full mb-2 rounded" />
                        )}
                        <p className="text-black">{message.text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-[#f0f0f0] p-4 border border-black" style={{ boxShadow: '3px 3px 0px 0px #000000' }}>
                        <p className="text-black" style={{ fontFamily: "'Product Sans', sans-serif" }}>
                          Typing...
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 flex gap-2 items-end border-t-2 border-black">
              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 h-[60px] px-4 border-2 border-black focus:outline-none"
                style={{ fontFamily: "'Product Sans', sans-serif" }}
              />

              {/* Mic Button */}
              <button
                className="bg-[#d3e5ff] border-2 border-black h-[60px] w-[84px] flex items-center justify-center hover:bg-[#c0d4ef] transition-colors"
                title="Voice Input"
              >
                <img src={imgMaterialSymbolsMic} alt="Mic" className="w-[44px] h-[44px]" />
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#d3e4ff] border-2 border-black h-[60px] w-[84px] flex items-center justify-center hover:bg-[#c0d4ef] transition-colors"
                title="Upload Image"
              >
                <img src={imgMaterialSymbolsUpload} alt="Upload" className="w-[44px] h-[44px]" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() && !selectedImage}
                className="bg-[#c5b5ff] border-2 border-black h-[60px] w-[84px] flex items-center justify-center hover:bg-[#b3a0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send"
              >
                <img src={imgMingcuteArrowUpFill} alt="Send" className="w-[44px] h-[44px]" />
              </button>
            </div>

            {selectedImage && (
              <div className="px-4 pb-2 flex items-center gap-2">
                <span className="text-sm text-black">Image attached: {selectedImage.name}</span>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-sm text-red-600 underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Product+Sans:wght@300;400;500;700&display=swap');
      `}</style>
    </div>
  );
};

export default TextIntelligence;
