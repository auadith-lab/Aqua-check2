import React from 'react';
import { FeatureImportance } from '../types';
import { BarChart2, Info } from 'lucide-react';

interface FeatureImportanceChartProps {
  importances: FeatureImportance[];
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  importances
}) => {
  const maxWeight = Math.max(...importances.map((f) => f.weight), 0.01);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <span>Random Forest Feature Split Importance</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Frequency and influence of each water quality parameter across all 100 decision trees.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          Total Tree Splits: {importances.reduce((a, b) => a + b.splits, 0).toLocaleString()}
        </span>
      </div>

      <div className="space-y-3">
        {importances.map((f) => {
          const barWidthPercent = (f.weight / maxWeight) * 100;

          return (
            <div key={f.name} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                    #{f.rank}
                  </span>
                  <span className="font-semibold text-slate-800">{f.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">({f.name})</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">{f.splits.toLocaleString()} splits</span>
                  <strong className="text-sky-800 font-bold">{(f.weight * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500 group-hover:from-sky-600 group-hover:to-cyan-600"
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
        <span>
          <strong>Gini Split Distribution:</strong> <strong>pH Level</strong>, <strong>Chloramines</strong>, and <strong>Turbidity</strong> serve as the primary discriminating features near root nodes, aligning directly with WHO physical-chemical potability standards.
        </span>
      </div>
    </div>
  );
};
