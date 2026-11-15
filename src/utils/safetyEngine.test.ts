import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSafeRoute,
  simulateBleMeshRelay,
  buildFirIncidentPack,
  type MeshNode,
} from './safetyEngine';

test('computeSafeRoute avoids unlit shortcut in safest mode', () => {
  const fastest = computeSafeRoute('metro', 'hostel', 'fastest', []);
  const safest = computeSafeRoute('metro', 'hostel', 'safest', []);

  assert.ok(fastest.totalDistanceMeters <= safest.totalDistanceMeters);
  assert.ok(safest.lightingCoveragePercent >= fastest.lightingCoveragePercent);
  assert.equal(safest.lightingCoveragePercent, 100);
  assert.equal(safest.safetyGrade, 'High Safety');
});

test('computeSafeRoute reroutes around dynamically reported crowd hazard', () => {
  const baseline = computeSafeRoute('metro', 'hostel', 'safest', []);
  assert.ok(baseline.edgeIds.length > 0);
  const targetEdge = baseline.edgeIds[baseline.edgeIds.length - 1];

  const rerouted = computeSafeRoute('metro', 'hostel', 'safest', [
    {
      id: 'h-1',
      edgeId: targetEdge,
      hazardType: 'unlit_street',
      note: 'Streetlight out tonight',
      reportedAt: '2026-11-15T20:00:00Z',
    },
  ]);

  assert.ok(!rerouted.edgeIds.includes(targetEdge));
});

test('simulateBleMeshRelay finds multi-hop path to cellular gateway', () => {
  const nodes: MeshNode[] = [
    { id: 'user', label: 'You', x: 50, y: 150, batteryPercent: 80, hasCellularGateway: false },
    { id: 'peer1', label: 'Peer A', x: 180, y: 150, batteryPercent: 60, hasCellularGateway: false },
    { id: 'peer2', label: 'Peer B', x: 310, y: 150, batteryPercent: 75, hasCellularGateway: true },
  ];

  const res = simulateBleMeshRelay('user', nodes, 160, 4);
  assert.equal(res.reachedGateway, true);
  assert.equal(res.gatewayNodeId, 'peer2');
  assert.equal(res.hops.length, 2);
});

test('buildFirIncidentPack formats required fields and evidence', () => {
  const pack = buildFirIncidentPack({
    coordinates: '28.4744° N, 77.5040° E',
    locationLabel: 'Knowledge Park II',
    audioCaptured: true,
    photoCaptured: true,
    trustedContacts: ['Maa (+91-98XXXXXX10)'],
    timestampIso: '2026-11-15T14:30:00Z',
  });

  assert.ok(pack.referenceId.startsWith('SAKHI-FIR-'));
  assert.equal(pack.evidenceIncluded.length, 3);
  assert.ok(pack.summaryText.includes('Zero-FIR'));
});
