import React from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
}

interface BottomNavProps {
  navItems: NavItem[];
  activeIndex?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ navItems, activeIndex = 2 }) => (
  <nav className="fixed bottom-0 left-0 w-full  bg-[#181c2b] border-t border-gray-800 flex justify-between items-center px-4 pb-2 z-50">
    {navItems.map((item, idx) => (
      <div key={idx} className={`flex flex-col items-center flex-1 `}>
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-full ${idx === activeIndex ? 'bg-indigo-600 shadow-lg text-white text-3xl' : 'text-gray-400'} transition-all`}
        >
          {item.icon}
        </button>
        {item.label && <span className="text-xs mt-1 text-gray-400">{item.label}</span>}
      </div>
    ))}
  </nav>
);

export default BottomNav; 