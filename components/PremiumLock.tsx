import React from 'react';
import { Lock } from 'lucide-react';

interface PremiumLockProps {
  isLocked: boolean;
  onUnlock: () => void;
  children: React.ReactNode;
  blurAmount?: string;
  title?: string;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ isLocked, onUnlock, children, blurAmount = 'blur-sm', title = "Pro Feature" }) => {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className={`filter ${blurAmount} pointer-events-none select-none transition-all duration-300`}>
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px] p-6 text-center transition-colors">
        <div className="bg-slate-900 dark:bg-black p-3 rounded-full mb-3 shadow-xl">
            <Lock className="w-6 h-6 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-xs">
          Unlock deep insights, financial scoring, and live market data.
        </p>
        <button
          onClick={onUnlock}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105"
        >
          Unlock Pro
        </button>
      </div>
    </div>
  );
};