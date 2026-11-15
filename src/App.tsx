import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Brain,
  ShieldAlert,
  Lock,
  Sprout,
  Stethoscope,
  BookOpenText,
} from 'lucide-react';
import { OverviewPillar, type PillarId } from './components/OverviewPillar';
import { BodyPillar } from './components/BodyPillar';
import { MindPillar, type EncryptedJournalRecord } from './components/MindPillar';
import { SafetyPillar } from './components/SafetyPillar';
import { DigitalDefensePillar } from './components/DigitalDefensePillar';
import { GrowthPillar } from './components/GrowthPillar';
import { EncyclopediaPillar } from './components/EncyclopediaPillar';
import { StealthCalculator } from './components/StealthCalculator';
import { DecoyVaultView } from './components/DecoyVaultView';
import { analyzeCycles, type CycleLog } from './utils/healthEngine';
import type { CrowdHazardReport } from './utils/safetyEngine';
import { DEFAULT_PIN_CONFIG, type PinConfig, type VaultMode } from './utils/defenseEngine';
import { SEED_CYCLE_LOGS, SEED_HAZARD_REPORTS } from './data/sakhiSeed';

const STORAGE_KEYS = {
  cycles: 'sakhi360_cycles_v2',
  journals: 'sakhi360_journals_v1',
  hazards: 'sakhi360_hazards_v1',
  contacts: 'sakhi360_contacts_v1',
  pins: 'sakhi360_pins_v1',
  lessons: 'sakhi360_lessons_v1',
  selfCheck: 'sakhi360_selfcheck_v1',
};

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const PILLAR_TITLES: Record<PillarId, string> = {
  overview: 'Clinical Overview',
  body: 'Body · Cycle & PCOS Care',
  mind: 'Mind · Therapy & Encrypted Vault',
  safety: 'Safety · Silent SOS & OSM Route',
  defense: 'Digital · Privacy Defense',
  growth: 'Growth · Savings & Literacy',
  wiki: 'SakhiPedia · PCOS & Health Wiki',
};

export default function App() {
  const [appSurface, setAppSurface] = useState<'real' | 'stealth_calc' | 'decoy'>('real');
  const [wipedBanner, setWipedBanner] = useState(false);
  const [activePillar, setActivePillar] = useState<PillarId>('overview');
  const [activeWikiArticle, setActiveWikiArticle] = useState<string>('pcos');

  const openWikiArticle = (articleId = 'pcos') => {
    setActiveWikiArticle(articleId);
    setActivePillar('wiki');
  };

  const [cycles, setCycles] = useState<CycleLog[]>(() =>
    readJsonStorage(STORAGE_KEYS.cycles, SEED_CYCLE_LOGS),
  );
  const [journalRecords, setJournalRecords] = useState<EncryptedJournalRecord[]>(() =>
    readJsonStorage(STORAGE_KEYS.journals, []),
  );
  const [hazardReports, setHazardReports] = useState<CrowdHazardReport[]>(() =>
    readJsonStorage(STORAGE_KEYS.hazards, SEED_HAZARD_REPORTS),
  );
  const [trustedContacts, setTrustedContacts] = useState<string[]>(() =>
    readJsonStorage(STORAGE_KEYS.contacts, [
      'Maa (+91-98XXXXXX10)',
      'Ananya Hostel Friend (+91-97XXXXXX45)',
    ]),
  );
  const [pinConfig, setPinConfig] = useState<PinConfig>(() =>
    readJsonStorage(STORAGE_KEYS.pins, DEFAULT_PIN_CONFIG),
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>(() =>
    readJsonStorage(STORAGE_KEYS.lessons, []),
  );
  const [lastSelfCheckDate, setLastSelfCheckDate] = useState<string | null>(() =>
    readJsonStorage(STORAGE_KEYS.selfCheck, null),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cycles, JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(journalRecords));
  }, [journalRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hazards, JSON.stringify(hazardReports));
  }, [hazardReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(trustedContacts));
  }, [trustedContacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pins, JSON.stringify(pinConfig));
  }, [pinConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selfCheck, JSON.stringify(lastSelfCheckDate));
  }, [lastSelfCheckDate]);

  const cycleAnalysis = useMemo(
    () => analyzeCycles(cycles, new Date().toISOString().slice(0, 10)),
    [cycles],
  );

  const handlePanicWipe = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setCycles([]);
    setJournalRecords([]);
    setTrustedContacts([]);
    setCompletedLessons([]);
    setLastSelfCheckDate(null);
    setWipedBanner(true);
    setAppSurface('decoy');
  };

  const handleUnlockFromCalculator = (mode: Exclude<VaultMode, 'invalid'>) => {
    if (mode === 'panic_wipe') {
      handlePanicWipe();
      return;
    }
    if (mode === 'decoy') {
      setWipedBanner(false);
      setAppSurface('decoy');
      return;
    }
    setWipedBanner(false);
    setAppSurface('real');
  };

  if (appSurface === 'stealth_calc') {
    return (
      <StealthCalculator
        pinConfig={pinConfig}
        onUnlockMode={handleUnlockFromCalculator}
      />
    );
  }

  if (appSurface === 'decoy') {
    return (
      <DecoyVaultView
        onLockToCalculator={() => setAppSurface('stealth_calc')}
        wipedBanner={wipedBanner}
      />
    );
  }

  const sidebarSections: Array<{
    group: string;
    items: Array<{ id: PillarId; label: string; icon: typeof HeartPulse }>;
  }> = [
    {
      group: 'Patient Summary',
      items: [{ id: 'overview', label: 'Clinical Overview', icon: LayoutDashboard }],
    },
    {
      group: 'Care & Screening',
      items: [
        { id: 'body', label: 'Body · Cycle & PCOS', icon: HeartPulse },
        { id: 'mind', label: 'Mind · Vault & AI', icon: Brain },
      ],
    },
    {
      group: 'Emergency & Defense',
      items: [
        { id: 'safety', label: 'Safety · SOS & Route', icon: ShieldAlert },
        { id: 'defense', label: 'Digital · Defense', icon: Lock },
      ],
    },
    {
      group: 'Wellness & Growth',
      items: [{ id: 'growth', label: 'Growth · Savings & News', icon: Sprout }],
    },
    {
      group: 'Knowledge Base',
      items: [{ id: 'wiki', label: 'SakhiPedia · PCOS Wiki', icon: BookOpenText }],
    },
  ];

  const mobileNavItems: Array<{ id: PillarId; label: string; icon: typeof HeartPulse }> = [
    { id: 'body', label: 'Body', icon: HeartPulse },
    { id: 'mind', label: 'Mind', icon: Brain },
    { id: 'safety', label: 'Safety', icon: ShieldAlert },
    { id: 'defense', label: 'Defense', icon: Lock },
    { id: 'growth', label: 'Growth', icon: Sprout },
  ];

  return (
    <div className="min-h-screen flex medical-canvas text-[#0F172A]">
      {/* Desktop Clinical Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-[272px] flex-col justify-between bg-white/95 backdrop-blur-md border-r border-teal-900/10 sticky top-0 h-screen shrink-0">
        <div className="p-5 space-y-6 overflow-y-auto">
          <button
            type="button"
            onClick={() => setActivePillar('overview')}
            className="w-full flex items-center gap-2.5 text-left cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <div className="text-lg font-display font-extrabold tracking-tight text-[#0F2942] leading-tight">
                Sakhi360
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Private Health & Safety Portal
              </div>
            </div>
          </button>

          <nav className="space-y-5" aria-label="Sakhi360 Pillars">
            {sidebarSections.map((section) => (
              <div key={section.group} className="space-y-1">
                <div className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wide">
                  {section.group}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePillar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePillar(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#0D9488]/10 text-[#0F766E]'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#0F2942]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Privacy Vault Keys */}
        <div className="p-4 border-t border-slate-200 bg-[#F7FAFC] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0F2942]">Calculator Vault Keys</span>
            <span className="text-[11px] text-slate-500">AES-256</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Real Vault</span>
              <span className="font-mono font-semibold text-[#0F2942] tabular-nums">{pinConfig.realPin}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Decoy Notes</span>
              <span className="font-mono font-semibold text-slate-700 tabular-nums">{pinConfig.decoyPin}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Panic Wipe</span>
              <span className="font-mono font-semibold text-[#DC2626] tabular-nums">{pinConfig.panicPin}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Clinical Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Clinical Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-teal-900/10 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActivePillar('overview')}
              className="md:hidden text-base font-display font-extrabold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sakhi360
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={() => setActivePillar('overview')}
                className="text-slate-500 hover:text-[#0F2942] font-medium cursor-pointer whitespace-nowrap"
              >
                Sakhi360
              </button>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-semibold text-[#0F2942] truncate">{PILLAR_TITLES[activePillar]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 md:hidden">
            <button
              type="button"
              onClick={() => openWikiArticle('pcos')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activePillar === 'wiki'
                  ? 'bg-[#0D9488] border-[#0D9488] text-white'
                  : 'bg-white border-slate-200 text-[#0F2942] hover:bg-slate-50'
              }`}
            >
              <BookOpenText className="w-3.5 h-3.5" />
              Wiki
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-10">
          {activePillar === 'overview' && (
            <OverviewPillar
              onNavigate={setActivePillar}
              onOpenWiki={openWikiArticle}
              onEnterStealth={() => setAppSurface('stealth_calc')}
              cycleAnalysis={cycleAnalysis}
              cycleCount={cycles.length}
              journalCount={journalRecords.length}
              hazardCount={hazardReports.length}
              trustedContactsCount={trustedContacts.length}
              completedSkillsCount={completedLessons.length}
              lastSelfCheckDate={lastSelfCheckDate}
            />
          )}

          {activePillar === 'body' && (
            <BodyPillar
              cycles={cycles}
              onAddCycle={(log) => setCycles((prev) => [...prev, log])}
              lastSelfCheckDate={lastSelfCheckDate}
              onMarkSelfCheckComplete={setLastSelfCheckDate}
              onOpenWiki={openWikiArticle}
            />
          )}

          {activePillar === 'mind' && (
            <MindPillar
              vaultPin={pinConfig.realPin}
              journalRecords={journalRecords}
              onSaveJournalRecord={(rec) => setJournalRecords((prev) => [rec, ...prev])}
            />
          )}

          {activePillar === 'safety' && (
            <SafetyPillar
              vaultPin={pinConfig.realPin}
              hazardReports={hazardReports}
              onAddHazardReport={(rep) => setHazardReports((prev) => [rep, ...prev])}
              trustedContacts={trustedContacts}
              onUpdateContacts={setTrustedContacts}
            />
          )}

          {activePillar === 'defense' && (
            <DigitalDefensePillar
              pinConfig={pinConfig}
              onUpdatePinConfig={setPinConfig}
              onEnterStealth={() => setAppSurface('stealth_calc')}
              onPanicWipe={handlePanicWipe}
            />
          )}

          {activePillar === 'growth' && (
            <GrowthPillar
              completedLessons={completedLessons}
              onToggleLesson={(key) =>
                setCompletedLessons((prev) =>
                  prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
                )
              }
            />
          )}

          {activePillar === 'wiki' && (
            <EncyclopediaPillar
              key={activeWikiArticle}
              initialArticleId={activeWikiArticle}
              onNavigatePillar={setActivePillar}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center"
        aria-label="Mobile Pillar Navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = activePillar === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePillar(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                active ? 'text-[#0D9488]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
