import React, { useState } from 'react';
import { BookOpen, Plus, Lock } from 'lucide-react';
import { DECOY_STUDY_NOTES } from '../data/sakhiSeed';

interface DecoyVaultViewProps {
  onLockToCalculator: () => void;
  wipedBanner?: boolean;
}

export const DecoyVaultView: React.FC<DecoyVaultViewProps> = ({
  onLockToCalculator,
  wipedBanner,
}) => {
  const [notes, setNotes] = useState(DECOY_STUDY_NOTES);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setNotes([
      {
        id: `d-${Date.now()}`,
        title: title.trim(),
        date: 'Today',
        body: body.trim(),
      },
      ...notes,
    ]);
    setTitle('');
    setBody('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-700" />
            <span className="font-display font-bold text-lg text-slate-900">QuickStudy Notes</span>
          </div>
          <button
            type="button"
            onClick={onLockToCalculator}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Lock
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {wipedBanner && (
          <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-600">
            Local cache reset complete. Showing standard study notebook.
          </div>
        )}

        <form onSubmit={handleAddNote} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h1 className="text-base font-bold text-slate-900">Add Class / Recipe Note</h1>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write summary..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Save Note
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((n) => (
            <article key={n.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Notebook</span>
                <span>{n.date}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{n.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{n.body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
