import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Send, Wind, Eye, Sparkles, CheckSquare } from 'lucide-react';
import { encryptVaultText, decryptVaultText } from '../utils/defenseEngine';

export interface EncryptedJournalRecord {
  id: string;
  createdAtIso: string;
  mood: string;
  cipherText: string; // AES-256-GCM encrypted payload
}

interface MindPillarProps {
  vaultPin: string;
  journalRecords: EncryptedJournalRecord[];
  onSaveJournalRecord: (record: EncryptedJournalRecord) => void;
}

const MOODS = ['Calm', 'Hopeful', 'Tired', 'Anxious', 'Overwhelmed', 'Strong'];

const GROUNDING_STEPS = [
  '5 things you can see around you right now',
  '4 things you can physically touch (fabric, desk, floor)',
  '3 distinct sounds you can hear',
  '2 scents you notice or recall',
  '1 slow steady breath and one kind thing you did today',
];

export const MindPillar: React.FC<MindPillarProps> = ({
  vaultPin,
  journalRecords,
  onSaveJournalRecord,
}) => {
  // Encrypted Journal State
  const [mood, setMood] = useState('Calm');
  const [entryText, setEntryText] = useState('');
  const [journalError, setJournalError] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [unlockedTexts, setUnlockedTexts] = useState<Record<string, string>>({});
  const [showCipherFor, setShowCipherFor] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionLoading, setReflectionLoading] = useState(false);

  // Coping Exercises State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathSecond, setBreathSecond] = useState(0); // 19-sec 4-7-8 cycle
  const [groundingChecked, setGroundingChecked] = useState<number[]>([]);

  // AI Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hi, I am Sakhi. This space is judgment-free and private. How are you feeling today, or would you like to try a quick calming exercise together?',
    },
  ]);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = window.setInterval(() => {
      setBreathSecond((s) => (s + 1) % 19);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActive]);

  const breathPhase =
    breathSecond < 4
      ? `Inhale gently (${4 - breathSecond}s)`
      : breathSecond < 11
      ? `Hold softly (${11 - breathSecond}s)`
      : `Exhale slowly (${19 - breathSecond}s)`;

  const handleSaveEncryptedEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim()) {
      setJournalError('Write a few words before saving to your encrypted vault.');
      return;
    }
    setJournalError('');
    setIsEncrypting(true);
    try {
      const cipherText = await encryptVaultText(entryText.trim(), vaultPin);
      const record: EncryptedJournalRecord = {
        id: `j-${Date.now()}`,
        createdAtIso: new Date().toISOString(),
        mood,
        cipherText,
      };
      onSaveJournalRecord(record);
      setUnlockedTexts((prev) => ({ ...prev, [record.id]: entryText.trim() }));
      setEntryText('');
    } catch {
      setJournalError('Encryption failed in browser crypto engine.');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleToggleDecrypt = async (rec: EncryptedJournalRecord) => {
    if (unlockedTexts[rec.id]) {
      setUnlockedTexts((prev) => {
        const copy = { ...prev };
        delete copy[rec.id];
        return copy;
      });
      return;
    }
    try {
      const plain = await decryptVaultText(rec.cipherText, vaultPin);
      setUnlockedTexts((prev) => ({ ...prev, [rec.id]: plain }));
    } catch {
      setJournalError('Unable to decrypt entry with active vault PIN.');
    }
  };

  const handleAiReflect = async () => {
    const textToReflect = entryText.trim();
    if (!textToReflect) {
      setJournalError('Type a journal thought first if you want a gentle AI reflection.');
      return;
    }
    setReflectionLoading(true);
    setJournalError('');
    try {
      const res = await fetch('/api/ai/journal-reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryText: textToReflect, mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reflection unavailable.');
      setReflectionText(data.reflection);
    } catch (err: unknown) {
      setJournalError(err instanceof Error ? err.message : 'Unable to reach AI reflection service.');
    } finally {
      setReflectionLoading(false);
    }
  };

  const sendChatMessage = async (textOverride?: string) => {
    const outgoing = (textOverride ?? chatInput).trim();
    if (!outgoing || chatLoading) return;
    const nextHistory = [...messages, { role: 'user' as const, text: outgoing }];
    setMessages(nextHistory);
    if (!textOverride) setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextHistory, moodContext: mood }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI companion failed to respond.');
      }
      setMessages([...nextHistory, { role: 'assistant', text: data.reply }]);
    } catch (err: unknown) {
      setChatError(err instanceof Error ? err.message : 'Connection issue with AI service.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2942]">Mind · Encrypted Journal & AI Companion</h1>
        <p className="text-sm text-slate-600">
          AES-256-GCM encrypted personal journal, mood tracker, guided coping exercises, and judgment-free AI support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Encrypted Journal & Mood Tracker */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#164E63]" />
              <h2 className="text-lg font-bold text-[#0F2942]">Private Encrypted Journal</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">AES-256-GCM</span>
          </div>

          <form onSubmit={handleSaveEncryptedEntry} className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">Current Mood Check-in</span>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    aria-pressed={mood === m}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      mood === m
                        ? 'bg-[#0F2942] text-white border-[#0F2942]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="journal-textarea" className="block text-xs font-semibold text-slate-700 mb-1">
                Private Entry (encrypted locally before storage)
              </label>
              <textarea
                id="journal-textarea"
                rows={4}
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="Write freely without judgment..."
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#164E63]"
              />
            </div>

            {journalError && <p className="text-xs text-[#DC2626] font-medium">{journalError}</p>}

            <div className="flex flex-wrap gap-2.5">
              <button
                type="submit"
                disabled={isEncrypting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {isEncrypting ? 'Encrypting...' : 'Encrypt & Save to Vault'}
              </button>
              <button
                type="button"
                onClick={handleAiReflect}
                disabled={reflectionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-[#0F2942] text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                {reflectionLoading ? 'Reflecting...' : 'Gentle AI Reflection'}
              </button>
            </div>
          </form>

          {reflectionText && (
            <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-slate-200 text-sm text-slate-700 leading-relaxed">
              <span className="block text-xs font-semibold text-[#0D9488] mb-1">Sakhi Reflection</span>
              {reflectionText}
            </div>
          )}

          {/* Encrypted Vault Entries List */}
          <div className="border-t border-slate-200 pt-4 space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F2942]">Encrypted Vault Entries ({journalRecords.length})</h3>
              <span className="text-xs text-slate-500">Stored as ciphertext</span>
            </div>

            {journalRecords.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No encrypted entries yet. Save a note above to verify AES-256-GCM storage.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {journalRecords.map((rec) => {
                  const plain = unlockedTexts[rec.id];
                  const showingCipher = showCipherFor === rec.id;
                  return (
                    <div key={rec.id} className="border border-slate-200 rounded-xl p-3.5 bg-[#F7FAFC] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-[#0F2942]">
                          {rec.mood} · <span className="font-mono font-normal tabular-nums">{rec.createdAtIso.slice(0, 10)}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCipherFor(showingCipher ? null : rec.id)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0F2942] font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {showingCipher ? 'Hide Cipher' : 'Inspect AES'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDecrypt(rec)}
                            className="inline-flex items-center gap-1 text-[#0D9488] hover:text-[#0F766E] font-semibold cursor-pointer"
                          >
                            {plain ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            {plain ? 'Lock' : 'Decrypt'}
                          </button>
                        </div>
                      </div>
                      {showingCipher ? (
                        <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
                          {rec.cipherText}
                        </p>
                      ) : plain ? (
                        <p className="text-sm text-slate-800 leading-relaxed">{plain}</p>
                      ) : (
                        <p className="text-xs font-mono text-slate-500">
                          [Locked AES-256-GCM Ciphertext — click Decrypt to view]
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Chatbot & Coping Exercises */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          {/* Coping Exercises */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-[#16A34A]" />
                <h2 className="text-lg font-bold text-[#0F2942]">Coping Exercises</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBreathingActive((b) => !b);
                  setBreathSecond(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  breathingActive
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#0F2942] text-white hover:bg-[#164E63]'
                }`}
              >
                {breathingActive ? 'Stop 4-7-8 Breathing' : 'Start 4-7-8 Breathing'}
              </button>
            </div>

            {breathingActive && (
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F2942]">{breathPhase}</span>
                <span className="text-xs font-mono text-slate-500 tabular-nums">Cycle sec {breathSecond + 1}/19</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CheckSquare className="w-3.5 h-3.5 text-[#164E63]" />
                <span>5-4-3-2-1 Grounding Checklist</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {GROUNDING_STEPS.map((step, i) => {
                  const checked = groundingChecked.includes(i);
                  return (
                    <label
                      key={step}
                      className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setGroundingChecked((prev) =>
                            prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                          )
                        }
                        className="w-3.5 h-3.5 accent-[#16A34A]"
                      />
                      <span className={checked ? 'line-through text-slate-400' : ''}>{step}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Judgment-Free AI Chatbot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0F2942]">Sakhi Support Chatbot</h2>
                <span className="text-xs text-slate-500">Judgment-free · Mood: {mood}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'I feel overwhelmed today',
                  'Help me calm down quickly',
                  'Tips for setting safe boundaries',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendChatMessage(prompt)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-[#F7FAFC] h-64 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-[#0F2942] text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="text-xs text-slate-500">Sakhi is writing thoughtfully...</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {chatError && <p className="text-xs text-[#DC2626]">{chatError}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendChatMessage();
                }}
                className="flex gap-2"
              >
                <label htmlFor="sakhi-chat-input" className="sr-only">
                  Message Sakhi
                </label>
                <input
                  id="sakhi-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share what is on your mind..."
                  className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D9488] text-white text-sm font-semibold hover:bg-[#0F766E] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
