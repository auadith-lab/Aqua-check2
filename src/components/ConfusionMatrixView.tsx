import React, { useState } from 'react';
import { ConfusionMatrixStats } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, HelpCircle, Layers } from 'lucide-react';

interface ConfusionMatrixViewProps {
  stats: ConfusionMatrixStats;
  threshold: number;
}

type DisplayMode = 'counts' | 'percent_total' | 'row_normalized' | 'col_normalized';

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({
  stats,
  threshold
}) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('counts');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const { tp, tn, fp, fn, total, actualPositives, actualNegatives, predictedPositives, predictedNegatives } = stats;

  const formatValue = (cell: 'tp' | 'tn' | 'fp' | 'fn') => {
    const val = stats[cell];
    if (displayMode === 'counts') {
      return val.toLocaleString();
    }
    if (displayMode === 'percent_total') {
      return total > 0 ? `${((val / total) * 100).toFixed(1)}%` : '0.0%';
    }
    if (displayMode === 'row_normalized') {
      // Row normalized: TP & FN out of actualPositives; FP & TN out of actualNegatives
      if (cell === 'tp' || cell === 'fn') {
        return actualPositives > 0 ? `${((val / actualPositives) * 100).toFixed(1)}%` : '0.0%';
      } else {
        return actualNegatives > 0 ? `${((val / actualNegatives) * 100).toFixed(1)}%` : '0.0%';
      }
    }
    if (displayMode === 'col_normalized') {
      // Column normalized: TP & FP out of predictedPositives; FN & TN out of predictedNegatives
      if (cell === 'tp' || cell === 'fp') {
        return predictedPositives > 0 ? `${((val / predictedPositives) * 100).toFixed(1)}%` : '0.0%';
      } else {
        return predictedNegatives > 0 ? `${((val / predictedNegatives) * 100).toFixed(1)}%` : '0.0%';
      }
    }
    return String(val);
  };

  const getSubtext = (cell: 'tp' | 'tn' | 'fp' | 'fn') => {
    const val = stats[cell];
    if (displayMode === 'counts') {
      return `${((val / total) * 100).toFixed(1)}% of total`;
    }
    return `${val} samples`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              Confusion Matrix
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
              Threshold: {threshold.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2×2 contingency table evaluating Random Forest classifications vs ground-truth laboratory potability.
          </p>
        </div>

        {/* Display mode buttons */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-medium text-slate-600 self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setDisplayMode('counts')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'counts'
                ? 'bg-white text-sky-700 shadow-sm font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Counts
          </button>
          <button
            onClick={() => setDisplayMode('percent_total')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'percent_total'
                ? 'bg-white text-sky-700 shadow-sm font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Total %
          </button>
          <button
            onClick={() => setDisplayMode('row_normalized')}
            title="Row normalized: Recall & Specificity (Actual class sums to 100%)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'row_normalized'
                ? 'bg-white text-sky-700 shadow-sm font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Recall (Row %)
          </button>
          <button
            onClick={() => setDisplayMode('col_normalized')}
            title="Column normalized: Precision & NPV (Predicted class sums to 100%)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'col_normalized'
                ? 'bg-white text-sky-700 shadow-sm font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Precision (Col %)
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px]">
          {/* Column Header: Predicted */}
          <div className="grid grid-cols-[140px_1fr_1fr_100px] gap-2.5 mb-2 text-center text-xs font-semibold">
            <div className="text-left text-slate-400 font-mono flex items-end pb-1">
              Actual \ Predicted
            </div>
            <div className="bg-sky-50 text-sky-800 py-2 rounded-lg border border-sky-100 flex items-center justify-center gap-1.5">
              <span>Predicted Potable</span>
              <span className="text-[10px] bg-sky-200/60 px-1.5 py-0.2 rounded font-mono">Class 1</span>
            </div>
            <div className="bg-slate-100 text-slate-700 py-2 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5">
              <span>Predicted Non-Potable</span>
              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono">Class 0</span>
            </div>
            <div className="bg-slate-50 text-slate-500 py-2 rounded-lg border border-slate-200/60 flex items-center justify-center">
              Total Actual
            </div>
          </div>

          {/* Row 1: Actual Potable */}
          <div className="grid grid-cols-[140px_1fr_1fr_100px] gap-2.5 mb-2.5">
            {/* Row Label */}
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-100 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>Actual Potable</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Ground Truth: 1</div>
            </div>

            {/* Cell 1: TP */}
            <div
              onMouseEnter={() => setHoveredCell('tp')}
              onMouseLeave={() => setHoveredCell(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                hoveredCell === 'tp'
                  ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-100/80 border-emerald-400'
                  : 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  True Positive (TP)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                  Hit
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1.5 tracking-tight font-mono">
                {formatValue('tp')}
              </div>
              <div className="text-[11px] text-emerald-700/90 font-medium mt-0.5">
                {getSubtext('tp')}
              </div>
              <div className="text-[10px] text-emerald-800/80 mt-1 leading-tight">
                Safe water accurately permitted for consumption
              </div>
            </div>

            {/* Cell 2: FN */}
            <div
              onMouseEnter={() => setHoveredCell('fn')}
              onMouseLeave={() => setHoveredCell(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                hoveredCell === 'fn'
                  ? 'ring-2 ring-amber-500 shadow-md bg-amber-100/80 border-amber-400'
                  : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  False Negative (FN)
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                  Type II Error
                </span>
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1.5 tracking-tight font-mono">
                {formatValue('fn')}
              </div>
              <div className="text-[11px] text-amber-700/90 font-medium mt-0.5">
                {getSubtext('fn')}
              </div>
              <div className="text-[10px] text-amber-800/80 mt-1 leading-tight">
                Potable water unnecessarily rejected / re-treated
              </div>
            </div>

            {/* Row 1 Marginal Total */}
            <div className="bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-center text-center">
              <div className="text-base font-bold font-mono text-slate-800">
                {actualPositives}
              </div>
              <div className="text-[10px] text-slate-500">
                {((actualPositives / total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Row 2: Actual Non-Potable */}
          <div className="grid grid-cols-[140px_1fr_1fr_100px] gap-2.5 mb-3">
            {/* Row Label */}
            <div className="bg-slate-100 text-slate-800 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>Actual Non-Potable</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Ground Truth: 0</div>
            </div>

            {/* Cell 3: FP */}
            <div
              onMouseEnter={() => setHoveredCell('fp')}
              onMouseLeave={() => setHoveredCell(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                hoveredCell === 'fp'
                  ? 'ring-2 ring-red-500 shadow-md bg-red-100/90 border-red-400'
                  : 'bg-red-50/70 border-red-200/80 hover:bg-red-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  False Positive (FP)
                </span>
                <span className="text-[10px] font-mono text-red-700 bg-red-200/70 px-1.5 py-0.5 rounded font-semibold">
                  Type I (Critical!)
                </span>
              </div>
              <div className="text-2xl font-black text-red-900 mt-1.5 tracking-tight font-mono">
                {formatValue('fp')}
              </div>
              <div className="text-[11px] text-red-700/90 font-medium mt-0.5">
                {getSubtext('fp')}
              </div>
              <div className="text-[10px] text-red-800/90 mt-1 font-semibold leading-tight">
                Contaminated water misclassified as safe! Public health risk.
              </div>
            </div>

            {/* Cell 4: TN */}
            <div
              onMouseEnter={() => setHoveredCell('tn')}
              onMouseLeave={() => setHoveredCell(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                hoveredCell === 'tn'
                  ? 'ring-2 ring-slate-500 shadow-md bg-slate-200/80 border-slate-400'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  True Negative (TN)
                </span>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                  Correct Rejection
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1.5 tracking-tight font-mono">
                {formatValue('tn')}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {getSubtext('tn')}
              </div>
              <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                Contaminated water correctly blocked from distribution
              </div>
            </div>

            {/* Row 2 Marginal Total */}
            <div className="bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-center text-center">
              <div className="text-base font-bold font-mono text-slate-800">
                {actualNegatives}
              </div>
              <div className="text-[10px] text-slate-500">
                {((actualNegatives / total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Column Marginal Totals */}
          <div className="grid grid-cols-[140px_1fr_1fr_100px] gap-2.5 text-center text-xs">
            <div className="bg-slate-50 text-slate-500 py-2 px-3 rounded-lg border border-slate-200/60 font-semibold text-left">
              Total Predicted
            </div>
            <div className="bg-sky-50 text-sky-800 py-2 px-3 rounded-lg border border-sky-100 flex flex-col items-center">
              <span className="font-bold font-mono text-sm">{predictedPositives}</span>
              <span className="text-[10px] text-sky-600">{((predictedPositives / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-100 text-slate-700 py-2 px-3 rounded-lg border border-slate-200 flex flex-col items-center">
              <span className="font-bold font-mono text-sm">{predictedNegatives}</span>
              <span className="text-[10px] text-slate-500">{((predictedNegatives / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-800 text-white py-2 px-3 rounded-lg flex flex-col items-center justify-center font-bold">
              <span className="font-mono text-sm">{total}</span>
              <span className="text-[10px] text-slate-300">Total N</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Interpretation Banner */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Correct Decisions:</strong> {tp + tn} / {total} ({(stats.accuracy * 100).toFixed(1)}% Accuracy)
            &nbsp;•&nbsp;
            <strong>Total Misclassifications:</strong> {fp + fn} ({((1 - stats.accuracy) * 100).toFixed(1)}% Error Rate)
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            False Positive Rate (FPR): <strong>{(stats.falsePositiveRate * 100).toFixed(1)}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            False Negative Rate (FNR): <strong>{(stats.falseNegativeRate * 100).toFixed(1)}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
