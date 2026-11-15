import React, { useMemo, useState } from 'react';
import { Calendar, Activity, CheckCircle2, AlertTriangle, Stethoscope, Sparkles, BookOpenText } from 'lucide-react';
import {
  analyzeCycles,
  evaluatePcosRisk,
  type CycleLog,
  type PcosInput,
  type PcosScreeningResult,
} from '../utils/healthEngine';
import { BREAST_SELF_CHECK_STEPS, PREGNANCY_TRIMESTER_GUIDE } from '../data/sakhiSeed';

interface BodyPillarProps {
  cycles: CycleLog[];
  onAddCycle: (log: CycleLog) => void;
  lastSelfCheckDate: string | null;
  onMarkSelfCheckComplete: (dateIso: string) => void;
  onOpenWiki?: (articleId?: string) => void;
}

const SYMPTOM_OPTIONS = ['Cramps', 'Fatigue', 'Jawline acne', 'Bloating', 'Headache', 'Mood shift'];

interface AiPcosAdvice {
  summary: string;
  doctorQuestions: string[];
  lifestyleSteps: string[];
  disclaimer: string;
}

export const BodyPillar: React.FC<BodyPillarProps> = ({
  cycles,
  onAddCycle,
  lastSelfCheckDate,
  onMarkSelfCheckComplete,
  onOpenWiki,
}) => {
  const [subTab, setSubTab] = useState<'cycle' | 'pcos' | 'pregnancy'>('cycle');

  // Cycle Logger State
  const todayIso = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayIso);
  const [durationDays, setDurationDays] = useState(5);
  const [flowIntensity, setFlowIntensity] = useState<CycleLog['flowIntensity']>('moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fatigue']);
  const [notes, setNotes] = useState('');
  const [cycleFormError, setCycleFormError] = useState('');

  const analysis = useMemo(() => analyzeCycles(cycles, todayIso), [cycles, todayIso]);

  // PCOS Screener State
  const [pcosInput, setPcosInput] = useState<PcosInput>({
    irregularCycles: analysis.isIrregular,
    fatigueLevel: 'moderate',
    acneSeverity: 'mild',
    hairSigns: 'none',
    metabolicMarkers: {
      sugarCravingsOrCrash: true,
      unexplainedWeightGain: false,
      darkSkinPatches: false,
      familyHistoryDiabetesOrPcos: false,
    },
  });
  const [screeningResult, setScreeningResult] = useState<PcosScreeningResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<AiPcosAdvice | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Pregnancy & Breast Self-Check State
  const [activeTrimester, setActiveTrimester] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const handleCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      setCycleFormError('Please select a period start date.');
      return;
    }
    setCycleFormError('');
    onAddCycle({
      id: `cycle-${Date.now()}`,
      startDate,
      durationDays,
      flowIntensity,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    });
    setNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const handleRunPcosScreener = () => {
    const result = evaluatePcosRisk(pcosInput);
    setScreeningResult(result);
    setAiAdvice(null);
    setAiError('');
  };

  const handleAskDoctorPrepAi = async () => {
    if (!screeningResult) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/pcos-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: screeningResult.score,
          tier: screeningResult.tier,
          factors: screeningResult.contributingFactors,
          cycleSummary: `${analysis.minCycleDays}-${analysis.maxCycleDays} days (${analysis.isIrregular ? 'irregular' : 'regular'})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not retrieve AI doctor guidance.');
      }
      setAiAdvice(data as AiPcosAdvice);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach AI insights service.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleBreastStep = (stepNum: number) => {
    setCheckedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">Body · Health, Cycle & PCOS Care</h1>
          <p className="text-sm text-slate-600">
            Irregular-cycle friendly predictions, early PCOS symptom screening, pregnancy & self-check guides.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl gap-1" role="tablist" aria-label="Body pillar tools">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'cycle'}
            onClick={() => setSubTab('cycle')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'cycle' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Cycle Tracker
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'pcos'}
            onClick={() => setSubTab('pcos')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'pcos' ? 'bg-[#0D9488] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Early PCOS Detector
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'pregnancy'}
            onClick={() => setSubTab('pregnancy')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'pregnancy' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Pregnancy & Breast Check
          </button>
        </div>
      </div>

      {/* TAB 1: CYCLE TRACKER */}
      {subTab === 'cycle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0D9488]" />
              <h2 className="text-lg font-bold text-[#0F2942]">Log Period & Symptoms</h2>
            </div>
            <form onSubmit={handleCycleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cycle-start-date" className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  id="cycle-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cycle-duration" className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    id="cycle-duration"
                    type="number"
                    min={1}
                    max={14}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value) || 4)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>
                <div>
                  <label htmlFor="cycle-flow" className="block text-xs font-semibold text-slate-700 mb-1">
                    Flow Intensity
                  </label>
                  <select
                    id="cycle-flow"
                    value={flowIntensity}
                    onChange={(e) => setFlowIntensity(e.target.value as CycleLog['flowIntensity'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="spotting">Spotting</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">Symptoms</span>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((sym) => {
                    const active = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#0D9488]/10 border-[#0D9488] text-[#0F766E]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="cycle-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Private Note (optional)
                </label>
                <input
                  id="cycle-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Stress, sleep shifts, or medication..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              {cycleFormError && <p className="text-xs text-[#DC2626] font-medium">{cycleFormError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] transition-colors cursor-pointer"
              >
                Save Cycle Log Locally
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Adaptive Prediction Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[#0F2942]">Adaptive Cycle Insights</h2>
                <span className="text-xs font-medium text-slate-600">
                  {analysis.isIrregular ? 'Irregular-Friendly Window Active' : 'Steady Rhythm Pattern'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-[#F7FAFC]">
                  <div className="text-xs text-slate-500">Average Length</div>
                  <div className="text-xl font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {analysis.averageCycleDays} days
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-[#F7FAFC]">
                  <div className="text-xs text-slate-500">Variability Range</div>
                  <div className="text-xl font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {analysis.minCycleDays}–{analysis.maxCycleDays}d
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-[#F7FAFC]">
                  <div className="text-xs text-slate-500">Current Phase</div>
                  <div className="text-sm font-bold text-[#0D9488] mt-1">{analysis.currentPhaseLabel}</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-[#F7FAFC]">
                  <div className="text-xs text-slate-500">Next Window</div>
                  <div className="text-xs font-mono font-semibold text-[#0F2942] tabular-nums mt-1">
                    {analysis.predictedWindowStart} → {analysis.predictedWindowEnd}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {analysis.clinicalNote}
              </p>

              {/* Clinical Cycle Interval Chart */}
              {cycles.length >= 2 && (() => {
                const sorted = [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
                const intervals = sorted.slice(1).map((c, idx) => {
                  const prev = new Date(`${sorted[idx].startDate}T00:00:00Z`).getTime();
                  const curr = new Date(`${c.startDate}T00:00:00Z`).getTime();
                  return {
                    label: c.startDate.slice(5),
                    days: Math.round((curr - prev) / (1000 * 60 * 60 * 24)),
                  };
                });
                return (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0F2942]">Cycle Length Variability Chart (Days)</span>
                      <span className="text-slate-500">Shaded zone = 21–35d clinical reference</span>
                    </div>
                    <svg viewBox="0 0 460 120" className="w-full h-auto bg-[#F7FAFC] rounded-xl border border-slate-200" role="img" aria-label="Cycle interval trend chart">
                      {/* Normal 21-35d clinical reference band (y mapped from 15..55 days) */}
                      <rect x="40" y="45" width="395" height="38" fill="#0D9488" fillOpacity="0.10" />
                      <line x1="40" y1="45" x2="435" y2="45" stroke="#0D9488" strokeDasharray="3 3" strokeOpacity="0.45" />
                      <line x1="40" y1="83" x2="435" y2="83" stroke="#0D9488" strokeDasharray="3 3" strokeOpacity="0.45" />
                      <text x="8" y="49" fontSize="9" fill="#0F766E" fontFamily="monospace">35d</text>
                      <text x="8" y="86" fontSize="9" fill="#0F766E" fontFamily="monospace">21d</text>
                      {intervals.map((pt, i) => {
                        const x = intervals.length === 1 ? 230 : 75 + (i * 320) / (intervals.length - 1);
                        const clamped = Math.max(15, Math.min(50, pt.days));
                        const y = 100 - ((clamped - 15) / 35) * 80;
                        const inRange = pt.days >= 21 && pt.days <= 35;
                        return (
                          <g key={pt.label + i}>
                            {i > 0 && (() => {
                              const prevPt = intervals[i - 1];
                              const prevX = 75 + ((i - 1) * 320) / (intervals.length - 1);
                              const prevClamped = Math.max(15, Math.min(50, prevPt.days));
                              const prevY = 100 - ((prevClamped - 15) / 35) * 80;
                              return <line x1={prevX} y1={prevY} x2={x} y2={y} stroke="#0F2942" strokeWidth="2" />;
                            })()}
                            <circle cx={x} cy={y} r="5" fill={inRange ? '#0D9488' : '#D97706'} stroke="#FFFFFF" strokeWidth="1.5" />
                            <text x={x} y={y - 9} textAnchor="middle" fontSize="10" fontWeight="600" fill="#0F2942" fontFamily="monospace">
                              {pt.days}d
                            </text>
                            <text x={x} y="114" textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="monospace">
                              {pt.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
            </div>

            {/* History Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-[#0F2942]">Recorded Cycle History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <th className="py-2 pr-4">Start Date</th>
                      <th className="py-2 pr-4">Duration</th>
                      <th className="py-2 pr-4">Flow</th>
                      <th className="py-2">Symptoms & Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...cycles]
                      .sort((a, b) => b.startDate.localeCompare(a.startDate))
                      .map((c) => (
                        <tr key={c.id}>
                          <td className="py-2.5 pr-4 font-mono text-xs text-[#0F2942] tabular-nums whitespace-nowrap">
                            {c.startDate}
                          </td>
                          <td className="py-2.5 pr-4 tabular-nums text-slate-700 whitespace-nowrap">
                            {c.durationDays} days
                          </td>
                          <td className="py-2.5 pr-4 capitalize text-slate-700 whitespace-nowrap">
                            {c.flowIntensity}
                          </td>
                          <td className="py-2.5 text-slate-600 text-xs">
                            {[...c.symptoms, c.notes].filter(Boolean).join(' · ') || 'No symptoms noted'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EARLY PCOS DETECTOR */}
      {subTab === 'pcos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0D9488]" />
                <h2 className="text-lg font-bold text-[#0F2942]">Early PCOS Symptom Screener</h2>
              </div>
              {onOpenWiki && (
                <button
                  type="button"
                  onClick={() => onOpenWiki('pcos')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                >
                  <BookOpenText className="w-3.5 h-3.5" />
                  Read PCOS Wiki Guide
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Evaluates cycle irregularity, fatigue, hormonal acne, hair indicators, and metabolic markers. Screening aid only—never a clinical diagnosis.
            </p>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={pcosInput.irregularCycles}
                  onChange={(e) => setPcosInput({ ...pcosInput, irregularCycles: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#0D9488]"
                />
                <div>
                  <span className="block text-sm font-semibold text-[#0F2942]">
                    Irregular, delayed (&gt;35d), or skipped periods
                  </span>
                  <span className="text-xs text-slate-500">
                    Auto-detected from your logs: {analysis.isIrregular ? 'Yes (irregular variance observed)' : 'Not detected in logs'}
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="pcos-fatigue" className="block text-xs font-semibold text-slate-700 mb-1">
                    Fatigue Level
                  </label>
                  <select
                    id="pcos-fatigue"
                    value={pcosInput.fatigueLevel}
                    onChange={(e) =>
                      setPcosInput({ ...pcosInput, fatigueLevel: e.target.value as PcosInput['fatigueLevel'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pcos-acne" className="block text-xs font-semibold text-slate-700 mb-1">
                    Acne Pattern
                  </label>
                  <select
                    id="pcos-acne"
                    value={pcosInput.acneSeverity}
                    onChange={(e) =>
                      setPcosInput({ ...pcosInput, acneSeverity: e.target.value as PcosInput['acneSeverity'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild breakouts</option>
                    <option value="cystic">Jawline / Cystic acne</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pcos-hair" className="block text-xs font-semibold text-slate-700 mb-1">
                    Hair Markers
                  </label>
                  <select
                    id="pcos-hair"
                    value={pcosInput.hairSigns}
                    onChange={(e) =>
                      setPcosInput({ ...pcosInput, hairSigns: e.target.value as PcosInput['hairSigns'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="none">None</option>
                    <option value="facial_body_excess">Excess facial/body hair</option>
                    <option value="scalp_thinning">Scalp thinning</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-700">Metabolic Markers</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'sugarCravingsOrCrash', label: 'Post-meal energy crash / sugar cravings' },
                    { key: 'unexplainedWeightGain', label: 'Unexplained central weight gain' },
                    { key: 'darkSkinPatches', label: 'Darkened neck/underarm skin patches' },
                    { key: 'familyHistoryDiabetesOrPcos', label: 'Family history of PCOS or diabetes' },
                  ].map((item) => {
                    const k = item.key as keyof PcosInput['metabolicMarkers'];
                    return (
                      <label
                        key={item.key}
                        className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={pcosInput.metabolicMarkers[k]}
                          onChange={(e) =>
                            setPcosInput({
                              ...pcosInput,
                              metabolicMarkers: {
                                ...pcosInput.metabolicMarkers,
                                [k]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 accent-[#0D9488]"
                        />
                        {item.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunPcosScreener}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] transition-colors cursor-pointer"
              >
                Run PCOS Screening
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            {!screeningResult ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-[#0F2942]">Ready for Screening</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Select any cycle, skin, hair, fatigue, or metabolic markers on the left and run the screening to generate a private doctor-ready summary.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs text-slate-500">Screening Indicator Tier</span>
                    <div className="flex items-center gap-2 mt-1">
                      {screeningResult.tier === 'Elevated' ? (
                        <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                      ) : screeningResult.tier === 'Moderate' ? (
                        <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                      )}
                      <span className="text-xl font-bold text-[#0F2942]">
                        {screeningResult.tier} Indicator Profile
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Index</span>
                    <div className="text-2xl font-bold font-mono text-[#0F2942] tabular-nums">
                      {screeningResult.score}/100
                    </div>
                  </div>
                </div>

                {screeningResult.contributingFactors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Observed Screening Markers
                    </h3>
                    <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                      {screeningResult.contributingFactors.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 space-y-1.5">
                  <h3 className="text-sm font-bold text-[#0F2942]">Doctor Prompt & Next Steps</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{screeningResult.doctorPrompt}</p>
                  <p className="text-xs text-slate-500 pt-1">{screeningResult.disclaimer}</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAskDoctorPrepAi}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F2942] text-white text-sm font-semibold hover:bg-[#164E63] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'Preparing Doctor Questions...' : 'Generate AI Doctor-Visit Prep'}
                  </button>

                  {aiError && <p className="text-xs text-[#DC2626]">{aiError}</p>}

                  {aiAdvice && (
                    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                      <p className="text-sm text-slate-700 leading-relaxed">{aiAdvice.summary}</p>
                      <div>
                        <h4 className="text-xs font-bold text-[#0F2942] mb-1">Questions to Ask Your Doctor</h4>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {aiAdvice.doctorQuestions?.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#0F2942] mb-1">Supportive Daily Habits</h4>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {aiAdvice.lifestyleSteps?.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-[11px] text-slate-500">{aiAdvice.disclaimer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PREGNANCY & BREAST SELF-CHECK */}
      {subTab === 'pregnancy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pregnancy Insights */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F2942]">Pregnancy Trimester Insights & Red Flags</h2>
            <div className="flex items-center gap-2">
              {PREGNANCY_TRIMESTER_GUIDE.map((item, idx) => (
                <button
                  key={item.trimester}
                  type="button"
                  onClick={() => setActiveTrimester(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    activeTrimester === idx
                      ? 'bg-[#0F2942] text-white border-[#0F2942]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Trimester {idx + 1}
                </button>
              ))}
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-[#F7FAFC] space-y-3">
              <h3 className="text-base font-bold text-[#0F2942]">
                {PREGNANCY_TRIMESTER_GUIDE[activeTrimester].trimester}
              </h3>
              <div>
                <span className="text-xs font-semibold text-slate-500">Routine Care Focus</span>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                  {PREGNANCY_TRIMESTER_GUIDE[activeTrimester].focus}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-semibold text-[#DC2626]">When to Seek Urgent Care</span>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                  {PREGNANCY_TRIMESTER_GUIDE[activeTrimester].redFlags}
                </p>
              </div>
            </div>
          </div>

          {/* Breast Self-Check Interactive Guide */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[#0F2942]">5-Step Breast Self-Check Guide</h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {lastSelfCheckDate ? `Last completed: ${lastSelfCheckDate}` : 'Not logged this month'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Best performed monthly 3–5 days after your period ends. Check off each step as you complete it.
            </p>

            {/* Clinical Palpation Quadrant Diagram */}
            <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-slate-200 flex items-center gap-4">
              <svg viewBox="0 0 100 100" className="w-20 h-20 shrink-0" role="img" aria-label="Breast palpation quadrants diagram">
                <circle cx="50" cy="50" r="38" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
                <line x1="50" y1="12" x2="50" y2="88" stroke="#CBD5E1" strokeDasharray="3 2" />
                <line x1="12" y1="50" x2="88" y2="50" stroke="#CBD5E1" strokeDasharray="3 2" />
                <circle cx="50" cy="50" r="7" fill="#0D9488" fillOpacity="0.2" stroke="#0D9488" strokeWidth="1.5" />
                <path d="M 50 18 L 50 82 M 34 22 L 34 78 M 66 22 L 66 78" stroke="#0F2942" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-bold text-[#0F2942]">Vertical Strip & Quadrant Sweep</div>
                <p>Cover all four quadrants plus the underarm tail using light, medium, and firm finger-pad pressure.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {BREAST_SELF_CHECK_STEPS.map((item) => {
                const done = checkedSteps.includes(item.step);
                return (
                  <label
                    key={item.step}
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      done ? 'bg-[#16A34A]/5 border-[#16A34A]/40' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleBreastStep(item.step)}
                      className="mt-0.5 w-4 h-4 accent-[#16A34A]"
                    />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#0F2942]">
                          0{item.step}. {item.title}
                        </span>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">{item.duration}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onMarkSelfCheckComplete(todayIso)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0F2942] text-white text-sm font-semibold hover:bg-[#164E63] transition-colors cursor-pointer"
            >
              Mark Monthly Self-Check Completed ({checkedSteps.length}/5 Steps)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
