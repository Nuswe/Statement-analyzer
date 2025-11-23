import React, { useState } from 'react';
import { Check, X, Smartphone, CreditCard, Globe, ArrowLeft, Loader2, ShieldCheck, RefreshCw, Calendar, CheckCircle } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (paymentMethod: string) => Promise<void>;
}

type PaymentMethod = 'AIRTEL' | 'MPAMBA' | 'VISA' | 'PAYPAL';

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form Inputs
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    try {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call parent handler to update state/backend
        await onUpgrade(selectedMethod);
        
        setIsProcessing(false);
        setStep(3); // Move to Success View
    } catch (error) {
        setIsProcessing(false);
        // Handle error (alert for now)
        alert("Payment failed. Please try again.");
    }
  };

  const handleClose = () => {
      setStep(1);
      setSelectedMethod(null);
      setIsProcessing(false);
      setPhone('');
      setCardNumber('');
      setEmail('');
      onClose();
  };

  const getNextBillingDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toLocaleDateString('en-MW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderPaymentInput = () => {
      if (!selectedMethod) return null;

      if (selectedMethod === 'AIRTEL' || selectedMethod === 'MPAMBA') {
          return (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {selectedMethod === 'AIRTEL' ? 'Airtel Money Number' : 'Mpamba Number'}
                  </label>
                  <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                          type="tel" 
                          placeholder="099X XXX XXX"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-900 dark:text-white"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                      />
                  </div>
                  <p className="text-xs text-slate-400">You will receive a USSD prompt to approve MWK 2,500.</p>
              </div>
          );
      }

      if (selectedMethod === 'VISA') {
          return (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                   <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Card Details</label>
                   <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-900 dark:text-white"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                      />
                  </div>
                  <div className="flex space-x-3">
                      <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-center text-slate-900 dark:text-white" required />
                      <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-center text-slate-900 dark:text-white" required />
                  </div>
              </div>
          );
      }

      if (selectedMethod === 'PAYPAL') {
        return (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">PayPal Email</label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>
        );
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto overflow-y-auto min-h-[500px]">
        
        {step === 1 && (
            <>
                {/* STEP 1: PLAN SELECTION */}
                
                {/* Free Tier */}
                <div className="p-5 md:p-8 md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 shrink-0">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">Free Starter</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 md:mb-6 text-sm">Basic cash flow tracking.</p>
                    <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 md:mb-8">MWK 0<span className="text-base font-medium text-slate-400">/mo</span></div>
                    
                    <ul className="space-y-3 md:space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" /> Total Inflow/Outflow
                        </li>
                        <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" /> Basic Categorization
                        </li>
                        <li className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0" /> Top 5 Transactions
                        </li>
                        <li className="flex items-center text-slate-400 dark:text-slate-600 text-sm">
                            <X className="w-5 h-5 mr-3 flex-shrink-0" /> Financial IQ Score
                        </li>
                        <li className="flex items-center text-slate-400 dark:text-slate-600 text-sm">
                            <X className="w-5 h-5 mr-3 flex-shrink-0" /> Rich Dad Wisdom
                        </li>
                    </ul>
                    
                    <button onClick={handleClose} className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Continue Free
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="p-5 md:p-8 md:w-1/2 flex flex-col bg-slate-50 dark:bg-slate-800 relative shrink-0">
                    <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden z-10">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm hidden md:block">
                        POPULAR
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-indigo-900 dark:text-indigo-300 mb-2">Pro Investor</h3>
                    <p className="text-indigo-600/80 dark:text-indigo-400 mb-4 md:mb-6 text-sm">For serious wealth builders.</p>
                    <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 md:mb-8">MWK 2,500<span className="text-base font-medium text-slate-400">/mo</span></div>
                    
                    <ul className="space-y-3 md:space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-slate-800 dark:text-slate-200 text-sm font-medium">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-green-700 dark:text-green-400" /></div>
                            Financial IQ Score & Rank
                        </li>
                        <li className="flex items-center text-slate-800 dark:text-slate-200 text-sm font-medium">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-green-700 dark:text-green-400" /></div>
                            Rich Dad / Babylon Wisdom
                        </li>
                        <li className="flex items-center text-slate-800 dark:text-slate-200 text-sm font-medium">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-green-700 dark:text-green-400" /></div>
                            Red Flag Detector
                        </li>
                        <li className="flex items-center text-slate-800 dark:text-slate-200 text-sm font-medium">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-green-700 dark:text-green-400" /></div>
                            Live Malawi Market Search
                        </li>
                         <li className="flex items-center text-slate-800 dark:text-slate-200 text-sm font-medium">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-green-700 dark:text-green-400" /></div>
                            CSV Export
                        </li>
                    </ul>
                    
                    <button 
                        onClick={() => setStep(2)}
                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        Upgrade Now
                    </button>
                </div>
            </>
        )}

        {step === 2 && (
            /* STEP 2: PAYMENT METHOD */
            <div className="w-full flex flex-col h-full bg-slate-50 dark:bg-slate-800 p-5 md:p-8 overflow-y-auto transition-colors">
                {/* Header */}
                <div className="flex items-center mb-6 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 pb-2 transition-colors">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors mr-2 -ml-2">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Checkout</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pro Investor Plan • MWK 2,500/mo</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-8">
                    {/* Method Selection */}
                    <div className="md:w-1/2 space-y-3 md:space-y-4">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-2">Select Payment Method</label>
                        
                        <button 
                            onClick={() => setSelectedMethod('AIRTEL')}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 transition-all ${selectedMethod === 'AIRTEL' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'AIRTEL' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${selectedMethod === 'AIRTEL' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>Airtel Money</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Malawi</p>
                            </div>
                        </button>

                         <button 
                            onClick={() => setSelectedMethod('MPAMBA')}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 transition-all ${selectedMethod === 'MPAMBA' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'MPAMBA' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${selectedMethod === 'MPAMBA' ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>TNM Mpamba</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Malawi</p>
                            </div>
                        </button>

                         <button 
                            onClick={() => setSelectedMethod('VISA')}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 transition-all ${selectedMethod === 'VISA' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'VISA' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${selectedMethod === 'VISA' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Visa / MasterCard</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">International</p>
                            </div>
                        </button>

                         <button 
                            onClick={() => setSelectedMethod('PAYPAL')}
                            className={`w-full flex items-center p-3 md:p-4 rounded-xl border-2 transition-all ${selectedMethod === 'PAYPAL' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'PAYPAL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${selectedMethod === 'PAYPAL' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>PayPal</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Global</p>
                            </div>
                        </button>
                    </div>

                    {/* Payment Form */}
                    <div className="md:w-1/2 flex flex-col">
                        <form onSubmit={handlePayment} className="flex-1 flex flex-col bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                             <div className="flex-1">
                                {selectedMethod ? (
                                    <>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Enter Details</h4>
                                        {renderPaymentInput()}
                                        
                                        <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex items-start">
                                            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Recurring Billing</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                                    You are authorizing a monthly deduction of MWK 2,500. 
                                                    Cancel anytime in profile settings.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-40 md:h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                        <ShieldCheck className="w-12 h-12 mb-3" />
                                        <p className="text-sm text-center">Select a payment method<br/>to continue secure checkout.</p>
                                    </div>
                                )}
                             </div>

                             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                 <div className="flex justify-between items-center mb-4">
                                     <span className="text-slate-500 dark:text-slate-400 text-sm">Total due today</span>
                                     <span className="text-xl font-bold text-slate-900 dark:text-white">MWK 2,500</span>
                                 </div>
                                 <button 
                                    type="submit"
                                    disabled={!selectedMethod || isProcessing}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center active:scale-95
                                        ${!selectedMethod || isProcessing ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 hover:scale-[1.02]'}
                                    `}
                                 >
                                     {isProcessing ? (
                                         <Loader2 className="w-5 h-5 animate-spin" />
                                     ) : (
                                         <>Subscribe Now</>
                                     )}
                                 </button>
                                 <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center">
                                     <ShieldCheck className="w-3 h-3 mr-1" />
                                     Payments are secure and encrypted.
                                 </p>
                             </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {step === 3 && (
            /* STEP 3: SUCCESS CONFIRMATION */
            <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-slate-900 text-center animate-in zoom-in-95 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Pro!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm md:text-base">
                    Your subscription is active. You can now access all premium features, including the Financial IQ score and Live Market data.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-100 dark:border-slate-700 mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Plan</span>
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">Pro Investor</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Next Billing
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{getNextBillingDate()}</span>
                    </div>
                </div>

                <button 
                    onClick={handleClose}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-8 md:px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-slate-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                    Start Analyzing Wealth
                </button>
            </div>
        )}

      </div>
    </div>
  );
};