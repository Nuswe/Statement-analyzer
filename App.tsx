import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { analyzeStatement } from './services/geminiService';
import { authService } from './services/authService';
import { AnalysisResult, AppState, HistoryItem, User } from './types';
import { AlertTriangle, FileSearch, BrainCircuit, TrendingUp, Globe, Clock, Trash2, History, ChevronRight, Lock, Loader2, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");
  
  // Data State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Auth & Subscription State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Initialize App
  useEffect(() => {
    const initAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                loadUserHistory(currentUser.id);
            }
        } catch (e) {
            console.error("Auth check failed", e);
        } finally {
            setIsAuthChecking(false);
        }
    };
    initAuth();
  }, []);

  const loadUserHistory = (userId: string) => {
    const historyKey = `malawi_bank_history_${userId}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
        setHistory([]);
      }
    } else {
        setHistory([]);
    }
  };

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    if (user) {
        localStorage.setItem(`malawi_bank_history_${user.id}`, JSON.stringify(newHistory));
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setAnalysisResult(item.result);
    setAppState(AppState.SUCCESS);
  };

  // Auth Handlers
  const handleAuthSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
      loadUserHistory(loggedInUser.id);
  };

  const handleSignOut = async () => {
      await authService.signOut();
      setUser(null);
      setHistory([]);
      reset();
  };

  const handleUpgrade = async (paymentMethod: string) => {
    if (!user) {
        setIsPricingOpen(false);
        setIsAuthOpen(true);
        return;
    }
    
    // Simulate API call to upgrade with monthly subscription setup
    const updatedUser = await authService.updateUserPlan(user.id, 'PRO', paymentMethod);
    setUser(updatedUser);
    // Note: We do NOT close the modal here anymore. 
    // The PricingModal will handle the transition to the Success step.
  };

  // Progress simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (appState === AppState.ANALYZING) {
      setProgress(0);
      
      const phrases = [
        "Securely scanning document...",
        "Detecting bank name...",
        "Extracting transactions...",
        "Categorizing expenses...",
        "Calculating insights...",
        "Applying 'Rich Dad' logic...",
        "Fetching market data...",
        "Generating wealth scorecard...",
        "Finalizing dashboard..."
      ];
      
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          const remaining = 95 - prev;
          const jump = Math.max(0.2, Math.random() * (remaining / 15));
          const newProgress = prev + jump;
          
          const totalPhrases = phrases.length;
          const phraseIndex = Math.floor((newProgress / 95) * totalPhrases);
          setLoadingText(phrases[Math.min(phraseIndex, totalPhrases - 1)]);
          
          return newProgress;
        });
      }, 120);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appState]);

  const handleFileSelect = async (selectedFile: File) => {
    if (!user) {
        setIsAuthOpen(true);
        return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setAppState(AppState.ANALYZING);

    try {
      const result = await analyzeStatement(selectedFile);
      
      setProgress(100);
      setLoadingText("Analysis Complete!");
      
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fileName: selectedFile.name,
        result: result
      };
      
      saveHistory([newHistoryItem, ...history]);

      setTimeout(() => {
        setAnalysisResult(result);
        setAppState(AppState.SUCCESS);
      }, 800);
      
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "An unexpected error occurred during analysis.");
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysisResult(null);
    setAppState(AppState.IDLE);
    setErrorMessage(null);
    setProgress(0);
  };

  const getLoadingIcon = () => {
    if (progress < 25) return <FileSearch className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-pulse" />;
    if (progress < 50) return <BrainCircuit className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />;
    if (progress < 75) return <TrendingUp className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-pulse" />;
    return <Globe className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-pulse" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400';
    return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
  };

  // Main Loading State (Checking Auth)
  if (isAuthChecking) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="text-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Restoring session...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header 
        user={user} 
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          {(appState === AppState.IDLE || appState === AppState.ERROR) && (
            <div className="text-center mb-8 sm:mb-10 space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Make Sense of Your Money <br />
                <span className="text-indigo-600 dark:text-indigo-400">Rich Dad Style.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
                Upload your Standard Bank, FDH, or NBM statement. 
                We'll detect Assets vs Liabilities and give you a gamified financial health score.
              </p>
            </div>
          )}

          {/* Error Message */}
          {appState === AppState.ERROR && errorMessage && (
            <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-semibold text-sm">Analysis Failed</h3>
                <p className="text-red-700 dark:text-red-200 text-sm mt-1">{errorMessage}</p>
                <button onClick={reset} className="text-red-700 dark:text-red-300 text-sm underline mt-2 hover:text-red-900 dark:hover:text-red-100">Try Again</button>
              </div>
            </div>
          )}

          {/* App Content */}
          {appState === AppState.IDLE && (
            <>
             {user ? (
                 <FileUpload onFileSelect={handleFileSelect} disabled={false} />
             ) : (
                 <div className="w-full max-w-2xl mx-auto mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-sm animate-in zoom-in-95 duration-300">
                     <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ready to analyze your statement?</h3>
                     <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm sm:text-base">Create a free account or sign in to upload your document securely and start your financial journey.</p>
                     <button 
                        onClick={() => setIsAuthOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center mx-auto active:scale-[0.98]"
                     >
                        Sign In / Register
                     </button>
                 </div>
             )}
             
             {/* History List */}
             {user && history.length > 0 && (
                <div className="max-w-2xl mx-auto mt-8 sm:mt-12 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
                      <History className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Recent Analyses
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{history.length} saved</span>
                  </div>
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group flex items-center justify-between active:scale-[0.99] touch-manipulation"
                      >
                        <div className="flex items-center space-x-4 overflow-hidden">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 ${getScoreColor(item.result.financialScore)}`}>
                            {user.plan === 'PRO' ? item.result.financialScore : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {item.fileName}
                            </p>
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                           <div className="hidden sm:block text-right mr-2">
                              <p className="text-xs text-slate-400 uppercase font-semibold">Rank</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {user.plan === 'PRO' ? item.result.financialRank : 'Unlock'}
                              </p>
                           </div>
                           <button 
                              onClick={(e) => deleteHistoryItem(e, item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                              title="Delete"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                           <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}
            </>
          )}

          {/* Loading State */}
          {appState === AppState.ANALYZING && (
            <div className="w-full max-w-lg mx-auto py-12 sm:py-24 flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in duration-500 px-4">
              
              <div className="relative">
                <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    {getLoadingIcon()}
                </div>
              </div>

              <div className="w-full space-y-4 text-center">
                <div className="flex justify-between items-end px-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 min-h-[1.75rem]">{loadingText}</h3>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{Math.round(progress)}%</span>
                </div>
                
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
                    
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                    >
                         <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash secure enclave</p>
              </div>
            </div>
          )}

          {/* Results Dashboard */}
          {appState === AppState.SUCCESS && analysisResult && user && (
            <div>
                <div className="flex justify-end mb-6">
                     <button 
                        onClick={reset} 
                        className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline flex items-center touch-manipulation py-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Analyze another document
                    </button>
                </div>
                <AnalysisDashboard 
                    result={analysisResult} 
                    userPlan={user.plan}
                    onUnlock={() => setIsPricingOpen(true)}
                    isDarkMode={isDarkMode}
                />
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)}
        onUpgrade={handleUpgrade}
      />
      
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 sm:py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MalawiBank Analyzer. Private & Secure.</p>
          <p className="mt-2 text-xs">
            Disclaimer: This tool uses AI for estimation. Always verify figures with your official bank documents. 
            Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;