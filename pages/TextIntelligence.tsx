import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { textIntelligenceService } from '../services/textIntelligenceService';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';
import { useChatHistory } from '../services/useHistory';
import { Timestamp } from 'firebase/firestore';

// Local icons from public folder
const imgMicIcon = "/images/mic icon.svg";
const imgUploadIcon = "/images/upload icon.svg";
const imgSubmitIcon = "/images/submit icon.svg";
const imgCopyIcon = "/images/copy button logo.svg";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  image?: string;
}

const TextIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { sessions, loading: historyLoading, loadSessions } = useChatHistory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);

  // Initialize speech recognition - SIMPLE VERSION
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        // Simple: just get the latest transcript
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('📝 Transcript:', transcript);
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🎤 Ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle microphone button click - SIMPLE VERSION
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop
      console.log('🛑 Stop');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Start
      console.log('▶️ Start');
      setInputText(''); // Clear input
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    }
  };

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
    const uploadedFile = selectedImage;
    setInputText('');
    setSelectedImage(null);
    setIsProcessing(true);

    try {
      let finalPrompt = userPrompt;
      
      // If PDF is uploaded, extract text first
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        try {
          console.log('📄 Extracting text from PDF...');
          const formData = new FormData();
          formData.append('file', uploadedFile);
          
          const pdfResponse = await fetch('http://localhost:5000/api/extract-pdf', {
            method: 'POST',
            body: formData
          });
          
          const pdfData = await pdfResponse.json();
          
          if (pdfData.success && pdfData.text) {
            console.log(`✅ PDF text extracted: ${pdfData.pages} pages, ${pdfData.wordCount} words`);
            
            // Create comprehensive prompt with PDF content for deep analysis
            finalPrompt = `I have uploaded a PDF document titled "${pdfData.filename}" with the following complete content:

📄 DOCUMENT DETAILS:
- Pages: ${pdfData.pages}
- Words: ${pdfData.wordCount}
- Characters: ${pdfData.charCount}

==== FULL PDF CONTENT START ====
${pdfData.text}
==== FULL PDF CONTENT END ====

ANALYSIS REQUEST:
${userPrompt}

INSTRUCTIONS FOR COMPREHENSIVE ANALYSIS:
1. Read and analyze the ENTIRE document content provided above
2. Reference specific sections, chapters, pages, or key points from the PDF
3. Provide detailed, thorough answers based on the complete document
4. If creating questions, ensure they cover the full scope of all ${pdfData.pages} pages
5. If summarizing, capture ALL major topics, concepts, and details from the entire document
6. Use bullet points for listing key points
7. Use numbered lists for steps or sequential information
8. Include specific examples or quotes from the PDF when relevant
9. Ensure your response demonstrates understanding of the complete document

Please provide a comprehensive, well-structured response based on the entire PDF content above.`;
          } else {
            throw new Error(pdfData.error || 'Failed to extract PDF text');
          }
        } catch (pdfError) {
          console.error('❌ PDF extraction failed:', pdfError);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I couldn't read the PDF file. Please make sure it's a text-based PDF, not a scanned image.",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsProcessing(false);
          return;
        }
      }
      
      // Build conversation context from recent messages
      const recentMessages = messages.slice(-6); // Last 3 exchanges
      const conversationContext = recentMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      // Create a conversational prompt with context
      const contextualPrompt = `You are VISORA's AI assistant, designed to help students learn and understand any topic.

Previous conversation:
${conversationContext}

Current user message: ${finalPrompt}

IMPORTANT FORMATTING INSTRUCTIONS:
- Use bullet points (•) for listing items or key points
- Use numbered lists (1., 2., 3.) for steps, procedures, or sequential information
- Add line breaks between paragraphs for better readability
- Use clear section headings when covering multiple topics
- Break up long text into digestible chunks
- Use proper spacing between different sections
- For code snippets, ALWAYS wrap them in triple backticks with language name
- Format: triple-backtick + language + newline + code + newline + triple-backtick
- Example for Python: three backticks python newline code newline three backticks

CONTENT INSTRUCTIONS:
- Provide comprehensive, detailed responses to help students learn
- If asked for an essay, article, or detailed explanation, provide it in full
- If asked for steps or "how-to", use numbered lists
- If listing features, options, or points, use bullet points
- Match the level of detail the student requests
- Be educational, accurate, and thorough
- Include examples when helpful
- For technical topics, explain concepts clearly with depth

Respond with well-formatted, easy-to-read content:`;

      const response = await textIntelligenceService.generateContent(
        contextualPrompt,
        'academic',
        'informative',
        'long'
      );
      
      // Convert markdown to readable format with proper line breaks
      let cleanResponse = response.content || "I'm here to help you learn! What would you like to know?";
      
      // Preserve line breaks and formatting
      cleanResponse = cleanResponse
        .replace(/\n\n/g, '\n\n')  // Keep double line breaks
        .replace(/\*\*/g, '')       // Remove bold markers but keep text
        .replace(/#{1,6}\s/g, '')   // Remove markdown headers but keep text
        .trim();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save chat session to Firestore
      if (currentUser) {
        try {
          console.log('💾 Saving chat session to database...');
          
          // Upload image if present
          let imageUrl: string | undefined;
          if (selectedImage) {
            imageUrl = await storageService.uploadImage(
              selectedImage,
              currentUser.uid,
              'chat'
            );
          }
          
          // Convert messages to Firestore format (omit undefined fields)
          const userMessageData: any = {
            role: 'user' as const,
            content: userPrompt,
            timestamp: Timestamp.fromDate(userMessage.timestamp)
          };
          
          // Only add imageUrl if it exists
          if (imageUrl) {
            userMessageData.imageUrl = imageUrl;
          }
          
          const newMessages = [
            userMessageData,
            {
              role: 'assistant' as const,
              content: cleanResponse,
              timestamp: Timestamp.fromDate(botMessage.timestamp)
            }
          ];
          
          // Update or create session
          if (currentSessionId) {
            // Get existing session and append new messages
            const existingSession = await firestoreService.getChatSession(currentSessionId);
            if (existingSession) {
              const allMessages = [...existingSession.messages, ...newMessages];
              await firestoreService.updateChatSession(currentSessionId, allMessages);
            }
          } else {
            const now = Timestamp.now();
            const sessionId = await firestoreService.saveChatSession({
              userId: currentUser.uid,
              messages: newMessages,
              createdAt: now,
              lastMessageAt: now
            });
            setCurrentSessionId(sessionId);
          }
          
          // Update API usage
          await firestoreService.updateUserApiUsage(currentUser.uid, 'chatMessages');
          
          // Reload chat history
          await loadSessions();
          
          console.log('✅ Chat session saved successfully!');
        } catch (saveError) {
          console.error('❌ Failed to save chat session:', saveError);
          // Don't show error to user, chat was successful
        }
      }
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
    if (file) {
      // Accept both images and PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedImage(file);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text to clipboard
  const handleCopyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Share message (native share API)
  const handleShareMessage = async (text: string, messageId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VISORA AI Response',
          text: text
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyMessage(text, messageId);
    }
  };

  // Export message as PDF with Visora branding
  const handleExportPDF = async (messageText: string, context: string) => {
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = 20;
      
      // Add Visora Logo with pixel blocks (matching Figma design)
      // Orange block
      doc.setFillColor(255, 119, 0); // #ff7700
      doc.rect(margin, currentY - 5, 6, 6, 'F');
      
      // Blue block
      doc.setFillColor(9, 0, 255); // #0900ff
      doc.rect(margin + 10, currentY + 2, 6, 6, 'F');
      
      // Yellow block
      doc.setFillColor(255, 187, 0); // #ffbb00
      doc.rect(margin + 20, currentY - 5, 6, 6, 'F');
      
      // Visora text in Silkscreen-style
      doc.setFontSize(20);
      doc.setFont('courier', 'bold'); // Monospace font for pixel look
      doc.setTextColor(0, 0, 0);
      doc.text('visora', margin + 2, currentY + 5);
      
      currentY += 20;
      
      // Add context/purpose in bold
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const contextLines = doc.splitTextToSize(context, contentWidth);
      doc.text(contextLines, margin, currentY);
      currentY += (contextLines.length * 7) + 10;
      
      // Add separator line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
      
      // Add content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(messageText, contentWidth);
      
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += 7;
      });
      
      // Add footer with timestamp
      const footer = `Generated by VISORA AI - ${new Date().toLocaleString()}`;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(footer, margin, pageHeight - 10);
      
      // Save the PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      doc.save(`visora-ai-response-${timestamp}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Function to render message content with code blocks
  const renderMessageContent = (text: string) => {
    // Match code blocks with optional language: ```language\ncode```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${key++}`} className="whitespace-pre-wrap">
            {textBefore}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'code';
      const code = match[2].trim();
      
      // Function to highlight comments in code
      const highlightCode = (codeText: string) => {
        const lines = codeText.split('\n');
        return lines.map((line, idx) => {
          // Check if line is a comment (starts with #, //, /* or *)
          const isComment = /^\s*(#|\/\/|\/\*|\*|<!--)/.test(line);
          return (
            <div key={idx}>
              <span style={{ color: isComment ? '#00ff00' : '#98985B' }}>
                {line}
              </span>
            </div>
          );
        });
      };
      
      parts.push(
        <div key={`code-${key++}`} className="my-3 w-full">
          <div 
            className="bg-[#33323B] border-2 border-black"
            style={{ 
              fontFamily: "'Silkscreen', monospace",
              boxShadow: '5px 5px 0px 0px #000000'
            }}
          >
            {/* Header with CODE TYPE and Copy button */}
            <div className="bg-[#33323B] border-b-2 border-black px-4 py-2 flex items-center justify-between">
              <span className="text-[14px] text-white font-bold uppercase">
                CODE TYPE: {language}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="bg-white text-black border border-black px-2 py-1 hover:bg-gray-200 transition-colors flex items-center gap-1"
                style={{ boxShadow: '2px 2px 0px 0px #000000', fontFamily: "'Silkscreen', monospace" }}
                title="Copy code"
              >
                <img src={imgCopyIcon} alt="Copy" className="w-4 h-4" />
                <span className="text-[10px] font-bold">COPY</span>
              </button>
            </div>
            {/* Code content with custom styling */}
            <div className="bg-[#33323B] p-4 overflow-x-auto">
              <pre className="text-[13px] leading-relaxed" style={{ fontFamily: "'Courier New', 'Consolas', monospace" }}>
                <code>{highlightCode(code)}</code>
              </pre>
            </div>
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`} className="whitespace-pre-wrap">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{text}</span>;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-1.5 gap-2">
        {/* Logo */}
        <div 
          className="bg-white border border-black flex items-center justify-center h-[65px] px-6 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/visual-intelligence')}
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <h1 className="text-[30px] font-bold text-black">VISORA</h1>
        </div>

        {/* Navigation Bar */}
        <nav 
          className="bg-[#e07400] border border-black flex items-center justify-center gap-0 h-[65px] flex-1 overflow-hidden"
          style={{ fontFamily: "'Silkscreen', monospace", boxShadow: '5px 5px 0px 0px #000000' }}
        >
          <button
            onClick={() => navigate('/visual-intelligence')}
            className="border border-black px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">VISUAL AI</span>
          </button>
          <button
            onClick={() => navigate('/generate-image')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">GENERATE</span>
          </button>
          <button
            onClick={() => navigate('/enhance-edit')}
            className="border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-black/10 transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">AI STUDIO</span>
          </button>
          <button
            onClick={() => navigate('/text-intelligence')}
            className="bg-[#523bb5] border border-black border-l-0 px-4 md:px-6 lg:px-8 h-full flex-1 min-w-0 hover:bg-[#6347d6] transition-colors flex items-center justify-center"
            style={{ textShadow: '#000000 2px 2px 0px' }}
          >
            <span className="text-[16px] md:text-[22px] lg:text-[28px] text-white whitespace-nowrap">CHAT</span>
          </button>
        </nav>

        {/* Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-[65px] w-[150px] flex items-center justify-center gap-2 px-3 bg-[#FFA500] border-2 border-black"
            style={{ filter: 'drop-shadow(5px 5px 0px #000000)' }}
          >
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-black bg-gray-200 flex-shrink-0">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#ffb7ce]">
                  <span className="text-2xl text-black" style={{ fontFamily: "'Silkscreen', monospace" }}>
                    {currentUser?.displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path d="M7 10L12 15L17 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
                onClick={async () => {
                  setShowProfileMenu(false);
                  await logout();
                  navigate('/auth');
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
          
          {/* History List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2 pb-2">
            {historyLoading ? (
              <div className="text-center text-black text-[14px]">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-black text-[14px]">No chat history yet</div>
            ) : (
              sessions.map((session) => {
                const firstMessage = session.messages?.[0]?.content || 'New conversation';
                const preview = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
                const date = session.lastMessageAt?.toDate ? new Date(session.lastMessageAt.toDate()).toLocaleDateString() : 'Recent';
                
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      // Load this session's messages
                      if (session.messages) {
                        const loadedMessages: Message[] = session.messages.map((msg: any, idx: number) => ({
                          id: `${session.id}_${idx}`,
                          text: msg.content,
                          sender: msg.role === 'user' ? 'user' : 'bot',
                          timestamp: msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()) : new Date(),
                          image: msg.imageUrl
                        }));
                        setMessages(loadedMessages);
                        setCurrentSessionId(session.id);
                      }
                    }}
                    className="bg-white border border-black p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    style={{ 
                      boxShadow: '5px 5px 0px 0px #000000',
                      fontFamily: "'Silkscreen', monospace"
                    }}
                  >
                    <div className="text-[12px] text-black font-bold">{date}</div>
                    <div className="text-[10px] text-black mt-1 break-words uppercase">{preview}</div>
                    <div className="text-[8px] text-gray-600 mt-1">{session.messages?.length || 0} MESSAGES</div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={() => {
              setMessages([]);
              setCurrentSessionId(null);
              setInputText('');
              setSelectedImage(null);
            }}
            className="bg-[#523bb5] border border-black text-white py-2 px-4 hover:bg-[#6347d6] transition-colors"
            style={{ boxShadow: '5px 5px 0px 0px #000000', fontFamily: "'Silkscreen', monospace" }}
          >
            + NEW CHAT
          </button>
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
            style={{ boxShadow: '5px 5px 0px 0px #000000', height: 'calc(100vh - 250px)' }}
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
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
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex flex-col max-w-[85%]">
                        <div
                          className={`p-4 border border-black ${
                            message.sender === 'user' ? 'bg-[#d3e4ff]' : 'bg-[#f0f0f0]'
                          }`}
                          style={{ fontFamily: "'Product Sans', sans-serif", boxShadow: '3px 3px 0px 0px #000000' }}
                        >
                          {message.image && (
                            <img src={message.image} alt="Uploaded" className="max-w-full mb-2 rounded" />
                          )}
                          <div className="text-black">
                            {renderMessageContent(message.text)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {/* Action buttons for bot messages */}
                        {message.sender === 'bot' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleCopyMessage(message.text, message.id)}
                              className={`border border-black px-3 py-1 transition-all text-[10px] flex items-center gap-1 ${
                                copiedMessageId === message.id 
                                  ? 'bg-[#00ff00] text-black' 
                                  : 'bg-white hover:bg-gray-100 text-black'
                              }`}
                              style={{ boxShadow: '2px 2px 0px 0px #000000', fontFamily: "'Silkscreen', monospace" }}
                              title="Copy to clipboard"
                            >
                              {copiedMessageId === message.id ? (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  COPIED!
                                </>
                              ) : (
                                <>
                                  <img src={imgCopyIcon} alt="Copy" className="w-3 h-3" />
                                  COPY
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleShareMessage(message.text, message.id)}
                              className="bg-white border border-black px-3 py-1 hover:bg-gray-100 transition-colors text-[10px] flex items-center gap-1"
                              style={{ boxShadow: '2px 2px 0px 0px #000000', fontFamily: "'Silkscreen', monospace" }}
                              title="Share"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                              </svg>
                              SHARE
                            </button>
                            
                            <button
                              onClick={() => {
                                // Get the user's question from previous message
                                const userQuestion = index > 0 ? messages[index - 1]?.text || 'AI Response' : 'AI Response';
                                handleExportPDF(message.text, `Question: ${userQuestion}`);
                              }}
                              className="bg-[#523bb5] border border-black text-white px-3 py-1 hover:bg-[#6347d6] transition-colors text-[10px] flex items-center gap-1"
                              style={{ boxShadow: '2px 2px 0px 0px #000000', fontFamily: "'Silkscreen', monospace" }}
                              title="Export as PDF"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                              </svg>
                              PDF
                            </button>
                          </div>
                        )}
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
            <div className="p-4 border-t-2 border-black">
              {/* File Preview */}
              {selectedImage && (
                <div className="mb-2 flex items-center gap-2 bg-[#f0f0f0] border border-black p-2" style={{ boxShadow: '3px 3px 0px 0px #000000' }}>
                  <div className="flex items-center gap-2 flex-1">
                    {selectedImage.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(selectedImage)} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover border border-black"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-500 border border-black flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PDF</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black" style={{ fontFamily: "'Silkscreen', monospace" }}>
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="bg-red-500 text-white border border-black px-2 py-1 text-xs hover:bg-red-600"
                    style={{ fontFamily: "'Silkscreen', monospace" }}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 items-end">
              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImage ? "Type your question about the file..." : "Type your message..."}
                className="flex-1 h-[60px] px-4 border-2 border-black focus:outline-none"
                style={{ fontFamily: "'Product Sans', sans-serif" }}
              />

              {/* Mic Button */}
              <button
                onClick={handleMicClick}
                className={`border-2 border-black h-[60px] w-[84px] flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-[#ff0000] animate-pulse' 
                    : 'bg-[#d3e5ff] hover:bg-[#c0d4ef]'
                }`}
                title={isListening ? 'Stop Recording' : 'Voice Input'}
                style={{ boxShadow: '3px 3px 0px 0px #000000' }}
              >
                <img 
                  src={imgMicIcon} 
                  alt="Mic" 
                  className={`w-[44px] h-[44px] ${isListening ? 'brightness-0 invert' : ''}`}
                />
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#d3e4ff] border-2 border-black h-[60px] w-[84px] flex items-center justify-center hover:bg-[#c0d4ef] transition-colors"
                title="Upload Image"
              >
                <img src={imgUploadIcon} alt="Upload" className="w-[44px] h-[44px]" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
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
                <img src={imgSubmitIcon} alt="Send" className="w-[44px] h-[44px]" />
              </button>
              </div>
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
