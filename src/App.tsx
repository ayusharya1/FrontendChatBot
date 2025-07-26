import { useRef, useEffect, useState } from 'react';
import React from 'react';
import { FiBookOpen, FiUser, FiAlertCircle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import Header from './components/Header';
import ErrorBanner from './components/ErrorBanner';
import Suggestions from './components/Suggestions';
import InputBar from './components/InputBar';

import Sidebar from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import type { Chat } from './types';
import SearchChatsModal from './components/SearchChatsModal';

const suggestions = [
  { icon: <FiUser />, text: 'When does library open?' },
  { icon: <FiAlertCircle />, text: 'I lost my book?' },
  { icon: <FiBookOpen />, text: 'Contact details' },
];

// const navItems = [
//   { icon: <FiHome />, label: 'Control' },
//   { icon: <FiCheckSquare />, label: 'Do' },
//   { icon: <span className="text-3xl">Ω</span>, label: '' },
//   { icon: <FiClipboard />, label: 'Test' },
//   { icon: <FiLock />, label: 'Fun Lock' },
// ];

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://backendchatbot-2bou.onrender.com/';

export default function App() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState('');
  // const [name] = useState('Ayush');
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
const [mode, setMode] = useState<'normal' | 'professional'>('normal');
const [modeError, setModeError] = useState('');
const [showCodeModal, setShowCodeModal] = useState(false);
const [codeInput, setCodeInput] = useState('');
const [showPassword, setShowPassword] = useState(false);

// Handler for mode change with custom modal
const handleModeChange = (newMode: 'normal' | 'professional') => {
  if (newMode === 'professional') {
    setShowCodeModal(true);
  } else {
    setMode('normal');
    setModeError('');
  }
};

const handleCodeSubmit = (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (codeInput === 'IISERM') {
    setMode('professional');
    setModeError('');
    setShowCodeModal(false);
    setCodeInput('');
  } else {
    setMode('normal');
    setModeError('Incorrect code. Professional mode not enabled.');
    setCodeInput(''); // Clear password input on wrong code
  }
};

const handleCodeModalClose = () => {
  setShowCodeModal(false);
  setCodeInput('');
  setMode('normal');
  setModeError('');
  setShowPassword(false);
};

  // Chat state
  const [chats, setChats] = useState<Chat[]>(() => {
    const stored = localStorage.getItem('chats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Optionally, convert date strings back to Date objects if needed
        return parsed;
      } catch {
        // fallback to default
      }
    }
    return [{
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
      createdAt: new Date()
    }];
  });
  
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    // Try to get the current chat ID from localStorage
    const storedCurrentChatId = localStorage.getItem('currentChatId');
    if (storedCurrentChatId) {
      return storedCurrentChatId;
    }
    return null;
  });

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Persist current chat ID to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    } else {
      localStorage.removeItem('currentChatId');
    }
  }, [currentChatId]);

  // Initialize current chat on first load
  useEffect(() => {
    if (!currentChatId && chats.length > 0) {
      // If no current chat is set, select the first (most recent) chat
      setCurrentChatId(chats[0].id);
    } else if (currentChatId && !chats.find(chat => chat.id === currentChatId)) {
      // If current chat ID exists but the chat doesn't exist (was deleted), select the first available chat
      setCurrentChatId(chats.length > 0 ? chats[0].id : null);
    }
  }, [chats, currentChatId]);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Handle chat selection with cleanup
  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    // Clear any pending assistant messages when switching chats
    setPendingAssistantMessage('');
    setDisplayedAssistantMessage('');
    setIsTypewriting(false);
  };

  // Auto-dismiss error after 3 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Add these states at the top of the App component
  const [displayedAssistantMessage, setDisplayedAssistantMessage] = useState<string>('');
  const [isTypewriting, setIsTypewriting] = useState(false);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<string>('');

  // Modify sendMessageToBackend to use typewriter effect
  const sendMessageToBackend = async (message: string) => {
    setLoading(true);
    try {
      const body = mode === 'professional'
        ? { question: message, mode, access_code: codeInput || 'IISERM' }
        : { question: message, mode, access_code: null };
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        let msg = 'Backend error';
        try {
          const data = await response.json();
          if (data && data.error) msg = data.error;
        } catch {}
        throw new Error(msg);
      }
      const data = await response.json();
      if (typeof data.answer === 'string') {
        // Check for error pattern
        if (
          data.answer.includes('Error occurred:') ||
          data.answer.includes('⚠️') ||
          data.answer.toLowerCase().includes('quota') ||
          data.answer.toLowerCase().includes('insufficient_quota')
        ) {
          setError(true);
          setErrorMessage(data.answer);
          setPendingAssistantMessage('');
          setDisplayedAssistantMessage('');
          setIsTypewriting(false);
        } else {
          setPendingAssistantMessage(data.answer);
          setDisplayedAssistantMessage('');
          setIsTypewriting(true);
        }
      } else {
        setPendingAssistantMessage('Sorry, I did not understand the response.');
        setDisplayedAssistantMessage('');
        setIsTypewriting(true);
      }
    } catch (e: any) {
      let msg = 'An unexpected error occurred.';
      if (e instanceof Error) msg = e.message;
      if (message.trim().length > 0 && input.trim() === message.trim()) {
        setError(true);
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input change and clear error if input is empty
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim().length === 0) setError(false);
  };

  // Handle input bar send
  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed.length > 0 && currentChatId) {
      setInput(''); // Clear input immediately
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const newMessages = [...chat.messages, { id: Date.now().toString() + Math.random().toString(36).slice(2), role: 'user' as const, content: trimmed, timestamp: new Date() }];
          // If this is the first message, update the chat title
          const newTitle = chat.messages.length === 0 ? (trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed) : chat.title;
          return { ...chat, messages: newMessages, title: newTitle };
        }
        return chat;
      }));
      sendMessageToBackend(trimmed);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length > 0 && currentChatId) {
      // Do NOT setInput(text) here; just send the message directly
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const newMessages = [...chat.messages, { id: Date.now().toString() + Math.random().toString(36).slice(2), role: 'user' as const, content: trimmed, timestamp: new Date() }];
          // If this is the first message, update the chat title
          const newTitle = chat.messages.length === 0 ? (trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed) : chat.title;
          return { ...chat, messages: newMessages, title: newTitle };
        }
        return chat;
      }));
      sendMessageToBackend(text);
    }
  };

  // Sidebar actions
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
      createdAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setInput('');
    // Clear any pending assistant messages when creating a new chat
    setPendingAssistantMessage('');
    setDisplayedAssistantMessage('');
    setIsTypewriting(false);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const updated = prev.filter(chat => chat.id !== chatId);
      localStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
    if (currentChatId === chatId) {
      const remaining = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remaining[0]?.id || null);
      // Clear any pending assistant messages when switching chats
      setPendingAssistantMessage('');
      setDisplayedAssistantMessage('');
      setIsTypewriting(false);
    }
  };

  // // Format timestamp as h:mm A
  // const formatTime = (date: Date) => {
  //   return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  // Enhance AI responses: insert emojis contextually, add friendly intro, improve readability
  function enhanceAIResponse(text: string): string {
    // Remove emoji enhancements

    // Convert numbered lists, markdown bullets, and lines like 'Item 1:' to lines starting with •
    let enhanced = text
      .replace(/(?:^|\n)\s*\d+\.\s+/g, '\n• ')
      .replace(/(?:^|\n)[•*]\s+/g, '\n• ')
      .replace(/(?:^|\n)(Item|Step) \d+:\s+/gi, '\n• ');

    // Ensure bullets are on separate lines and all content is on its own line
    enhanced = enhanced.replace(/\n• /g, '\n\n• ');
    enhanced = enhanced.replace(/([^\n])\n• /g, '$1\n\n• '); // Extra safety for bullets
    enhanced = enhanced.replace(/([^\n])\n/g, '$1\n'); // Ensure all content is on its own line

    // Add a friendly intro only for long responses
    const isLong = enhanced.length > 520 || (enhanced.match(/\n\n/g) || []).length > 0;
    if (isLong) {
      enhanced = `Here's what I found for you!\n\n${enhanced}`;
    }

    return enhanced;
  }

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  // Scroll to bottom on new message
  useEffect(() => {
    if (
      chatAreaRef.current &&
      currentChat &&
      currentChat.messages.length > prevMsgCount.current
    ) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    prevMsgCount.current = currentChat ? currentChat.messages.length : 0;
  }, [currentChat && currentChat.messages.length]);

  useEffect(() => {
    const chatDiv = chatAreaRef.current;
    if (!chatDiv) return;
    const onScroll = () => {
      // setShowScrollButton(chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight > 100);
    };
    chatDiv.addEventListener('scroll', onScroll);
    return () => chatDiv.removeEventListener('scroll', onScroll);
  }, [chatAreaRef, currentChat && currentChat.messages.length]);

  // const scrollToBottom = () => {
  //   if (chatAreaRef.current) {
  //     chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
  //   }
  // };

  // Add useEffect for typewriter animation
  useEffect(() => {
    if (isTypewriting && pendingAssistantMessage) {
      setDisplayedAssistantMessage('');
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedAssistantMessage(pendingAssistantMessage.slice(0, i + 1));
        i++;
        if (i >= pendingAssistantMessage.length) {
          clearInterval(interval);
          // Add the full message to chat history
          setChats(prev => prev.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, { id: Date.now().toString() + Math.random().toString(36).slice(2), role: 'assistant', content: pendingAssistantMessage, timestamp: new Date() }] }
              : chat
          ));
          setIsTypewriting(false);
          setPendingAssistantMessage('');
          setDisplayedAssistantMessage('');
        }
      }, 20); // Adjust speed as desired
      return () => clearInterval(interval);
    }
  }, [isTypewriting, pendingAssistantMessage, currentChatId, setChats]);

  return (
    <div className="min-h-[100vh] flex bg-black text-white relative">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        onSearchChats={() => setIsSearchModalOpen(true)}
      />
      {/* Main area */}
      <div className="flex-1 flex flex-col">
      <Header
  appName="Ridan"
  subtitle="IISER Mohali Library"
  onDelete={() => {}}
  icon={<span className="text-3xl text-indigo-400 font-bold">Ω</span>}
  isSidebarCollapsed={isSidebarCollapsed}
  mode={mode}
  setMode={handleModeChange}
/>

      {/* Professional Mode Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#23272f] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-0 relative flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-700">
              <div className="text-lg font-semibold text-white">Enter Professional Mode Code</div>
              <button onClick={handleCodeModalClose} className="ml-4 p-2 rounded hover:bg-gray-700 transition-colors text-gray-400">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4 px-6 py-6">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-indigo-400">
                  <FiLock size={20} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  placeholder="Enter Password"
                  className="bg-gray-800 border border-gray-600 text-white text-base rounded-md pl-10 pr-10 py-2 focus:outline-none placeholder-gray-400 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-indigo-400 hover:text-indigo-200 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {modeError && <div className="text-red-400 text-sm font-medium">{modeError}</div>}
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md px-4 py-2 transition-colors"
              >
                Unlock Professional Mode
              </button>
            </form>
          </div>
        </div>
      )}
      <ErrorBanner
        message={errorMessage || "Failed to load document."}
        subMessage="Please try again or check the file format."
        onRetry={() => { setError(false); setModeError(''); }}
        visible={error}
      />
        {/* Chat Area */}
        <div className="flex-1 flex flex-col px-0">
          <div
            ref={chatAreaRef}
            className="w-full h-full flex flex-col gap-4 overflow-y-auto pb-8 pt-2 scrollbar-none scroll-smooth"
            style={{ height: 'calc(100vh - 180px)' }}
          >
            <div className="w-full flex flex-col items-center">
              {currentChat && currentChat.messages.map((msg, idx) => (
                <React.Fragment key={msg.id}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert w-full max-w-3xl leading-7 tracking-normal text-[1.05rem]">
                      <ReactMarkdown>{enhanceAIResponse(msg.content)}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className={`flex justify-end w-[63%] ${idx > 0 && currentChat.messages[idx-1].role === 'assistant' ? ' mt-[4rem]' : 'mt-[1.5rem]'}`}>
                      <div className="rounded-2xl px-6 py-4 mb-3 shadow-lg transition-all duration-200 bg-indigo-600 text-white max-w-xl hover:shadow-xl focus-within:shadow-xl">
                        <span className="break-words leading-relaxed tracking-normal text-light">{msg.content}</span>
                      </div>
                    </div>
                  )}
                  {idx < (currentChat.messages.length - 1) && (
                    <div className="w-full h-2" />
                  )}
                </React.Fragment>
              ))}
              {/* Show the typewriting assistant message if in progress */}
              {isTypewriting && displayedAssistantMessage && (
                <div className="prose prose-invert w-full max-w-3xl leading-7 tracking-normal text-[1.08rem]">
                  <ReactMarkdown>{enhanceAIResponse(displayedAssistantMessage)}</ReactMarkdown>
                </div>
              )}
            </div>
            {/* Remove the loading spinner for assistant typing, as the typewriter effect replaces it */}
            {!isTypewriting && loading && (
              <div className="py-4 text-center text-gray-500 animate-pulse">
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assistant is thinking...
                </span>
              </div>
            )}
          </div>
          {/* Scroll-to-bottom button removed */}
        </div>
        {/* Suggestions (only show if no messages yet) */}
        {currentChat && currentChat.messages.length === 0 && (
          <div
            className="absolute top-1/3 w-full flex flex-col items-center mt-[-7rem] z-30"
            style={{ left: isSidebarCollapsed ? '2rem' : '11%' }}
          >
            <div className="w-full max-w-[33rem] text-center  bg-opacity-95  p-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 mt-6 text-indigo-400 drop-shadow-lg tracking-tight">How can I help you?</h1>
              <div className="text-gray-300 text-lg md:text-lg font-medium mb-8">I'm your go-to AI for <span className='text-indigo-300 font-semibold'>IISER Mohali Library</span></div>
              <Suggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        )}
        {/* Input Area */}
        <div
          className="fixed bottom-[4.68%] flex justify-center px-4 bg-black z-40 transition-all duration-300"
          style={{
            left: isSidebarCollapsed ? '5rem' : '19rem',
            width: isSidebarCollapsed ? 'calc(100vw - 4rem)' : 'calc(100vw - 18rem)'
          }}
        >
          <InputBar
            value={input}
            onChange={handleInputChange}
            onSend={handleSend}
            placeholder={loading ? 'Waiting for response...' : 'Ask me anything...'}
          />
        </div>
        {/* Bottom Navigation Bar */}
        {/* <BottomNav navItems={navItems} activeIndex={2} /> */}
      </div>
      <SearchChatsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleChatSelect}
      />
      {/* Hide scrollbar for chat area if not using Tailwind's plugin */}
      <style>{`
         .scrollbar-none::-webkit-scrollbar { display: none; }
         .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
