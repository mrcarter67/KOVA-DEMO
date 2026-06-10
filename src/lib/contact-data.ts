export interface CActivity {
  id:string; type:"email"|"call"|"note"|"task"|"meeting"|"quote"|"deal"|"score"|"sms";
  title:string; body:string; date:string; time:string; status?:string; from?:string; to?:string;
}
export interface CDeal { id:string; name:string; value:number; stage:string; probability:number; closeDate:string; }
export interface CQuote { id:string; number:string; title:string; total:number; status:string; date:string; }
export interface CTask { id:string; title:string; due:string; done:boolean; priority:string; }
export interface CNote { id:string; text:string; date:string; by:string; }
export interface CDoc { type:string; num:string; title:string; total:number; status:string; color:string; }
export interface CCalEvent { title:string; date:string; time:string; type:string; }

export interface ContactExtra {
  address:string; zip:string; website:string; linkedin:string;
  source:string; tags:string[];
  lifetimeValue:number; dealCount:number; quoteCount:number;
  avgDealSize:number; lastContact:string; firstContact:string;
  lastPurchase:string; nextLikelyAction:string; buyProbability:number;
  preferredChannel:string; responseTime:string;
  emailsOpened:number; emailsSent:number; meetingsHeld:number;
  quotesAccepted:number; quotesSent:number; pageVisits:number;
  lastPageVisited:string; referralSource:string;
  activities:CActivity[]; deals:CDeal[]; quotes:CQuote[];
  tasks:CTask[]; notes:CNote[]; docs:CDoc[]; calendar:CCalEvent[];
  aiPrediction:string;
}

const D: Record<number, ContactExtra> = {

  // ── REAL ESTATE ─────────────────────────────────────────────────────────────

  1: {
    address:"2400 Brickell Ave, Suite 310", zip:"33129",
    website:"apexrealtygroup.com", linkedin:"linkedin.com/in/sarahmitchell",
    source:"Google Ads", tags:["VIP","Referral Partner","Active"],
    lifetimeValue:48600, dealCount:4, quoteCount:6, avgDealSize:12150,
    lastContact:"Jun 4, 2026", firstContact:"Mar 14, 2024", lastPurchase:"Jun 2, 2026",
    nextLikelyAction:"Send Q3 volume pricing proposal before July 1 — expansion timing is now",
    buyProbability:72, preferredChannel:"Email", responseTime:"< 2 hours",
    emailsOpened:34, emailsSent:42, meetingsHeld:8, quotesAccepted:4, quotesSent:6,
    pageVisits:156, lastPageVisited:"Pricing page — May 30", referralSource:"Google Ads → Landing Page",
    activities:[
      {id:"a1",type:"sms",title:"Coral Gables proposal follow-up",body:"Hi Sarah — did you get a chance to look at Q-2026-004? Happy to adjust the furniture package if the budget needs to shift. – Michael",date:"Jun 4",time:"9:22 AM",status:"delivered"},
      {id:"a2",type:"email",title:"Re: Hialeah listing staging proposal",body:"Sarah replied confirming she wants to move forward with the full package. Signed the quote the same afternoon. Invoice sent, deposit due in 5 days.",date:"Jun 2",time:"2:14 PM",from:"s.mitchell@apexrealty.com",to:"you"},
      {id:"a3",type:"sms",title:"Pre-close follow-up — Hialeah quote",body:"Hi Sarah, just checking in on the staging proposal. Happy to adjust anything. – Michael",date:"May 31",time:"10:15 AM",status:"delivered"},
      {id:"a4",type:"quote",title:"Quote accepted — Property Staging Q-2026-001",body:"$8,180 — full staging, photography, and landscaping for the Hialeah listing. Sarah accepted within 3 hours.",date:"May 30",time:"10:30 AM",status:"accepted"},
      {id:"a5",type:"meeting",title:"Listing strategy review — 45 min",body:"Walked through 3 upcoming listings: Hialeah, Coral Gables, and a Brickell condo. Sarah wants staging proposals for all three.",date:"May 28",time:"11:00 AM"},
      {id:"a6",type:"call",title:"Inbound call — Hialeah listing inquiry",body:"Sarah called about staging a new 3BR at 1420 W 49th St, Hialeah. Wants a quote by Friday. Budget ~$8K. Timeline: 2 weeks out from listing.",date:"May 27",time:"3:45 PM"},
      {id:"a7",type:"score",title:"AI Score updated → 87",body:"Fit: 92 · Intent: 84 · Timing: 88 · Value: 85. Moved from 74 to 87 in 30 days. Strong referral partner.",date:"May 25",time:"9:00 AM"},
      {id:"a8",type:"note",title:"Broward County expansion — flag for July",body:"Sarah mentioned she's opening a second office in Broward County in Q3. Expects 3–5 listings per quarter from that market.",date:"May 20",time:"4:10 PM"},
      {id:"a9",type:"call",title:"Check-in call — market timing",body:"10-minute catch-up. Watching the Broward market before committing to second office. Said staging turnaround time matters most.",date:"May 5",time:"2:30 PM"},
      {id:"a10",type:"deal",title:"Deal closed — Brickell Condo Photography",body:"$2,600 photography package for a Brickell condo listing. First closed deal. Delivered 3 days early. Sarah sent a referral the following week.",date:"Apr 10",time:"3:00 PM",status:"won"},
      {id:"a11",type:"meeting",title:"First meeting — discovery & needs assessment",body:"45-minute intro call. Sarah manages 12 agents and handles roughly 8–10 listings per month. Pain point: slow turnaround from current vendors.",date:"Mar 20",time:"10:00 AM"},
      {id:"a12",type:"email",title:"Welcome to KOVA — your CRM is ready",body:"Automated onboarding email delivered. Opened within 90 minutes. Clicked the 'View Your Dashboard' CTA.",date:"Mar 14",time:"9:00 AM",status:"opened"},
    ],
    deals:[
      {id:"d1",name:"Hialeah Listing — Full Staging Package",value:8180,stage:"Closed Won",probability:100,closeDate:"Jun 2, 2026"},
      {id:"d2",name:"Coral Gables Home Staging",value:12400,stage:"Proposal Sent",probability:65,closeDate:"Jun 20, 2026"},
      {id:"d3",name:"Broward Volume Staging Agreement — Q3",value:24000,stage:"Discovery",probability:28,closeDate:"Aug 1, 2026"},
      {id:"d4",name:"Brickell Condo Photography",value:2600,stage:"Closed Won",probability:100,closeDate:"Apr 10, 2026"},
      {id:"d5",name:"Annual Photography Retainer — Apex Realty",value:9600,stage:"Qualifying",probability:45,closeDate:"Jul 8, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",date:"May 30"},
      {id:"q2",number:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",date:"Jun 1"},
      {id:"q3",number:"Q-2026-009",title:"Annual Photography Retainer — Apex",total:9600,status:"viewed",date:"Jun 3"},
      {id:"q4",number:"Q-2026-005",title:"Photography Package — Brickell",total:2600,status:"accepted",date:"Apr 8"},
      {id:"q5",number:"Q-2026-002",title:"Staging — Kendall Listing",total:7400,status:"declined",date:"Apr 22"},
    ],
    tasks:[
      {id:"t1",title:"Follow up on Coral Gables proposal (Q-2026-004)",due:"Jun 6",done:false,priority:"high"},
      {id:"t2",title:"Prepare volume pricing deck for Broward office opening",due:"Jun 30",done:false,priority:"medium"},
      {id:"t3",title:"Schedule Q3 check-in — Broward expansion timing",due:"Jun 15",done:false,priority:"medium"},
      {id:"t4",title:"Send retainer contract for annual photography agreement",due:"Jun 10",done:false,priority:"high"},
      {id:"t5",title:"Send welcome package to Sarah's 3 new Broward agents",due:"May 20",done:true,priority:"low"},
    ],
    notes:[
      {id:"n1",text:"Sarah is opening a Broward office in Q3 (August target). Expects 3–5 new listings/month from that market. Volume pricing deck needs to be ready before the June 30 follow-up.",date:"May 20",by:"Michael"},
      {id:"n2",text:"Prefers email for proposals — always responds within 2 hours during business hours. Best days: Tuesday or Thursday AM. Never call before 9am.",date:"Apr 15",by:"Michael"},
      {id:"n3",text:"Referral partner value: has sent 2 property management clients who each converted. One at $6,200/yr, one at $4,800/yr. Consider locking in a formal referral discount (10%).",date:"Mar 28",by:"AI Agent"},
      {id:"n4",text:"Lost the Kendall staging quote in April to a cheaper competitor who moved faster. She came back 3 weeks later. Speed and responsiveness are her key differentiators.",date:"Apr 22",by:"Michael"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-201",title:"Staging Services — Hialeah Listing",total:8180,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-009",title:"Annual Photography Retainer — Apex",total:9600,status:"viewed",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",color:"#10B981"},
      {type:"Receipt",num:"REC-2026-050",title:"Deposit — Hialeah Staging",total:4090,status:"generated",color:"#64748B"},
      {type:"Quote",num:"Q-2026-005",title:"Photography Package — Brickell",total:2600,status:"accepted",color:"#10B981"},
    ],
    calendar:[
      {title:"Quarterly Review — Sarah Mitchell",date:"Jun 15, 2026",time:"11:00 AM – 11:45 AM",type:"Upcoming"},
      {title:"Listing Strategy Review",date:"May 28, 2026",time:"11:00 AM – 11:45 AM",type:"Completed"},
    ],
    aiPrediction:"Sarah is 72% likely to close the Coral Gables staging deal within 14 days. Engagement signals are strong: last email opened in under 90 minutes, 8 meetings held, 67% quote win rate. The annual photography retainer (Q-2026-009) has been viewed but not actioned — bundle it into the Tuesday follow-up. Priority: reach her before she routes the Broward listings to another vendor.",
  },

  2: {
    address:"4025 W Kennedy Blvd, Suite 200", zip:"33609",
    website:"suncoastproperties.com", linkedin:"linkedin.com/in/jamesthornton",
    source:"LinkedIn Outreach", tags:["VIP","Top Producer","Referral Source"],
    lifetimeValue:86400, dealCount:7, quoteCount:9, avgDealSize:12343,
    lastContact:"Jun 3, 2026", firstContact:"Oct 8, 2021", lastPurchase:"May 30, 2026",
    nextLikelyAction:"Monthly check-in and market briefing — first look at off-market distressed pipeline",
    buyProbability:82, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:58, emailsSent:72, meetingsHeld:12, quotesAccepted:7, quotesSent:9,
    pageVisits:298, lastPageVisited:"Deal Pipeline — Jun 3", referralSource:"Networking event → LinkedIn",
    activities:[
      {id:"a1",type:"email",title:"Weekly market intelligence report — Jun 3",body:"Report delivered with Tampa Bay distressed inventory update. 34% open rate — forwarded to 3 team members within the hour.",date:"Jun 3",time:"9:00 AM",status:"opened"},
      {id:"a2",type:"deal",title:"REO Portfolio — Broward County closed at $178K",body:"Suncoast's 5th deal this year. Invoice sent, payment confirmed May 31. Referral introduced to our data team.",date:"May 30",time:"9:00 AM",status:"won"},
      {id:"a3",type:"call",title:"Contract review — Annual Management terms",body:"Reviewed terms for 62-unit portfolio management agreement. James wants a 3-year lock-in with a 60-day exit clause. Sending revised draft.",date:"May 29",time:"2:00 PM"},
      {id:"a4",type:"quote",title:"Q-2026-007 sent — Annual Management Package $84K",body:"Annual property management agreement covering Suncoast's full 62-unit Tampa portfolio. James forwarded to his operations manager.",date:"May 24",time:"3:15 PM",status:"sent"},
      {id:"a5",type:"meeting",title:"Quarterly account review — 60 min",body:"Reviewed Q2 performance: 7 deals closed, $86K revenue. Discussed Hillsborough SFR package and a potential volume discount for Q3.",date:"May 15",time:"10:00 AM"},
      {id:"a6",type:"note",title:"Off-market SFR first-look arrangement confirmed",body:"James agreed to route all Hillsborough County distressed SFR leads to us first. Formalizing in the management contract renewal.",date:"Apr 10",time:"4:00 PM"},
      {id:"a7",type:"deal",title:"Suncoast Photography Retainer — closed $18K",body:"Annual photography retainer for Suncoast's Tampa listings. 3rd deal this year. Delivered first batch within 48 hours.",date:"Jan 15",time:"11:00 AM",status:"won"},
    ],
    deals:[
      {id:"d1",name:"Annual Property Management — 62-Unit Portfolio",value:84000,stage:"Proposal Sent",probability:75,closeDate:"Aug 18, 2026"},
      {id:"d2",name:"REO Portfolio — Broward County",value:178000,stage:"Closed Won",probability:100,closeDate:"May 30, 2026"},
      {id:"d3",name:"Hillsborough SFR Package × 3",value:145000,stage:"Qualifying",probability:55,closeDate:"Sep 5, 2026"},
      {id:"d4",name:"Suncoast Photography Retainer",value:18000,stage:"Closed Won",probability:100,closeDate:"Jan 15, 2026"},
      {id:"d5",name:"Tampa Bay Investment Intelligence Suite",value:38000,stage:"Discovery",probability:30,closeDate:"Oct 1, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-007",title:"Annual Management Package — 62 Units",total:84000,status:"sent",date:"May 24"},
      {id:"q2",number:"Q-2026-003",title:"Photography Package — Spring Listings",total:18000,status:"accepted",date:"Apr 1"},
      {id:"q3",number:"Q-2026-011",title:"Tampa Bay Investment Intelligence Suite",total:38000,status:"draft",date:"Jun 3"},
      {id:"q4",number:"Q-2025-042",title:"Hillsborough SFR Data Package",total:145000,status:"viewed",date:"May 24"},
    ],
    tasks:[
      {id:"t1",title:"Send deal structure for Hillsborough Package to CFO",due:"Jun 12",done:false,priority:"high"},
      {id:"t2",title:"Set up monthly market briefing — July schedule",due:"Jun 20",done:false,priority:"medium"},
      {id:"t3",title:"Confirm payment for REO Portfolio invoice",due:"Jun 5",done:true,priority:"high"},
      {id:"t4",title:"Prepare 5-listing pipeline for Q3 volume pricing",due:"Jun 25",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"James manages 28 agents and 5 admin staff — team is expanding. Referred 2 new clients this quarter who both converted. Strong loyalty and referral value.",date:"Jun 3",by:"Michael"},
      {id:"n2",text:"Responds best by email, same day. Prefers concise updates with data attached. Never call on Mondays. Best time: Tue/Wed morning.",date:"May 15",by:"Michael"},
      {id:"n3",text:"Hillsborough package requires a title search service we don't currently offer. Explore third-party partnership before next follow-up.",date:"May 29",by:"Michael"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-195",title:"REO Portfolio — Broward County",total:178000,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-007",title:"Annual Property Management — 62 Units",total:84000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-003",title:"Photography Package — Spring Listings",total:18000,status:"accepted",color:"#10B981"},
      {type:"Receipt",num:"REC-2026-038",title:"Down Payment — REO Portfolio",total:89000,status:"generated",color:"#64748B"},
    ],
    calendar:[
      {title:"Monthly Account Review — James Thornton",date:"Jun 15, 2026",time:"10:00 AM – 10:45 AM",type:"Upcoming"},
      {title:"Q3 Strategy Call — Tampa Market Expansion",date:"Jul 8, 2026",time:"2:00 PM – 2:45 PM",type:"Upcoming"},
      {title:"Quarterly Account Review — Q1 2026",date:"Mar 20, 2026",time:"10:00 AM – 11:00 AM",type:"Completed"},
    ],
    aiPrediction:"James is 82% likely to sign the $84K annual management contract before August 18. He's reviewed Q-2026-007 three times without requesting a revision — a strong buy signal. His historical pattern: 18-day average from proposal to close. Q3 pipeline (4 active listings + Hillsborough package) creates natural urgency. Recommend: send a one-page ROI summary showing Q2 results and include a July 1 deadline incentive.",
  },

  3: {
    address:"801 Brickell Key Dr, Suite 150", zip:"33131",
    website:"bluehorizonhomes.com", linkedin:"linkedin.com/in/mariadelgadorealty",
    source:"Facebook Ads", tags:["Mid-Tier","Demo Requested","Active"],
    lifetimeValue:12800, dealCount:1, quoteCount:2, avgDealSize:12800,
    lastContact:"May 31, 2026", firstContact:"Feb 14, 2026", lastPurchase:"Apr 5, 2026",
    nextLikelyAction:"Run live AI scoring demo on her top 3 listings — show distress + equity overlay",
    buyProbability:58, preferredChannel:"Phone", responseTime:"1-2 hours",
    emailsOpened:18, emailsSent:24, meetingsHeld:3, quotesAccepted:1, quotesSent:2,
    pageVisits:67, lastPageVisited:"AI Scoring page — May 29", referralSource:"Facebook Ads → Retargeting",
    activities:[
      {id:"a1",type:"note",title:"Demo request confirmed — Friday 2pm Zoom",body:"Maria requested a live AI scoring demo on her top 3 Miami-Dade listings. Strong intent signal — she referenced a competitor's pricing.",date:"May 31",time:"5:30 PM"},
      {id:"a2",type:"email",title:"AI Scoring for Real Estate — case study sent",body:"Sent comparable case study: 14-listing Miami agent who cut prospecting time 40%. Maria opened within 2 hours.",date:"May 28",time:"9:15 AM",status:"opened"},
      {id:"a3",type:"call",title:"Inbound — interested in AI scoring platform",body:"Maria called after seeing our retargeting ad. 18 active listings in Miami-Dade, looking for a scoring tool. Demo scheduled.",date:"May 25",time:"3:00 PM"},
      {id:"a4",type:"quote",title:"Q-2026-006 sent — Photography + Staging combo",body:"Photography + staging package for 5 listings at $12,800. Maria viewed the proposal but hasn't responded.",date:"May 12",time:"4:00 PM",status:"viewed"},
      {id:"a5",type:"deal",title:"Brickell Condo Flip — Photography Package",body:"First closed deal: $6,800 photography package for 3 Brickell listings. Delivered on time, Maria shared on her agency page.",date:"Apr 5",time:"2:00 PM",status:"won"},
      {id:"a6",type:"meeting",title:"Discovery call — 30 min",body:"45-minute intro call. Manages 18 Miami-Dade listings. Pain point: no way to prioritize which listings to stage first. Strong use case for AI scoring.",date:"Apr 25",time:"10:00 AM"},
    ],
    deals:[
      {id:"d1",name:"Brickell Condo Flip — Photography & Staging",value:12800,stage:"Contacted",probability:35,closeDate:"Sep 20, 2026"},
      {id:"d2",name:"Blue Horizon AI Scoring Suite",value:18000,stage:"Discovery",probability:28,closeDate:"Oct 15, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-006",title:"Photography + Staging Combo — 5 Listings",total:12800,status:"viewed",date:"May 12"},
      {id:"q2",number:"Q-2026-010",title:"AI Lead Scoring Module — Blue Horizon",total:18000,status:"draft",date:"Jun 2"},
    ],
    tasks:[
      {id:"t1",title:"Run AI scoring demo — Friday 2pm (3 listings)",due:"Jun 6",done:false,priority:"high"},
      {id:"t2",title:"Prepare Blue Horizon ROI deck — 18 active listings",due:"Jun 5",done:false,priority:"high"},
      {id:"t3",title:"Send staging portfolio samples to Maria",due:"May 30",done:true,priority:"low"},
    ],
    notes:[
      {id:"n1",text:"Maria manages 18 active listings in Miami-Dade. She's 4 years into her career, growing quickly. Demo is her qualifying test before buying — make it count.",date:"May 31",by:"Michael"},
      {id:"n2",text:"Saw our ads on Facebook retargeting before signing up. Responsive on phone, less on email. Her one closed deal came within 7 days of the demo.",date:"Feb 28",by:"Michael"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-188",title:"Photography Package — 3 Brickell Listings",total:6800,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-006",title:"Photography + Staging Combo",total:12800,status:"viewed",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-010",title:"AI Lead Scoring Module",total:18000,status:"draft",color:"#94A3B8"},
    ],
    calendar:[
      {title:"AI Scoring Demo — Blue Horizon 3 Listings",date:"Jun 6, 2026",time:"2:00 PM – 2:45 PM",type:"Upcoming"},
      {title:"Discovery Call — Maria Delgado",date:"Apr 25, 2026",time:"10:00 AM – 10:30 AM",type:"Completed"},
    ],
    aiPrediction:"Maria is 58% likely to upgrade to the full AI Scoring Suite after Friday's demo. Her 18 active listings create a strong ROI story — show a live score on at least one of her current listings. Her prior photography purchase closed 7 days after a demo. Expected path: demo → proposal → 14-day close. Bundle the Brickell flip staging into the pitch to raise total deal value.",
  },

  4: {
    address:"8011 Beach Blvd, Suite 210", zip:"32216",
    website:"palmettore.com", linkedin:"linkedin.com/in/robertcheninvestments",
    source:"Referral (James Thornton)", tags:["New","Referral","Investment Buyer"],
    lifetimeValue:0, dealCount:0, quoteCount:0, avgDealSize:0,
    lastContact:"May 28, 2026", firstContact:"May 26, 2026", lastPurchase:"—",
    nextLikelyAction:"Intro call — qualify investment criteria, deal cadence, and current data stack",
    buyProbability:35, preferredChannel:"Email", responseTime:"Unknown",
    emailsOpened:0, emailsSent:1, meetingsHeld:0, quotesAccepted:0, quotesSent:0,
    pageVisits:3, lastPageVisited:"Homepage — May 27", referralSource:"James Thornton referral",
    activities:[
      {id:"a1",type:"note",title:"New referral from James Thornton",body:"Investment buyer, SFR focus in Duval County. Thornton says he moves fast when the data is right. Intro email sent, no response yet.",date:"May 26",time:"2:00 PM"},
      {id:"a2",type:"email",title:"Intro email — Palmetto Real Estate via Thornton referral",body:"Personalized intro sent referencing Thornton. Homepage visit confirmed May 27 — hasn't logged in yet.",date:"May 27",time:"9:00 AM"},
      {id:"a3",type:"note",title:"No response to intro — follow up with Jacksonville sample",body:"3 days since intro email. Phone call or LinkedIn message is next step. Prepare Duval County distressed SFR sample before reaching out.",date:"May 28",time:"4:00 PM"},
    ],
    deals:[], quotes:[],
    tasks:[
      {id:"t1",title:"Intro call — qualify investment criteria and deal cadence",due:"Jun 10",done:false,priority:"high"},
      {id:"t2",title:"Send Jacksonville distressed SFR market sample",due:"Jun 8",done:false,priority:"medium"},
      {id:"t3",title:"Follow up intro email if no reply by Tuesday",due:"Jun 3",done:true,priority:"high"},
    ],
    notes:[
      {id:"n1",text:"Thornton referred Robert as a strong potential buyer — distressed SFR in Duval County. Different profile from existing accounts. May need a custom Jacksonville market package.",date:"May 26",by:"Michael"},
      {id:"n2",text:"No login yet — hasn't opened the intro email. First touchpoint is critical. Personalize with Duval County data, not generic content.",date:"May 28",by:"AI Agent"},
    ],
    docs:[],
    calendar:[
      {title:"Intro Call — Robert Chen (Thornton Referral)",date:"Jun 10, 2026",time:"2:00 PM – 2:30 PM",type:"Upcoming"},
    ],
    aiPrediction:"Robert Chen is a brand-new referral with no purchase history. Thornton's last 2 referrals both converted within 21 days — referral quality is high. His Jacksonville/Duval County focus is a new market for us; prepare targeted distressed SFR data for the intro call. Don't pitch a proposal until investment criteria and deal cadence are qualified. 35% confidence will rise quickly after first live conversation.",
  },

  5: {
    address:"1 Duval Street, Suite 40", zip:"33040",
    website:"keyscoastrealty.com", linkedin:"linkedin.com/in/angelabrookspm",
    source:"Referral (Local Agent)", tags:["Qualified","Property Manager","Seasonal"],
    lifetimeValue:22400, dealCount:2, quoteCount:4, avgDealSize:11200,
    lastContact:"Jun 1, 2026", firstContact:"Nov 12, 2024", lastPurchase:"May 10, 2026",
    nextLikelyAction:"Follow up on management contract — close before July peak season lockout",
    buyProbability:68, preferredChannel:"Phone", responseTime:"< 4 hours",
    emailsOpened:22, emailsSent:31, meetingsHeld:4, quotesAccepted:2, quotesSent:4,
    pageVisits:89, lastPageVisited:"Annual Management proposal — Jun 1", referralSource:"Local agent referral",
    activities:[
      {id:"a1",type:"email",title:"Annual management contract proposal sent",body:"62-unit Keys & Coast vacation rental portfolio, $84K ARR. Proposal sent June 1. Angela confirmed receipt via text.",date:"Jun 1",time:"10:15 AM",status:"sent"},
      {id:"a2",type:"call",title:"Inbound — 2 new vacation rental units coming to market",body:"Angela called about 2 new units. Wants photography + 3D walkthrough within 10 days. Confirmed pricing and availability.",date:"May 28",time:"4:30 PM"},
      {id:"a3",type:"quote",title:"Q-2026-008 sent — Annual Management Package $84K",body:"Annual management package covering all 62 vacation rental units. Includes scheduling, photography refresh, and seasonal reporting.",date:"May 24",time:"11:00 AM",status:"sent"},
      {id:"a4",type:"meeting",title:"Property portfolio review — 75 min",body:"Walked through the full 62-unit portfolio. 4 units need immediate photography refresh before peak season. 2 new units coming to market in June.",date:"May 18",time:"11:00 AM"},
      {id:"a5",type:"deal",title:"Waterfront Photography Package — closed $9,800",body:"20-property photography bundle including aerial shots. Angela promoted results on her agency website. Referral followed within 2 weeks.",date:"May 10",time:"2:00 PM",status:"won"},
      {id:"a6",type:"score",title:"AI Score updated → 81",body:"Fit: 83 · Intent: 80 · Timing: 78 · Value: 85. Strong seasonal urgency with June window narrowing fast.",date:"Apr 15",time:"9:00 AM"},
    ],
    deals:[
      {id:"d1",name:"Annual Property Management — 62-Unit Portfolio",value:84000,stage:"Proposal Sent",probability:68,closeDate:"Aug 10, 2026"},
      {id:"d2",name:"Waterfront Vacation Rental Photography Package",value:9800,stage:"Closed Won",probability:100,closeDate:"May 10, 2026"},
      {id:"d3",name:"Keys & Coast Seasonal Staging Package",value:18600,stage:"Qualifying",probability:45,closeDate:"Aug 22, 2026"},
      {id:"d4",name:"Off-Season Maintenance Photography",value:4200,stage:"Closed Won",probability:100,closeDate:"Mar 18, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-008",title:"Annual Management Package — 62 Units",total:84000,status:"sent",date:"May 24"},
      {id:"q2",number:"Q-2026-013",title:"Seasonal Staging Package — Keys",total:18600,status:"draft",date:"Jun 1"},
      {id:"q3",number:"Q-2025-087",title:"Waterfront Photography Package",total:9800,status:"accepted",date:"May 8"},
      {id:"q4",number:"Q-2025-062",title:"Off-Season Property Documentation",total:4200,status:"accepted",date:"Mar 12"},
    ],
    tasks:[
      {id:"t1",title:"Follow up on management contract before July peak lockout",due:"Jun 12",done:false,priority:"high"},
      {id:"t2",title:"Confirm photography schedule for 2 new units",due:"Jun 8",done:false,priority:"medium"},
      {id:"t3",title:"Prepare management contract terms summary",due:"May 22",done:true,priority:"high"},
    ],
    notes:[
      {id:"n1",text:"Angela manages 62 vacation rental units in Key West area. Peak season starts July — she needs everything contracted by July 1. Annual contract is an $84K ARR opportunity.",date:"Jun 1",by:"Michael"},
      {id:"n2",text:"Very responsive on phone, less on email. Best time to call: weekday mornings before 11am. Prefers WhatsApp for quick updates.",date:"May 18",by:"Michael"},
      {id:"n3",text:"Has referred us to 2 other property management companies in the Florida Keys — both came inbound this month. Strong advocate.",date:"May 28",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-201",title:"Waterfront Photography Package",total:9800,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-008",title:"Annual Management Package",total:84000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-013",title:"Seasonal Staging Package",total:18600,status:"draft",color:"#94A3B8"},
      {type:"Invoice",num:"INV-2026-178",title:"Off-Season Photography",total:4200,status:"paid",color:"#15803D"},
    ],
    calendar:[
      {title:"Annual Contract Review — Angela Brooks",date:"Jun 15, 2026",time:"10:30 AM – 11:00 AM",type:"Upcoming"},
      {title:"Photography Scheduling — 2 New Units",date:"Jun 8, 2026",time:"9:00 AM – 9:30 AM",type:"Upcoming"},
      {title:"Property Portfolio Review",date:"May 18, 2026",time:"11:00 AM – 12:15 PM",type:"Completed"},
    ],
    aiPrediction:"Angela is 68% likely to sign the $84K annual management contract, but the decision window is narrow — July peak season starts in 3 weeks. She's viewed Q-2026-008 twice. Her last 2 quotes closed within 12 days. Recommend a phone call before June 12 and anchor the contract start date to July 1. Her 2 new units needing photography are also an upsell opportunity — include that in the conversation to raise deal value.",
  },

  6: {
    address:"100 Second Ave N, Suite 502", zip:"33755",
    website:"clearwaterinv.com", linkedin:"linkedin.com/in/priyasharmainvestments",
    source:"Cold Outreach", tags:["VIP","Investment Portfolio","High Value"],
    lifetimeValue:142600, dealCount:6, quoteCount:8, avgDealSize:23767,
    lastContact:"Jun 2, 2026", firstContact:"Jan 22, 2023", lastPurchase:"May 15, 2026",
    nextLikelyAction:"Priority account — first look at all new distressed inventory. Close $520K package by Aug 5",
    buyProbability:80, preferredChannel:"Email", responseTime:"< 24 hours",
    emailsOpened:48, emailsSent:62, meetingsHeld:9, quotesAccepted:5, quotesSent:8,
    pageVisits:215, lastPageVisited:"Distressed Package proposal — May 31", referralSource:"Cold outreach → LinkedIn DM",
    activities:[
      {id:"a1",type:"deal",title:"Off-Market Package × 5 advanced to Proposal Sent — $520K",body:"Decision expected Aug 5. Priya answered the flood zone question same day — last known blocker removed.",date:"Jun 2",time:"11:30 AM"},
      {id:"a2",type:"call",title:"Q3 acquisition pipeline — 2 new Hialeah properties",body:"Reviewing 2 additional distressed SFRs in Hialeah. Q3 acquisition budget confirmed at $1.4M. Flood zone question flagged on 2 of the 5 package properties.",date:"Jun 1",time:"3:00 PM"},
      {id:"a3",type:"email",title:"Off-Market Distressed Package proposal — 5 properties, $520K",body:"Full proposal sent covering 5 Pinellas/Hillsborough SFRs. Priya opened within 3 hours and forwarded to her attorney.",date:"May 31",time:"4:00 PM",status:"opened"},
      {id:"a4",type:"meeting",title:"Portfolio strategy session — 90 min",body:"Reviewed Q2 acquisitions (3 closed). Discussed Q4 volume program — she wants a tiered pricing proposal for 8-10 units.",date:"May 22",time:"2:00 PM"},
      {id:"a5",type:"deal",title:"Tampa Heights acquisition closed — $164K",body:"Third acquisition this quarter. Closed 8 days after proposal. Title held in private trust as usual. Payment wired in 24 hours.",date:"May 15",time:"3:00 PM",status:"won"},
      {id:"a6",type:"call",title:"New inventory — Pinellas County SFRs",body:"Flagged 3 new distressed SFRs matching Priya's criteria: equity >40%, vacant 60+ days, motivated sellers. She requested comps.",date:"May 8",time:"10:30 AM"},
      {id:"a7",type:"deal",title:"Hillsborough off-market package closed — $98K",body:"Second package acquisition this year. 3 units in Hillsborough County. Priya moved fast — signed within 6 days of proposal.",date:"Apr 3",time:"2:00 PM",status:"won"},
    ],
    deals:[
      {id:"d1",name:"Off-Market Distressed Package × 5",value:520000,stage:"Proposal Sent",probability:80,closeDate:"Aug 5, 2026"},
      {id:"d2",name:"Tampa Heights Off-Market Acquisition",value:164000,stage:"Closed Won",probability:100,closeDate:"May 15, 2026"},
      {id:"d3",name:"Hillsborough Off-Market Package",value:98000,stage:"Closed Won",probability:100,closeDate:"Apr 3, 2026"},
      {id:"d4",name:"Pinellas County SFR Portfolio",value:220000,stage:"Qualifying",probability:60,closeDate:"Sep 1, 2026"},
      {id:"d5",name:"Q4 Distressed Acquisition — Volume Program",value:380000,stage:"Discovery",probability:35,closeDate:"Nov 1, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-012",title:"Off-Market Distressed Package × 5",total:520000,status:"sent",date:"May 31"},
      {id:"q2",number:"Q-2026-004",title:"Pinellas County SFR Portfolio",total:220000,status:"viewed",date:"May 28"},
      {id:"q3",number:"Q-2025-082",title:"Hillsborough Off-Market Package",total:98000,status:"accepted",date:"Mar 28"},
      {id:"q4",number:"Q-2025-044",title:"Tampa Heights Acquisition",total:164000,status:"accepted",date:"Jan 28"},
      {id:"q5",number:"Q-2026-016",title:"Q4 Volume Distressed Acquisition Program",total:380000,status:"draft",date:"Jun 1"},
    ],
    tasks:[
      {id:"t1",title:"Send flood zone analysis for 2 Hialeah properties",due:"Jun 3",done:true,priority:"high"},
      {id:"t2",title:"Set up monthly off-market inventory feed for Priya",due:"Jun 15",done:false,priority:"medium"},
      {id:"t3",title:"Prepare Q4 volume pricing tier — 8-10 unit program",due:"Jul 1",done:false,priority:"medium"},
      {id:"t4",title:"Quarterly account review — prep performance data",due:"Jun 20",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Priya buys 2-3 distressed properties per quarter using a private trust structure. She moves fast when the data is right — 3 deals closed in 90 days.",date:"Jun 1",by:"Michael"},
      {id:"n2",text:"Responds to everything within 24 hours. Prefers email for proposals, phone for quick questions. Always reviews title and flood zone before committing.",date:"May 22",by:"Michael"},
      {id:"n3",text:"She asked about a Q4 volume program at our last meeting — draft a tiered pricing proposal for 8-10 units before July. High probability of conversion.",date:"May 22",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-194",title:"Tampa Heights Acquisition",total:164000,status:"paid",color:"#15803D"},
      {type:"Invoice",num:"INV-2026-182",title:"Hillsborough Off-Market Package",total:98000,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-012",title:"Off-Market Distressed Package × 5",total:520000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-004",title:"Pinellas County SFR Portfolio",total:220000,status:"viewed",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-016",title:"Q4 Volume Program",total:380000,status:"draft",color:"#94A3B8"},
    ],
    calendar:[
      {title:"Q3 Portfolio Review — Priya Sharma",date:"Jun 20, 2026",time:"2:00 PM – 3:30 PM",type:"Upcoming"},
      {title:"$520K Package Q&A Call",date:"Jun 5, 2026",time:"10:00 AM – 10:30 AM",type:"Completed"},
      {title:"Portfolio Strategy Session",date:"May 22, 2026",time:"2:00 PM – 3:30 PM",type:"Completed"},
    ],
    aiPrediction:"Priya is 80% likely to close the $520K Off-Market Distressed Package. She engaged with the proposal twice and her flood zone question (answered) was the last known blocker. Her pattern: propose → verify flood/title → sign — average 9 days from proposal to close. If no signature by June 10, a follow-up call with a title review summary will close the gap. Her Q4 volume intent is real — prepare tiered pricing for 8-10 units before July to capture the next cycle.",
  },

  // ── HEALTHCARE ──────────────────────────────────────────────────────────────

  10: {
    address:"3456 W Fullerton Ave, Suite 210", zip:"60647",
    website:"okaformd.com", linkedin:"linkedin.com/in/lindaokaformd",
    source:"Healthcare Conference", tags:["Qualified","Expansion Signal","High Growth"],
    lifetimeValue:42000, dealCount:2, quoteCount:3, avgDealSize:21000,
    lastContact:"Jun 4, 2026", firstContact:"Mar 14, 2026", lastPurchase:"May 28, 2026",
    nextLikelyAction:"Demo Friday — bring expansion ROI case study. Timeline is tight",
    buyProbability:72, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:24, emailsSent:31, meetingsHeld:5, quotesAccepted:1, quotesSent:3,
    pageVisits:98, lastPageVisited:"Expansion Package proposal — Jun 2", referralSource:"Healthcare IT conference → follow-up",
    activities:[
      {id:"a1",type:"call",title:"IL state filing confirmed — demo rescheduled Friday 1pm",body:"Second location filing confirmed June 2. Budget $28K approved. Demo rescheduled from May 30 to June 6 at 1pm. She's ready.",date:"Jun 4",time:"1:00 PM"},
      {id:"a2",type:"email",title:"Second location expansion ROI report sent",body:"Sent expansion ROI report: $48K package covers both locations, 18-month payback at 34% referral growth. Opened within 30 minutes.",date:"Jun 2",time:"9:15 AM",status:"opened"},
      {id:"a3",type:"deal",title:"Practice Analytics Platform — closed at $42K",body:"First closed deal with Okafor FM. Onboarding scheduled for June 10. Dr. Okafor approved same day as final proposal.",date:"May 28",time:"3:00 PM",status:"won"},
      {id:"a4",type:"meeting",title:"Demo prep + contract review — 45 min",body:"Reviewed Practice Analytics scope and onboarding timeline. Also discussed second location — she expects 90-day build-out.",date:"May 22",time:"3:00 PM"},
      {id:"a5",type:"quote",title:"Q-2026-016 — Practice Analytics Platform $42K",body:"Proposal sent covering full analytics platform deployment for 8-provider practice. Dr. Okafor responded with 2 clarifying questions.",date:"May 10",time:"11:00 AM",status:"accepted"},
      {id:"a6",type:"call",title:"Discovery call — IT budget approved, second location 90 days",body:"Second location timeline confirmed: 90 days. IT budget approved at $28K. Referral volume up 34% YOY. Strong expansion signal.",date:"May 22",time:"3:45 PM"},
      {id:"a7",type:"meeting",title:"Initial discovery call — 60 min",body:"8-provider primary care practice in Chicago. Referral growth from 3 hospital systems. Pain point: no centralized patient analytics across providers.",date:"Apr 28",time:"10:00 AM"},
    ],
    deals:[
      {id:"d1",name:"Practice Analytics Platform — Okafor FM",value:42000,stage:"Closed Won",probability:100,closeDate:"May 28, 2026"},
      {id:"d2",name:"Second Location Expansion Package",value:48000,stage:"Qualified",probability:65,closeDate:"Aug 15, 2026"},
      {id:"d3",name:"EMR Integration Module",value:24000,stage:"New Lead",probability:25,closeDate:"Sep 10, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-016",title:"Practice Analytics Platform",total:42000,status:"accepted",date:"May 10"},
      {id:"q2",number:"Q-2026-019",title:"Second Location Expansion Package",total:48000,status:"sent",date:"Jun 2"},
      {id:"q3",number:"Q-2026-022",title:"EMR Integration Module",total:24000,status:"draft",date:"Jun 4"},
    ],
    tasks:[
      {id:"t1",title:"Run Friday 1pm demo — bring expansion ROI case study",due:"Jun 6",done:false,priority:"high"},
      {id:"t2",title:"Send onboarding calendar invite for Practice Analytics",due:"Jun 4",done:true,priority:"high"},
      {id:"t3",title:"Prepare enterprise upgrade path for second location",due:"Jun 12",done:false,priority:"medium"},
      {id:"t4",title:"Follow up after demo — EMR integration proposal",due:"Jun 9",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Dr. Okafor is practice owner and final decision-maker. 8 providers, 14 staff, strong private-pay mix. Second location IL state filing confirmed June 2 — 90-day timeline.",date:"Jun 4",by:"Michael"},
      {id:"n2",text:"Responds quickly on email. Prefers 1pm-3pm call windows. Her office manager (Diane) screens vendor calls — go direct to Dr. Okafor via email.",date:"May 22",by:"Michael"},
      {id:"n3",text:"First closed deal onboarding June 10. Use this meeting to surface the expansion package — timing could not be better.",date:"May 28",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-204",title:"Practice Analytics Platform",total:42000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-016",title:"Practice Analytics Platform",total:42000,status:"accepted",color:"#10B981"},
      {type:"Quote",num:"Q-2026-019",title:"Second Location Expansion Package",total:48000,status:"sent",color:"#3B9EFF"},
      {type:"Receipt",num:"REC-2026-053",title:"50% Deposit — Analytics Platform",total:21000,status:"generated",color:"#64748B"},
    ],
    calendar:[
      {title:"KOVA Platform Demo — Second Location ROI",date:"Jun 6, 2026",time:"1:00 PM – 1:45 PM",type:"Upcoming"},
      {title:"Practice Analytics Onboarding Kickoff",date:"Jun 10, 2026",time:"10:00 AM – 11:00 AM",type:"Upcoming"},
      {title:"Initial Discovery Call",date:"Apr 28, 2026",time:"10:00 AM – 11:00 AM",type:"Completed"},
    ],
    aiPrediction:"Dr. Okafor is 72% likely to purchase the Second Location Expansion Package ($48K) following Friday's demo. Her first purchase closed in 12 days. The IL state filing for the second location was confirmed June 2 — urgency is real. Lead the demo with the expansion ROI calculation: 34% YOY referral growth × 2 locations = clear payback under 18 months. If the demo lands, expect a 7-14 day decision cycle. Don't pitch the EMR integration ($24K) on Friday — save it for the follow-up.",
  },

  11: {
    address:"4100 Alpha Rd, Suite 300", zip:"75244",
    website:"sunrisedental.com", linkedin:"linkedin.com/in/marcusjimenezdds",
    source:"ADA Conference", tags:["VIP","Enterprise","Multi-Location"],
    lifetimeValue:134000, dealCount:3, quoteCount:5, avgDealSize:44667,
    lastContact:"Jun 3, 2026", firstContact:"Mar 6, 2026", lastPurchase:"May 16, 2026",
    nextLikelyAction:"Upsell to Enterprise Suite — forward ROI deck to CFO. Decision expected Aug 10",
    buyProbability:80, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:42, emailsSent:54, meetingsHeld:8, quotesAccepted:2, quotesSent:5,
    pageVisits:187, lastPageVisited:"Enterprise proposal — Jun 3", referralSource:"ADA conference → direct contact",
    activities:[
      {id:"a1",type:"email",title:"Enterprise proposal forwarded to CFO — $185K",body:"Marcus confirmed he forwarded Q-2026-018 to CFO Elena Ruiz. CFO reviewing — decision deadline August 10.",date:"Jun 3",time:"2:00 PM",status:"sent"},
      {id:"a2",type:"deal",title:"Enterprise Suite advanced to Proposal Sent — $185K",body:"Highest-value active deal in healthcare vertical. 6-location DFW rollout. Marcus pushed it to CFO same day.",date:"Jun 2",time:"10:00 AM"},
      {id:"a3",type:"call",title:"Discovery call — 6 DFW locations, 38 staff, strong budget",body:"Full discovery on Sunrise Dental: 6 locations, 42 chairs, 72% private insurance payer mix. Wants patient analytics + outreach automation.",date:"May 27",time:"2:30 PM"},
      {id:"a4",type:"meeting",title:"Site walk + technology review — 2 Dallas locations",body:"Visited 2 DFW locations with Marcus and the IT lead. Confirmed integration path with their existing EMR system.",date:"May 20",time:"9:00 AM"},
      {id:"a5",type:"deal",title:"Patient Intelligence Suite — 6 locations closed $92K",body:"All 6 locations onboarded. Marcus praised the implementation speed. Referral conversation followed within a week.",date:"May 16",time:"11:00 AM",status:"won"},
      {id:"a6",type:"quote",title:"Q-2026-003 accepted — Patient Intelligence Suite $92K",body:"Proposal accepted same day. Marcus flagged that the enterprise suite would be the natural next step after the 6-location rollout.",date:"May 15",time:"2:00 PM",status:"accepted"},
      {id:"a7",type:"call",title:"Inbound — heard about KOVA at ADA conference",body:"Marcus called after seeing our ADA demo. 6-location dental group in DFW. Specifically interested in patient recall automation.",date:"Mar 22",time:"3:00 PM"},
    ],
    deals:[
      {id:"d1",name:"Enterprise Suite — Sunrise Dental (6 Locations)",value:185000,stage:"Proposal Sent",probability:80,closeDate:"Aug 10, 2026"},
      {id:"d2",name:"Patient Intelligence Suite (6 Locations)",value:92000,stage:"Closed Won",probability:100,closeDate:"May 16, 2026"},
      {id:"d3",name:"Automated Outreach — Recall & Reactivation",value:42000,stage:"Closed Won",probability:100,closeDate:"Apr 8, 2026"},
      {id:"d4",name:"Custom Reporting Dashboards (6 Locations)",value:28000,stage:"Qualifying",probability:65,closeDate:"Aug 15, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-018",title:"Enterprise Suite — 6 Locations",total:185000,status:"sent",date:"Jun 3"},
      {id:"q2",number:"Q-2026-003",title:"Patient Intelligence Suite",total:92000,status:"accepted",date:"May 15"},
      {id:"q3",number:"Q-2025-047",title:"Automated Outreach Platform",total:42000,status:"accepted",date:"Apr 1"},
      {id:"q4",number:"Q-2026-021",title:"Custom Reporting Dashboards",total:28000,status:"draft",date:"Jun 3"},
      {id:"q5",number:"Q-2026-014",title:"HIPAA Compliance Module — Add-on",total:18000,status:"viewed",date:"May 28"},
    ],
    tasks:[
      {id:"t1",title:"Follow up with Marcus on Enterprise proposal — CFO Aug 10",due:"Jun 10",done:false,priority:"high"},
      {id:"t2",title:"Send CFO separate ROI summary for 6-location rollout",due:"Jun 5",done:false,priority:"high"},
      {id:"t3",title:"Confirm all 6 location admin logins are active",due:"Jun 8",done:false,priority:"medium"},
      {id:"t4",title:"Schedule onboarding kickoff for Patient Intelligence Suite",due:"Jun 6",done:true,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Marcus is the operating partner — he recommends, CFO Elena Ruiz signs. Build the ROI case for the CFO using revenue per chair and recall conversion metrics.",date:"Jun 3",by:"Michael"},
      {id:"n2",text:"6 DFW locations, 38 total staff, 42 dental chairs. Payer mix 72% private insurance. PE-backed group — sponsor will want ROI metrics.",date:"May 27",by:"Michael"},
      {id:"n3",text:"3 additional locations planned for 2027. The enterprise contract is not just $185K — it's a platform for a company growing to 9 locations.",date:"Jun 2",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-198",title:"Patient Intelligence Suite",total:92000,status:"paid",color:"#15803D"},
      {type:"Invoice",num:"INV-2026-181",title:"Automated Outreach Platform",total:42000,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-018",title:"Enterprise Suite — 6 Locations",total:185000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-003",title:"Patient Intelligence Suite",total:92000,status:"accepted",color:"#10B981"},
      {type:"Receipt",num:"REC-2026-039",title:"Deposit — Patient Intelligence Suite",total:46000,status:"generated",color:"#64748B"},
    ],
    calendar:[
      {title:"Enterprise Suite — CFO Presentation (Sunrise Dental)",date:"Jun 24, 2026",time:"2:00 PM – 3:00 PM",type:"Upcoming"},
      {title:"6-Location Admin Platform Demo",date:"Jun 12, 2026",time:"10:00 AM – 11:00 AM",type:"Upcoming"},
      {title:"Site Walk — 2 Dallas Locations",date:"May 20, 2026",time:"9:00 AM – 12:00 PM",type:"Completed"},
    ],
    aiPrediction:"Marcus is 80% likely to close the $185K Enterprise Suite by August 10. Two prior purchases show consistent pattern: conference-to-proposal in 28 days, proposal-to-close in 21 days. CFO Elena Ruiz is the gatekeeper — send her a separate ROI deck focused on revenue per chair and recall conversion. With 3 additional locations planned for 2027, the enterprise contract total opportunity is $280K+. Custom Reporting ($28K) is likely to be bundled into the enterprise deal — mention it, don't itemize separately.",
  },

  12: {
    address:"2200 W Cypress Creek Rd, Suite 320", zip:"33309",
    website:"coastalbh.com", linkedin:"linkedin.com/in/aishathompsonlpc",
    source:"LinkedIn Outreach", tags:["Contacted","Compliance Risk","Healthcare"],
    lifetimeValue:0, dealCount:1, quoteCount:2, avgDealSize:0,
    lastContact:"Jun 1, 2026", firstContact:"Mar 28, 2026", lastPurchase:"—",
    nextLikelyAction:"Send behavioral health ROI case study. Follow up Friday. Compliance angle is the hook",
    buyProbability:45, preferredChannel:"Email", responseTime:"2-4 hours",
    emailsOpened:14, emailsSent:22, meetingsHeld:2, quotesAccepted:0, quotesSent:2,
    pageVisits:44, lastPageVisited:"Compliance module page — May 30", referralSource:"LinkedIn outreach campaign",
    activities:[
      {id:"a1",type:"note",title:"Compliance risk flagged in telehealth billing audit",body:"Internal audit found moderate telehealth billing risk — compliance module is a direct match. Case study sent, follow up Friday.",date:"Jun 1",time:"4:00 PM"},
      {id:"a2",type:"email",title:"Behavioral health ROI case study + compliance module",body:"Sent 3 comparable behavioral health practices with compliance module. Aisha opened within 1 hour. Strong signal.",date:"May 30",time:"9:15 AM",status:"opened"},
      {id:"a3",type:"quote",title:"Q-2026-017 sent — Telehealth Compliance Platform $36K",body:"Compliance platform proposal sent covering audit documentation, billing review, and CMS readiness. Aisha viewed it twice.",date:"May 25",time:"11:00 AM",status:"viewed"},
      {id:"a4",type:"call",title:"Discovery call — telehealth billing process overview",body:"40% of Coastal BH revenue is telehealth. Aisha confirmed 2 billing flags from recent internal audit. Compliance module is the right entry point.",date:"May 20",time:"2:00 PM"},
      {id:"a5",type:"meeting",title:"Initial discovery call — 45 min",body:"Behavioral health group with 12 clinicians. Telehealth-heavy. Pain point: no audit-ready documentation trail for billing. Perfect compliance module fit.",date:"Apr 18",time:"11:00 AM"},
    ],
    deals:[
      {id:"d1",name:"Telehealth Compliance Platform",value:36000,stage:"Contacted",probability:40,closeDate:"Aug 28, 2026"},
      {id:"d2",name:"Behavioral Health EMR Integration",value:22000,stage:"New Lead",probability:30,closeDate:"Oct 1, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-017",title:"Telehealth Compliance Platform",total:36000,status:"viewed",date:"May 25"},
      {id:"q2",number:"Q-2026-020",title:"Behavioral Health EMR Integration",total:22000,status:"draft",date:"Jun 1"},
    ],
    tasks:[
      {id:"t1",title:"Follow up after case study — does compliance angle resonate?",due:"Jun 6",done:false,priority:"high"},
      {id:"t2",title:"Set up HIPAA compliance module demo for Aisha",due:"Jun 12",done:false,priority:"medium"},
      {id:"t3",title:"Prepare billing audit risk report for Coastal BH",due:"Jun 8",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Aisha is Clinical Director — she recommends, the board approves contracts >$25K. The compliance angle needs to lead with a risk mitigation number, not features.",date:"Jun 1",by:"Michael"},
      {id:"n2",text:"Opened the case study email in under 1 hour. Strong engagement. She's not buying features — she's buying protection from a CMS audit.",date:"May 30",by:"AI Agent"},
    ],
    docs:[
      {type:"Quote",num:"Q-2026-017",title:"Telehealth Compliance Platform",total:36000,status:"viewed",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-020",title:"Behavioral Health EMR Integration",total:22000,status:"draft",color:"#94A3B8"},
    ],
    calendar:[
      {title:"Compliance Module Demo — Aisha Thompson",date:"Jun 12, 2026",time:"11:00 AM – 11:45 AM",type:"Upcoming"},
      {title:"Discovery Call — Coastal Behavioral Health",date:"Apr 18, 2026",time:"11:00 AM – 11:45 AM",type:"Completed"},
    ],
    aiPrediction:"Aisha is 45% likely to purchase the Telehealth Compliance Platform, but the window is now — she opened the case study within an hour and viewed the proposal twice. Her board approval threshold ($25K) means the $36K proposal needs a concrete risk number. Reframe: 'A single CMS telehealth audit finding can exceed $150K in penalties — our platform costs $36K and provides audit-ready documentation.' Call Friday before the case study momentum fades.",
  },

  13: {
    address:"2400 Patterson St, Suite 220", zip:"37203",
    website:"parkorthopedic.com", linkedin:"linkedin.com/in/kevinparkmd",
    source:"Inbound Website", tags:["New","Orthopedic","Qualify"],
    lifetimeValue:0, dealCount:0, quoteCount:0, avgDealSize:0,
    lastContact:"May 28, 2026", firstContact:"May 21, 2026", lastPurchase:"—",
    nextLikelyAction:"Intro call — qualify IT budget, current EMR vendor, and primary pain point",
    buyProbability:40, preferredChannel:"Phone", responseTime:"Unknown",
    emailsOpened:1, emailsSent:2, meetingsHeld:0, quotesAccepted:0, quotesSent:0,
    pageVisits:12, lastPageVisited:"Healthcare pricing page — May 28", referralSource:"Inbound website form",
    activities:[
      {id:"a1",type:"email",title:"Follow-up — orthopedic practice intelligence platform",body:"Second email sent with Nashville orthopedic case study. Dr. Park opened it — pricing page visit confirms budget awareness.",date:"May 28",time:"9:00 AM",status:"opened"},
      {id:"a2",type:"email",title:"Intro email — Park Orthopedic, KOVA Healthcare Platform",body:"Personalized intro sent. No open yet — follow-up needed. Small practice inbound leads typically require 2-3 touches before response.",date:"May 21",time:"10:00 AM"},
      {id:"a3",type:"note",title:"New inbound — orthopedic specialty, Nashville",body:"Filled out website form. Orthopedic clinic with steady referral volume. IT budget and current vendor not yet known. Schedule intro call.",date:"May 24",time:"9:30 AM"},
    ],
    deals:[], quotes:[],
    tasks:[
      {id:"t1",title:"Intro call — qualify IT budget, EMR vendor, primary pain point",due:"Jun 10",done:false,priority:"high"},
      {id:"t2",title:"Research Park Orthopedic — Medicare/Medicaid payer mix",due:"Jun 5",done:false,priority:"medium"},
      {id:"t3",title:"Follow up after email open — Nashville orthopedic case study",due:"Jun 3",done:true,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"New inbound from Park Orthopedic in Nashville. Payer mix likely skews Medicare/Medicaid — watch revenue cycle exposure. EMR and IT vendor unknown.",date:"May 24",by:"Michael"},
      {id:"n2",text:"Opened the follow-up email but hasn't replied. Phone call is the right next step to get past the office manager.",date:"May 28",by:"AI Agent"},
    ],
    docs:[],
    calendar:[
      {title:"Intro Call — Dr. Kevin Park",date:"Jun 10, 2026",time:"3:00 PM – 3:30 PM",type:"Upcoming"},
    ],
    aiPrediction:"Dr. Park is a new inbound with limited data. The pricing page visit after opening the follow-up email signals genuine budget awareness. Orthopedic practices typically have IT budgets of $30-80K/year. Payer mix skewing Medicare/Medicaid means revenue cycle risk is elevated — compliance module is likely the right first product. Intro call goal: qualify whether they have a current IT vendor and whether they've experienced billing audit issues. Confidence will rise significantly after first live conversation.",
  },

  14: {
    address:"8950 SW 74th Ct, Suite 1100", zip:"33156",
    website:"torreswomenshealth.com", linkedin:"linkedin.com/in/racheltorresmd",
    source:"LinkedIn Campaign", tags:["Qualified","Expansion Signal","Women's Health"],
    lifetimeValue:36000, dealCount:2, quoteCount:3, avgDealSize:18000,
    lastContact:"May 31, 2026", firstContact:"Mar 18, 2026", lastPurchase:"May 12, 2026",
    nextLikelyAction:"Follow up on $82K proposal — Q4 Doral expansion creates urgency",
    buyProbability:72, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:19, emailsSent:28, meetingsHeld:4, quotesAccepted:1, quotesSent:3,
    pageVisits:81, lastPageVisited:"Mid-Market proposal — May 26", referralSource:"LinkedIn outreach → intro call",
    activities:[
      {id:"a1",type:"call",title:"Q4 expansion confirmed — Doral location, November open",body:"Dr. Torres confirmed Doral location targeting November. Referral network growing across 4 hospital systems. Follow up on $82K proposal.",date:"May 31",time:"10:30 AM"},
      {id:"a2",type:"email",title:"Women's Health Mid-Market Package proposal — $82K",body:"Full proposal sent covering both current and Doral locations. Dr. Torres opened within the hour and viewed it twice.",date:"May 26",time:"11:00 AM",status:"opened"},
      {id:"a3",type:"meeting",title:"Expansion strategy call — 60 min",body:"Discussed Doral location timeline and staffing plan. Adding 1 provider and 3 support staff. Mid-market package is well-scoped for her trajectory.",date:"May 18",time:"2:00 PM"},
      {id:"a4",type:"deal",title:"Revenue Cycle Optimization closed — $36K",body:"First closed deal. Approved same day as proposal. Dr. Torres praised the integration speed with her existing billing system.",date:"May 12",time:"3:00 PM",status:"won"},
      {id:"a5",type:"call",title:"Discovery call — OB-GYN practice, referral network overview",body:"2-provider OB-GYN practice, strong referral network across 4 hospital systems. Pain point: no centralized patient tracking across referral sources.",date:"Apr 22",time:"3:00 PM"},
      {id:"a6",type:"email",title:"Women's health practice intelligence case study",body:"Sent comparable case study: 3-provider OB-GYN practice that grew referrals 28% in 90 days using KOVA patient intelligence. Opened within 2 hours.",date:"May 8",time:"9:00 AM",status:"opened"},
    ],
    deals:[
      {id:"d1",name:"Women's Health Mid-Market Package",value:82000,stage:"Proposal Sent",probability:72,closeDate:"Aug 5, 2026"},
      {id:"d2",name:"Revenue Cycle Optimization",value:36000,stage:"Closed Won",probability:100,closeDate:"May 12, 2026"},
      {id:"d3",name:"Patient Intelligence Module — Torres WH",value:24000,stage:"Qualifying",probability:55,closeDate:"Sep 15, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-015",title:"Women's Health Mid-Market Package",total:82000,status:"sent",date:"May 26"},
      {id:"q2",number:"Q-2025-091",title:"Revenue Cycle Optimization",total:36000,status:"accepted",date:"May 1"},
      {id:"q3",number:"Q-2026-023",title:"Patient Intelligence Module",total:24000,status:"draft",date:"Jun 1"},
    ],
    tasks:[
      {id:"t1",title:"Follow up on $82K proposal — Q4 expansion creates urgency",due:"Jun 8",done:false,priority:"high"},
      {id:"t2",title:"Prepare Doral location expansion package options",due:"Jun 15",done:false,priority:"medium"},
      {id:"t3",title:"Confirm revenue cycle module onboarding is complete",due:"Jun 5",done:true,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Dr. Torres runs a 2-provider OB-GYN practice with referral network across 4 hospital systems. Q4 expansion to Doral confirmed — second location opens November.",date:"May 31",by:"Michael"},
      {id:"n2",text:"Prefers email for formal proposals, responsive on SMS for quick questions. Her office manager (Jessica) handles scheduling.",date:"May 18",by:"Michael"},
      {id:"n3",text:"Revenue cycle module closed in 12 days. Mid-market package should be framed as a scalability solution — she's adding a location and a provider.",date:"May 26",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-196",title:"Revenue Cycle Optimization",total:36000,status:"paid",color:"#15803D"},
      {type:"Quote",num:"Q-2026-015",title:"Women's Health Mid-Market Package",total:82000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-023",title:"Patient Intelligence Module",total:24000,status:"draft",color:"#94A3B8"},
      {type:"Receipt",num:"REC-2026-041",title:"50% Deposit — Revenue Cycle Module",total:18000,status:"generated",color:"#64748B"},
    ],
    calendar:[
      {title:"Mid-Market Package Follow-Up — Dr. Torres",date:"Jun 10, 2026",time:"11:00 AM – 11:30 AM",type:"Upcoming"},
      {title:"Expansion Strategy Call",date:"May 18, 2026",time:"2:00 PM – 3:00 PM",type:"Completed"},
    ],
    aiPrediction:"Dr. Torres is 72% likely to sign the $82K mid-market package. She's opened Q-2026-015 twice without responding — this matches her revenue cycle purchase pattern (viewed twice, then called to confirm). Her 4-hospital referral network is a hidden asset: KOVA's referral tracking module shows measurable value within 60 days. If she signs by July, the platform will be operational before the Doral opening — use that timing as the anchor in the follow-up.",
  },

  // ── MANUFACTURING ────────────────────────────────────────────────────────────

  20: {
    address:"5500 Brookpark Rd, Suite 320", zip:"44142",
    website:"harmonindustrial.com", linkedin:"linkedin.com/in/gregharmonprocurement",
    source:"LinkedIn Ads", tags:["Qualified","High Intent","Procurement"],
    lifetimeValue:94000, dealCount:2, quoteCount:3, avgDealSize:47000,
    lastContact:"Jun 4, 2026", firstContact:"Mar 12, 2026", lastPurchase:"May 29, 2026",
    nextLikelyAction:"Submit equipment procurement proposal this week — budget cycle closes Jul 31",
    buyProbability:75, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:28, emailsSent:38, meetingsHeld:5, quotesAccepted:1, quotesSent:3,
    pageVisits:122, lastPageVisited:"Q3 Equipment proposal — Jun 2", referralSource:"LinkedIn ads → website",
    activities:[
      {id:"a1",type:"call",title:"Q3 budget $2.1M confirmed — CNC + conveyor RFQ this week",body:"Greg confirmed Q3 equipment budget at $2.1M. CNC lathe expansion (4 machines + conveyor upgrade) is the primary focus. Budget cycle closes Jul 31.",date:"Jun 4",time:"9:30 AM"},
      {id:"a2",type:"deal",title:"Supply Chain Module closed — $94K. Onboarding scheduled.",body:"First closed deal with Harmon Industrial. Onboarding call scheduled June 6. Greg described it as the easiest vendor approval he's had this year.",date:"May 29",time:"4:00 PM",status:"won"},
      {id:"a3",type:"email",title:"Q3 equipment procurement proposal draft ready",body:"Draft RFQ framework sent for CNC + conveyor package. Greg opened and forwarded to plant engineering team.",date:"Jun 2",time:"10:00 AM",status:"opened"},
      {id:"a4",type:"call",title:"Q3 planning call — CNC capacity expansion, 4 machines",body:"Greg expanding CNC capacity ahead of Q4 production cycle. 4 new Haas ST-10 lathes + conveyor upgrades. Budget approved and allocated.",date:"May 22",time:"10:15 AM"},
      {id:"a5",type:"quote",title:"Q-2026-002 sent — Q3 Equipment Supply Agreement $148K",body:"Full CNC + conveyor procurement package. Greg sent to his VP of Engineering for technical review.",date:"May 15",time:"2:00 PM",status:"sent"},
      {id:"a6",type:"note",title:"Job postings up 40% for CNC operators — expansion signal confirmed",body:"LinkedIn job postings for CNC operators at Harmon are up 40% since April. Strong leading indicator — equipment purchase is not exploratory.",date:"May 22",time:"4:00 PM"},
      {id:"a7",type:"meeting",title:"Discovery — procurement stack and Q3 expansion",body:"Deep dive on Harmon's procurement process. Greg manages $8M annual spend across 40+ vendors. Primary pain: no unified tracking of vendor performance.",date:"Apr 24",time:"10:00 AM"},
    ],
    deals:[
      {id:"d1",name:"Q3 Equipment Package — CNC & Conveyor",value:148000,stage:"New Lead",probability:30,closeDate:"Jul 31, 2026"},
      {id:"d2",name:"Procurement Intelligence Platform",value:220000,stage:"Qualified",probability:60,closeDate:"Aug 20, 2026"},
      {id:"d3",name:"Supply Chain Module",value:94000,stage:"Closed Won",probability:100,closeDate:"May 29, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-002",title:"Q3 Equipment Supply Agreement",total:148000,status:"sent",date:"May 15"},
      {id:"q2",number:"Q-2026-025",title:"Procurement Intelligence Platform",total:220000,status:"draft",date:"Jun 2"},
      {id:"q3",number:"Q-2025-058",title:"Supply Chain Module — Phase 1",total:94000,status:"accepted",date:"May 10"},
    ],
    tasks:[
      {id:"t1",title:"Submit CNC + conveyor equipment proposal by Jun 6",due:"Jun 6",done:false,priority:"high"},
      {id:"t2",title:"Finalize onboarding for Supply Chain Module (Jun 6)",due:"Jun 5",done:true,priority:"high"},
      {id:"t3",title:"Prepare volume pricing tier for $2.1M Q3 budget",due:"Jun 10",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Greg manages $2.1M in Q3 equipment budget — confirmed June 4. CNC lathe expansion (4 machines + conveyor upgrade) is the primary focus. Budget cycle closes July 31.",date:"Jun 4",by:"Michael"},
      {id:"n2",text:"Greg prefers concise emails with specs attached. Don't send multi-page proposals — 2-page executive summary + detailed appendix is the right format.",date:"Apr 24",by:"Michael"},
      {id:"n3",text:"UCC filings show $2.1M equipment financing in last 90 days. This is not exploratory — he has the money and the mandate to buy.",date:"May 18",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-200",title:"Supply Chain Module — Phase 1",total:94000,status:"sent",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-002",title:"Q3 Equipment Supply Agreement",total:148000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-025",title:"Procurement Intelligence Platform",total:220000,status:"draft",color:"#94A3B8"},
      {type:"Receipt",num:"REC-2026-047",title:"50% Deposit — Supply Chain Module",total:47000,status:"generated",color:"#64748B"},
    ],
    calendar:[
      {title:"Supply Chain Module Onboarding",date:"Jun 6, 2026",time:"10:00 AM – 11:00 AM",type:"Upcoming"},
      {title:"Q3 Equipment RFQ Review",date:"Jun 10, 2026",time:"2:00 PM – 3:00 PM",type:"Upcoming"},
      {title:"Discovery — Procurement Stack",date:"Apr 24, 2026",time:"10:00 AM – 11:00 AM",type:"Completed"},
    ],
    aiPrediction:"Greg is 75% likely to purchase the Q3 Equipment Package ($148K) by July 31. His Q3 budget is confirmed at $2.1M, CNC expansion decision is flagged for this week, and Supply Chain Module onboarding shows he's already committed to our platform. The proposal must be submitted by June 6 — budget committee meets July 15. Procurement Intelligence Platform ($220K) is a strong Q4 follow-on: mention it in the June 10 RFQ call but don't push it yet. His pattern: receive proposal → 2-week internal review → approve.",
  },

  21: {
    address:"1234 NW Flanders St, Suite 500", zip:"97209",
    website:"pacificfab.com", linkedin:"linkedin.com/in/sandrawuoperations",
    source:"Trade Show", tags:["VIP","Enterprise","Top Account"],
    lifetimeValue:526000, dealCount:5, quoteCount:5, avgDealSize:105200,
    lastContact:"Jun 3, 2026", firstContact:"Feb 15, 2025", lastPurchase:"May 1, 2026",
    nextLikelyAction:"Renew enterprise contract — $620K proposal with CFO. Decision deadline Aug 1",
    buyProbability:88, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:68, emailsSent:84, meetingsHeld:14, quotesAccepted:4, quotesSent:5,
    pageVisits:341, lastPageVisited:"Enterprise renewal proposal — Jun 3", referralSource:"Manufacturing trade show → demo",
    activities:[
      {id:"a1",type:"email",title:"Enterprise renewal proposal sent — $620K 18-month contract",body:"Sandra opened within 2 hours and forwarded to CFO James Nakamura. Decision expected by Aug 1.",date:"Jun 3",time:"3:30 PM",status:"opened"},
      {id:"a2",type:"deal",title:"Enterprise Renewal advanced to Proposal Sent — $620K",body:"Highest-value active deal in manufacturing vertical. 18-month contract locks in pricing before market rate increases.",date:"Jun 2",time:"9:00 AM"},
      {id:"a3",type:"call",title:"Annual account review — Pacific Fab up 18% YOY",body:"$24.8M annual revenue, 18% YOY growth. Sandra flagged 3 additional plant locations for next contract cycle. Q2 processed $6.4M through KOVA.",date:"May 27",time:"1:00 PM"},
      {id:"a4",type:"email",title:"Q2 performance report — $6.4M procurement, +22%",body:"Q2 report delivered. Sandra shared it internally within the hour. CFO Nakamura was CC'd on her reply.",date:"May 20",time:"2:30 PM",status:"opened"},
      {id:"a5",type:"meeting",title:"Strategic account review — 90 min",body:"Deep dive on Q2 results and renewal terms. Sandra confirmed 3 additional plant locations in 2027 plan. Enterprise renewal is strategic, not routine.",date:"May 14",time:"10:00 AM"},
      {id:"a6",type:"deal",title:"Pacific Fab Q2 Data Platform renewal — closed $248K",body:"Fourth deal closed. Zero negotiation — Sandra signed within 3 days of proposal. Largest single renewal to date.",date:"May 1",time:"3:00 PM",status:"won"},
      {id:"a7",type:"note",title:"3 additional plant locations flagged for 2027 contract cycle",body:"Sandra confirmed expansion to 3 new plants in Q1 2027. The $620K renewal is a floor — total opportunity with expanded footprint is $900K+.",date:"May 14",time:"4:00 PM"},
    ],
    deals:[
      {id:"d1",name:"Enterprise Renewal — Pacific Fab (18-Month)",value:620000,stage:"Proposal Sent",probability:85,closeDate:"Aug 1, 2026"},
      {id:"d2",name:"Pacific Fab Q2 Data Platform",value:248000,stage:"Closed Won",probability:100,closeDate:"May 1, 2026"},
      {id:"d3",name:"Supply Chain Intelligence Platform — West",value:186000,stage:"Closed Won",probability:100,closeDate:"Feb 28, 2026"},
      {id:"d4",name:"3-Plant Expansion Intelligence Package",value:380000,stage:"Discovery",probability:35,closeDate:"Jan 1, 2027"},
      {id:"d5",name:"Automated Procurement Module",value:92000,stage:"Closed Won",probability:100,closeDate:"Nov 14, 2025"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-024",title:"Enterprise Renewal — 18-Month Contract",total:620000,status:"sent",date:"Jun 3"},
      {id:"q2",number:"Q-2026-009",title:"Data Platform Renewal — Pacific Fab",total:248000,status:"accepted",date:"Apr 25"},
      {id:"q3",number:"Q-2025-088",title:"Supply Chain Intelligence Platform",total:186000,status:"accepted",date:"Feb 18"},
      {id:"q4",number:"Q-2026-027",title:"3-Plant Expansion Package",total:380000,status:"draft",date:"Jun 2"},
      {id:"q5",number:"Q-2025-062",title:"Automated Procurement Module",total:92000,status:"accepted",date:"Nov 8"},
    ],
    tasks:[
      {id:"t1",title:"Follow up on $620K enterprise renewal — Aug 1 deadline",due:"Jun 10",done:false,priority:"high"},
      {id:"t2",title:"Send CFO ROI deck for 18-month contract justification",due:"Jun 8",done:false,priority:"high"},
      {id:"t3",title:"Confirm Q2 performance report was shared internally",due:"Jun 5",done:true,priority:"medium"},
      {id:"t4",title:"Assign dedicated success manager to Pacific Fab account",due:"Jun 6",done:true,priority:"high"},
    ],
    notes:[
      {id:"n1",text:"Sandra is the operations lead — CFO James Nakamura approves deals >$250K. Q2 results ($6.4M processed, +22%) are the strongest argument for renewal.",date:"May 27",by:"Michael"},
      {id:"n2",text:"Pacific Fab has 18% YOY growth and 3 additional plant locations in the 2027 plan. The $620K renewal is a floor, not a ceiling.",date:"May 14",by:"AI Agent"},
      {id:"n3",text:"4 contracts closed, 0 disputes, 0 missed deadlines. Highest-value account in manufacturing vertical. Dedicated success manager assigned immediately.",date:"Jun 2",by:"AI Agent"},
    ],
    docs:[
      {type:"Invoice",num:"INV-2026-192",title:"Q2 Data Platform Renewal",total:248000,status:"paid",color:"#F59E0B"},
      {type:"Invoice",num:"INV-2025-198",title:"Supply Chain Intelligence Platform",total:186000,status:"paid",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-024",title:"Enterprise Renewal — 18-Month",total:620000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-027",title:"3-Plant Expansion Package",total:380000,status:"draft",color:"#94A3B8"},
      {type:"Invoice",num:"INV-2025-166",title:"Automated Procurement Module",total:92000,status:"paid",color:"#F59E0B"},
    ],
    calendar:[
      {title:"Enterprise Renewal Review — Sandra Wu",date:"Jun 18, 2026",time:"10:00 AM – 11:00 AM",type:"Upcoming"},
      {title:"CFO Presentation — Pacific Fab (Nakamura)",date:"Jun 24, 2026",time:"2:00 PM – 3:00 PM",type:"Upcoming"},
      {title:"Strategic Account Review — Q2",date:"May 14, 2026",time:"10:00 AM – 11:30 AM",type:"Completed"},
    ],
    aiPrediction:"Sandra is 88% likely to renew the $620K enterprise contract by August 1. She has never missed a renewal, processed $6.4M in Q2 alone (+22% YOY), and her team has zero open support tickets. CFO Nakamura will review — prepare a 1-page ROI deck: cost-per-dollar-processed is $0.97 per $100 (industry avg: $2.40). The 3 additional plant locations planned for 2027 make this renewal strategic. A price-lock provision in the 18-month contract is likely to accelerate Nakamura's sign-off before any RFP process begins.",
  },

  22: {
    address:"7200 E 30th St, Suite 100", zip:"46219",
    website:"midweststeel.com", linkedin:"linkedin.com/in/derekcoleman",
    source:"Cold Email Campaign", tags:["Contacted","OSHA Risk","Q1 Opportunity"],
    lifetimeValue:0, dealCount:1, quoteCount:2, avgDealSize:0,
    lastContact:"May 31, 2026", firstContact:"Mar 22, 2026", lastPurchase:"—",
    nextLikelyAction:"Nurture now with Q4 manufacturing outlook. Revisit Q1 when replacement cycle opens",
    buyProbability:42, preferredChannel:"Email", responseTime:"1-3 days",
    emailsOpened:12, emailsSent:18, meetingsHeld:1, quotesAccepted:0, quotesSent:2,
    pageVisits:38, lastPageVisited:"Equipment RFQ page — May 24", referralSource:"Cold email campaign → website",
    activities:[
      {id:"a1",type:"note",title:"OSHA inspection flagged 2 aging press units — Q1 replacement likely",body:"Forced replacement cycle creates a natural buy event in Q1 2027. OSHA re-inspection is typically 180 days out — November deadline creates urgency then.",date:"May 31",time:"11:00 AM"},
      {id:"a2",type:"email",title:"Q4 manufacturing outlook + OSHA equipment aging trend report",body:"Sent OSHA equipment aging trend data relevant to Midwest Steel. Derek opened immediately — strong topical relevance.",date:"May 26",time:"9:30 AM",status:"opened"},
      {id:"a3",type:"quote",title:"Q-2026-026 — Midwest Steel Equipment RFQ Package $88K",body:"Equipment replacement proposal sent. Derek viewed it but hasn't responded — realistic until the OSHA deadline creates pressure.",date:"May 24",time:"3:00 PM",status:"viewed"},
      {id:"a4",type:"call",title:"OSHA inspection results — equipment replacement timeline",body:"Derek confirmed 2 aging press units flagged. Replacement cycle not yet budgeted. VP Operations (Tom Liu) would need to approve >$50K.",date:"May 20",time:"3:00 PM"},
      {id:"a5",type:"meeting",title:"Discovery call — plant capacity and procurement",body:"Indianapolis plant, 88 employees, 3 press lines. Current equipment is 12-14 years old. OSHA compliance risk is the primary entry point.",date:"Apr 12",time:"10:00 AM"},
    ],
    deals:[
      {id:"d1",name:"CNC Press Replacement RFQ — Midwest Steel",value:88000,stage:"Contacted",probability:35,closeDate:"Oct 1, 2026"},
      {id:"d2",name:"Procurement Intelligence Module",value:54000,stage:"New Lead",probability:25,closeDate:"Nov 15, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-026",title:"Equipment RFQ Package",total:88000,status:"viewed",date:"May 24"},
      {id:"q2",number:"Q-2026-028",title:"Procurement Intelligence Module",total:54000,status:"draft",date:"Jun 1"},
    ],
    tasks:[
      {id:"t1",title:"Nurture Derek with Q4 outlook — revisit Q1 2027",due:"Jun 15",done:false,priority:"medium"},
      {id:"t2",title:"Monitor OSHA compliance timeline — replacement signal Q1",due:"Jul 1",done:false,priority:"medium"},
      {id:"t3",title:"Research VP Operations Tom Liu — build parallel relationship",due:"Jun 12",done:false,priority:"low"},
    ],
    notes:[
      {id:"n1",text:"Derek is plant manager — doesn't have budget authority >$50K. VP of Operations Tom Liu is the real decision-maker. Build a parallel relationship with Tom before the Q1 proposal.",date:"May 31",by:"Michael"},
      {id:"n2",text:"Derek is a reactive buyer — OSHA pressure, not platform enthusiasm, will drive the decision. The Q4 check-in on Oct 1 is the strategic window.",date:"May 31",by:"AI Agent"},
    ],
    docs:[
      {type:"Quote",num:"Q-2026-026",title:"Equipment RFQ Package",total:88000,status:"viewed",color:"#F59E0B"},
      {type:"Quote",num:"Q-2026-028",title:"Procurement Intelligence Module",total:54000,status:"draft",color:"#94A3B8"},
    ],
    calendar:[
      {title:"Q4 Check-in — Midwest Steel (OSHA Timeline)",date:"Oct 1, 2026",time:"10:00 AM – 10:30 AM",type:"Upcoming"},
      {title:"Discovery Call — Plant Capacity",date:"Apr 12, 2026",time:"10:00 AM – 11:00 AM",type:"Completed"},
    ],
    aiPrediction:"Derek is 42% likely to purchase by October but more realistically Q1 2027 when the OSHA replacement cycle forces action. He's a reactive buyer — OSHA pressure will drive the decision, not platform enthusiasm. The VP of Operations (Tom Liu) is the real decision-maker — research his contact and build a parallel relationship before the Q1 proposal. OSHA re-inspection is typically 180 days after finding — November is the urgency window.",
  },

  23: {
    address:"2800 Amnicola Hwy, Unit 14", zip:"37406",
    website:"reevesprecision.com", linkedin:"linkedin.com/in/tamarareevesceo",
    source:"Government Contract Database", tags:["New","Aerospace","Government"],
    lifetimeValue:0, dealCount:0, quoteCount:0, avgDealSize:0,
    lastContact:"May 24, 2026", firstContact:"May 22, 2026", lastPurchase:"—",
    nextLikelyAction:"Intro call — qualify production capacity and RFQ volume",
    buyProbability:28, preferredChannel:"Phone", responseTime:"Unknown",
    emailsOpened:0, emailsSent:1, meetingsHeld:0, quotesAccepted:0, quotesSent:0,
    pageVisits:2, lastPageVisited:"Homepage — May 22", referralSource:"Government contract database scan",
    activities:[
      {id:"a1",type:"note",title:"New inbound — precision parts shop, DoD aerospace filings",body:"Government contract filings suggest active DoD aerospace subcontracting. Small shop but high-value if primary contract is active. Intro call needed.",date:"May 24",time:"3:00 PM"},
      {id:"a2",type:"email",title:"Intro email — Reeves Precision Parts, supply chain intelligence",body:"Personalized intro referencing aerospace composites and supply chain intelligence. No open yet — call or LinkedIn is next step.",date:"May 22",time:"9:00 AM"},
    ],
    deals:[], quotes:[],
    tasks:[
      {id:"t1",title:"Intro call — qualify production capacity, RFQ volume, DoD scope",due:"Jun 10",done:false,priority:"high"},
      {id:"t2",title:"Research Reeves Precision — government contract database",due:"Jun 5",done:true,priority:"medium"},
      {id:"t3",title:"Try LinkedIn before email — small CEO often ignores cold email",due:"Jun 8",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"Reeves Precision is a small shop (<50 employees) but DoD aerospace subcontracting creates a different growth dynamic. If the primary contract is active, supply chain intelligence is required.",date:"May 24",by:"Michael"},
      {id:"n2",text:"Has not opened intro email yet. Try LinkedIn first — small CEOs often read cold email but don't respond. Direct message may break through.",date:"May 24",by:"AI Agent"},
    ],
    docs:[],
    calendar:[
      {title:"Intro Call — Tamara Reeves (DoD Subcontract)",date:"Jun 10, 2026",time:"10:00 AM – 10:30 AM",type:"Upcoming"},
    ],
    aiPrediction:"Tamara Reeves is a low-confidence new lead, but DoD subcontracting creates a different growth dynamic than typical SMB manufacturing. If the DoD contract is active, they will need supply chain intelligence covering import compliance, material certifications, and part traceability — all in our platform. Main risk: this is a small shop and may not have the IT budget yet. Intro call objective: determine whether the DoD contract is active, its value, and whether there's a supply chain visibility requirement attached.",
  },

  24: {
    address:"66 Cedar St, Suite 880", zip:"06103",
    website:"apexcomposite.com", linkedin:"linkedin.com/in/jamespatelbuying",
    source:"Inbound Website", tags:["Qualified","DoD","Aerospace"],
    lifetimeValue:0, dealCount:1, quoteCount:2, avgDealSize:0,
    lastContact:"Jun 1, 2026", firstContact:"Apr 12, 2026", lastPurchase:"—",
    nextLikelyAction:"Send supply chain intelligence proposal — $56K is priced right for their risk profile",
    buyProbability:62, preferredChannel:"Email", responseTime:"Same day",
    emailsOpened:16, emailsSent:22, meetingsHeld:2, quotesAccepted:0, quotesSent:2,
    pageVisits:64, lastPageVisited:"Supply chain intelligence page — Jun 1", referralSource:"Website form → aerospace content",
    activities:[
      {id:"a1",type:"call",title:"DoD subcontract awarded June 1 — needs 3-country supply chain intel",body:"DoD contract confirmed. James needs supply chain intelligence covering US, Japan, and Germany sourcing. Proposal requested urgently.",date:"Jun 1",time:"2:00 PM"},
      {id:"a2",type:"email",title:"Supply chain intelligence proposal — $56K",body:"Full proposal sent covering 3-country sourcing intelligence, import compliance, and DFARS traceability. James opened within 2 hours.",date:"May 30",time:"10:00 AM",status:"opened"},
      {id:"a3",type:"meeting",title:"Discovery call — aerospace composites, 3-country sourcing",body:"Deep dive on Apex Composite's sourcing structure: 40% US, 35% Japan, 25% Germany. DFARS compliance not yet in place. Strong product fit.",date:"May 18",time:"2:00 PM"},
      {id:"a4",type:"email",title:"Aerospace supply chain intelligence case study",body:"Sent DoD aerospace composites case study — similar Hartford-area supplier who reduced sourcing risk 60% in 90 days.",date:"May 15",time:"9:00 AM",status:"opened"},
      {id:"a5",type:"call",title:"Inbound — DoD aerospace composites sourcing challenge",body:"James called after reading our aerospace content. Managing 3-country supply chain for composite components with no visibility tool. Urgent need.",date:"Apr 30",time:"3:00 PM"},
    ],
    deals:[
      {id:"d1",name:"Supply Chain Intelligence — 3-Country Sourcing",value:56000,stage:"New Lead",probability:25,closeDate:"Sep 15, 2026"},
      {id:"d2",name:"DoD Contract Compliance Module",value:28000,stage:"New Lead",probability:30,closeDate:"Sep 30, 2026"},
    ],
    quotes:[
      {id:"q1",number:"Q-2026-029",title:"Supply Chain Intelligence — Aerospace",total:56000,status:"sent",date:"May 30"},
      {id:"q2",number:"Q-2026-031",title:"DoD Contract Compliance Module",total:28000,status:"draft",date:"Jun 1"},
    ],
    tasks:[
      {id:"t1",title:"Follow up on supply chain proposal — DoD creates urgency",due:"Jun 5",done:false,priority:"high"},
      {id:"t2",title:"Prepare DoD compliance module overview for James",due:"Jun 8",done:false,priority:"medium"},
      {id:"t3",title:"Request DoD contract number for sourcing requirements analysis",due:"Jun 10",done:false,priority:"medium"},
    ],
    notes:[
      {id:"n1",text:"James is Purchasing Director but CEO (Alan Patel, his father) may need to approve >$40K contracts. DoD subcontract awarded June 1 creates non-negotiable traceability requirements.",date:"Jun 1",by:"Michael"},
      {id:"n2",text:"Import records confirm 3-country sourcing: US, Japan, Germany. DFARS non-compliance risk is real. Position $56K platform as risk mitigation, not a feature purchase.",date:"May 18",by:"AI Agent"},
    ],
    docs:[
      {type:"Quote",num:"Q-2026-029",title:"Supply Chain Intelligence — Aerospace",total:56000,status:"sent",color:"#3B9EFF"},
      {type:"Quote",num:"Q-2026-031",title:"DoD Contract Compliance Module",total:28000,status:"draft",color:"#94A3B8"},
    ],
    calendar:[
      {title:"Supply Chain Intelligence Demo — James Patel",date:"Jun 8, 2026",time:"2:00 PM – 2:45 PM",type:"Upcoming"},
      {title:"Discovery Call — Aerospace Composites",date:"May 18, 2026",time:"2:00 PM – 3:00 PM",type:"Completed"},
    ],
    aiPrediction:"James is 62% likely to purchase the Supply Chain Intelligence Platform ($56K) following the DoD contract award on June 1. The contract creates non-negotiable traceability requirements — this is a compelled purchase. The DoD Compliance Module ($28K) should be positioned as a required add-on, not optional, given DFARS requirements. Frame the proposal as risk mitigation: 'A DFARS non-compliance finding can result in contract termination — the $56K platform eliminates that risk.' Call June 5 to walk through the proposal.",
  },
};

export default D;
