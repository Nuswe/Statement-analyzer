import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AnalysisResult } from '../types';
import { 
    Download, FileDown, Trophy, TrendingUp, AlertTriangle, ExternalLink, Globe, 
    ArrowUpRight, ArrowDownRight, BookOpen, LayoutDashboard, List, FileText, ChevronRight
} from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'wisdom' | 'report'>('overview');

  const formatCurrency = (val: number) => {
    return `MWK ${(val / 1000).toFixed(1)}k`;
  };

  const flowData = [
    { name: 'Inflow', value: result.inflow, fill: '#10B981' },
    { name: 'Outflow', value: result.outflow, fill: '#EF4444' },
  ];

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Emerald
    if (score >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(result.financialScore);
  const scoreGaugeData = [
      { name: 'Score', value: result.financialScore, fill: scoreColor },
      { name: 'Gap', value: 100 - result.financialScore, fill: '#E2E8F0' } 
  ];

  const downloadCSV = () => {
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
    <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        {[
            { id: 'overview', label: 'Score & Pulse', icon: LayoutDashboard },
            { id: 'breakdown', label: 'Cash Flow', icon: List },
            { id: 'wisdom', label: 'Guru Wisdom', icon: BookOpen },
            { id: 'report', label: 'Full Report', icon: FileText },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    activeTab === tab.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
            </button>
        ))}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fade-in">
      
      {renderTabNavigation()}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            {/* Financial IQ Scorecard */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
                <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center">
                        <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                        Financial IQ
                    </h2>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">Gamified</span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex items-center justify-center relative h-40">
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
                                    <Cell fill="#E2E8F0" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-3xl font-extrabold text-slate-800">{result.financialScore}</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Rank Achieved</p>
                        <h3 className="text-2xl font-bold" style={{ color: scoreColor }}>{result.financialRank}</h3>
                        <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                            "{result.scoreFeedback}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Market Pulse */}
            {result.investmentInsights && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg border border-indigo-800 text-white overflow-hidden">
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
                                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-800/40 hover:bg-indigo-700/60 border border-indigo-700/50 transition-all text-xs text-indigo-200 hover:text-white truncate max-w-[200px]"
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
      )}

      {/* TAB 2: BREAKDOWN */}
      {activeTab === 'breakdown' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
             
             {/* Wins vs Leaks Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Top Credits */}
                 <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                     <h3 className="text-emerald-800 font-bold flex items-center mb-4">
                         <ArrowUpRight className="w-5 h-5 mr-2" />
                         Big Wins (Income)
                     </h3>
                     <div className="space-y-3">
                         {result.topInflows.map((tx, i) => (
                             <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100/50 flex justify-between items-center">
                                 <div>
                                     <p className="text-xs text-slate-400 font-medium">{tx.date}</p>
                                     <p className="text-sm text-slate-800 font-medium line-clamp-1">{tx.description}</p>
                                     {tx.category && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{tx.category}</span>}
                                 </div>
                                 <span className="text-emerald-600 font-bold whitespace-nowrap">
                                     +{formatCurrency(tx.amount)}
                                 </span>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Top Debits */}
                 <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                     <h3 className="text-red-800 font-bold flex items-center mb-4">
                         <ArrowDownRight className="w-5 h-5 mr-2" />
                         Major Leaks (Expenses)
                     </h3>
                     <div className="space-y-3">
                         {result.topOutflows.map((tx, i) => (
                             <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-red-100/50 flex justify-between items-center">
                                 <div>
                                     <p className="text-xs text-slate-400 font-medium">{tx.date}</p>
                                     <p className="text-sm text-slate-800 font-medium line-clamp-1">{tx.description}</p>
                                     <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Liability</span>
                                 </div>
                                 <span className="text-red-600 font-bold whitespace-nowrap">
                                     -{formatCurrency(tx.amount)}
                                 </span>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             {/* Charts Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cash Flow Balance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flowData} layout="vertical" margin={{ left: 0, right: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12}} />
                                <Tooltip formatter={(val: number) => `MWK ${val.toLocaleString()}`} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Spending Habits</h3>
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
                                <Tooltip formatter={(val: number) => `MWK ${val.toLocaleString()}`} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* TAB 3: WISDOM */}
      {activeTab === 'wisdom' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
              
              {/* Red Flags Section */}
              {result.redFlags && result.redFlags.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                    <h3 className="text-amber-800 font-bold flex items-center mb-4 text-lg">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Detective's Observations
                    </h3>
                    <ul className="space-y-3">
                        {result.redFlags.map((flag, i) => (
                            <li key={i} className="flex items-start text-amber-900 bg-white p-3 rounded-lg shadow-sm border border-amber-100">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{i + 1}</span>
                                <span className="text-sm leading-relaxed">{flag}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              {/* Guru Cards */}
              <div className="space-y-4">
                  <h3 className="text-slate-800 font-bold text-lg px-2">Words from the Masters</h3>
                  {result.financialWisdom && result.financialWisdom.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                          <div className={`absolute top-0 left-0 w-1 h-full ${
                              idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></div>
                          
                          <blockquote className="text-slate-700 italic text-lg mb-4 font-serif relative z-10">
                              "{item.quote}"
                          </blockquote>
                          
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {item.book}
                              </span>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl">
                               <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Tactic for You</p>
                               <p className="text-sm text-slate-700 font-medium">{item.tactic}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* TAB 4: REPORT (Old View) */}
      {activeTab === 'report' && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 pb-4 gap-4">
                <h2 className="text-xl font-bold text-slate-900">Detailed Analysis</h2>
                <div className="flex flex-row space-x-3 w-full sm:w-auto">
                    <button 
                        onClick={downloadCSV} 
                        className="flex-1 sm:flex-none justify-center flex items-center space-x-2 text-xs text-slate-700 hover:text-indigo-700 font-medium px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 transition-all"
                    >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>CSV</span>
                    </button>
                    <button 
                        onClick={() => window.print()} 
                        className="flex-1 sm:flex-none justify-center flex items-center space-x-2 text-xs text-white font-medium px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print</span>
                    </button>
                </div>
            </div>
            
            <article className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-h3:text-indigo-700 prose-strong:text-slate-900 prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2 prose-blockquote:bg-indigo-50 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700">
              <ReactMarkdown
                components={{
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                    th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider" {...props} />,
                    td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-t border-slate-100" {...props} />,
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