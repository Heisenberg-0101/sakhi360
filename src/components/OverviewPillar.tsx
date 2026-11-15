import React from 'react';
import {
  HeartPulse,
  Brain,
  ShieldAlert,
  Lock,
  Sprout,
  ArrowRight,
  BookOpen,
  BookOpenText,
  Activity,
  ChevronRight,
} from 'lucide-react';
import type { CycleAnalysis } from '../utils/healthEngine';
import { RESEARCH_IMPACT_STATS, RESEARCH_REFERENCES } from '../data/sakhiSeed';

export type PillarId = 'overview' | 'body' | 'mind' | 'safety' | 'defense' | 'growth' | 'wiki';

interface OverviewPillarProps {
  onNavigate: (pillar: PillarId) => void;
  onOpenWiki?: (articleId?: string) => void;
  onEnterStealth?: () => void;
  cycleAnalysis: CycleAnalysis;
  cycleCount: number;
  journalCount: number;
  hazardCount: number;
  trustedContactsCount: number;
  completedSkillsCount: number;
  lastSelfCheckDate: string | null;
}

const METHODOLOGY_STEPS = [
  {
    step: '01',
    title: 'Capture',
    detail: 'Cycle dates, PCOS symptoms, mood check-ins, location, and timestamped evidence.',
  },
  {
    step: '02',
    title: 'Analyse',
    detail: 'AI screening for PCOS markers, mood support, safe route risk, deepfake & stalkerware checks.',
  },
  {
    step: '03',
    title: 'Protect',
    detail: 'AES-256-GCM encrypted local vault, Dual PIN access, Calculator Stealth, and Panic Wipe.',
  },
  {
    step: '04',
    title: 'Act',
    detail: 'Hold-to-confirm Silent SOS, offline BLE Mesh relay, NCII takedown notice, and FIR pack.',
  },
  {
    step: '05',
    title: 'Grow',
    detail: 'Bank-free savings planning, career & legal skill modules, and a calm safe news digest.',
  },
];

const FEASIBILITY_MITIGATIONS = [
  { risk: 'AI accuracy', strategy: 'Screening only, not diagnosis; explicit doctor prompts' },
  { risk: 'False or misused SOS', strategy: 'Confirm gesture, silent cancel PIN, trusted contacts' },
  { risk: 'Mesh range & battery', strategy: 'Low-power BLE opportunistic relay between nearby users' },
  { risk: 'Sparse safe-route data', strategy: 'OSM street-lighting tags + anonymous crowd reports' },
  { risk: 'Abuser finds the app', strategy: 'Decoy PIN, calculator stealth disguise, panic wipe' },
];

export const OverviewPillar: React.FC<OverviewPillarProps> = ({
  onNavigate,
  onOpenWiki,
  cycleAnalysis,
  cycleCount,
  journalCount,
  hazardCount,
  trustedContactsCount,
  completedSkillsCount,
  lastSelfCheckDate,
}) => {
  const carePathways: Array<{
    id: PillarId;
    title: string;
    subtitle: string;
    metric: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'body',
      title: 'Body · Reproductive & PCOS Screening',
      subtitle: 'Irregular-cycle tracker, early PCOS detector, pregnancy & breast self-check guide.',
      metric: `${cycleCount} cycles · ${cycleAnalysis.isIrregular ? 'Irregular window' : 'Steady'}`,
      icon: <HeartPulse className="w-5 h-5 text-[#0D9488]" />,
    },
    {
      id: 'mind',
      title: 'Mind · Encrypted Therapy Journal & AI',
      subtitle: 'AES-256-GCM encrypted private journal, mood tracker, AI companion & coping exercises.',
      metric: `${journalCount} encrypted entries`,
      icon: <Brain className="w-5 h-5 text-[#164E63]" />,
    },
    {
      id: 'safety',
      title: 'Safety · Emergency SOS & OSM Safe Route',
      subtitle: 'Silent SOS with Zero-FIR pack, OSM lit route planner & offline BLE Mesh relay.',
      metric: `${hazardCount} route alerts · ${trustedContactsCount} contacts`,
      icon: <ShieldAlert className="w-5 h-5 text-[#DC2626]" />,
    },
    {
      id: 'defense',
      title: 'Digital · Privacy & Stalkerware Defense',
      subtitle: 'Deepfake takedown assistant, stalkerware permission audit, dual PIN & stealth lock.',
      metric: 'AES-256-GCM Active',
      icon: <Lock className="w-5 h-5 text-[#164E63]" />,
    },
    {
      id: 'growth',
      title: 'Growth · Savings, Skills & Safe Briefing',
      subtitle: 'Bank-free savings planner, career & legal literacy modules, algorithm-free news.',
      metric: `${completedSkillsCount} lessons completed`,
      icon: <Sprout className="w-5 h-5 text-[#16A34A]" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clinical Header Banner */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488]">
            <Activity className="w-4 h-4" />
            <span>Sakhi360 Clinical & Safety Companion · Device-First Private Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2942] [text-wrap:balance]">
            Women’s Health, Mental Care, Safety & Digital Defense Chart
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            All cycle logs, PCOS screenings, encrypted reflections, and emergency incident packs remain stored privately on your device—concealable behind a working calculator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('body')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] transition-colors cursor-pointer"
          >
            Open PCOS Screener
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => (onOpenWiki ? onOpenWiki('pcos') : onNavigate('wiki'))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-[#0F2942] text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <BookOpenText className="w-4 h-4 text-[#0D9488]" />
            PCOS Encyclopedia
          </button>
          <button
            type="button"
            onClick={() => onNavigate('safety')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-[#0F2942] text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Silent SOS & Route
          </button>
        </div>
      </section>

      {/* 4-Column Clinical Vitals & Status Strip */}
      <section aria-label="Clinical Summary Strip" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500">Cycle Window Prediction</div>
          <div className="text-xl font-bold font-mono text-[#0F2942] tabular-nums">
            {cycleAnalysis.minCycleDays === cycleAnalysis.maxCycleDays
              ? `${cycleAnalysis.averageCycleDays} days`
              : `${cycleAnalysis.minCycleDays}–${cycleAnalysis.maxCycleDays} days`}
          </div>
          <div className="text-xs text-[#0D9488] font-medium tabular-nums">
            Next: {cycleAnalysis.predictedWindowStart} → {cycleAnalysis.predictedWindowEnd}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500">Encrypted Mind Vault</div>
          <div className="text-xl font-bold font-mono text-[#0F2942] tabular-nums">
            {journalCount} entries
          </div>
          <div className="text-xs text-slate-600">AES-256-GCM local encryption</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500">Mobility & SOS Readiness</div>
          <div className="text-xl font-bold font-mono text-[#0F2942] tabular-nums">
            {trustedContactsCount} contacts
          </div>
          <div className="text-xs text-slate-600 tabular-nums">
            {hazardCount} active OSM route hazard alerts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500">Self-Check & Empowerment</div>
          <div className="text-xl font-bold font-mono text-[#0F2942] tabular-nums">
            {completedSkillsCount} lessons
          </div>
          <div className="text-xs text-slate-600 tabular-nums">
            {lastSelfCheckDate ? `Breast check: ${lastSelfCheckDate}` : 'Monthly breast check pending'}
          </div>
        </div>
      </section>

      {/* Main 2-Column Clinical Split: Care Pathways List + 5-Step Protocol */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F2942]">Active Care & Safety Modules (5 Pillars)</h2>
            <span className="text-xs text-slate-500">Zero ads · Zero data brokers</span>
          </div>
          <div className="divide-y divide-slate-100">
            {carePathways.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onNavigate(p.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F7FAFC] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#F7FAFC] border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {p.icon}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-sm font-bold text-[#0F2942]">{p.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.subtitle}</p>
                    <div className="text-[11px] font-medium text-[#0D9488] tabular-nums pt-0.5">
                      {p.metric}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-[#0F2942]">5-Step Clinical & Safety Protocol</h2>
            <span className="text-xs text-slate-500">End-to-End Flow</span>
          </div>
          <div className="divide-y divide-slate-100">
            {METHODOLOGY_STEPS.map((m) => (
              <div key={m.step} className="py-3 first:pt-1 last:pb-1 flex items-start gap-3">
                <span className="text-xs font-mono font-bold text-[#0D9488] tabular-nums pt-0.5 shrink-0">
                  {m.step}
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#0F2942]">{m.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence Impact + Clinical Safeguards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F2942]">Public Health & Safety Evidence</h2>
          <div className="divide-y divide-slate-200">
            {RESEARCH_IMPACT_STATS.map((item) => (
              <div key={item.metric} className="py-3 first:pt-0 last:pb-0 space-y-0.5">
                <div className="text-xl font-bold text-[#0D9488] tabular-nums font-display">
                  {item.metric}
                </div>
                <p className="text-sm text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500">{item.source}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F2942]">Clinical & Safety Risk Safeguards</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2 pr-4">Challenge / Risk</th>
                  <th className="py-2">Built-in Safeguard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEASIBILITY_MITIGATIONS.map((row) => (
                  <tr key={row.risk}>
                    <td className="py-2.5 pr-4 font-semibold text-[#0F2942] whitespace-nowrap">{row.risk}</td>
                    <td className="py-2.5 text-slate-600">{row.strategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* References & Credits */}
      <footer className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F2942]">
          <BookOpen className="w-4 h-4 text-[#164E63]" />
          <h2>Clinical References & Project Credits</h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600 list-decimal list-inside">
          {RESEARCH_REFERENCES.map((ref) => (
            <li key={ref} className="leading-relaxed">
              {ref}
            </li>
          ))}
        </ol>
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Sakhi360 · Team Pragati (Soumya Srivastava, Ansh Goel, Shirsh Gupta, Ankit Chaudhary)</span>
          <span>Galgotias University · IEEE WIE Empowerment Initiative</span>
        </div>
      </footer>
    </div>
  );
};
