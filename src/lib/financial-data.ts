export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface ExpenseCategory {
  label: string;
  amount: number;
  color: string;
  icon: string;
  change: number; // % vs last month
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: "income" | "expense";
  amount: number;
  status: "cleared" | "pending" | "failed";
  contact?: string;
}

export interface ForecastDeal {
  name: string;
  value: number;
  probability: number;
  closeDate: string;
  stage: string;
  contact: string;
}

export interface FinancialSummary {
  mrr: number;
  mrrChange: number;
  ytdRevenue: number;
  ytdExpenses: number;
  netMargin: number;
  netMarginChange: number;
  pipelineValue: number;
  winRate: number;
  winRateChange: number;
  avgDealSize: number;
  cac: number;
  ltv: number;
}

export const FINANCIAL_SUMMARY: FinancialSummary = {
  mrr: 71_200,
  mrrChange: 8.4,
  ytdRevenue: 326_700,
  ytdExpenses: 241_480,
  netMargin: 26.1,
  netMarginChange: 2.3,
  pipelineValue: 284_000,
  winRate: 67,
  winRateChange: 4,
  avgDealSize: 12_400,
  cac: 1_840,
  ltv: 48_600,
};

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", revenue: 42_800, expenses: 31_200, net: 11_600 },
  { month: "Feb", revenue: 38_200, expenses: 30_400, net: 7_800 },
  { month: "Mar", revenue: 51_400, expenses: 37_800, net: 13_600 },
  { month: "Apr", revenue: 64_700, expenses: 44_100, net: 20_600 },
  { month: "May", revenue: 71_200, expenses: 49_800, net: 21_400 },
  { month: "Jun", revenue: 58_400, expenses: 48_180, net: 10_220 },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { label: "Personnel",          amount: 22_400, color: "#0F172A", icon: "Users",     change:  3.2 },
  { label: "Cost of Services",   amount: 14_600, color: "#3B9EFF", icon: "Settings2", change: -1.8 },
  { label: "Marketing",          amount:  6_800, color: "#00C896", icon: "Megaphone",  change: 12.4 },
  { label: "Software & Tools",   amount:  2_980, color: "#A78BFA", icon: "Monitor",    change:  0.0 },
  { label: "Operations",         amount:  2_100, color: "#F59E0B", icon: "Building2",  change:  5.1 },
  { label: "Other",              amount:    900, color: "#CBD5E1", icon: "Package",     change: -8.3 },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id:"t1",  date:"Jun 4",  description:"Invoice #2026-214 — Apex Realty Group",       category:"income",  amount:8_180,  status:"cleared",  contact:"Sarah Mitchell" },
  { id:"t2",  date:"Jun 3",  description:"Invoice #2026-211 — Pacific Fabrication",     category:"income",  amount:24_800, status:"cleared",  contact:"Sandra Wu" },
  { id:"t3",  date:"Jun 3",  description:"Gusto Payroll — June cycle",                  category:"expense", amount:11_200, status:"cleared" },
  { id:"t4",  date:"Jun 2",  description:"Google Ads — May campaign balance",           category:"expense", amount:3_420,  status:"cleared" },
  { id:"t5",  date:"Jun 1",  description:"Invoice #2026-209 — Suncoast Properties",     category:"income",  amount:5_180,  status:"cleared",  contact:"David Torres" },
  { id:"t6",  date:"Jun 1",  description:"AWS + Vercel infrastructure",                 category:"expense", amount:640,   status:"cleared" },
  { id:"t7",  date:"May 31", description:"Invoice #2026-206 — Harmon Industrial",       category:"income",  amount:18_400, status:"cleared",  contact:"Greg Harmon" },
  { id:"t8",  date:"May 30", description:"Subcontractor — staging crew (Hialeah)",      category:"expense", amount:3_800,  status:"cleared" },
  { id:"t9",  date:"May 29", description:"Invoice #2026-203 — Sunrise Dental Group",    category:"income",  amount:12_400, status:"pending",  contact:"Jennifer Osei" },
  { id:"t10", date:"May 28", description:"HubSpot CRM subscription (annual prorate)",   category:"expense", amount:890,   status:"cleared" },
  { id:"t11", date:"May 27", description:"Invoice #2026-201 — Clearwater Investments",  category:"income",  amount:9_600,  status:"cleared",  contact:"Marcus Webb" },
  { id:"t12", date:"May 26", description:"Meta Ads — retargeting May campaign",         category:"expense", amount:2_100,  status:"cleared" },
];

export const FORECAST_DEALS: ForecastDeal[] = [
  { name:"Coral Gables Home Staging",          value:12_400, probability:65, closeDate:"Jun 20", stage:"Proposal Sent",  contact:"Sarah Mitchell" },
  { name:"Enterprise Suite — Sunrise Dental",  value:38_400, probability:72, closeDate:"Jun 25", stage:"Negotiation",    contact:"Jennifer Osei" },
  { name:"Annual Photography Retainer",        value:9_600,  probability:45, closeDate:"Jul 8",  stage:"Qualifying",     contact:"Sarah Mitchell" },
  { name:"Supply Chain Intelligence — Apex",   value:56_000, probability:58, closeDate:"Jul 12", stage:"Proposal Sent",  contact:"James Patel" },
  { name:"Enterprise Renewal — Pacific Fab",   value:62_400, probability:81, closeDate:"Aug 1",  stage:"Negotiation",    contact:"Sandra Wu" },
  { name:"Broward Volume Staging Q3",          value:24_000, probability:28, closeDate:"Aug 1",  stage:"Discovery",      contact:"Sarah Mitchell" },
];

export const CASH_FLOW_WEEKS = [
  { label: "May W1", inflow: 38_400, outflow: 28_100 },
  { label: "May W2", inflow: 12_800, outflow: 14_200 },
  { label: "May W3", inflow: 24_600, outflow: 18_900 },
  { label: "May W4", inflow: 31_200, outflow: 22_400 },
  { label: "Jun W1", inflow: 44_800, outflow: 38_600 },
  { label: "Jun W2", inflow: 13_600, outflow: 9_580 },
];
