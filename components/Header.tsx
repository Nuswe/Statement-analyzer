import React, { useState } from 'react';
import { WalletCards, Activity, Crown, Zap, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onOpenPricing: () => void;
    onOpenAuth: () => void;
    onSignOut: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenPricing, onOpenAuth, onSignOut, isDarkMode, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
            <WalletCards className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">MalawiBank Analyzer</h1>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight sm:hidden">MB Analyzer</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Powered by Gemini AI</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
            
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
                // Logged In State
                <div className="flex items-center gap-2 sm:gap-3">
                    {user.plan === 'PRO' ? (
                        <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 sm:px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                            <Crown className="w-3 h-3 fill-yellow-600 dark:fill-yellow-400" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Pro</span>
                        </div>
                    ) : (
                         <>
                            <button 
                                onClick={onOpenPricing}
                                className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span>Upgrade</span>
                            </button>
                            <button
                                onClick={onOpenPricing}
                                className="sm:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                aria-label="Upgrade"
                            >
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </button>
                         </>
                    )}

                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {/* Dropdown */}
                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    
                                    {user.plan !== 'PRO' && (
                                        <button 
                                            onClick={() => { setIsMenuOpen(false); onOpenPricing(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium flex items-center"
                                        >
                                            <Zap className="w-4 h-4 mr-2" />
                                            Upgrade to Pro
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onSignOut(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 flex items-center"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                // Logged Out State
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button 
                        onClick={onOpenAuth}
                        className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs sm:text-sm px-2 py-2"
                    >
                        Log In
                    </button>
                    <button 
                        onClick={onOpenAuth}
                        className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-md shadow-slate-300 dark:shadow-none whitespace-nowrap"
                    >
                        Sign Up
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};