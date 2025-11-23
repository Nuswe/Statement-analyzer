import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

type AuthMode = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'FORGOT_PASSWORD') {
        await authService.resetPassword(email);
        setSuccessMsg("If an account exists, a reset link has been sent.");
        setIsLoading(false);
        return;
      }

      let user;
      if (mode === 'SIGN_UP') {
        if (!name) throw new Error("Name is required");
        user = await authService.signUp(email, password, name);
      } else {
        user = await authService.signIn(email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      if (mode !== 'FORGOT_PASSWORD') {
        setIsLoading(false);
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  const getTitle = () => {
    switch (mode) {
      case 'SIGN_IN': return 'Welcome Back';
      case 'SIGN_UP': return 'Create Account';
      case 'FORGOT_PASSWORD': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'SIGN_IN': return 'Enter your details to access your dashboard.';
      case 'SIGN_UP': return 'Join to start analyzing your finances.';
      case 'FORGOT_PASSWORD': return 'Enter your email to receive a reset link.';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-colors">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getTitle()}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{getSubtitle()}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm p-3 rounded-lg mb-4 text-center border border-red-100 dark:border-red-900/30 flex items-center justify-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm p-3 rounded-lg mb-4 text-center border border-green-100 dark:border-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'SIGN_UP' && (
              <div className="space-y-1 animate-in slide-in-from-right-4 fade-in">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="John Banda"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {mode !== 'FORGOT_PASSWORD' && (
              <div className="space-y-1 animate-in slide-in-from-right-4 fade-in">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Password</label>
                   {mode === 'SIGN_IN' && (
                     <button type="button" onClick={() => switchMode('FORGOT_PASSWORD')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                       Forgot?
                     </button>
                   )}
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:scale-[1.02] flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'SIGN_IN' && 'Sign In'}
                  {mode === 'SIGN_UP' && 'Create Account'}
                  {mode === 'FORGOT_PASSWORD' && 'Send Reset Link'}
                  {mode !== 'FORGOT_PASSWORD' && <ArrowRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'FORGOT_PASSWORD' ? (
                <button 
                  onClick={() => switchMode('SIGN_IN')}
                  className="text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center mx-auto text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
                </button>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'SIGN_IN' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => switchMode(mode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    {mode === 'SIGN_IN' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};