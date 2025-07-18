import React from 'react';

interface InputBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  placeholder?: string;
}

const InputBar: React.FC<InputBarProps> = ({ value, onChange, onSend, placeholder }) => (
  <div className="relative w-full max-w-2xl mb-[0.5rem]">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Ask me anything...'}
      className="w-full bg-[#181c2b] text-white placeholder-gray-400 rounded-full py-4 pl-6 pr-14 text-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      onKeyDown={e => {
        if (e.key === 'Enter' && value.trim().length > 0) onSend();
      }}
    />
    <button
      className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition-colors"
      onClick={() => value.trim().length > 0 && onSend()}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

export default InputBar; 