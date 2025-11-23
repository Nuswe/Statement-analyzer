import React from 'react';
import { WalletCards, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <WalletCards className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MalawiBank Analyzer</h1>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-sm font-medium text-slate-600">
          <span className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>NBM</span>
          </span>
          <span className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Standard Bank</span>
          </span>
          <span className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span>FDH</span>
          </span>
        </div>
      </div>
    </header>
  );
};