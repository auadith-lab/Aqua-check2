import React, { useState } from 'react';
import { ConfusionMatrixStats } from '../types';
import { Target, Zap, Shield, HeartPulse, CheckSquare, BarChart3, HelpCircle, Code2, ChevronDown, ChevronUp } from 'lucide-react';

interface MetricsCardsProps {
  stats: ConfusionMatrixStats;
  rocAuc: number;
  prAuc: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  stats,
  rocAuc,
  prAuc
}) => {
  const [showFormulas, setShowFormulas] = useState(false);

  const primaryMetrics = [
    {
      id: 'accuracy',
      name: 'Accuracy',
      abbr: 'ACC',
      value: (stats.accuracy * 100).toFixed(1) + '%',
      fraction: `${stats.tp + stats.tn} / ${stats.total}`,
      formula: '(TP + TN) / (Total)',
      desc: 'Overall fraction of predictions correctly diagnosed.',
      subtext: `95% CI: [${(stats.accuracyCI[0] * 100).toFixed(1)}% – ${(stats.accuracyCI[1] * 100).toFixed(1)}%]`,
      color: 'sky',
      icon: Target
    },
    {
      id: 'precision',
      name: 'Precision',
      abbr: 'PPV',
      value: (stats.precision * 100).toFixed(1) + '%',
      fraction: `${stats.tp} / ${stats.predictedPositives}`,
      formula: 'TP / (TP + FP)',
      desc: 'When the model predicts water is potable, how often is it truly safe?',
      subtext: `${stats.fp} false alarms`,
      color: 'emerald',
      icon: Zap
    },
    {
      id: 'recall',
      name: 'Recall / Sensitivity',
      abbr: 'TPR',
      value: (stats.recall * 100).toFixed(1) + '%',
      fraction: `${stats.tp} / ${stats.actualPositives}`,
      formula: 'TP / (TP + FN)',
      desc: 'Ability of the model to detect truly potable water samples.',
      subtext: `${stats.fn} missed potable samples`,
      color: 'teal',
      icon: HeartPulse
    },
    {
      id: 'specificity',
      name: 'Specificity',
      abbr: 'TNR',
      value: (stats.specificity * 100).toFixed(1) + '%',
      fraction: `${stats.tn} / ${stats.actualNegatives}`,
      formula: 'TN / (TN + FP)',
      desc: 'Ability of the model to correctly identify contaminated water.',
      subtext: `FPR: ${(stats.falsePositiveRate * 100).toFixed(1)}%`,
      color: 'indigo',
      icon: Shield
    },
    {
      id: 'f1',
      name: 'F1-Score',
      abbr: 'F₁',
      value: stats.f1Score.toFixed(3),
      fraction: 'Harmonic Mean',
      formula: '2 × (Precision × Recall) / (Precision + Recall)',
      desc: 'Balances precision and recall for imbalanced distribution.',
      subtext: `${(stats.f1Score * 100).toFixed(1)}% harmonic balance`,
      color: 'purple',
      icon: CheckSquare
    },
    {
      id: 'balancedAcc',
      name: 'Balanced Accuracy',
      abbr: 'B-ACC',
      value: (stats.balancedAccuracy * 100).toFixed(1) + '%',
      fraction: 'Mean of Sens & Spec',
      formula: '(Sensitivity + Specificity) / 2',
      desc: 'Avoids inflated accuracy due to class imbalances.',
      subtext: `Class-balanced performance`,
      color: 'blue',
      icon: BarChart3
    }
  ];

  const advancedMetrics = [
    {
      name: 'ROC-AUC',
      val: rocAuc.toFixed(3),
      desc: 'Area Under Receiver Operating Characteristic Curve (discriminative power across all cutoffs)'
    },
    {
      name: 'PR-AUC',
      val: prAuc.toFixed(3),
      desc: 'Area Under Precision-Recall Curve'
    },
    {
      name: "Matthews Corr (MCC)",
      val: stats.matthewsCorrCoef.toFixed(3),
      desc: 'Correlation coefficient between truth and prediction (-1 to +1)'
    },
    {
      name: "Cohen's Kappa (κ)",
      val: stats.cohensKappa.toFixed(3),
      desc: 'Inter-rater agreement above chance expectation'
    },
    {
      name: 'Negative Pred Value (NPV)',
      val: (stats.negativePredictiveValue * 100).toFixed(1) + '%',
      desc: 'Probability that a sample predicted non-potable is truly non-potable'
    },
    {
      name: 'Critical Success Index (CSI)',
      val: (stats.threatScore * 100).toFixed(1) + '%',
      desc: 'Threat score: TP / (TP + FN + FP)'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {primaryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>{m.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    {m.abbr}
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {m.value}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {m.fraction}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="text-[10px] text-slate-500 leading-tight">
                  {m.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Statistical Metrics & Formula Collapsible */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Advanced Evaluation Statistics & Discrimination Metrics</span>
            </h4>
          </div>

          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showFormulas ? 'Hide Mathematical Formulas' : 'Show Mathematical Formulas'}</span>
            {showFormulas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {advancedMetrics.map((item, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
              <div className="text-[10px] text-slate-500 font-medium truncate" title={item.desc}>
                {item.name}
              </div>
              <div className="text-base font-extrabold font-mono text-slate-800 mt-0.5">
                {item.val}
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Formulas Reference */}
        {showFormulas && (
          <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs">
            <h5 className="font-bold text-slate-800 mb-2">Metric Formulation Reference:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-[11px] text-slate-600">
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">Accuracy:</strong> (TP + TN) / (TP + TN + FP + FN)
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">Precision (PPV):</strong> TP / (TP + FP)
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">Recall (Sensitivity):</strong> TP / (TP + FN)
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">Specificity (TNR):</strong> TN / (TN + FP)
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">F1-Score:</strong> 2 × (Precision × Recall) / (Precision + Recall)
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <strong className="text-slate-800">MCC:</strong> (TP×TN - FP×FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
