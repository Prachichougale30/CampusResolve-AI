import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-brand-600 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-600 tracking-wide uppercase">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      <p className="mt-2 text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
};

export default Loader;
