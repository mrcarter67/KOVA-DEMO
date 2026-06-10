export interface Contact {
  id: number;
  vertical: string;
  fn: string; ln: string;
  co?: string; role?: string;
  name?: string; firstName?: string; lastName?: string;
  title?: string; company?: string;
  email: string; phone: string; status: string;
  score: number; city: string;
  state?: string; zip?: string; address?: string;
  deals?: number; dealCount?: number;
  lastAct?: string; notes?: string;
  breakdown?: { n: string; s: number }[];
  insight?: string; action?: string;
  stage?: string; source?: string; tags?: string[];
  lifetimeValue?: number; quoteCount?: number;
  lastContact?: string; nextAction?: string; buyProbability?: number;
  preferredChannel?: string; [key: string]: any;
}
export interface Company {
  id: number; vertical: string; name: string; industry: string;
  size?: string; city: string; contacts?: number;
  deals?: number; revenue?: string; since?: string; [key: string]: any;
}
export interface Deal {
  id: string | number; title: string; co?: string; company?: string;
  val?: number; value?: number; contact?: string;
  prob?: number; probability?: number;
  close?: string; closeDate?: string; stage_hist?: string[];
  stage?: string; vertical?: string; [key: string]: any;
}
export type View = "dashboard"|"contacts"|"companies"|"deals"|"lists"|"reports"|"activity";
export type Modal = null|"import"|"csv"|"newcontact"|"newdeal"|"newcompany";
export interface Quote {
  id: string; number?: string; title: string; total?: number;
  status: string; date?: string; contactId?: number; vertical?: string;
  contact?: string; company?: string; email?: string; font?: string;
  accentColor?: string; intro?: string; scope?: string; lines?: any[];
  tax?: number; notes?: string; terms?: string; [key: string]: any;
}
export interface QuoteLineItem {
  id: string; description: string; qty: number; unit: string; price: number;
}
