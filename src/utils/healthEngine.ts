export interface CycleLog {
  id: string;
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  flowIntensity: 'light' | 'moderate' | 'heavy' | 'spotting';
  symptoms: string[];
  notes?: string;
}

export interface CycleAnalysis {
  averageCycleDays: number;
  minCycleDays: number;
  maxCycleDays: number;
  variabilityDays: number;
  isIrregular: boolean;
  predictedWindowStart: string;
  predictedWindowEnd: string;
  daysSinceLastStart: number;
  currentPhaseLabel: string;
  clinicalNote: string;
}

export interface PcosInput {
  irregularCycles: boolean; // >35 days, <21 days, or skipped cycles
  fatigueLevel: 'none' | 'mild' | 'moderate' | 'severe';
  acneSeverity: 'none' | 'mild' | 'cystic';
  hairSigns: 'none' | 'facial_body_excess' | 'scalp_thinning' | 'both';
  metabolicMarkers: {
    sugarCravingsOrCrash: boolean;
    unexplainedWeightGain: boolean;
    darkSkinPatches: boolean; // acanthosis nigricans
    familyHistoryDiabetesOrPcos: boolean;
  };
}

export interface PcosScreeningResult {
  score: number; // 0-100
  tier: 'Low' | 'Moderate' | 'Elevated';
  contributingFactors: string[];
  doctorPrompt: string;
  disclaimer: string;
}

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(`${isoA}T00:00:00Z`).getTime();
  const b = new Date(`${isoB}T00:00:00Z`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Computes irregular-cycle-friendly predictions using a dynamic confidence window
 * instead of assuming a rigid 28-day textbook cycle (ACOG Opinion No. 651).
 */
export function analyzeCycles(logs: CycleLog[], referenceDateIso: string): CycleAnalysis {
  if (logs.length === 0) {
    return {
      averageCycleDays: 28,
      minCycleDays: 28,
      maxCycleDays: 28,
      variabilityDays: 0,
      isIrregular: false,
      predictedWindowStart: addDays(referenceDateIso, 25),
      predictedWindowEnd: addDays(referenceDateIso, 31),
      daysSinceLastStart: 0,
      currentPhaseLabel: 'No cycle logged yet',
      clinicalNote: 'Log at least two period start dates so Sakhi360 can adapt to your unique rhythm.',
    };
  }

  const sorted = [...logs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const latest = sorted[sorted.length - 1];
  const daysSinceLastStart = Math.max(0, daysBetween(latest.startDate, referenceDateIso));

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (gap >= 14 && gap <= 120) {
      intervals.push(gap);
    }
  }

  if (intervals.length === 0) {
    const windowStart = addDays(latest.startDate, 25);
    const windowEnd = addDays(latest.startDate, 34);
    return {
      averageCycleDays: 29,
      minCycleDays: 25,
      maxCycleDays: 34,
      variabilityDays: 9,
      isIrregular: false,
      predictedWindowStart: windowStart,
      predictedWindowEnd: windowEnd,
      daysSinceLastStart,
      currentPhaseLabel: daysSinceLastStart <= latest.durationDays ? 'Menstrual phase' : 'Follicular / Luteal',
      clinicalNote: 'Add one more prior cycle to calculate your personal cycle variability range.',
    };
  }

  const sum = intervals.reduce((acc, v) => acc + v, 0);
  const averageCycleDays = Math.round(sum / intervals.length);
  const minCycleDays = Math.min(...intervals);
  const maxCycleDays = Math.max(...intervals);
  const variabilityDays = maxCycleDays - minCycleDays;
  const isIrregular =
    variabilityDays >= 8 ||
    intervals.some((d) => d < 21 || d > 35);

  // Irregular-friendly buffer widens prediction window to match user's real variance
  const buffer = isIrregular ? Math.max(4, Math.ceil(variabilityDays / 2)) : 2;
  const predictedWindowStart = addDays(latest.startDate, Math.max(21, averageCycleDays - buffer));
  const predictedWindowEnd = addDays(latest.startDate, averageCycleDays + buffer);

  let currentPhaseLabel = 'Luteal / Late Cycle';
  if (daysSinceLastStart <= latest.durationDays) {
    currentPhaseLabel = 'Menstrual Phase';
  } else if (daysSinceLastStart < Math.round(averageCycleDays * 0.45)) {
    currentPhaseLabel = 'Follicular Phase';
  } else if (daysSinceLastStart <= Math.round(averageCycleDays * 0.58)) {
    currentPhaseLabel = 'Ovulatory Window (Estimate)';
  } else if (daysSinceLastStart > maxCycleDays + 5) {
    currentPhaseLabel = 'Extended Cycle Window';
  }

  const clinicalNote = isIrregular
    ? `Your cycle length varies by ${variabilityDays} days (${minCycleDays}–${maxCycleDays} days). Sakhi360 uses a widened ${buffer * 2}-day prediction window rather than rigid 28-day assumptions.`
    : `Your recorded cycles average ${averageCycleDays} days with low variance (${variabilityDays} days).`;

  return {
    averageCycleDays,
    minCycleDays,
    maxCycleDays,
    variabilityDays,
    isIrregular,
    predictedWindowStart,
    predictedWindowEnd,
    daysSinceLastStart,
    currentPhaseLabel,
    clinicalNote,
  };
}

/**
 * Early PCOS Risk Screener aligned with Rotterdam-inspired symptom domains:
 * 1) Ovulatory/cycle irregularity, 2) Hyperandrogenic signs (cystic acne, hair),
 * 3) Metabolic & fatigue markers. Screening only — never a diagnosis.
 */
export function evaluatePcosRisk(input: PcosInput): PcosScreeningResult {
  let score = 0;
  const contributingFactors: string[] = [];

  if (input.irregularCycles) {
    score += 30;
    contributingFactors.push('Irregular or prolonged cycles (>35d / <21d / skipped)');
  }

  if (input.fatigueLevel === 'mild') {
    score += 6;
  } else if (input.fatigueLevel === 'moderate') {
    score += 12;
    contributingFactors.push('Persistent moderate fatigue');
  } else if (input.fatigueLevel === 'severe') {
    score += 18;
    contributingFactors.push('Severe daily fatigue & energy crashes');
  }

  if (input.acneSeverity === 'mild') {
    score += 7;
  } else if (input.acneSeverity === 'cystic') {
    score += 16;
    contributingFactors.push('Hormonal / jawline cystic acne');
  }

  if (input.hairSigns === 'facial_body_excess') {
    score += 18;
    contributingFactors.push('Excess facial/body hair (hirsutism indicator)');
  } else if (input.hairSigns === 'scalp_thinning') {
    score += 14;
    contributingFactors.push('Scalp hair thinning / widening part');
  } else if (input.hairSigns === 'both') {
    score += 22;
    contributingFactors.push('Both hirsutism & scalp thinning');
  }

  const m = input.metabolicMarkers;
  if (m.sugarCravingsOrCrash) {
    score += 5;
    contributingFactors.push('Post-meal fatigue or sugar cravings');
  }
  if (m.unexplainedWeightGain) {
    score += 5;
    contributingFactors.push('Unexplained central weight gain');
  }
  if (m.darkSkinPatches) {
    score += 6;
    contributingFactors.push('Darkened skin patches (neck/underarms — insulin marker)');
  }
  if (m.familyHistoryDiabetesOrPcos) {
    score += 4;
    contributingFactors.push('Family history of PCOS or type 2 diabetes');
  }

  const clampedScore = Math.min(100, score);
  let tier: PcosScreeningResult['tier'] = 'Low';
  let doctorPrompt =
    'Your current symptom profile shows low PCOS indicators. Continue logging cycles so any new shifts are spotted early.';

  if (clampedScore >= 55) {
    tier = 'Elevated';
    doctorPrompt =
      'Multiple Rotterdam & metabolic indicators overlap here. Consider booking a gynecologist visit and sharing your cycle log for a hormone panel (LH/FSH, free testosterone, TSH, fasting insulin/HbA1c) and pelvic ultrasound.';
  } else if (clampedScore >= 28) {
    tier = 'Moderate';
    doctorPrompt =
      'A few hormonal or metabolic markers are present. Track symptoms for 2–3 cycles and discuss thyroid, vitamin D/B12, and androgen markers with a doctor if symptoms persist.';
  }

  return {
    score: clampedScore,
    tier,
    contributingFactors,
    doctorPrompt,
    disclaimer:
      'Screening aid only — not a medical diagnosis. Only a qualified clinician can diagnose PCOS after clinical labs and imaging.',
  };
}
