import React from 'react';
import { Sliders, ShieldAlert, Scale, RefreshCw, Filter } from 'lucide-react';

interface ThresholdSliderProps {
  threshold: number;
  setThreshold: (val: number) => void;
  optimalThreshold: number;
}

export const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  threshold,
  setThreshold,
  optimalThreshold
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Classification Decision Boundary (Threshold Cutoff)
            </h3>
            <p className="text-xs text-slate-500">
              Samples with Random Forest voting probability ≥ Threshold are classified as <strong className="text-emerald-700">Potable</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Cutoff:
          </span>
          <span className="text-lg font-black font-mono text-sky-800 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
            {threshold.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Slider Track with Tick Marks */}
      <div className="space-y-2">
        <div className="relative pt-2">
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>0.05 (High Recall)</span>
          <span className="text-slate-600 font-semibold">0.50 (Standard)</span>
          <span>0.95 (High Precision)</span>
        </div>
      </div>

      {/* Decision Strategy Presets */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Operational Threshold Presets:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => setThreshold(0.70)}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              Math.abs(threshold - 0.70) < 0.02
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Strict Public Health</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Cutoff: 0.70
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Suppresses dangerous False Positives
            </div>
          </button>

          <button
            onClick={() => setThreshold(optimalThreshold)}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              Math.abs(threshold - optimalThreshold) < 0.02
                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/30'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
              <Scale className="w-3.5 h-3.5 text-sky-600" />
              <span>Max F1-Score</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Cutoff: {optimalThreshold.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Optimizes harmonic mean of Prec & Recall
            </div>
          </button>

          <button
            onClick={() => setThreshold(0.50)}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              Math.abs(threshold - 0.50) < 0.02
                ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400/30'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Standard Baseline</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Cutoff: 0.50
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Unweighted 50% ensemble consensus
            </div>
          </button>

          <button
            onClick={() => setThreshold(0.35)}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              Math.abs(threshold - 0.35) < 0.02
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>High Sensitivity</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Cutoff: 0.35
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Catches virtually all potable candidates
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
