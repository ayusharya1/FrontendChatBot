import {  FiZap } from 'react-icons/fi';
import React from 'react';

interface HeaderProps {
  appName: string;
  subtitle: string;
  onDelete: () => void;
  icon?: React.ReactNode;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ appName, subtitle, isSidebarCollapsed }) => (
  <div className={`flex items-center justify-between px-6 pt-4 pb-2 ${!isSidebarCollapsed ? '' : 'pl-[5rem]'}`}>
    <div className="flex items-center gap-3">
      {/* <span className="text-2xl text-indigo-400 font-bold">{icon || 'Ω'}</span> */}
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
 
  </div>
);

export default Header; 