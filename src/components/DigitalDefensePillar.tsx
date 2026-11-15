import React, { useState } from 'react';
import {
  ShieldCheck,
  FileWarning,
  Smartphone,
  Calculator,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  evaluateStalkerwareRisk,
  type PinConfig,
  type StalkerwareAssessment,
  type StalkerwareSignalInput,
} from '../utils/defenseEngine';

interface DigitalDefensePillarProps {
  pinConfig: PinConfig;
  onUpdatePinConfig: (next: PinConfig) => void;
  onEnterStealth: () => void;
  onPanicWipe: () => void;
}

export const DigitalDefensePillar: React.FC<DigitalDefensePillarProps> = ({
  pinConfig,
  onUpdatePinConfig,
  onEnterStealth,
  onPanicWipe,
}) => {
  // Deepfake / Morphed-Image Takedown Assistant
  const [platform, setPlatform] = useState('Instagram / Meta');
  const [incidentType, setIncidentType] = useState('Non-consensual morphed / deepfake image');
  const [contentRef, setContentRef] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [takedownDraft, setTakedownDraft] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [copied, setCopied] = useState(false);

  // Stalkerware Detector
  const [signals, setSignals] = useState<StalkerwareSignalInput>({
    unknownDeviceAdmin: false,
    accessibilityServiceAbuse: false,
    hiddenLauncherIcon: false,
    backgroundMicOrLocationSpike: true,
    unrecognizedBatteryDrain: false,
    sideloadedUnknownApp: false,
  });
  const [scanResult, setScanResult] = useState<StalkerwareAssessment | null>(null);

  // Privacy Shield Dual PIN config
  const [realPin, setRealPin] = useState(pinConfig.realPin);
  const [decoyPin, setDecoyPin] = useState(pinConfig.decoyPin);
  const [panicPin, setPanicPin] = useState(pinConfig.panicPin);
  const [pinSavedMsg, setPinSavedMsg] = useState('');
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);

  const handleGenerateTakedown = async (e: React.FormEvent) => {
    e.preventDefault();
    setDraftLoading(true);
    setDraftError('');
    try {
      const res = await fetch('/api/ai/takedown-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          incidentType,
          contentReference: contentRef,
          additionalContext: contextNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate AI takedown draft.');
      }
      setTakedownDraft(data.draft);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI service unavailable.';
      setDraftError(`${msg} Loaded verified statutory fallback template below.`);
      setTakedownDraft(
        `URGENT NCII / DEEPFAKE TAKEDOWN NOTICE — IT RULES 2021 (24-HOUR COMPLIANCE)\n\nTo: Grievance Officer, ${platform}\nSubject: Immediate Removal of Non-Consensual Morphed / Deepfake Content\nReference URL / Account: ${contentRef || '[Insert URL / Handle]'}\n\nDear Grievance Officer,\nI am formally reporting ${incidentType} hosted on ${platform}. Under Rule 3(2)(b) of India's Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and Sections 66E / 67 / 67A of the IT Act, intermediaries are legally obligated to disable access to non-consensual intimate or morphed imagery within 24 hours of receipt.\n\nDetails: ${contextNote || 'Synthetic/morphed image published without consent.'}\n\nPlease confirm removal and preserve server logs for Cyber Crime Portal complaint (1930 / cybercrime.gov.in).`,
      );
    } finally {
      setDraftLoading(false);
    }
  };

  const handleCopyDraft = async () => {
    if (!takedownDraft) return;
    await navigator.clipboard.writeText(takedownDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePins = (e: React.FormEvent) => {
    e.preventDefault();
    if (realPin.length < 4 || decoyPin.length < 4 || panicPin.length < 4) {
      setPinSavedMsg('All PINs must be at least 4 digits.');
      return;
    }
    if (new Set([realPin, decoyPin, panicPin]).size < 3) {
      setPinSavedMsg('Real, Decoy, and Panic PINs must all be distinct.');
      return;
    }
    onUpdatePinConfig({ realPin, decoyPin, panicPin });
    setPinSavedMsg('Dual PIN & Panic Wipe codes updated.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2942]">Digital Defense · Takedown, Stalkerware & Privacy Shield</h1>
        <p className="text-sm text-slate-600">
          Deepfake/morphed-image takedown assistant, stalkerware permission scanner, dual PIN, calculator stealth & panic wipe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Deepfake / Morphed-Image Takedown Assistant */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-lg font-bold text-[#0F2942]">Deepfake & Morphed-Image Takedown Assistant</h2>
          </div>

          <form onSubmit={handleGenerateTakedown} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="td-platform" className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
                <select
                  id="td-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option>Instagram / Meta</option>
                  <option>Telegram Channel / Group</option>
                  <option>WhatsApp</option>
                  <option>X (Twitter)</option>
                  <option>External Website / Search</option>
                </select>
              </div>
              <div>
                <label htmlFor="td-type" className="block text-xs font-semibold text-slate-700 mb-1">Incident Type</label>
                <select
                  id="td-type"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option>Non-consensual morphed / deepfake image</option>
                  <option>AI synthetic video impersonation</option>
                  <option>Sextortion / blackmail threat</option>
                  <option>Doxxing & private photo leak</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="td-ref" className="block text-xs font-semibold text-slate-700 mb-1">
                Offending URL, Account Handle, or StopNCII Hash
              </label>
              <input
                id="td-ref"
                type="text"
                value={contentRef}
                onChange={(e) => setContentRef(e.target.value)}
                placeholder="https://... or @username"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label htmlFor="td-context" className="block text-xs font-semibold text-slate-700 mb-1">
                Brief Description (Do not paste sensitive personal IDs)
              </label>
              <textarea
                id="td-context"
                rows={2}
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="Describe impersonation or blackmail demand..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={draftLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] disabled:opacity-60 cursor-pointer"
            >
              {draftLoading ? 'Drafting Takedown Request...' : 'Generate Legal Takedown & Grievance Draft'}
            </button>
          </form>

          {draftError && <p className="text-xs text-[#D97706]">{draftError}</p>}

          {takedownDraft && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2942]">Ready-to-Send Takedown Notice</span>
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D9488] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#F7FAFC] border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                {takedownDraft}
              </pre>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-[#0F2942]">Immediate Action Checklist</div>
            <p>1. Generate a privacy-preserving digital hash at <span className="font-mono">StopNCII.org</span> without uploading raw images.</p>
            <p>2. Report on <span className="font-mono">cybercrime.gov.in</span> or call <span className="font-mono font-semibold">1930</span> (India).</p>
          </div>
        </div>

        {/* 2. Stalkerware Detector + Privacy Shield */}
        <div className="lg:col-span-6 space-y-6">
          {/* Stalkerware Detector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#164E63]" />
              <h2 className="text-lg font-bold text-[#0F2942]">Stalkerware & Spyware Detector</h2>
            </div>
            <p className="text-xs text-slate-600">
              Audit device permissions and stealth telemetry behaviors commonly abused by spouseware/stalkerware apps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'unknownDeviceAdmin', label: 'Unknown Device Admin app active' },
                { key: 'accessibilityServiceAbuse', label: 'App abusing Accessibility service' },
                { key: 'hiddenLauncherIcon', label: 'Hidden home-screen app icon' },
                { key: 'backgroundMicOrLocationSpike', label: 'Background mic / GPS spikes' },
                { key: 'sideloadedUnknownApp', label: 'App sideloaded outside store' },
                { key: 'unrecognizedBatteryDrain', label: 'Overnight data/battery drain' },
              ].map((item) => {
                const k = item.key as keyof StalkerwareSignalInput;
                return (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={signals[k]}
                      onChange={(e) => setSignals({ ...signals, [k]: e.target.checked })}
                      className="w-4 h-4 accent-[#164E63]"
                    />
                    {item.label}
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setScanResult(evaluateStalkerwareRisk(signals))}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0F2942] text-white text-sm font-semibold hover:bg-[#164E63] cursor-pointer"
            >
              Run Stalkerware Permission Audit
            </button>

            {scanResult && (
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scanResult.threatLevel === 'Clean' ? (
                      <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                    )}
                    <span className="font-bold text-sm text-[#0F2942]">{scanResult.threatLevel}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                    Risk {scanResult.riskScore}/100
                  </span>
                </div>
                {scanResult.findings.length === 0 ? (
                  <p className="text-xs text-slate-600">No stalkerware permission anomalies flagged.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {scanResult.findings.map((f) => (
                      <li key={f.title} className="border-t border-slate-200 pt-2">
                        <div className="font-semibold text-[#0F2942]">{f.title}</div>
                        <div className="text-slate-600 mt-0.5">{f.remediation}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Privacy Shield: Dual PIN, Calculator Stealth & Panic Wipe */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#0F2942]">Privacy Shield · Dual PIN & Stealth Disguise</h2>
            <form onSubmit={handleSavePins} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="real-pin" className="block text-xs font-semibold text-slate-700 mb-1">Real Vault PIN</label>
                  <input
                    id="real-pin"
                    type="text"
                    value={realPin}
                    onChange={(e) => setRealPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="decoy-pin" className="block text-xs font-semibold text-slate-700 mb-1">Decoy PIN</label>
                  <input
                    id="decoy-pin"
                    type="text"
                    value={decoyPin}
                    onChange={(e) => setDecoyPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="panic-pin" className="block text-xs font-semibold text-slate-700 mb-1">Panic Wipe PIN</label>
                  <input
                    id="panic-pin"
                    type="text"
                    value={panicPin}
                    onChange={(e) => setPanicPin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tabular-nums text-[#DC2626]"
                  />
                </div>
              </div>
              {pinSavedMsg && <p className="text-xs font-medium text-[#0F2942]">{pinSavedMsg}</p>}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0F2942] hover:bg-slate-50 cursor-pointer"
              >
                Update Dual PIN Codes
              </button>
            </form>

            <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onEnterStealth}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F2942] text-white text-sm font-semibold hover:bg-[#164E63] cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                Launch Calculator Stealth Now
              </button>
              <button
                type="button"
                onClick={() => setConfirmWipeOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DC2626] text-[#DC2626] bg-white text-sm font-semibold hover:bg-[#DC2626]/5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Panic Wipe Vault
              </button>
            </div>

            {confirmWipeOpen && (
              <div className="p-4 rounded-xl border border-[#DC2626] bg-[#DC2626]/5 space-y-2.5">
                <p className="text-xs font-semibold text-[#DC2626]">
                  Confirm Panic Wipe: This immediately clears encrypted journal entries, cycle logs, and SOS contacts from this browser and switches to Decoy Mode.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmWipeOpen(false);
                      onPanicWipe();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-semibold cursor-pointer"
                  >
                    Yes, Wipe Sensitive Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipeOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
