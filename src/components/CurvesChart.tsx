import React, { useState } from 'react';
import { CurvePoint } from '../types';
import { TrendingUp, Activity, HelpCircle } from 'lucide-react';

interface CurvesChartProps {
  rocPoints: CurvePoint[];
  prPoints: CurvePoint[];
  rocAuc: number;
  prAuc: number;
  currentThreshold: number;
  baselinePositiveRate: number;
}

export const CurvesChart: React.FC<CurvesChartProps> = ({
  rocPoints,
  prPoints,
  rocAuc,
  prAuc,
  currentThreshold,
  baselinePositiveRate
}) => {
  const [activeChart, setActiveChart] = useState<'roc' | 'pr' | 'tradeoff'>('roc');

  // Chart dimensions
  const width = 460;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Find the point closest to currentThreshold
  const currentRocPoint = rocPoints.reduce((prev, curr) =>
    Math.abs(curr.threshold - currentThreshold) < Math.abs(prev.threshold - currentThreshold) ? curr : prev
  );

  // Generate SVG path for ROC: x = fpr, y = tpr
  const rocPath = rocPoints
    .slice()
    .sort((a, b) => a.fpr - b.fpr)
    .map((p, idx) => {
      const x = padding.left + p.fpr * innerWidth;
      const y = padding.top + (1 - p.tpr) * innerHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // SVG area for ROC under curve
  const rocAreaPath = `${rocPath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  // Generate SVG path for PR: x = recall, y = precision
  const prPath = prPoints
    .slice()
    .sort((a, b) => a.recall - b.recall)
    .map((p, idx) => {
      const x = padding.left + p.recall * innerWidth;
      const y = padding.top + (1 - p.precision) * innerHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const prAreaPath = `${prPath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Model Discrimination & Diagnostic Curves</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate sensitivity vs false alarm trade-offs across all possible decision boundaries.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setActiveChart('roc')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChart === 'roc' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ROC Curve (AUC: {rocAuc.toFixed(3)})
          </button>
          <button
            onClick={() => setActiveChart('pr')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChart === 'pr' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Precision-Recall (PR)
          </button>
          <button
            onClick={() => setActiveChart('tradeoff')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeChart === 'tradeoff' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Threshold Trade-offs
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
        <div className="relative w-full max-w-[500px] flex justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[320px]">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = padding.top + (1 - tick) * innerHeight;
              const x = padding.left + tick * innerWidth;
              return (
                <g key={tick}>
                  {/* Horizontal grid line */}
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  {/* Vertical grid line */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerHeight}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  {/* Y-axis label */}
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    className="fill-slate-400 font-mono"
                  >
                    {tick.toFixed(2)}
                  </text>
                  {/* X-axis label */}
                  <text
                    x={x}
                    y={padding.top + innerHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-slate-400 font-mono"
                  >
                    {tick.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {activeChart === 'roc' && (
              <>
                {/* Diagonal random guess reference line (AUC = 0.5) */}
                <line
                  x1={padding.left}
                  y1={padding.top + innerHeight}
                  x2={padding.left + innerWidth}
                  y2={padding.top}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Shaded Area under curve */}
                <path d={rocAreaPath} fill="rgba(2, 132, 199, 0.12)" />

                {/* ROC Curve line */}
                <path d={rocPath} fill="none" stroke="#0284c7" strokeWidth="2.5" />

                {/* Current Operating Point */}
                {(() => {
                  const cx = padding.left + currentRocPoint.fpr * innerWidth;
                  const cy = padding.top + (1 - currentRocPoint.tpr) * innerHeight;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="8" fill="rgba(2, 132, 199, 0.25)" className="animate-ping" />
                      <circle cx={cx} cy={cy} r="5" fill="#0369a1" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })()}

                {/* Axis Titles */}
                <text
                  x={padding.left + innerWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  False Positive Rate (1 – Specificity)
                </text>
                <text
                  transform={`rotate(-90 ${padding.left - 35} ${padding.top + innerHeight / 2})`}
                  x={padding.left - 35}
                  y={padding.top + innerHeight / 2}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  True Positive Rate (Recall / Sensitivity)
                </text>
              </>
            )}

            {activeChart === 'pr' && (
              <>
                {/* Baseline No-Skill line */}
                {(() => {
                  const y = padding.top + (1 - baselinePositiveRate) * innerHeight;
                  return (
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                })()}

                {/* Shaded PR Area */}
                <path d={prAreaPath} fill="rgba(16, 185, 129, 0.12)" />

                {/* PR Curve Line */}
                <path d={prPath} fill="none" stroke="#059669" strokeWidth="2.5" />

                {/* Current Operating Point */}
                {(() => {
                  const cx = padding.left + currentRocPoint.recall * innerWidth;
                  const cy = padding.top + (1 - currentRocPoint.precision) * innerHeight;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="8" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />
                      <circle cx={cx} cy={cy} r="5" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })()}

                {/* Axis Titles */}
                <text
                  x={padding.left + innerWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  Recall (Coverage of Potable Water)
                </text>
                <text
                  transform={`rotate(-90 ${padding.left - 35} ${padding.top + innerHeight / 2})`}
                  x={padding.left - 35}
                  y={padding.top + innerHeight / 2}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  Precision (Purity of Potable Calls)
                </text>
              </>
            )}

            {activeChart === 'tradeoff' && (
              <>
                {/* Precision Curve (Emerald) */}
                <path
                  d={rocPoints
                    .slice()
                    .sort((a, b) => a.threshold - b.threshold)
                    .map((p, idx) => {
                      const x = padding.left + p.threshold * innerWidth;
                      const y = padding.top + (1 - p.precision) * innerHeight;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                />

                {/* Recall Curve (Teal) */}
                <path
                  d={rocPoints
                    .slice()
                    .sort((a, b) => a.threshold - b.threshold)
                    .map((p, idx) => {
                      const x = padding.left + p.threshold * innerWidth;
                      const y = padding.top + (1 - p.recall) * innerHeight;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                />

                {/* F1 Curve (Purple) */}
                <path
                  d={rocPoints
                    .slice()
                    .sort((a, b) => a.threshold - b.threshold)
                    .map((p, idx) => {
                      const x = padding.left + p.threshold * innerWidth;
                      const y = padding.top + (1 - p.f1) * innerHeight;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Current Threshold Vertical Line */}
                {(() => {
                  const x = padding.left + currentThreshold * innerWidth;
                  return (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  );
                })()}

                {/* Axis Titles */}
                <text
                  x={padding.left + innerWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  Decision Threshold Cutoff
                </text>
                <text
                  transform={`rotate(-90 ${padding.left - 35} ${padding.top + innerHeight / 2})`}
                  x={padding.left - 35}
                  y={padding.top + innerHeight / 2}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-600 font-semibold"
                >
                  Metric Score (0.0 – 1.0)
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Legend and Operating Point Summary */}
        <div className="w-full lg:w-64 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Current Operating Point</span>
              <span className="font-mono text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded font-bold">
                T = {currentThreshold.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">True Pos Rate (Recall):</span>
                <span className="font-bold text-sky-800">{(currentRocPoint.tpr * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">False Pos Rate (FPR):</span>
                <span className="font-bold text-rose-700">{(currentRocPoint.fpr * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Precision:</span>
                <span className="font-bold text-emerald-800">{(currentRocPoint.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Specificity:</span>
                <span className="font-bold text-indigo-800">{(currentRocPoint.specificity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">F1-Score:</span>
                <span className="font-bold text-purple-800">{currentRocPoint.f1.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {activeChart === 'tradeoff' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-emerald-600 rounded" />
                <span className="text-slate-700 font-medium">Precision Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-sky-600 rounded" />
                <span className="text-slate-700 font-medium">Recall Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-purple-600 rounded border-dashed" />
                <span className="text-slate-700 font-medium">F1-Score Harmonic Mean</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-red-600" />
                <span className="text-slate-700 font-medium">Active Cutoff Boundary</span>
              </div>
            </div>
          )}

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/80 text-[11px] text-sky-900 leading-relaxed">
            <strong>Diagnostic Interpretation:</strong> ROC-AUC of <strong>{rocAuc.toFixed(3)}</strong> indicates substantial discriminative ability of the 100-tree ensemble beyond chance (0.50).
          </div>
        </div>
      </div>
    </div>
  );
};
