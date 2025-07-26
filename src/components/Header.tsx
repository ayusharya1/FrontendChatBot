// Header.tsx
import React from 'react';
import { FiZap } from 'react-icons/fi';

interface HeaderProps {
  appName: string;
  subtitle: string;
  onDelete: () => void;
  icon?: React.ReactNode;
  isSidebarCollapsed?: boolean;
  mode: 'normal' | 'professional';
  setMode: (mode: 'normal' | 'professional') => void;
}

const Header: React.FC<HeaderProps> = ({
  appName,
  subtitle,
  isSidebarCollapsed,
  mode,
  setMode
}) => (
  <div className={`flex items-center justify-between px-6 pt-4 pb-2 ${!isSidebarCollapsed ? '' : 'pl-[5rem]'}`}>
    <div className="flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{appName}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
          <span className="inline-block"><FiZap size={12} color="#facc15" /></span>
          {subtitle}
        </div>
      </div>
    </div>

    {/* 🔁 Mode Toggle */}
    <div className="text-sm text-white flex items-center gap-2">
      <label htmlFor="modeToggle" className="font-semibold text-gray-300">Mode:</label>
      <select
        id="modeToggle"
        value={mode}
        onChange={(e) => setMode(e.target.value as 'normal' | 'professional')}
        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-2 py-1 focus:outline-none"
      >
        <option value="normal">Normal</option>
        <option value="professional">Professional</option>
      </select>
    </div>
  </div>
);

export default Header;
