export interface MapNode {
  id: string;
  label: string;
  x: number; // SVG coordinate 0..640
  y: number; // SVG coordinate 0..380
  type: 'transit' | 'campus' | 'market' | 'clinic' | 'residential';
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  streetName: string;
  distanceMeters: number;
  lit: boolean; // OSM tag: lit=yes / lit=no
  crowdScore: number; // 1 (isolated) to 10 (busy, open shops)
  policePatrol: boolean;
}

export interface CrowdHazardReport {
  id: string;
  edgeId: string;
  hazardType: 'unlit_street' | 'harassment_hotspot' | 'isolated_alley' | 'broken_cctv';
  note: string;
  reportedAt: string;
}

export interface RouteResult {
  mode: 'safest' | 'fastest';
  nodeIds: string[];
  edgeIds: string[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  lightingCoveragePercent: number;
  hazardsAvoided: number;
  safetyGrade: 'High Safety' | 'Moderate Caution' | 'High Risk';
}

export interface MeshNode {
  id: string;
  label: string;
  x: number;
  y: number;
  batteryPercent: number;
  hasCellularGateway: boolean;
}

export interface MeshRelayHop {
  fromId: string;
  toId: string;
  rssiDbm: number;
  hopNumber: number;
}

export interface MeshDispatchResult {
  reachedGateway: boolean;
  gatewayNodeId: string | null;
  hops: MeshRelayHop[];
  totalLatencyMs: number;
  packetId: string;
  encryptedPayloadBytes: number;
}

export const OSM_NEIGHBORHOOD_NODES: MapNode[] = [
  { id: 'metro', label: 'Knowledge Park Metro', x: 75, y: 295, type: 'transit' },
  { id: 'hostel', label: 'Girls Hostel Gate', x: 560, y: 80, type: 'residential' },
  { id: 'plaza', label: 'Central Market Chowk', x: 245, y: 245, type: 'market' },
  { id: 'alley', label: 'Old Service Lane', x: 255, y: 115, type: 'residential' },
  { id: 'clinic', label: '24x7 Care Clinic', x: 405, y: 270, type: 'clinic' },
  { id: 'campus', label: 'University Main Blvd', x: 405, y: 145, type: 'campus' },
  { id: 'underpass', label: 'Bypass Underpass', x: 145, y: 155, type: 'transit' },
  { id: 'park', label: 'Sector Park Corner', x: 545, y: 235, type: 'residential' },
];

export const OSM_NEIGHBORHOOD_EDGES: MapEdge[] = [
  { id: 'e1', from: 'metro', to: 'plaza', streetName: 'Station Main Rd', distanceMeters: 420, lit: true, crowdScore: 9, policePatrol: true },
  { id: 'e2', from: 'metro', to: 'underpass', streetName: 'Shortcut Culvert', distanceMeters: 280, lit: false, crowdScore: 2, policePatrol: false },
  { id: 'e3', from: 'underpass', to: 'alley', streetName: 'Warehouse Backlane', distanceMeters: 260, lit: false, crowdScore: 1, policePatrol: false },
  { id: 'e4', from: 'alley', to: 'hostel', streetName: 'North Perimeter Track', distanceMeters: 510, lit: false, crowdScore: 3, policePatrol: false },
  { id: 'e5', from: 'plaza', to: 'clinic', streetName: 'Hospital Avenue', distanceMeters: 390, lit: true, crowdScore: 8, policePatrol: true },
  { id: 'e6', from: 'plaza', to: 'campus', streetName: 'Academic Arcade', distanceMeters: 430, lit: true, crowdScore: 8, policePatrol: true },
  { id: 'e7', from: 'alley', to: 'campus', streetName: 'Library Link Rd', distanceMeters: 310, lit: true, crowdScore: 6, policePatrol: false },
  { id: 'e8', from: 'clinic', to: 'campus', streetName: 'Pharmacy Cross Rd', distanceMeters: 290, lit: true, crowdScore: 7, policePatrol: false },
  { id: 'e9', from: 'campus', to: 'hostel', streetName: 'Lit Avenue North', distanceMeters: 380, lit: true, crowdScore: 7, policePatrol: true },
  { id: 'e10', from: 'clinic', to: 'park', streetName: 'East Ring Rd', distanceMeters: 360, lit: true, crowdScore: 6, policePatrol: false },
  { id: 'e11', from: 'park', to: 'hostel', streetName: 'Hostel East Gate Rd', distanceMeters: 340, lit: true, crowdScore: 7, policePatrol: true },
];

/**
 * Computes either the shortest physical path or the safest lit/patrolled path
 * factoring in OSM lighting tags (`lit=yes/no`) and live anonymous crowd hazard reports.
 */
export function computeSafeRoute(
  startId: string,
  endId: string,
  mode: 'safest' | 'fastest',
  hazardReports: CrowdHazardReport[],
  nodes: MapNode[] = OSM_NEIGHBORHOOD_NODES,
  edges: MapEdge[] = OSM_NEIGHBORHOOD_EDGES,
): RouteResult {
  const hazardEdgeSet = new Set(hazardReports.map((r) => r.edgeId));
  const adjacency = new Map<string, Array<{ to: string; edge: MapEdge; weight: number }>>();

  for (const n of nodes) {
    adjacency.set(n.id, []);
  }

  for (const edge of edges) {
    const hasHazard = hazardEdgeSet.has(edge.id);
    let weight = edge.distanceMeters;

    if (mode === 'safest') {
      // Heavily penalize unlit OSM segments, isolated alleys, and crowd-reported hazards
      const lightingPenalty = edge.lit ? 0 : 900;
      const crowdPenalty = (10 - edge.crowdScore) * 65;
      const patrolBonus = edge.policePatrol ? -80 : 0;
      const hazardPenalty = hasHazard ? 1800 : 0;
      weight = Math.max(50, edge.distanceMeters + lightingPenalty + crowdPenalty + patrolBonus + hazardPenalty);
    }

    adjacency.get(edge.from)?.push({ to: edge.to, edge, weight });
    adjacency.get(edge.to)?.push({ to: edge.from, edge, weight });
  }

  const dist = new Map<string, number>();
  const prevNode = new Map<string, string | null>();
  const prevEdge = new Map<string, MapEdge | null>();
  const unvisited = new Set<string>(nodes.map((n) => n.id));

  for (const n of nodes) {
    dist.set(n.id, Infinity);
    prevNode.set(n.id, null);
    prevEdge.set(n.id, null);
  }
  dist.set(startId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let best = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < best) {
        best = d;
        current = id;
      }
    }
    if (!current || best === Infinity) break;
    if (current === endId) break;
    unvisited.delete(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = best + neighbor.weight;
      if (alt < (dist.get(neighbor.to) ?? Infinity)) {
        dist.set(neighbor.to, alt);
        prevNode.set(neighbor.to, current);
        prevEdge.set(neighbor.to, neighbor.edge);
      }
    }
  }

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const traversedEdges: MapEdge[] = [];

  let cursor: string | null = endId;
  while (cursor) {
    nodeIds.unshift(cursor);
    const e = prevEdge.get(cursor);
    if (e) {
      edgeIds.unshift(e.id);
      traversedEdges.unshift(e);
    }
    cursor = prevNode.get(cursor) ?? null;
  }

  const totalDistanceMeters = traversedEdges.reduce((s, e) => s + e.distanceMeters, 0);
  const estimatedMinutes = Math.max(1, Math.round(totalDistanceMeters / 75)); // ~4.5 km/h walking
  const litMeters = traversedEdges.filter((e) => e.lit && !hazardEdgeSet.has(e.id)).reduce((s, e) => s + e.distanceMeters, 0);
  const lightingCoveragePercent =
    totalDistanceMeters > 0 ? Math.round((litMeters / totalDistanceMeters) * 100) : 100;

  const traversedHazards = traversedEdges.filter((e) => !e.lit || hazardEdgeSet.has(e.id)).length;
  const totalRiskEdges = edges.filter((e) => !e.lit || hazardEdgeSet.has(e.id)).length;
  const hazardsAvoided = Math.max(0, totalRiskEdges - traversedHazards);

  let safetyGrade: RouteResult['safetyGrade'] = 'High Safety';
  if (lightingCoveragePercent < 55 || traversedHazards >= 2) {
    safetyGrade = 'High Risk';
  } else if (lightingCoveragePercent < 85 || traversedHazards === 1) {
    safetyGrade = 'Moderate Caution';
  }

  return {
    mode,
    nodeIds,
    edgeIds,
    totalDistanceMeters,
    estimatedMinutes,
    lightingCoveragePercent,
    hazardsAvoided,
    safetyGrade,
  };
}

/**
 * Simulates opportunistic low-power BLE Mesh SOS packet relay when cellular network is offline.
 * Uses Euclidean range threshold (<= 180 units) and BFS hop discovery to nearest gateway node.
 */
export function simulateBleMeshRelay(
  sourceNodeId: string,
  nodes: MeshNode[],
  maxHopRange = 185,
  maxTtl = 4,
): MeshDispatchResult {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const source = nodeMap.get(sourceNodeId);
  const packetId = `BLE-SOS-${Math.abs(sourceNodeId.charCodeAt(0) * 131 + nodes.length * 37).toString(16).toUpperCase()}`;

  if (!source) {
    return {
      reachedGateway: false,
      gatewayNodeId: null,
      hops: [],
      totalLatencyMs: 0,
      packetId,
      encryptedPayloadBytes: 128,
    };
  }

  const queue: Array<{ id: string; path: MeshRelayHop[] }> = [{ id: sourceNodeId, path: [] }];
  const visited = new Set<string>([sourceNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currNode = nodeMap.get(current.id)!;

    if (currNode.hasCellularGateway && current.path.length > 0) {
      return {
        reachedGateway: true,
        gatewayNodeId: currNode.id,
        hops: current.path,
        totalLatencyMs: current.path.length * 140,
        packetId,
        encryptedPayloadBytes: 128,
      };
    }

    if (current.path.length >= maxTtl) continue;

    const neighbors = nodes
      .filter((n) => !visited.has(n.id) && n.batteryPercent > 10)
      .map((n) => {
        const dx = n.x - currNode.x;
        const dy = n.y - currNode.y;
        const distance = Math.hypot(dx, dy);
        return { node: n, distance };
      })
      .filter((item) => item.distance <= maxHopRange)
      .sort((a, b) => a.distance - b.distance);

    for (const item of neighbors) {
      visited.add(item.node.id);
      const rssiDbm = Math.round(-45 - (item.distance / maxHopRange) * 42);
      const nextHop: MeshRelayHop = {
        fromId: currNode.id,
        toId: item.node.id,
        rssiDbm,
        hopNumber: current.path.length + 1,
      };
      queue.push({ id: item.node.id, path: [...current.path, nextHop] });
    }
  }

  return {
    reachedGateway: false,
    gatewayNodeId: null,
    hops: [],
    totalLatencyMs: 0,
    packetId,
    encryptedPayloadBytes: 128,
  };
}

export interface FirIncidentPack {
  referenceId: string;
  generatedAtIso: string;
  coordinates: string;
  locationLabel: string;
  evidenceIncluded: string[];
  trustedContactsNotified: string[];
  summaryText: string;
}

export function buildFirIncidentPack(params: {
  coordinates: string;
  locationLabel: string;
  audioCaptured: boolean;
  photoCaptured: boolean;
  trustedContacts: string[];
  timestampIso: string;
}): FirIncidentPack {
  const evidenceIncluded = ['Encrypted GPS/Cell Coordinates'];
  if (params.audioCaptured) evidenceIncluded.push('Ambient Audio Buffer (SHA-256 Sealed)');
  if (params.photoCaptured) evidenceIncluded.push('Front/Rear Timestamped Frame');

  const referenceId = `SAKHI-FIR-${params.timestampIso.replace(/[^0-9]/g, '').slice(0, 12)}`;
  const summaryText = [
    `SAKHI360 SILENT SOS — FIR-READY INCIDENT PACK`,
    `Reference ID: ${referenceId}`,
    `Timestamp (UTC): ${params.timestampIso}`,
    `Location: ${params.locationLabel} (${params.coordinates})`,
    `Evidence Attached: ${evidenceIncluded.join(', ')}`,
    `Trusted Contacts Dispatched: ${params.trustedContacts.join(', ') || 'Local Helpline Fallback (112 / 181)'}`,
    `Integrity Note: Captured via Sakhi360 Silent SOS mode. Preserve original timestamps for police/Zero-FIR filing.`,
  ].join('\n');

  return {
    referenceId,
    generatedAtIso: params.timestampIso,
    coordinates: params.coordinates,
    locationLabel: params.locationLabel,
    evidenceIncluded,
    trustedContactsNotified: params.trustedContacts,
    summaryText,
  };
}
