import { useRef, useEffect, useState } from 'react';
import React from 'react';
import { FiBookOpen, FiUser, FiAlertCircle } from 'react-icons/fi';
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
const API_BASE_URL = 'https://backendchatbot-2bou.onrender.com';

export default function App() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState('');
  // const [name] = useState('Ayush');
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

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
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message }),
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
        setPendingAssistantMessage(data.answer);
        setDisplayedAssistantMessage('');
        setIsTypewriting(true);
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
    }
  };

  // // Format timestamp as h:mm A
  // const formatTime = (date: Date) => {
  //   return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  // Enhance AI responses: insert emojis contextually, add friendly intro, improve readability
  function enhanceAIResponse(text: string): string {
    // Insert emojis contextually within the text
    let enhanced = text
      .replace(/(workshop[s]?)/gi, '$1 🎓')
      // .replace(/(book[s]?)/gi, '$1 📚')
      // .replace(/(contact|help|assist)/gi, '$1 🙋‍♂️')
      // .replace(/(digital resource[s]?|online|website|platform)/gi, '$1 🌐')
      .replace(/(thank(s| you)?|welcome|happy|glad|great|awesome|appreciate)/gi, '$1 😊')
      .replace(/(error|sorry|unavailable|not found|apolog|issue|problem|fail)/gi, '$1 ⚠️')
      .replace(/(congrat|celebrat|success|well done|good job)/gi, '$1 🎉');

    // Convert numbered lists, markdown bullets, and lines like 'Item 1:' to lines starting with •
    enhanced = enhanced
      .replace(/(?:^|\n)\s*\d+\.\s+/g, '\n• ')
      .replace(/(?:^|\n)[•*]\s+/g, '\n• ')
      .replace(/(?:^|\n)(Item|Step) \d+:\s+/gi, '\n• ');

    // Ensure bullets are on separate lines
    enhanced = enhanced.replace(/\n• /g, '\n\n• ');

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
        onChatSelect={setCurrentChatId}
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
          onDelete={() => { /* real delete logic here, no error trigger */ }}
          icon={<span className="text-3xl text-indigo-400 font-bold">Ω</span>}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <ErrorBanner
          message={errorMessage || "Failed to load document."}
          subMessage="Please try again or check the file format."
          onRetry={() => setError(false)}
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
        onSelectChat={setCurrentChatId}
      />
      {/* Hide scrollbar for chat area if not using Tailwind's plugin */}
      <style>{`
         .scrollbar-none::-webkit-scrollbar { display: none; }
         .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
