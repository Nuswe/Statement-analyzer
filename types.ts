export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface Source {
  title: string;
  uri: string;
}

export interface InvestmentInsight {
  advice: string;
  sources: Source[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface BookWisdom {
  book: string;
  quote: string;
  tactic: string;
}

export interface AnalysisResult {
  markdownReport: string;
  inflow: number;
  outflow: number;
  categories: ChartDataPoint[];
  topInflows: Transaction[];
  topOutflows: Transaction[];
  redFlags: string[];
  financialWisdom: BookWisdom[];
  financialScore: number;
  financialRank: string;
  scoreFeedback: string;
  investmentInsights?: InvestmentInsight;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}