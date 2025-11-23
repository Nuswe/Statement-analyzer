
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

export interface RealityCheck {
  wasteCategory: string;
  wasteAmount: number;
  opportunityCost: string; // e.g., "2 Bags of Cement"
  itemIcon: 'CEMENT' | 'FERTILIZER' | 'PETROL' | 'BREAD' | 'SCHOOL_SHOES';
  runwayDays: number; // How many days money lasts at current burn rate
  runwayMessage: string;
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
  realityCheck?: RealityCheck;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  result: AnalysisResult;
}

export type UserPlan = 'FREE' | 'PRO';

export interface Subscription {
  method: 'AIRTEL' | 'MPAMBA' | 'VISA' | 'PAYPAL';
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  nextBillingDate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  subscription?: Subscription;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
