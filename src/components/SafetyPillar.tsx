import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Navigation,
  Radio,
  Download,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  OSM_NEIGHBORHOOD_NODES,
  OSM_NEIGHBORHOOD_EDGES,
  computeSafeRoute,
  simulateBleMeshRelay,
  buildFirIncidentPack,
  type CrowdHazardReport,
  type FirIncidentPack,
  type MeshDispatchResult,
} from '../utils/safetyEngine';
import { SEED_MESH_NODES } from '../data/sakhiSeed';

interface SafetyPillarProps {
  vaultPin: string;
  hazardReports: CrowdHazardReport[];
  onAddHazardReport: (report: CrowdHazardReport) => void;
  trustedContacts: string[];
  onUpdateContacts: (contacts: string[]) => void;
}

export const SafetyPillar: React.FC<SafetyPillarProps> = ({
  vaultPin,
  hazardReports,
  onAddHazardReport,
  trustedContacts,
  onUpdateContacts,
}) => {
  const [subTab, setSubTab] = useState<'sos' | 'route' | 'mesh'>('sos');

  // Silent SOS State
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [activeFirPack, setActiveFirPack] = useState<FirIncidentPack | null>(null);
  const [cancelPinInput, setCancelPinInput] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [newContact, setNewContact] = useState('');

  // Safe Route Planner State
  const [startNodeId, setStartNodeId] = useState('metro');
  const [endNodeId, setEndNodeId] = useState('hostel');
  const [routeMode, setRouteMode] = useState<'safest' | 'fastest'>('safest');
  const [reportEdgeId, setReportEdgeId] = useState('e9');
  const [reportType, setReportType] = useState<CrowdHazardReport['hazardType']>('unlit_street');
  const [reportNote, setReportNote] = useState('');

  // BLE Mesh SOS State
  const [meshOfflineMode, setMeshOfflineMode] = useState(true);
  const [meshResult, setMeshResult] = useState<MeshDispatchResult | null>(null);

  const route = useMemo(
    () => computeSafeRoute(startNodeId, endNodeId, routeMode, hazardReports),
    [startNodeId, endNodeId, routeMode, hazardReports],
  );

  const hazardEdgeIds = useMemo(() => new Set(hazardReports.map((r) => r.edgeId)), [hazardReports]);
  const nodeById = useMemo(
    () => new Map(OSM_NEIGHBORHOOD_NODES.map((n) => [n.id, n])),
    [],
  );

  const handleTriggerSilentSos = () => {
    if (!confirmArmed) return;
    const nowIso = new Date().toISOString();
    const finalize = (coords: string, label: string) => {
      const pack = buildFirIncidentPack({
        coordinates: coords,
        locationLabel: label,
        audioCaptured: includeAudio,
        photoCaptured: includePhoto,
        trustedContacts,
        timestampIso: nowIso,
      });
      setActiveFirPack(pack);
      setCancelMessage('');
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finalize(
            `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
            'Live GPS Fix',
          );
        },
        () => {
          finalize('28.4744° N, 77.5040° E', 'Knowledge Park II Sector (Last Cached Fix)');
        },
        { timeout: 1500 },
      );
    } else {
      finalize('28.4744° N, 77.5040° E', 'Knowledge Park II Sector (Cached Fix)');
    }
  };

  const handleDownloadFirPack = () => {
    if (!activeFirPack) return;
    const blob = new Blob([activeFirPack.summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFirPack.referenceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSilentCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancelPinInput.trim() === vaultPin) {
      setActiveFirPack(null);
      setConfirmArmed(false);
      setCancelPinInput('');
      setCancelMessage('Silent SOS cancelled cleanly. Contacts notified of safe status.');
    } else {
      setCancelMessage('PIN did not match — SOS remains active.');
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.trim()) return;
    onUpdateContacts([...trustedContacts, newContact.trim()]);
    setNewContact('');
  };

  const handleSubmitHazardReport = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHazardReport({
      id: `hr-${Date.now()}`,
      edgeId: reportEdgeId,
      hazardType: reportType,
      note: reportNote.trim() || 'Anonymous community lighting/safety alert',
      reportedAt: new Date().toISOString(),
    });
    setReportNote('');
  };

  const handleBroadcastBleMesh = () => {
    const res = simulateBleMeshRelay('you', SEED_MESH_NODES, 185, 4);
    setMeshResult(res);
  };

  const meshNodeMap = useMemo(() => new Map(SEED_MESH_NODES.map((n) => [n.id, n])), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">Safety & Mobility · SOS, OSM Safe Route & BLE Mesh</h1>
          <p className="text-sm text-slate-600">
            Hold/confirm Silent SOS with FIR-ready evidence pack, lit route planner, and offline Bluetooth Mesh relay.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl gap-1" role="tablist" aria-label="Safety tools">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'sos'}
            onClick={() => setSubTab('sos')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'sos' ? 'bg-[#DC2626] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Silent SOS & FIR Pack
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'route'}
            onClick={() => setSubTab('route')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'route' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Safe Route Planner
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'mesh'}
            onClick={() => setSubTab('mesh')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              subTab === 'mesh' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:text-[#0F2942]'
            }`}
          >
            Offline BLE Mesh SOS
          </button>
        </div>
      </div>

      {/* TAB 1: SILENT SOS */}
      {subTab === 'sos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              <h2 className="text-lg font-bold text-[#0F2942]">Silent SOS Dispatch (No Siren)</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Captures encrypted GPS coordinates, ambient audio seal, and camera frame silently—with a two-step confirm gesture to prevent accidental alerts.
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="w-4 h-4 accent-[#0F2942]"
                />
                Include sealed ambient audio buffer
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePhoto}
                  onChange={(e) => setIncludePhoto(e.target.checked)}
                  className="w-4 h-4 accent-[#0F2942]"
                />
                Include silent timestamped camera frame
              </label>
            </div>

            <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 space-y-3">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-[#0F2942] cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmArmed}
                  onChange={(e) => setConfirmArmed(e.target.checked)}
                  className="w-4 h-4 accent-[#DC2626]"
                />
                Confirm Gesture: Arm Silent SOS Dispatch
              </label>
              <button
                type="button"
                disabled={!confirmArmed}
                onClick={handleTriggerSilentSos}
                className="w-full py-3 px-4 rounded-xl bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Trigger Silent SOS & Build FIR Pack
              </button>
            </div>

            {cancelMessage && (
              <p className="text-xs font-medium text-[#16A34A]">{cancelMessage}</p>
            )}

            {/* Trusted Contacts */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h3 className="text-sm font-bold text-[#0F2942]">Trusted SOS Contacts</h3>
              <ul className="divide-y divide-slate-100 text-sm">
                {trustedContacts.map((contact, idx) => (
                  <li key={`${contact}-${idx}`} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-slate-700">{contact}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateContacts(trustedContacts.filter((_, i) => i !== idx))}
                      aria-label={`Remove ${contact}`}
                      className="p-1.5 text-slate-400 hover:text-[#DC2626] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddContact} className="flex gap-2">
                <label htmlFor="new-sos-contact" className="sr-only">Add trusted contact</label>
                <input
                  id="new-sos-contact"
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Name & phone (e.g. Didi +91-98XXXXXX22)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0F2942] text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
            </div>
          </div>

          {/* FIR-Ready Incident Pack & Silent Cancel */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            {!activeFirPack ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-[#0F2942]">Standby · No Active SOS</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Arm the confirm gesture and trigger Silent SOS on the left to test encrypted evidence sealing, contact dispatch, and Zero-FIR export.
                </p>
                <p className="text-xs text-slate-500 pt-2">
                  National Helplines: 112 (Emergency) · 181 (Women’s Helpline) · 1930 (Cyber Crime)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-[#DC2626]">Silent SOS Dispatched</span>
                    <h3 className="text-lg font-bold font-mono text-[#0F2942] tabular-nums">
                      {activeFirPack.referenceId}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadFirPack}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F2942] text-white text-xs font-semibold hover:bg-[#164E63] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download FIR Pack
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {activeFirPack.summaryText}
                </pre>

                <form onSubmit={handleSilentCancel} className="border-t border-slate-200 pt-4 space-y-2">
                  <label htmlFor="silent-cancel-pin" className="block text-xs font-semibold text-slate-700">
                    Silent Cancel (Enter Real Vault PIN {vaultPin} if triggered by mistake)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="silent-cancel-pin"
                      type="password"
                      value={cancelPinInput}
                      onChange={(e) => setCancelPinInput(e.target.value)}
                      placeholder="Enter Vault PIN"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0F2942] hover:bg-slate-50 cursor-pointer"
                    >
                      Silent Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SAFE ROUTE PLANNER */}
      {subTab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#164E63]" />
                <h2 className="text-lg font-bold text-[#0F2942]">OSM Safe Route Map</h2>
              </div>
              <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1">
                <button
                  type="button"
                  onClick={() => setRouteMode('safest')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                    routeMode === 'safest' ? 'bg-[#0F2942] text-white' : 'text-slate-600'
                  }`}
                >
                  Safest (Lit & Patrolled)
                </button>
                <button
                  type="button"
                  onClick={() => setRouteMode('fastest')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                    routeMode === 'fastest' ? 'bg-[#0D9488] text-white' : 'text-slate-600'
                  }`}
                >
                  Fastest Shortest
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="route-start" className="block text-xs font-semibold text-slate-700 mb-1">Start Point</label>
                <select
                  id="route-start"
                  value={startNodeId}
                  onChange={(e) => setStartNodeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {OSM_NEIGHBORHOOD_NODES.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="route-end" className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                <select
                  id="route-end"
                  value={endNodeId}
                  onChange={(e) => setEndNodeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {OSM_NEIGHBORHOOD_NODES.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive SVG OSM Map */}
            <div className="border border-slate-200 rounded-xl bg-[#F7FAFC] overflow-hidden">
              <svg
                viewBox="0 0 640 360"
                className="w-full h-auto"
                role="img"
                aria-label="Neighborhood OSM lighting and safe route map"
                data-testid="safe-route-svg"
              >
                {/* Background subtle grid */}
                <defs>
                  <pattern id="osm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                  </pattern>
                </defs>
                <rect width="640" height="360" fill="url(#osm-grid)" />

                {/* Edges */}
                {OSM_NEIGHBORHOOD_EDGES.map((edge) => {
                  const a = nodeById.get(edge.from);
                  const b = nodeById.get(edge.to);
                  if (!a || !b) return null;
                  const onRoute = route.edgeIds.includes(edge.id);
                  const hasHazard = hazardEdgeIds.has(edge.id);
                  const strokeColor = onRoute
                    ? routeMode === 'safest'
                      ? '#16A34A'
                      : '#0D9488'
                    : hasHazard || !edge.lit
                    ? '#FCA5A5'
                    : '#CBD5E1';
                  return (
                    <line
                      key={edge.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={strokeColor}
                      strokeWidth={onRoute ? 6 : 3}
                      strokeDasharray={!edge.lit && !onRoute ? '5 4' : undefined}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Hazard Markers */}
                {OSM_NEIGHBORHOOD_EDGES.map((edge) => {
                  const a = nodeById.get(edge.from);
                  const b = nodeById.get(edge.to);
                  if (!a || !b) return null;
                  const hasHazard = hazardEdgeIds.has(edge.id);
                  if (!hasHazard && edge.lit) return null;
                  const midX = (a.x + b.x) / 2;
                  const midY = (a.y + b.y) / 2;
                  return (
                    <g key={`haz-${edge.id}`} transform={`translate(${midX}, ${midY})`}>
                      <circle r="9" fill="#DC2626" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">!</text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {OSM_NEIGHBORHOOD_NODES.map((node) => {
                  const isStart = node.id === startNodeId;
                  const isEnd = node.id === endNodeId;
                  const inPath = route.nodeIds.includes(node.id);
                  const labelAbove = node.id === 'alley' || node.id === 'hostel';
                  const rectY = labelAbove ? -30 : 13;
                  const textY = labelAbove ? -18 : 25;
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      <circle
                        r={isStart || isEnd ? 10 : 7}
                        fill={isStart ? '#0F2942' : isEnd ? '#0D9488' : inPath ? '#16A34A' : '#FFFFFF'}
                        stroke="#0F2942"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="-58"
                        y={rectY}
                        width="116"
                        height="17"
                        rx="4"
                        fill="#FFFFFF"
                        fillOpacity="0.94"
                        stroke="#E2E8F0"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y={textY}
                        textAnchor="middle"
                        fill="#0F2942"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="border border-slate-200 rounded-xl p-3 bg-[#F7FAFC]">
                <div className="text-xs text-slate-500">Distance</div>
                <div className="text-base font-bold text-[#0F2942] tabular-nums">{route.totalDistanceMeters} m</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 bg-[#F7FAFC]">
                <div className="text-xs text-slate-500">Walk ETA</div>
                <div className="text-base font-bold text-[#0F2942] tabular-nums">{route.estimatedMinutes} min</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 bg-[#F7FAFC]">
                <div className="text-xs text-slate-500">OSM Lit Coverage</div>
                <div className="text-base font-bold text-[#16A34A] tabular-nums">{route.lightingCoveragePercent}%</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 bg-[#F7FAFC]">
                <div className="text-xs text-slate-500">Safety Rating</div>
                <div className="text-xs font-bold text-[#0F2942] mt-1">{route.safetyGrade}</div>
              </div>
            </div>
          </div>

          {/* Anonymous Crowd Hazard Reporter */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D97706]" />
              <h2 className="text-lg font-bold text-[#0F2942]">Anonymous Crowd Hazard Report</h2>
            </div>
            <p className="text-xs text-slate-600">
              Reporting a broken streetlight or unsafe stretch immediately updates the Safe Route solver so all nearby routes avoid it.
            </p>

            <form onSubmit={handleSubmitHazardReport} className="space-y-3.5">
              <div>
                <label htmlFor="hazard-street" className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Segment
                </label>
                <select
                  id="hazard-street"
                  value={reportEdgeId}
                  onChange={(e) => setReportEdgeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {OSM_NEIGHBORHOOD_EDGES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.streetName} ({e.lit ? 'OSM lit=yes' : 'OSM lit=no'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hazard-type" className="block text-xs font-semibold text-slate-700 mb-1">
                  Hazard Type
                </label>
                <select
                  id="hazard-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as CrowdHazardReport['hazardType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="unlit_street">Streetlights out / dark stretch</option>
                  <option value="isolated_alley">Isolated / zero foot traffic</option>
                  <option value="harassment_hotspot">Harassment / unsafe gathering</option>
                  <option value="broken_cctv">Damaged CCTV / blind spot</option>
                </select>
              </div>
              <div>
                <label htmlFor="hazard-note" className="block text-xs font-semibold text-slate-700 mb-1">
                  Observation Note (anonymous)
                </label>
                <input
                  id="hazard-note"
                  type="text"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="e.g., 3 poles unlit near corner gate"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F2942] text-white text-sm font-semibold hover:bg-[#164E63] cursor-pointer"
              >
                Submit Anonymous Report & Reroute
              </button>
            </form>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Crowd Alerts ({hazardReports.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {hazardReports.map((rep) => {
                  const street = OSM_NEIGHBORHOOD_EDGES.find((e) => e.id === rep.edgeId)?.streetName || rep.edgeId;
                  return (
                    <div key={rep.id} className="p-2.5 rounded-lg bg-[#F7FAFC] border border-slate-200 text-xs">
                      <div className="font-semibold text-[#0F2942]">{street}</div>
                      <div className="text-slate-600">{rep.note}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE BLE MESH SOS */}
      {subTab === 'mesh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#0D9488]" />
                <h2 className="text-lg font-bold text-[#0F2942]">Offline Bluetooth (BLE) Mesh Relay</h2>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meshOfflineMode}
                  onChange={(e) => setMeshOfflineMode(e.target.checked)}
                  className="w-4 h-4 accent-[#0D9488]"
                />
                Cellular Offline Mode
              </label>
            </div>
            <p className="text-xs text-slate-600">
              When mobile data or cellular signal drops (basements, highways, outages), Sakhi360 relays an encrypted 128-byte SOS beacon hop-by-hop across nearby Sakhi BLE peers until one reaches a cellular gateway.
            </p>

            <div className="border border-slate-200 rounded-xl bg-[#F7FAFC] overflow-hidden">
              <svg viewBox="0 0 560 330" className="w-full h-auto" role="img" aria-label="Bluetooth Mesh SOS relay topology">
                {/* Draw candidate peer links */}
                {SEED_MESH_NODES.map((a, i) =>
                  SEED_MESH_NODES.slice(i + 1).map((b) => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist > 185) return null;
                    const activeHop = meshResult?.hops.some(
                      (h) => (h.fromId === a.id && h.toId === b.id) || (h.fromId === b.id && h.toId === a.id),
                    );
                    return (
                      <line
                        key={`${a.id}-${b.id}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={activeHop ? '#0D9488' : '#CBD5E1'}
                        strokeWidth={activeHop ? 4 : 1.5}
                        strokeDasharray={activeHop ? undefined : '4 4'}
                      />
                    );
                  }),
                )}

                {SEED_MESH_NODES.map((node) => {
                  const isYou = node.id === 'you';
                  const isGateway = node.hasCellularGateway;
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      <circle
                        r={isYou ? 13 : 10}
                        fill={isYou ? '#DC2626' : isGateway ? '#16A34A' : '#0F2942'}
                      />
                      <text x="0" y="25" textAnchor="middle" fill="#0F2942" fontSize="10" fontWeight="600">
                        {node.label}
                      </text>
                      <text x="0" y="36" textAnchor="middle" fill="#64748B" fontSize="9">
                        Bat {node.batteryPercent}%{isGateway ? ' · Gateway' : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <button
              type="button"
              onClick={handleBroadcastBleMesh}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] cursor-pointer"
            >
              Broadcast Encrypted BLE Mesh SOS Beacon
            </button>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0F2942]">Mesh Relay Telemetry</h3>
            {!meshResult ? (
              <p className="text-sm text-slate-600">
                Click &ldquo;Broadcast Encrypted BLE Mesh SOS Beacon&rdquo; to trace multi-hop relay discovery to the nearest online gateway.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                    <div className="text-xs text-slate-500">Packet ID</div>
                    <div className="font-mono font-bold text-[#0F2942] text-xs mt-0.5">{meshResult.packetId}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                    <div className="text-xs text-slate-500">Gateway Reached</div>
                    <div className="font-bold text-[#16A34A] text-sm mt-0.5">
                      {meshResult.reachedGateway ? 'Delivered' : 'Queued'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                    <div className="text-xs text-slate-500">Relay Hops</div>
                    <div className="font-mono font-bold text-[#0F2942] tabular-nums">{meshResult.hops.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                    <div className="text-xs text-slate-500">Total Latency</div>
                    <div className="font-mono font-bold text-[#0F2942] tabular-nums">{meshResult.totalLatencyMs} ms</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hop Trace</h4>
                  {meshResult.hops.map((hop) => (
                    <div
                      key={hop.hopNumber}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-[#F7FAFC] text-xs"
                    >
                      <span className="font-medium text-[#0F2942]">
                        Hop {hop.hopNumber}: {meshNodeMap.get(hop.fromId)?.label} → {meshNodeMap.get(hop.toId)?.label}
                      </span>
                      <span className="font-mono text-slate-600 tabular-nums">{hop.rssiDbm} dBm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
