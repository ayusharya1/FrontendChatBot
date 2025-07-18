import { FiTrash2, FiZap } from 'react-icons/fi';
import React from 'react';

interface HeaderProps {
  appName: string;
  subtitle: string;
  onDelete: () => void;
  icon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ appName, subtitle, onDelete, icon }) => (
  <div className="flex items-center justify-between px-6 pt-6 pb-2">
    <div className="flex items-center gap-3">
      <span className="text-3xl text-indigo-400 font-bold">{icon || 'Ω'}</span>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{appName}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
          <span className="inline-block"><FiZap size={20} color="#facc15" /></span>
          {subtitle}
        </div>
      </div>
    </div>
    <button className="p-2 rounded-full hover:bg-gray-800 transition-colors" onClick={onDelete}>
      <FiTrash2 size={24} color="#f87171" />
    </button>
  </div>
);

export default Header; 