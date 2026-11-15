import React, { useEffect, useState } from 'react';
import { Delete } from 'lucide-react';
import {
  evaluateCalculatorExpression,
  resolvePinMode,
  type PinConfig,
  type VaultMode,
} from '../utils/defenseEngine';

interface StealthCalculatorProps {
  pinConfig: PinConfig;
  onUnlockMode: (mode: Exclude<VaultMode, 'invalid'>) => void;
}

const CALC_KEYS = [
  ['C', '(', ')', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

export const StealthCalculator: React.FC<StealthCalculatorProps> = ({
  pinConfig,
  onUnlockMode,
}) => {
  const [display, setDisplay] = useState('0');
  const [rawInputBuffer, setRawInputBuffer] = useState('');
  const [historyLine, setHistoryLine] = useState('');

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setDisplay('0');
      setRawInputBuffer('');
      setHistoryLine('');
      return;
    }
    if (key === '⌫') {
      setDisplay((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      setRawInputBuffer((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '=') {
      const candidatePin = rawInputBuffer || display;
      const mode = resolvePinMode(candidatePin, pinConfig);
      if (mode !== 'invalid') {
        setDisplay('0');
        setRawInputBuffer('');
        onUnlockMode(mode);
        return;
      }
      const result = evaluateCalculatorExpression(display);
      setHistoryLine(`${display} =`);
      setDisplay(result);
      setRawInputBuffer('');
      return;
    }

    setRawInputBuffer((prev) => prev + key);
    setDisplay((prev) => {
      if (prev === '0' && /[0-9]/.test(key)) return key;
      if (prev === 'Error') return /[0-9]/.test(key) ? key : '0';
      return prev + key;
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9+\-*/.()]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleKeyPress('=');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('⌫');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleKeyPress('C');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-4">
      <main className="w-full max-w-sm bg-[#1F2937] border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-display font-semibold tracking-wide text-slate-300">CalcPro</span>
          <span>Standard</span>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 text-right space-y-1">
          <div className="h-5 text-xs font-mono text-slate-400 truncate tabular-nums">
            {historyLine || '\u00A0'}
          </div>
          <div
            className="text-3xl font-mono font-bold tracking-tight text-white truncate tabular-nums"
            data-testid="calculator-display"
          >
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {CALC_KEYS.flat().map((key) => {
            const isEquals = key === '=';
            const isOp = ['/', '*', '-', '+'].includes(key);
            const isClear = key === 'C';
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                aria-label={key === '⌫' ? 'Backspace' : key === '=' ? 'Equals' : key === 'C' ? 'Clear' : key}
                className={`h-14 rounded-xl text-lg font-mono font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  isEquals
                    ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
                    : isOp
                    ? 'bg-slate-700 hover:bg-slate-600 text-amber-300'
                    : isClear
                    ? 'bg-slate-700 hover:bg-slate-600 text-rose-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {key === '⌫' ? <Delete className="w-5 h-5" /> : key}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
