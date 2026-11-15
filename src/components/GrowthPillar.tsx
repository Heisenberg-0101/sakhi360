import React, { useState } from 'react';
import { Wallet, GraduationCap, Newspaper, CheckCircle2 } from 'lucide-react';
import {
  BANK_FREE_SAVINGS_GUIDES,
  CAREER_SKILL_MODULES,
  CURATED_SAFE_NEWS,
} from '../data/sakhiSeed';

interface GrowthPillarProps {
  completedLessons: string[];
  onToggleLesson: (lessonKey: string) => void;
}

export const GrowthPillar: React.FC<GrowthPillarProps> = ({
  completedLessons,
  onToggleLesson,
}) => {
  const [weeklySaveInr, setWeeklySaveInr] = useState(250);
  const [weeksHorizon, setWeeksHorizon] = useState(24);
  const [newsCategory, setNewsCategory] = useState('All');

  const projectedBuffer = weeklySaveInr * weeksHorizon;
  const emergencySplit = Math.round(projectedBuffer * 0.65);
  const skillSplit = projectedBuffer - emergencySplit;

  const categories = ['All', 'Health', 'Safety & Rights', 'Finance', 'Careers'];
  const filteredNews =
    newsCategory === 'All'
      ? CURATED_SAFE_NEWS
      : CURATED_SAFE_NEWS.filter((item) => item.category === newsCategory);

  const totalLessons = CAREER_SKILL_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2942]">Growth · Bank-Free Savings, Skills & Safe News</h1>
        <p className="text-sm text-slate-600">
          Independent financial literacy without mandatory bank exposure, career/legal skill modules, and an algorithm-free safe news feed.
        </p>
      </div>

      {/* Bank-Free Savings Guides & Planner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-lg font-bold text-[#0F2942]">Bank-Free Emergency Buffer Planner</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <label htmlFor="weekly-save">Weekly Cash / Micro-Savings (₹)</label>
                <span className="font-mono tabular-nums text-[#0F2942]">₹{weeklySaveInr}/week</span>
              </div>
              <input
                id="weekly-save"
                type="range"
                min={50}
                max={2000}
                step={50}
                value={weeklySaveInr}
                onChange={(e) => setWeeklySaveInr(Number(e.target.value))}
                className="w-full accent-[#16A34A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <label htmlFor="weeks-horizon">Saving Duration</label>
                <span className="font-mono tabular-nums text-[#0F2942]">{weeksHorizon} weeks</span>
              </div>
              <input
                id="weeks-horizon"
                type="range"
                min={4}
                max={52}
                step={4}
                value={weeksHorizon}
                onChange={(e) => setWeeksHorizon(Number(e.target.value))}
                className="w-full accent-[#0F2942]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                <div className="text-[11px] text-slate-500">Total Saved</div>
                <div className="text-base font-bold font-mono text-[#0F2942] tabular-nums">
                  ₹{projectedBuffer.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                <div className="text-[11px] text-slate-500">Safety Stash</div>
                <div className="text-base font-bold font-mono text-[#16A34A] tabular-nums">
                  ₹{emergencySplit.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-slate-200">
                <div className="text-[11px] text-slate-500">Skill Fund</div>
                <div className="text-base font-bold font-mono text-[#0D9488] tabular-nums">
                  ₹{skillSplit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 gap-4">
          {BANK_FREE_SAVINGS_GUIDES.map((guide) => (
            <div key={guide.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#0F2942]">{guide.title}</h3>
                <span className="text-xs font-medium text-slate-500">{guide.category}</span>
              </div>
              <p className="text-sm text-slate-600">{guide.summary}</p>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pt-1">
                {guide.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Career & Rights Skill Modules */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#164E63]" />
            <h2 className="text-lg font-bold text-[#0F2942]">Career & Empowerment Skill Modules</h2>
          </div>
          <span className="text-xs font-mono font-semibold text-[#16A34A] tabular-nums">
            {completedLessons.length}/{totalLessons} lessons completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAREER_SKILL_MODULES.map((mod) => (
            <div key={mod.id} className="border border-slate-200 rounded-xl p-4 bg-[#F7FAFC] space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0F2942]">{mod.title}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {mod.track} · {mod.duration}
                </span>
              </div>
              <div className="space-y-1.5">
                {mod.lessons.map((lesson, idx) => {
                  const key = `${mod.id}-${idx}`;
                  const done = completedLessons.includes(key);
                  return (
                    <label
                      key={key}
                      className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => onToggleLesson(key)}
                        className="mt-0.5 w-4 h-4 accent-[#16A34A]"
                      />
                      <span className={done ? 'line-through text-slate-400' : ''}>{lesson}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Safe News Feed */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-lg font-bold text-[#0F2942]">Curated Safe News Feed (No Toxic Algorithms)</h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewsCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  newsCategory === cat
                    ? 'bg-[#0F2942] text-white border-[#0F2942]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => (
            <article key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-[#F7FAFC]">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#0D9488]">{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>{item.source}</span>
                <span aria-hidden="true">·</span>
                <span>{item.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-[#0F2942] leading-snug">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
              <div className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified constructive briefing · Zero engagement tracking</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
