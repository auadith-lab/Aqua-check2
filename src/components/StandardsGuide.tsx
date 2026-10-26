import React from 'react';
import { WATER_PARAMETERS } from '../data/parameters';
import { BookOpen, Shield, AlertCircle, Wrench, ExternalLink } from 'lucide-react';

export const StandardsGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              WHO & EPA Water Quality Standards Encyclopedia
            </h2>
            <p className="text-xs text-slate-500">
              International drinking water regulatory benchmarks, permissible limits, physiological toxicity risks, and engineering remediation technologies.
            </p>
          </div>
        </div>
      </div>

      {/* Standards Cards for all 9 Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WATER_PARAMETERS.map((p) => (
          <div
            key={p.key}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-slate-900">{p.label}</span>
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg">
                  {p.whoStandard}
                </span>
              </div>

              <div className="text-xs text-slate-600 mb-3 leading-relaxed">
                {p.description}
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-[11px] text-rose-950 mb-3 leading-relaxed">
                <div className="font-bold text-rose-800 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Public Health Hazard:</span>
                </div>
                {p.healthSignificance}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-700">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>Recommended Treatment:</span>
              </div>
              {p.recommendedTreatment}
            </div>
          </div>
        ))}
      </div>

      {/* Model Methodology & Tree Traversal Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Random Forest Model Architecture & Traversal Mathematics
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          AquaCheck executes a 100-tree Random Forest Classifier trained on water potability features. Each decision tree evaluates continuous thresholds with 32-bit floating point precision (<code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">Math.fround</code>). Node decisions branch left if <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">x[feature] &le; threshold</code> and right otherwise. The final ensemble prediction is calculated as the unweighted mean probability of all 100 leaf probability distributions:
        </p>

        <div className="bg-slate-900 text-cyan-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          P(Potable | X) = (1 / 100) * &sum;<sub>i=1..100</sub> Tree<sub>i</sub>.traverse(X)
        </div>
      </div>
    </div>
  );
};
