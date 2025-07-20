import React, { useState, useMemo } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import type { Chat } from '../types';

interface SearchChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const SearchChatsModal: React.FC<SearchChatsModalProps> = ({ isOpen, onClose, chats, currentChatId, onSelectChat }) => {
  const [query, setQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    return chats.filter(chat =>
      chat.title.toLowerCase().includes(query.toLowerCase()) ||
      chat.messages.some(m => m.content.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, chats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#23272f] rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-0 relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-700">
          <div className="flex items-center gap-2 w-full">
            <FiSearch className="text-gray-400 text-lg" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="bg-transparent outline-none border-none text-white text-base w-full placeholder-gray-400"
            />
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded hover:bg-gray-700 transition-colors text-gray-400">
            <FiX size={22} />
          </button>
        </div>
        {/* Chats List */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] py-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No chats found.</div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {filteredChats.map(chat => (
                <li
                  key={chat.id}
                  className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors rounded-lg ${chat.id === currentChatId ? 'bg-indigo-700 text-white' : 'hover:bg-gray-800 text-gray-200'}`}
                  onClick={() => { onSelectChat(chat.id); onClose(); }}
                >
                  <span className="flex-1 truncate text-left text-sm font-normal">{chat.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchChatsModal; 