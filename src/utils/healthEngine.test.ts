import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCycles, evaluatePcosRisk, type CycleLog } from './healthEngine';

test('analyzeCycles adapts prediction window for irregular cycles', () => {
  const logs: CycleLog[] = [
    { id: '1', startDate: '2026-07-01', durationDays: 5, flowIntensity: 'moderate', symptoms: [] },
    { id: '2', startDate: '2026-08-08', durationDays: 6, flowIntensity: 'heavy', symptoms: ['Fatigue'] }, // 38 days
    { id: '3', startDate: '2026-09-05', durationDays: 4, flowIntensity: 'light', symptoms: [] }, // 28 days
    { id: '4', startDate: '2026-10-17', durationDays: 5, flowIntensity: 'moderate', symptoms: ['Cramps'] }, // 42 days
  ];

  const analysis = analyzeCycles(logs, '2026-11-15');
  assert.equal(analysis.isIrregular, true);
  assert.equal(analysis.minCycleDays, 28);
  assert.equal(analysis.maxCycleDays, 42);
  assert.equal(analysis.variabilityDays, 14);
  assert.ok(analysis.predictedWindowStart < analysis.predictedWindowEnd);
});

test('evaluatePcosRisk classifies low vs elevated risk accurately', () => {
  const low = evaluatePcosRisk({
    irregularCycles: false,
    fatigueLevel: 'none',
    acneSeverity: 'none',
    hairSigns: 'none',
    metabolicMarkers: {
      sugarCravingsOrCrash: false,
      unexplainedWeightGain: false,
      darkSkinPatches: false,
      familyHistoryDiabetesOrPcos: false,
    },
  });
  assert.equal(low.tier, 'Low');
  assert.equal(low.score, 0);

  const elevated = evaluatePcosRisk({
    irregularCycles: true,
    fatigueLevel: 'severe',
    acneSeverity: 'cystic',
    hairSigns: 'both',
    metabolicMarkers: {
      sugarCravingsOrCrash: true,
      unexplainedWeightGain: true,
      darkSkinPatches: true,
      familyHistoryDiabetesOrPcos: true,
    },
  });
  assert.equal(elevated.tier, 'Elevated');
  assert.ok(elevated.score >= 80);
  assert.ok(elevated.disclaimer.includes('not a medical diagnosis'));
});
