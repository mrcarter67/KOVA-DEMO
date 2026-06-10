export interface Contact {
  id: number;
  vertical: string;
  fn: string; ln: string; co: string; role: string;
  email: string; phone: string; status: string;
  score: number; city: string; deals: number;
  lastAct: string; notes: string;
  breakdown: { n: string; s: number }[];
  insight: string; action: string;
}
export interface Company {
  id: number; vertical: string; name: string; industry: string;
  size: string; city: string; contacts: number;
  deals: number; revenue: string; since: string;
}
export interface Deal {
  id: number; title: string; co: string;
  val: number; contact: string; prob: number;
  close: string; stage_hist: string[];
}
export interface Activity {
  type: string; icon: string; bg: string;
  contact: string; text: string; time: string;
}
export type View = "dashboard"|"contacts"|"companies"|"deals"|"lists"|"reports"|"activity";
export type Modal = null|"score"|"create"|"csv"|"settings";

// ── QUOTE TYPES ──────────────────────────────────────────────────────────────
export interface QuoteLineItem {
  id: string; description: string; qty: number; unit: string; price: number;
}
export interface Quote {
  id: string; vertical: string; number: string; title: string;
  contact: string; company: string; email: string;
  status: "draft"|"sent"|"viewed"|"accepted"|"declined";
  font: string; coverImage: string; accentColor: string;
  intro: string; scope: string; terms: string;
  lines: QuoteLineItem[]; tax: number;
  created: string; validUntil: string; sentAt?: string;
}
