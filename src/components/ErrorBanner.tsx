import { FiAlertTriangle } from 'react-icons/fi';
import React from 'react';

interface ErrorBannerProps {
  message: string;
  subMessage: string;
  onRetry: () => void;
  visible: boolean;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, subMessage, onRetry, visible }) => {
  if (!visible) return null;
  return (
    <div className="mx-auto w-full max-w-lg mt-4 mb-6 bg-[#2a1d0e] border border-yellow-700 rounded-2xl flex items-center gap-3 px-6 py-4 shadow-lg">
      <FiAlertTriangle size={28} color="#facc15" />
      <div className="flex-1">
        <div className="font-semibold text-yellow-300">{message}</div>
        <div className="text-yellow-200 text-sm">{subMessage}</div>
      </div>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorBanner; 