import type { CycleLog } from '../utils/healthEngine';
import type { CrowdHazardReport, MeshNode } from '../utils/safetyEngine';

export const SEED_CYCLE_LOGS: CycleLog[] = [
  {
    id: 'c-1',
    startDate: '2026-08-18',
    durationDays: 5,
    flowIntensity: 'moderate',
    symptoms: ['Fatigue', 'Lower back ache'],
    notes: 'Baseline cycle',
  },
  {
    id: 'c-2',
    startDate: '2026-09-15',
    durationDays: 5,
    flowIntensity: 'moderate',
    symptoms: ['Cramps', 'Bloating'],
    notes: '28-day cycle',
  },
  {
    id: 'c-3',
    startDate: '2026-10-17',
    durationDays: 4,
    flowIntensity: 'moderate',
    symptoms: ['Mild headache'],
    notes: '32-day cycle',
  },
];

export const BREAST_SELF_CHECK_STEPS = [
  {
    step: 1,
    title: 'Visual Check in Mirror (Arms at Sides)',
    detail: 'Look for changes in symmetry, skin dimpling, puckering, redness, or nipple inversion.',
    duration: '1 min',
  },
  {
    step: 2,
    title: 'Visual Check (Arms Raised Overhead)',
    detail: 'Raise both arms high and check if both sides lift evenly without skin tethering.',
    duration: '1 min',
  },
  {
    step: 3,
    title: 'Lying Down — Circular Pad Palpation',
    detail: 'Use the flat pads of your three middle fingers in small dime-sized circles with light, medium, and firm pressure.',
    duration: '3 min',
  },
  {
    step: 4,
    title: 'Collarbone to Underarm Sweep',
    detail: 'Check vertically from collarbone to bra line and outward into the armpit tissue for firm knots or thickening.',
    duration: '2 min',
  },
  {
    step: 5,
    title: 'Gentle Nipple Check & Monthly Note',
    detail: 'Check for unusual discharge or tenderness. Best done 3–5 days after your period ends (or on a fixed day each month).',
    duration: '1 min',
  },
];

export const PREGNANCY_TRIMESTER_GUIDE = [
  {
    trimester: '1st Trimester (Weeks 1–12)',
    focus: 'Folic acid (400 mcg), hydration, baseline thyroid & hemoglobin check, nausea-friendly small meals.',
    redFlags: 'Severe one-sided pelvic pain, heavy bleeding, persistent dizziness, or inability to keep fluids down.',
  },
  {
    trimester: '2nd Trimester (Weeks 13–26)',
    focus: 'Anomaly scan (18–20 wks), iron + calcium supplementation, gestational diabetes screening (24–28 wks).',
    redFlags: 'Sudden facial/hand swelling, blurred vision, severe headache, or fluid leakage.',
  },
  {
    trimester: '3rd Trimester (Weeks 27–40)',
    focus: 'Daily kick counts, blood pressure monitoring, hospital birth bag & emergency transport plan.',
    redFlags: 'Noticeable drop in baby movements, regular contractions before 37 weeks, or sudden bleeding.',
  },
];

export const SEED_HAZARD_REPORTS: CrowdHazardReport[] = [
  {
    id: 'hr-1',
    edgeId: 'e2',
    hazardType: 'unlit_street',
    note: 'Culvert lights non-functional after 7 PM (OSM lit=no)',
    reportedAt: '2026-11-14T20:15:00Z',
  },
  {
    id: 'hr-2',
    edgeId: 'e3',
    hazardType: 'isolated_alley',
    note: 'Low visibility behind warehouse wall',
    reportedAt: '2026-11-13T21:40:00Z',
  },
];

export const SEED_MESH_NODES: MeshNode[] = [
  { id: 'you', label: 'Your Device (Offline)', x: 80, y: 210, batteryPercent: 64, hasCellularGateway: false },
  { id: 'peer-1', label: 'Sakhi Node #104', x: 195, y: 140, batteryPercent: 82, hasCellularGateway: false },
  { id: 'peer-2', label: 'Sakhi Node #219', x: 210, y: 265, batteryPercent: 45, hasCellularGateway: false },
  { id: 'peer-3', label: 'Sakhi Node #308', x: 345, y: 175, batteryPercent: 71, hasCellularGateway: false },
  { id: 'peer-4', label: 'Campus Guard Relay', x: 475, y: 120, batteryPercent: 95, hasCellularGateway: true },
  { id: 'peer-5', label: 'Transit Kiosk Gateway', x: 485, y: 260, batteryPercent: 90, hasCellularGateway: true },
];

export const BANK_FREE_SAVINGS_GUIDES = [
  {
    id: 'sg-1',
    title: 'Three-Envelope Cash Safety Split',
    category: 'Zero-Bank Method',
    summary: 'Divide weekly cash or scholarship stipends into Essentials (60%), Quiet Emergency Stash (25%), and Skill Fund (15%) in opaque tamper-evident envelopes.',
    steps: [
      'Keep emergency cash split across two physical locations rather than one purse.',
      'Use Sakhi360 Calculator Vault to log cash balances locally without SMS/bank statement alerts.',
      'Set a weekly micro-target (e.g. ₹250/week = ₹13,000/year independent safety buffer).',
    ],
  },
  {
    id: 'sg-2',
    title: 'Post Office & Jan Dhan Independent Account Checklist',
    category: 'Low-Document Banking',
    summary: 'Open an independent savings account under your own phone number when ready—without linking family-shared devices.',
    steps: [
      'India Post Payments Bank (IPPB) or basic BSBDA accounts need zero minimum balance.',
      'Register a dedicated personal SIM / email for OTPs and turn off lock-screen SMS previews.',
      'Verify nominee and passbook custody stays exclusively with you.',
    ],
  },
  {
    id: 'sg-3',
    title: 'Community Chit & SHG Red-Flag Audit',
    category: 'Fraud Protection',
    summary: 'Protect small savings groups from unregistered schemes by checking 4 mandatory rules before contributing.',
    steps: [
      'Verify state registration under the Chit Funds Act or NRLM Self-Help Group ledger.',
      'Never hand over original Aadhaar/PAN or blank signed cheques to informal agents.',
      'Always keep a photo receipt inside your encrypted Sakhi360 vault.',
    ],
  },
];

export const CAREER_SKILL_MODULES = [
  {
    id: 'cm-1',
    title: 'Remote Freelancing & Invoice Independence',
    track: 'Career & Income',
    duration: '25 min',
    lessons: [
      'Creating a privacy-safe portfolio without exposing personal home address',
      'Setting fair hourly/project rates and using milestone payments',
      'Basic PAN / UPI merchant receipt hygiene for independent earners',
    ],
  },
  {
    id: 'cm-2',
    title: 'Workplace Safety & POSH Act Rights',
    track: 'Legal Literacy',
    duration: '15 min',
    lessons: [
      'What counts as workplace harassment (including digital/late-night messages)',
      'How to file with an Internal Committee (IC) or Local Committee (LC) within 3 months',
      'Preserving timestamped screenshots securely inside an encrypted vault',
    ],
  },
  {
    id: 'cm-3',
    title: 'Digital Hygiene & Cyber-Resilience',
    track: 'Tech Foundations',
    duration: '20 min',
    lessons: [
      'Auditing Google/Apple account active sessions and two-factor authenticator apps',
      'Spotting deepfake extortion scams and using StopNCII hash protection',
      'Securing WhatsApp & Instagram privacy settings against location leaks',
    ],
  },
  {
    id: 'cm-4',
    title: 'Zero-FIR, 181 & Cybercrime 1930 Playbook',
    track: 'Civic Safety',
    duration: '15 min',
    lessons: [
      'Right to file a Zero-FIR at any police station regardless of jurisdiction',
      'Reporting financial or image-based abuse immediately on 1930 / cybercrime.gov.in',
      'Recording evidence metadata without altering original image/audio hashes',
    ],
  },
];

export const CURATED_SAFE_NEWS = [
  {
    id: 'news-1',
    category: 'Health',
    title: 'Why Irregular Cycles Deserve Personalized Tracking Windows',
    source: 'ACOG Clinical Guidance Digest',
    readTime: '3 min read',
    summary: 'Clinicians recognize the menstrual cycle as a vital sign. Flexible prediction ranges reduce anxiety and flag early hormonal shifts like PCOS sooner.',
  },
  {
    id: 'news-2',
    category: 'Safety & Rights',
    title: '24-Hour Takedown Rules for Non-Consensual Morphed Imagery',
    source: 'Digital Rights & IT Rules Brief',
    readTime: '4 min read',
    summary: 'Under India’s IT Rules 2021, platforms must act within 24 hours on NCII/deepfake complaints. Hash-matching via StopNCII stops re-uploads without sharing raw photos.',
  },
  {
    id: 'news-3',
    category: 'Finance',
    title: 'Building an Independent Emergency Fund on a Student Budget',
    source: 'Women’s Financial Literacy Collective',
    readTime: '3 min read',
    summary: 'Starting with ₹200–₹300 a week builds autonomy and resilience. Practical steps for cash-envelope safety and zero-balance independent accounts.',
  },
  {
    id: 'news-4',
    category: 'Careers',
    title: 'Tier-2 & Tier-3 Women Entering Remote UI, QA & Data Roles',
    source: 'Skills & Workforce Watch',
    readTime: '4 min read',
    summary: 'Verified open-source portfolios and micro-credentials are helping college students land flexible remote internships without relocating.',
  },
];

export const RESEARCH_IMPACT_STATS = [
  {
    metric: '4.45 lakh',
    label: 'Crimes against women cases registered in India in 2022 (~52 every hour)',
    source: 'NCRB Crime in India 2022',
  },
  {
    metric: '1 in 5',
    label: 'Young Indian women affected by PCOS, often unaware of early markers',
    source: 'The Week (2025)',
  },
  {
    metric: '84%',
    label: 'Of 25 period apps studied shared user health data with third parties',
    source: 'ORCHA Study (2022)',
  },
];

export const RESEARCH_REFERENCES = [
  'NCRB, Crime in India 2022: 4.45 lakh crimes-against-women cases (Daily Excelsior)',
  'NCRB 2022: ~52 cases registered every hour (The Tribune)',
  'PCOS: the hidden struggle of one in five young Indian women (The Week, 2025)',
  'ORCHA (2022): Privacy issues with period tracking apps (Digital Health News)',
  'Privacy International: No Body’s Business but Mine, Vol. 2 (privacyinternational.org)',
  'ACOG Committee Opinion No. 651 (2015): Menstrual cycle as a vital sign (doi:10.1097/AOG.0000000000001215)',
];

export const DECOY_STUDY_NOTES = [
  {
    id: 'd1',
    title: 'Organic Chemistry — Exam Revision Notes',
    date: 'Nov 14',
    body: 'Review SN1 vs SN2 reaction mechanisms, stereochemistry inversion, and polar protic vs aprotic solvents before Friday quiz.',
  },
  {
    id: 'd2',
    title: 'Quick Masala Oats & Dal Khichdi Recipe',
    date: 'Nov 12',
    body: '1 cup rolled oats, 1/2 tsp turmeric, cumin seeds, chopped carrots & peas. Simmer 6 minutes with 2.5 cups water.',
  },
  {
    id: 'd3',
    title: 'Monthly Hostel Mess & Stationery Budget',
    date: 'Nov 10',
    body: 'Notebooks ₹320, Metro card recharge ₹500, Library printouts ₹140, Laundry ₹250.',
  },
];
