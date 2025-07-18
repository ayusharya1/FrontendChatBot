import React from 'react';

interface Suggestion {
  icon: React.ReactNode;
  text: string;
}

interface SuggestionsProps {
  suggestions: Suggestion[];
  onSuggestionClick?: (text: string) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSuggestionClick }) => (
  <div className="flex flex-col gap-4 mb-10">
    {suggestions.map((s, i) => (
      <button
        key={i}
        className="flex items-center gap-3 w-full justify-center bg-[#181c2b] hover:bg-[#23263a] text-indigo-300 font-semibold py-3 rounded-2xl text-lg shadow transition-colors"
        onClick={() => onSuggestionClick && onSuggestionClick(s.text)}
      >
        <span className="text-xl">{s.icon}</span>
        {s.text}
      </button>
    ))}
  </div>
);

export default Suggestions; 