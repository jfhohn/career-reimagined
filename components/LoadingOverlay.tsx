import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  subMessage?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message, subMessage }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full text-center">
        <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 bg-evergreen-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-evergreen-50 rounded-full">
                <Loader2 className="w-8 h-8 text-evergreen-900 animate-spin" />
            </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{message}</h3>
        {subMessage && <p className="text-slate-500 text-sm">{subMessage}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
