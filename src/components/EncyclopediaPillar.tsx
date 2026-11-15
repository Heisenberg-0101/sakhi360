import React, { useMemo, useState } from 'react';
import { Search, BookOpenText, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { ENCYCLOPEDIA_ARTICLES, type EncyclopediaArticle } from '../data/encyclopediaData';
import type { PillarId } from './OverviewPillar';

interface EncyclopediaPillarProps {
  onNavigatePillar: (pillar: PillarId) => void;
  initialArticleId?: string;
}

const CATEGORIES: Array<'All' | EncyclopediaArticle['category']> = [
  'All',
  'PCOS & Hormones',
  'Menstrual & Reproductive',
  'Mental Well-being',
  'Safety & Legal Rights',
];

export const EncyclopediaPillar: React.FC<EncyclopediaPillarProps> = ({
  onNavigatePillar,
  initialArticleId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EncyclopediaArticle['category']>('All');
  const [activeId, setActiveId] = useState(initialArticleId || 'pcos');

  // Optional inline AI Q&A for the active article
  const [questionInput, setQuestionInput] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ENCYCLOPEDIA_ARTICLES.filter((art) => {
      if (selectedCategory !== 'All' && art.category !== selectedCategory) return false;
      if (!q) return true;
      const haystack = [
        art.title,
        art.subtitle,
        art.lead,
        ...art.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets || [])]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [searchQuery, selectedCategory]);

  const activeArticle = useMemo(() => {
    return (
      ENCYCLOPEDIA_ARTICLES.find((a) => a.id === activeId) ||
      filteredArticles[0] ||
      ENCYCLOPEDIA_ARTICLES[0]
    );
  }, [activeId, filteredArticles]);

  const handleSelectArticle = (id: string) => {
    setActiveId(id);
    setAiAnswer('');
    setAiError('');
    setQuestionInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskArticleAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodContext: `Reading SakhiPedia article: ${activeArticle.title}`,
          messages: [
            {
              role: 'user',
              text: `Regarding "${activeArticle.title}": ${questionInput.trim()}. Please give a clear, educational, non-diagnostic explanation.`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not retrieve AI explanation.');
      setAiAnswer(data.reply);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encyclopedia Header & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488]">
              <BookOpenText className="w-4 h-4" />
              <span>SakhiPedia · Clinical & Safety Reference Encyclopedia</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F2942]">
              Women’s Health, PCOS & Legal Rights Knowledge Base
            </h1>
            <p className="text-sm text-slate-600">
              Search structured medical articles on PCOS, Rotterdam diagnostic criteria, insulin resistance, cycles, pregnancy, and legal protections.
            </p>
          </div>

          <div className="w-full lg:w-80 relative">
            <label htmlFor="wiki-search" className="sr-only">Search SakhiPedia articles</label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="wiki-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PCOS, Rotterdam, insulin, Zero-FIR..."
              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-[#F7FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wikipedia-Style 2-Column Layout: Article Index Sidebar + Full Article Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Article Index */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-[#F7FAFC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F2942]">Articles ({filteredArticles.length})</span>
            <span className="text-[11px] text-slate-500">A–Z Index</span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-4 text-xs text-slate-500 space-y-2">
              <p>No articles match &ldquo;{searchQuery}&rdquo;.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-[#0D9488] font-semibold cursor-pointer"
              >
                Reset search filter
              </button>
            </div>
          ) : (
            <nav className="divide-y divide-slate-100" aria-label="Encyclopedia Articles">
              {filteredArticles.map((art) => {
                const isSelected = art.id === activeArticle.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => handleSelectArticle(art.id)}
                    className={`w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#0D9488]/10' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-sm font-bold leading-snug ${isSelected ? 'text-[#0F766E]' : 'text-[#0F2942]'}`}>
                      {art.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{art.category}</div>
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Right Wikipedia-Style Article View */}
        <article className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Article Title & Metadata */}
          <header className="border-b border-slate-200 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{activeArticle.category} · Reviewed {activeArticle.lastReviewed}</span>
              <span>Educational reference only — not a substitute for clinical diagnosis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2942] font-display leading-tight">
              {activeArticle.title}
            </h2>
            <p className="text-sm text-slate-600">{activeArticle.subtitle}</p>
          </header>

          {/* Lead + Wikipedia Infobox Split */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 space-y-5">
              <p className="text-base text-slate-800 leading-relaxed">{activeArticle.lead}</p>

              {/* Table of Contents */}
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-[#0F2942] uppercase tracking-wider">Contents</div>
                <ul className="space-y-1 text-sm">
                  {activeArticle.sections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#wiki-sec-${sec.id}`}
                        className="text-[#0F766E] hover:underline font-medium"
                      >
                        {sec.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Wikipedia Infobox */}
            <aside className="xl:col-span-5 border border-slate-200 rounded-xl overflow-hidden bg-[#F7FAFC]">
              <div className="px-4 py-2.5 bg-[#0F2942] text-white text-sm font-bold">
                {activeArticle.infobox.heading}
              </div>
              <dl className="divide-y divide-slate-200 text-xs">
                {activeArticle.infobox.rows.map((row) => (
                  <div key={row.label} className="px-4 py-2.5 grid grid-cols-12 gap-2">
                    <dt className="col-span-5 font-semibold text-[#0F2942]">{row.label}</dt>
                    <dd className="col-span-7 text-slate-700 leading-relaxed">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {activeArticle.actionTarget && (
                <div className="p-3 bg-white border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => onNavigatePillar(activeArticle.actionTarget!.pillar)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E] cursor-pointer"
                  >
                    {activeArticle.actionTarget.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </aside>
          </div>

          {/* Article Body Sections */}
          <div className="space-y-6 pt-2">
            {activeArticle.sections.map((sec) => (
              <section
                key={sec.id}
                id={`wiki-sec-${sec.id}`}
                className="border-t border-slate-200 pt-5 space-y-3"
              >
                <h3 className="text-lg font-bold text-[#0F2942]">{sec.heading}</h3>
                {sec.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}
                {sec.bullets && (
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 leading-relaxed pl-1">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* See Also Cross-Links */}
          {activeArticle.relatedIds.length > 0 && (
            <section className="border-t border-slate-200 pt-5 space-y-2.5">
              <h3 className="text-sm font-bold text-[#0F2942]">See Also (Related Articles)</h3>
              <div className="flex flex-wrap gap-2">
                {activeArticle.relatedIds.map((rid) => {
                  const target = ENCYCLOPEDIA_ARTICLES.find((a) => a.id === rid);
                  if (!target) return null;
                  return (
                    <button
                      key={rid}
                      type="button"
                      onClick={() => handleSelectArticle(rid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F7FAFC] text-xs font-semibold text-[#0F766E] hover:border-[#0D9488] cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {target.title}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ask Sakhi AI About This Article */}
          <section className="border-t border-slate-200 pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-sm font-bold text-[#0F2942]">
                Ask Sakhi AI a Question About {activeArticle.title}
              </h3>
            </div>
            <form onSubmit={handleAskArticleAi} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="wiki-ai-question" className="sr-only">Ask a medical education question</label>
              <input
                id="wiki-ai-question"
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder={`e.g., What blood tests should I ask for regarding ${activeArticle.title}?`}
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={aiLoading || !questionInput.trim()}
                className="px-4 py-2 rounded-lg bg-[#0F2942] text-white text-xs font-semibold hover:bg-[#164E63] disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {aiLoading ? 'Asking Sakhi...' : 'Ask AI'}
              </button>
            </form>
            {aiError && <p className="text-xs text-[#DC2626]">{aiError}</p>}
            {aiAnswer && (
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {aiAnswer}
              </div>
            )}
          </section>

          {/* References */}
          <footer className="border-t border-slate-200 pt-4 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">References</h3>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
              {activeArticle.references.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ol>
          </footer>
        </article>
      </div>
    </div>
  );
};
