// ── SAMPLE QUOTES ─────────────────────────────────────────────────────────────
import type { Quote } from "./types";

export const SAMPLE_QUOTES: Quote[] = [
  {
    id:"q1", vertical:"real_estate", number:"Q-2026-001",
    title:"Property Renovation & Staging — Hialeah Listing",
    contact:"Sarah Mitchell", company:"Apex Realty Group", email:"s.mitchell@apexrealty.com",
    status:"sent", font:"Georgia", coverImage:"", accentColor:"#00C896",
    intro:"Thank you for the opportunity to present this proposal. We've reviewed the property at 1420 W 49th St and put together a scope that maximizes buyer appeal within your timeline.",
    scope:"Full interior repaint (3 bedrooms, 2 baths, living areas) · Staging package with premium furniture rental · Professional photography (20 edited images) · Curb appeal landscaping refresh · Deep clean and prep",
    terms:"50% deposit required to begin. Balance due upon completion. Valid for 30 days. All work completed within 14 business days of deposit.",
    lines:[
      {id:"l1", description:"Interior Painting — Full Home", qty:1, unit:"job", price:3800},
      {id:"l2", description:"Staging Package — 60-Day Rental", qty:1, unit:"package", price:2400},
      {id:"l3", description:"Professional Photography", qty:20, unit:"images", price:650},
      {id:"l4", description:"Landscaping & Curb Appeal", qty:1, unit:"job", price:950},
      {id:"l5", description:"Deep Clean & Move-In Prep", qty:1, unit:"job", price:380},
    ],
    tax:7, created:"May 28, 2026", validUntil:"Jun 28, 2026", sentAt:"May 29, 2026",
  },
  {
    id:"q2", vertical:"manufacturing", number:"Q-2026-002",
    title:"Q3 Equipment Supply Agreement — Harmon Industrial",
    contact:"Greg Harmon", company:"Harmon Industrial Supply", email:"g.harmon@harmonindustrial.com",
    status:"draft", font:"Inter", coverImage:"", accentColor:"#F59E0B",
    intro:"Following our conversation on May 30, we're pleased to submit this supply agreement for your Q3 equipment procurement cycle. Pricing reflects volume commitment and preferred vendor status.",
    scope:"CNC lathe units (3) with installation and calibration · Compressed air systems overhaul · Safety compliance inspection and certification · 12-month service agreement · Staff training (4 sessions)",
    terms:"Net 30 payment terms. Equipment delivery within 21 business days of signed agreement. Installation included. 12-month parts warranty.",
    lines:[
      {id:"l1", description:"CNC Lathe — Haas ST-10 (x3)", qty:3, unit:"units", price:48000},
      {id:"l2", description:"Installation & Calibration", qty:3, unit:"units", price:3600},
      {id:"l3", description:"Compressed Air System Overhaul", qty:1, unit:"job", price:12400},
      {id:"l4", description:"Safety Compliance & Certification", qty:1, unit:"job", price:4200},
      {id:"l5", description:"12-Month Service Agreement", qty:1, unit:"year", price:8800},
      {id:"l6", description:"Staff Training — 4 Sessions", qty:4, unit:"sessions", price:600},
    ],
    tax:0, created:"Jun 1, 2026", validUntil:"Jun 30, 2026",
  },
  {
    id:"q3", vertical:"healthcare", number:"Q-2026-003",
    title:"Practice Intelligence Suite — Sunrise Dental Group",
    contact:"Marcus Jimenez", company:"Sunrise Dental Group", email:"m.jimenez@sunrisedental.com",
    status:"accepted", font:"Inter", coverImage:"", accentColor:"#3B9EFF",
    intro:"We're excited to present this proposal for the Sunrise Dental Group enterprise implementation. Based on your 6-location footprint and growth trajectory, we've designed a solution that scales with you.",
    scope:"KOVA CRM — full 6-location deployment · AI-powered patient intelligence scoring · Automated recall and reactivation sequences · Custom reporting dashboards per location · Dedicated onboarding and training",
    terms:"Annual subscription billed quarterly. 60-day implementation period. Dedicated success manager assigned. Cancel anytime after 90 days.",
    lines:[
      {id:"l1", description:"KOVA CRM — Enterprise License (6 locations)", qty:1, unit:"year", price:18000},
      {id:"l2", description:"AI Patient Intelligence Module", qty:1, unit:"year", price:6000},
      {id:"l3", description:"Automated Outreach — Recall + Reactivation", qty:1, unit:"year", price:4800},
      {id:"l4", description:"Custom Reporting Dashboards", qty:6, unit:"locations", price:400},
      {id:"l5", description:"Implementation & Training", qty:1, unit:"project", price:3200},
    ],
    tax:0, created:"May 15, 2026", validUntil:"Jun 15, 2026", sentAt:"May 16, 2026",
  },
];
