import { FiPlus, FiSearch, FiSettings, FiHelpCircle } from 'react-icons/fi';
 // fallback if needed
import type { Chat } from '../types';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggle: () => void;
  isCollapsed?: boolean; // new prop for collapsed state
  onSearchChats: () => void;
}

const Sidebar = ({ 
  chats, 
  currentChatId, 
  onChatSelect, 
  onNewChat, 
  onDeleteChat, 
  onToggle,
  isCollapsed = false,
  onSearchChats,
}: SidebarProps) => {
  const [logoHovered, setLogoHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight;
    }
  }, [chats.length]);

  // Collapsed sidebar: only icons
  if (isCollapsed) {
    return (
      <div ref={sidebarRef} className="fixed inset-y-0 left-0 z-50 w-16 bg-[#181c2b] text-white flex flex-col h-screen border-r border-gray-800 transition-all duration-500 ease-in-out">
        {/* Top section */}
        <div className="flex flex-col gap-2 items-center w-full mt-4">
          <div className="flex items-center justify-center w-full px-2 mb-8">
            <button
              onClick={onToggle}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none cursor-expand-arrows"
              title="Expand sidebar"
              aria-label="Expand sidebar"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="transition-all duration-200 flex items-center justify-center" style={{ width: 20, height: 18 }}>
                {logoHovered ? (
                  <svg width="20" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="2" width="20" height="14" rx="5" stroke="#ccc" strokeWidth="2" fill="none" />
                    <rect x="10" y="2" width="2" height="14" rx="1" fill="#ccc" />
                  </svg>
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-indigo-400" style={{ lineHeight: 1 }}>Ω</span>
                )}
              </span>
            </button>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-700" onClick={onNewChat}><FiPlus size={18} /></button>
          <button className="p-2 rounded-lg hover:bg-gray-700" onClick={onSearchChats}><FiSearch size={18} /></button>
          {/* <button className="p-2 rounded-lg hover:bg-gray-700"><FiBookOpen size={18} /></button>
          <button className="p-2 rounded-lg hover:bg-gray-700"><FiUser size={18} /></button> */}
        </div>
        {/* Chats section (scrollable) */}
        <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-1 mt-4">
          {/* You can add a label or just the chat icons here if needed */}
          {/* Example: <div className='text-xs text-gray-400 uppercase mb-2 tracking-wider'>Chats</div> */}
          {/* Render chat icons or mini chat list here if desired */}
        </div>
        {/* Bottom section */}
        <div className="flex flex-col items-center gap-3 w-full mb-2">
          <button className="p-1 rounded-lg hover:bg-gray-700"><FiSettings size={16} /></button>
          <button className="p-1 rounded-lg hover:bg-gray-700"><FiHelpCircle size={16} /></button>
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold mb-1">A</div>
        </div>
      </div>
    );
  }

  // Expanded sidebar
  return (
    <div ref={sidebarRef} className={`
      fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#181c2b] text-white shadow-xl
      border-r border-gray-800 flex flex-col h-screen
      transform transition-all duration-500 ease-in-out
    `}>
      {/* Top Section */}
      <div className="flex items-center justify-between pt-4 pb-2 px-3 pl-4 border-b border-gray-800 mb-2">
        <span className="text-2xl font-bold tracking-tight text-indigo-400">Ω</span>
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors cursor-expand-arrows"
          title="Collapse sidebar"
        >
          {/* Custom SVG for vertical pill toggle */}
          <svg width="22" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="22" height="16" rx="6" stroke="#ccc" strokeWidth="2" fill="none" />
            <rect x="13" y="4" width="2" height="16" rx="1" fill="#ccc" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-1 px-3 pl-0">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-[0.96rem] font-normal"
        >
          <FiPlus className="text-lg" />
          New chat
        </button>
        <button onClick={onSearchChats} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-[0.96rem] font-normal">
          <FiSearch className="text-lg" />
          Search chats
        </button>
        {/* <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-[0.96rem] font-normal">
          <FiBookOpen className="text-lg" />
          Library
        </button> */}
        {/* <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-[0.96rem] font-normal">
          <FiUser className="text-lg" />
          Sora
        </button> */}
      </div>
      {/* Chats Section (scrollable) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 border-b border-gray-800 scrollbar-none">
        <div className="text-xs text-gray-400 uppercase px-2 mb-2 tracking-wider">Chats</div>
        {chats.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8 italic opacity-80">
            No conversations yet
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group flex items-center gap-2 px-3 py-2 pl-2 rounded-lg cursor-pointer
                  truncate transition-all duration-150
                  ${currentChatId === chat.id ? 'bg-indigo-700 text-white font-semibold' : 'hover:bg-gray-800 text-gray-200'}
                `}
                onClick={() => onChatSelect(chat.id)}
                title={chat.title}
              >
                <span className="flex-1 truncate text-left text-[0.96rem] font-normal">{chat.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded-full transition-opacity"
                  title="Delete chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Bottom section */}
      <div className="px-2 py-2 flex flex-col gap-1 mt-auto">
        <div className="flex items-center gap-2 px-1 py-1 rounded bg-gray-800">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">A</div>
          <div className="flex-1">
            <div className="font-semibold text-xs leading-tight">Ayush Arya</div>
            <div className="text-[10px] text-gray-400 leading-tight">Free</div>
          </div>
        </div>
        <button className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-700 transition-colors text-xs font-medium mt-1">
          <FiSettings className="text-base" />
          Settings
        </button>
        <button className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-700 transition-colors text-xs font-medium">
          <FiHelpCircle className="text-base" />
          Help
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 