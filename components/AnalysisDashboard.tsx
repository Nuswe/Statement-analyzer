import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AnalysisResult, UserPlan } from '../types';
import { PremiumLock } from './PremiumLock';
import { 
    Download, FileDown, Trophy, TrendingUp, AlertTriangle, ExternalLink, Globe, 
    ArrowUpRight, ArrowDownRight, BookOpen, LayoutDashboard, List, FileText, Lock,
    Hammer, Sprout, Fuel, ShoppingBag, GraduationCap, AlertCircle, Wallet, Lightbulb
} from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  userPlan: UserPlan;
  onUnlock: () => void;
  isDarkMode: boolean;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, userPlan, onUnlock, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'wisdom' | 'report'>('breakdown');
  const isFree = userPlan === 'FREE';

  const formatCurrency = (val: number) => {
    return `MWK ${(val / 1000).toFixed(1)}k`;
  };

  const flowData = [
    { name: 'Inflow', value: result.inflow, fill: '#10B981' },
    { name: 'Outflow', value: result.outflow, fill: '#EF4444' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Emerald
    if (score >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(result.financialScore);
  const scoreGaugeData = [
      { name: 'Score', value: result.financialScore, fill: scoreColor },
      { name: 'Gap', value: 100 - result.financialScore, fill: isDarkMode ? '#334155' : '#E2E8F0' } 
  ];

  const getRealityIcon = (type?: string) => {
      switch(type) {
          case 'CEMENT': return <Hammer className="w-8 h-8 text-slate-600 dark:text-slate-300" />;
          case 'FERTILIZER': return <Sprout className="w-8 h-8 text-green-600 dark:text-green-400" />;
          case 'PETROL': return <Fuel className="w-8 h-8 text-amber-600 dark:text-amber-400" />;
          case 'BREAD': return <ShoppingBag className="w-8 h-8 text-orange-600 dark:text-orange-400" />;
          case 'SCHOOL_SHOES': return <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />;
          default: return <Wallet className="w-8 h-8 text-slate-600 dark:text-slate-300" />;
      }
  };

  const downloadCSV = () => {
    if (isFree) {
        onUnlock();
        return;
    }

    const escapeCsv = (val: string | number) => {
        const stringVal = String(val);
        if (stringVal.includes(',')) {
            return `"${stringVal}"`;
        }
        return stringVal;
    };

    const summaryData = [
      ['SUMMARY REPORT', ''],
      ['Total Inflow', result.inflow],
      ['Total Outflow', result.outflow],
      ['Net Cash Flow', result.inflow - result.outflow],
      ['Financial Score', result.financialScore],
      ['Financial Rank', result.financialRank],
      ['', ''], 
      ['SPENDING BREAKDOWN', '']
    ];

    const headers = ['Category', 'Amount (MWK)'];
    const rows = result.categories.map(cat => [cat.name, cat.value]);

    const csvContent = [
      ...summaryData,
      headers,
      ...rows
    ]
      .map(row => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "malawi_bank_analysis.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTabNavigation = () => (
    <div className="sticky top-[64px] z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm pt-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:pt-0 sm:pb-4 mb-4 flex overflow-x-auto gap-2 no-scrollbar scroll-smooth transition-colors duration-300" style={{ scrollbarWidth: 'none' }}>
        {[
            { id: 'breakdown', label: 'Cash Flow', icon: List },
            { id: 'overview', label: 'Score & Pulse', icon: LayoutDashboard, locked: isFree },
            { id: 'wisdom', label: 'Guru Wisdom', icon: BookOpen, locked: isFree },
            { id: 'report', label: 'Full Report', icon: FileText },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border touch-manipulation ${
                    activeTab === tab.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md dark:shadow-indigo-900/20'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600'
                }`}
            >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.locked && <Lock className="w-3 h-3 ml-1 opacity-50" />}
            </button>
        ))}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fade-in">
      
      {renderTabNavigation()}

      {/* TAB 1: OVERVIEW (LOCKED) */}
      {activeTab === 'overview' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <PremiumLock isLocked={isFree} onUnlock={onUnlock} title="Unlock Financial IQ">
                <div className="space-y-6">
                    {/* Financial IQ Scorecard */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
                        <div className="bg-slate-900 dark:bg-black p-4 text-white flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center">
                                <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                                Financial IQ
                            </h2>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">Monthly</span>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="flex items-center justify-center relative h-48 md:h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={scoreGaugeData}
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill={scoreColor} />
                                            <Cell fill={isDarkMode ? '#1e293b' : '#E2E8F0'} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-4xl md:text-3xl font-extrabold text-slate-800 dark:text-white">{result.financialScore}</span>
                                </div>
                            </div>

                            <div className="text-center md:text-left space-y-3 md:space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Rank Achieved</p>
                                <h3 className="text-3xl md:text-2xl font-bold" style={{ color: scoreColor }}>{result.financialRank}</h3>
                                
                                <div className="relative mt-2">
                                    <div className="absolute -top-3 -left-2 bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-100 dark:border-slate-700 shadow-sm z-10">
                                        <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 leading-relaxed text-left">
                                        "{result.scoreFeedback}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Market Pulse */}
                    {result.investmentInsights && (
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-black rounded-2xl shadow-lg border border-indigo-800 dark:border-indigo-900 text-white overflow-hidden">
                            <div className="p-4 border-b border-indigo-800/50 flex items-center justify-between bg-black/20">
                                <h2 className="text-lg font-bold flex items-center text-cyan-400">
                                    <Globe className="w-5 h-5 mr-2" />
                                    Malawi Market Pulse
                                </h2>
                                <span className="text-[10px] text-indigo-300 uppercase tracking-wider">Live Search</span>
                            </div>
                            <div className="p-5">
                                <div className="prose prose-invert prose-sm max-w-none text-indigo-100 mb-4">
                                    <ReactMarkdown>{result.investmentInsights.advice}</ReactMarkdown>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {result.investmentInsights.sources.map((source, idx) => (
                                        <a 
                                            key={idx}
                                            href={source.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-800/40 hover:bg-indigo-700/60 border border-indigo-700/50 transition-all text-xs text-indigo-200 hover:text-white truncate max-w-full"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                            <span className="truncate">{source.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumLock>
          </div>
      )}

      {/* TAB 2: BREAKDOWN (FREE) */}
      {activeTab === 'breakdown' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
             
             {/* Reality Check - The Meaningful Feature */}
             {result.realityCheck && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-black text-white rounded-2xl p-6 shadow-lg border border-slate-700 dark:border-slate-800">
                    <div className="flex items-center mb-4 border-b border-slate-700 dark:border-slate-700 pb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                        <h3 className="text-lg font-bold">The Reality Check</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Opportunity Cost */}
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/10 p-3 rounded-xl flex items-center justify-center shrink-0">
                                {getRealityIcon(result.realityCheck.itemIcon)}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Opportunity Cost</p>
                                <p className="text-sm text-slate-300 mb-2">
                                    You spent <span className="text-white font-bold">{formatCurrency(result.realityCheck.wasteAmount)}</span> on <span className="text-red-300 font-bold">{result.realityCheck.wasteCategory}</span>.
                                </p>
                                <p className="text-lg font-bold text-yellow-300 leading-tight">
                                    That equals {result.realityCheck.opportunityCost}.
                                </p>
                            </div>
                        </div>

                        {/* Runway */}
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/10 p-3 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp className={`w-8 h-8 ${result.realityCheck.runwayDays < 30 ? 'text-red-400' : 'text-green-400'}`} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Survival Forecast</p>
                                <p className="text-lg font-bold text-white mb-1">
                                    {result.realityCheck.runwayDays > 365 ? "Stable" : `${result.realityCheck.runwayDays} Days Left`}
                                </p>
                                <p className="text-sm text-slate-300 leading-tight">
                                    {result.realityCheck.runwayMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
             )}

             {/* Wins vs Leaks Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Top Credits */}
                 <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50">
                     <h3 className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center mb-4">
                         <ArrowUpRight className="w-5 h-5 mr-2" />
                         Big Wins (Income)
                     </h3>
                     <div className="space-y-3">
                         {result.topInflows.map((tx, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-emerald-100/50 dark:border-emerald-900/30 flex justify-between items-center transition-colors">
                                 <div className="min-w-0 pr-2">
                                     <p className="text-xs text-slate-400 font-medium">{tx.date}</p>
                                     <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{tx.description}</p>
                                     {tx.category && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded inline-block mt-1">{tx.category}</span>}
                                 </div>
                                 <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap text-sm sm:text-base">
                                     +{formatCurrency(tx.amount)}
                                 </span>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Top Debits */}
                 <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-900/50">
                     <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center mb-4">
                         <ArrowDownRight className="w-5 h-5 mr-2" />
                         Major Leaks (Expenses)
                     </h3>
                     <div className="space-y-3">
                         {result.topOutflows.map((tx, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-red-100/50 dark:border-red-900/30 flex justify-between items-center transition-colors">
                                 <div className="min-w-0 pr-2">
                                     <p className="text-xs text-slate-400 font-medium">{tx.date}</p>
                                     <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{tx.description}</p>
                                     <span className="text-[10px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded inline-block mt-1">Liability</span>
                                 </div>
                                 <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap text-sm sm:text-base">
                                     -{formatCurrency(tx.amount)}
                                 </span>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             {/* Charts Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Cash Flow Balance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flowData} layout="vertical" margin={{ left: 0, right: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                                <Tooltip 
                                  formatter={(val: number) => `MWK ${val.toLocaleString()}`} 
                                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Spending Habits</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={result.categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {result.categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(val: number) => `MWK ${val.toLocaleString()}`}
                                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px', color: isDarkMode ? '#cbd5e1' : '#334155'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* TAB 3: WISDOM (LOCKED) */}
      {activeTab === 'wisdom' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <PremiumLock isLocked={isFree} onUnlock={onUnlock} title="Unlock Guru Wisdom">
                <div className="space-y-6">
                    {/* Red Flags Section */}
                    {result.redFlags && result.redFlags.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/50">
                            <h3 className="text-amber-800 dark:text-amber-400 font-bold flex items-center mb-4 text-lg">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Detective's Observations
                            </h3>
                            <ul className="space-y-3">
                                {result.redFlags.map((flag, i) => (
                                    <li key={i} className="flex items-start text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900/30">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{i + 1}</span>
                                        <span className="text-sm leading-relaxed">{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Guru Cards */}
                    <div className="space-y-4">
                        <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg px-2">Words from the Masters</h3>
                        {result.financialWisdom && result.financialWisdom.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                                <div className={`absolute top-0 left-0 w-1 h-full ${
                                    idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                                }`}></div>
                                
                                <blockquote className="text-slate-700 dark:text-slate-300 italic text-lg mb-4 font-serif relative z-10 pl-2">
                                    "{item.quote}"
                                </blockquote>
                                
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        {item.book}
                                    </span>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Tactic for You</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.tactic}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </PremiumLock>
          </div>
      )}

      {/* TAB 4: REPORT (Free) */}
      {activeTab === 'report' && (
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-2 fade-in duration-300 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Detailed Analysis</h2>
                <div className="flex flex-row space-x-3 w-full sm:w-auto">
                    <button 
                        onClick={downloadCSV} 
                        className={`flex-1 sm:flex-none justify-center flex items-center space-x-2 text-xs font-medium px-4 py-2 rounded-lg transition-all ${isFree ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-300'}`}
                    >
                        {isFree ? <Lock className="w-3.5 h-3.5" /> : <FileDown className="w-3.5 h-3.5" />}
                        <span>CSV</span>
                    </button>
                    <button 
                        onClick={() => window.print()} 
                        className="flex-1 sm:flex-none justify-center flex items-center space-x-2 text-xs text-white font-medium px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print</span>
                    </button>
                </div>
            </div>
            
            <article className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-h3:text-indigo-700 dark:prose-h3:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-table:border-slate-200 dark:prose-table:border-slate-700 prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:p-2 prose-td:p-2 prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300">
              <ReactMarkdown
                components={{
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 whitespace-nowrap sm:whitespace-normal" {...props} />,
                }}
              >
                {result.markdownReport}
              </ReactMarkdown>
            </article>
          </div>
      )}
    </div>
  );
};