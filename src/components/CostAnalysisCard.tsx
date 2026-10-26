import React from 'react';
import { ConfusionMatrixStats } from '../types';
import { ShieldCheck, AlertOctagon, DollarSign, HeartHandshake, Lightbulb } from 'lucide-react';

interface CostAnalysisCardProps {
  stats: ConfusionMatrixStats;
  costFP: number;
  costFN: number;
  setCostFP: (val: number) => void;
  setCostFN: (val: number) => void;
  currentThreshold: number;
}

export const CostAnalysisCard: React.FC<CostAnalysisCardProps> = ({
  stats,
  costFP,
  costFN,
  setCostFP,
  setCostFN,
  currentThreshold
}) => {
  const totalCost = stats.fp * costFP + stats.fn * costFN;
  const costPerSample = stats.total > 0 ? (totalCost / stats.total).toFixed(2) : '0';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            <span>Public Health Risk & Utility Cost Evaluation</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate asymmetric real-world consequences: Health poisoning hazards (False Positives) vs unnecessary treatment reprocessing (False Negatives).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-800 text-xs">
          <span className="font-semibold">Expected Loss Index:</span>
          <strong className="font-mono text-base">{costPerSample}</strong>
          <span className="text-[10px] text-rose-600">pts / test</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Weight 1: False Positive Penalty */}
        <div className="bg-red-50/60 p-4 rounded-xl border border-red-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>False Positive Severity Weight (Type I)</span>
            </span>
            <span className="font-mono text-sm font-black text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
              {costFP}×
            </span>
          </div>
          <p className="text-[11px] text-red-800/80 mb-2.5">
            Penalty for delivering contaminated water to households (illness, hospitalization, municipal liability).
          </p>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={costFP}
            onChange={(e) => setCostFP(Number(e.target.value))}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-[10px] text-red-700 font-mono mt-1">
            <span>Low (1×)</span>
            <span>Severe Toxicity (20×)</span>
          </div>
        </div>

        {/* Cost Weight 2: False Negative Penalty */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>False Negative Economic Weight (Type II)</span>
            </span>
            <span className="font-mono text-sm font-black text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
              {costFN}×
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 mb-2.5">
            Cost of discarding potable water or running unnecessary energy-intensive reverse osmosis filtration.
          </p>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={costFN}
            onChange={(e) => setCostFN(Number(e.target.value))}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-amber-700 font-mono mt-1">
            <span>Minor (1×)</span>
            <span>Substantial Energy (10×)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Decision Theory Insight:</strong> With a high False Positive penalty ({costFP}×), the mathematical optimal threshold shifts to <strong>≥ 0.65</strong>. This deliberately sacrifices raw accuracy and overall recall to guarantee that virtually no toxic water sample is ever marked potable.
        </div>
      </div>
    </div>
  );
};
