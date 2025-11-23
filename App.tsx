import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzeStatement } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { AlertTriangle, FileSearch, BrainCircuit, Sparkles, TrendingUp, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  // Progress simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (appState === AppState.ANALYZING) {
      setProgress(0);
      
      const phrases = [
        "Securely analyzing document structure...",
        "Detecting Bank Identity (NBM, FDH, Standard)...",
        "Extracting transaction line items...",
        "Categorizing 'Assets' vs 'Liabilities'...",
        "Consulting 'Rich Dad' & 'Babylon' logic...",
        "Calculating Financial IQ Score...",
        "Identifying spending red flags...",
        "Connecting to live Malawi market data...",
        "Finalizing your wealth dashboard..."
      ];
      
      interval = setInterval(() => {
        setProgress((prev) => {
          // Asymptotic approach to 95%
          if (prev >= 95) return prev;
          
          const remaining = 95 - prev;
          // Slower asymptotic curve to allow time for API calls
          const jump = Math.max(0.1, Math.random() * (remaining / 20));
          const newProgress = prev + jump;
          
          // Update text based on progress
          const totalPhrases = phrases.length;
          const phraseIndex = Math.floor((newProgress / 95) * totalPhrases);
          setLoadingText(phrases[Math.min(phraseIndex, totalPhrases - 1)]);
          
          return newProgress;
        });
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appState]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setAppState(AppState.ANALYZING);

    try {
      const result = await analyzeStatement(selectedFile);
      
      // Force completion
      setProgress(100);
      setLoadingText("Analysis Complete!");
      
      // Delay to show completion state
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

  // Helper to get icon based on progress
  const getLoadingIcon = () => {
    if (progress < 25) return <FileSearch className="w-12 h-12 text-indigo-600 animate-pulse" />;
    if (progress < 50) return <BrainCircuit className="w-12 h-12 text-purple-600 animate-pulse" />;
    if (progress < 75) return <TrendingUp className="w-12 h-12 text-amber-600 animate-pulse" />;
    return <Globe className="w-12 h-12 text-emerald-600 animate-pulse" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section (Only show when idle or error) */}
          {(appState === AppState.IDLE || appState === AppState.ERROR) && (
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Make Sense of Your Money <br />
                <span className="text-indigo-600">Rich Dad Style.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your Standard Bank, FDH, or NBM statement (PDF/Image). 
                We'll detect Assets vs Liabilities, red flags, and give you a gamified financial health score.
              </p>
            </div>
          )}

          {/* Error Message */}
          {appState === AppState.ERROR && errorMessage && (
            <div className="max-w-2xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold text-sm">Analysis Failed</h3>
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                <button onClick={reset} className="text-red-700 text-sm underline mt-2 hover:text-red-900">Try Again</button>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {appState === AppState.IDLE && (
             <FileUpload onFileSelect={handleFileSelect} disabled={false} />
          )}

          {/* Loading State */}
          {appState === AppState.ANALYZING && (
            <div className="w-full max-w-lg mx-auto py-24 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
              
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center">
                    {getLoadingIcon()}
                </div>
              </div>

              <div className="w-full space-y-4 text-center">
                <div className="flex justify-between items-end px-1">
                    <h3 className="text-lg font-semibold text-slate-800 transition-all duration-300 min-h-[1.75rem]">{loadingText}</h3>
                    <span className="text-sm font-bold text-indigo-600 tabular-nums">{Math.round(progress)}%</span>
                </div>
                
                {/* Progress Bar Container */}
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
                    {/* Background stripes pattern */}
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
          {appState === AppState.SUCCESS && analysisResult && (
            <div>
                <div className="flex justify-end mb-6">
                     <button 
                        onClick={reset} 
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 underline"
                    >
                        Analyze another document
                    </button>
                </div>
                <AnalysisDashboard result={analysisResult} />
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
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