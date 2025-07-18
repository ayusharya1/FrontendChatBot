import { useRef, useEffect, useState } from 'react';
import React from 'react';
import { FiBookOpen, FiVideo, FiUser } from 'react-icons/fi';
import Header from './components/Header';
import ErrorBanner from './components/ErrorBanner';
import Suggestions from './components/Suggestions';
import InputBar from './components/InputBar';

import Sidebar from './components/Sidebar';
import ReactMarkdown from 'react-markdown';
import type { Chat} from './types';

const suggestions = [
  { icon: <FiUser />, text: 'When does library open?' },
  { icon: <FiVideo />, text: 'I lost my book?' },
  { icon: <FiBookOpen />, text: 'Contact details' },
];

// const navItems = [
//   { icon: <FiHome />, label: 'Control' },
//   { icon: <FiCheckSquare />, label: 'Do' },
//   { icon: <span className="text-3xl">Ω</span>, label: '' },
//   { icon: <FiClipboard />, label: 'Test' },
//   { icon: <FiLock />, label: 'Fun Lock' },
// ];

const API_BASE_URL = 'https://backendchatbot-2bou.onrender.com';

export default function App() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState('');
  const [name] = useState('Ayush');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Chat state
  const [chats, setChats] = useState<Chat[]>(() => [{
    id: Date.now().toString(),
    title: 'New chat',
    messages: [],
    createdAt: new Date()
  }]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chats[0]?.id || null);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Auto-dismiss error after 3 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Send message to backend and update chat history
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
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { id: Date.now().toString() + Math.random().toString(36).slice(2), role: 'assistant', content: data.answer, timestamp: new Date() }] }
            : chat
        ));
      } else {
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { id: Date.now().toString() + Math.random().toString(36).slice(2), role: 'assistant', content: 'Sorry, I did not understand the response.', timestamp: new Date() }] }
            : chat
        ));
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
      setInput('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length > 0 && currentChatId) {
      setInput(text);
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
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remaining = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remaining[0]?.id || null);
    }
  };

  // Format timestamp as h:mm A
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [currentChat && currentChat.messages.length]);

  return (
    <div className="min-h-[100vh] flex bg-black text-white relative">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <Header
          appName="Ridan Test 2"
          subtitle="IISER Mohali Library"
          onDelete={() => { /* real delete logic here, no error trigger */ }}
          icon={<span className="text-3xl text-indigo-400 font-bold">Ω</span>}
        />
        <ErrorBanner
          message={errorMessage || "Failed to load document."}
          subMessage="Please try again or check the file format."
          onRetry={() => setError(false)}
          visible={error}
        />
        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center px-4">
          <div
            ref={chatAreaRef}
            className="w-full max-w-lg flex flex-col gap-4 overflow-y-auto pb-8 scrollbar-none"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            {currentChat && currentChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-lg relative
                    ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white self-end'
                      : 'bg-[#23263a] text-indigo-100 self-start'}
                  `}
                >
                  {/* Sender and timestamp */}
                  <div className="flex items-center mb-1 gap-2">
                    {msg.role === 'assistant' && (
                      <span className="font-bold text-indigo-300 text-sm">Ridan by IISER</span>
                    )}
                    {msg.role === 'user' && (
                      <span className="font-bold text-indigo-100 text-sm">{name}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-2">{formatTime(msg.timestamp)}</span>
                  </div>
                  {/* Message content */}
                  <div className="prose prose-invert break-words">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Suggestions (only show if no messages yet) */}
        {currentChat && currentChat.messages.length === 0 && (
          <div className="absolute top-1/3 left-[10%] w-full flex flex-col items-center mt-[-7rem]">
            <div className="w-full max-w-lg text-center">
              <h1 className="text-3xl font-bold mb-2 mt-8">How can I help you,{name}?</h1>
              <div className="text-gray-300 mb-8">I'm your go-to AI for IISER Mohali library</div>
              <Suggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        )}
        {/* Input Area */}
        <div className="fixed bottom-[4.68%] left-[10%] w-full flex justify-center px-4 bg-black">
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
      {/* Hide scrollbar for chat area if not using Tailwind's plugin */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
