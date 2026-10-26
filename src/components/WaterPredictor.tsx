import React from 'react';
import { WaterFeatures, WaterParameter, PresetSample, PredictionResult, ModelData } from '../types';
import { WATER_PARAMETERS, PRESET_SAMPLES } from '../data/parameters';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Wrench,
  Check
} from 'lucide-react';

interface WaterPredictorProps {
  currentValues: WaterFeatures;
  setCurrentValues: React.Dispatch<React.SetStateAction<WaterFeatures>>;
  prediction: PredictionResult;
  onApplyPreset: (preset: PresetSample) => void;
  onReset: () => void;
  onSwitchToPerformance: () => void;
}

export const WaterPredictor: React.FC<WaterPredictorProps> = ({
  currentValues,
  setCurrentValues,
  prediction,
  onApplyPreset,
  onReset,
  onSwitchToPerformance
}) => {
  const handleValueChange = (key: string, val: number, param: WaterParameter) => {
    // Keep within bounds
    const clamped = Math.min(Math.max(val, param.min), param.max);
    setCurrentValues((prev) => ({
      ...prev,
      [key]: clamped
    }));
  };

  return (
    <div className="space-y-6">
      {/* Quick Sample Presets */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            One-Tap Sample Presets:
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer self-start sm:self-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50 hover:border-sky-300 transition-all text-left group cursor-pointer"
            >
              <div className="text-xl mb-1">{preset.icon}</div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-sky-800 line-clamp-1">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                {preset.tagline}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Prediction Banner & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 9 Parameter Inputs (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">
                Water Quality Parameters (9 Features)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Real-time Float32 Inference
            </span>
          </div>

          <div className="space-y-4">
            {WATER_PARAMETERS.map((p) => {
              const val = currentValues[p.key] ?? p.defaultValue;

              // Check violation status
              let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              let statusText = 'Within WHO Standard';
              if (p.whoSafeMin !== undefined && val < p.whoSafeMin) {
                statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
                statusText = `Below WHO Safe Min (${p.whoSafeMin})`;
              } else if (p.whoSafeMax !== undefined && val > p.whoSafeMax) {
                statusColor = val > p.whoSafeMax * 1.5
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200';
                statusText = `Exceeds Safe Limit (${p.whoSafeMax})`;
              }

              return (
                <div key={p.key} className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{p.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{p.unit}]</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.hint}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusText}
                      </span>
                      <input
                        type="number"
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        value={val}
                        onChange={(e) => handleValueChange(p.key, parseFloat(e.target.value) || 0, p)}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="pt-1">
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={val}
                      onChange={(e) => handleValueChange(p.key, parseFloat(e.target.value), p)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>{p.min} {p.unit}</span>
                      <span className="text-slate-500">WHO Safe: {p.whoStandard}</span>
                      <span>{p.max} {p.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Verdict, Probability Consensus Meter, Treatment Advice (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Verdict Card */}
          <div
            className={`rounded-2xl p-6 shadow-sm border transition-all ${
              prediction.isPotable
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400 shadow-emerald-500/10'
                : 'bg-gradient-to-br from-rose-600 to-red-800 text-white border-rose-400 shadow-rose-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold opacity-90">
                Random Forest ML Verdict
              </span>
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {prediction.isPotable ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-2xl font-black tracking-tight text-white">
                {prediction.isPotable ? 'Predicted Potable' : 'Predicted Non-Potable'}
              </h2>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                {prediction.isPotable
                  ? 'Sample exhibits physical and chemical properties matching safe drinking water standards across the Random Forest ensemble.'
                  : 'Sample exhibits hazardous or imbalanced contaminant readings indicating significant water quality impairment.'}
              </p>
            </div>

            {/* Voting consensus meter */}
            <div className="mt-6 pt-4 border-t border-white/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Ensemble Tree Consensus</span>
                <span className="font-mono text-base">{prediction.percentage}%</span>
              </div>

              <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/80">
                <span>{prediction.treesPotableCount} / {prediction.totalTrees} trees voted Potable</span>
                <span>Cutoff: 50%</span>
              </div>
            </div>
          </div>

          {/* Quick link to Performance Dashboard */}
          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200/80 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-sky-900">
                Need Confusion Matrix & Precision Metrics?
              </h4>
              <p className="text-[11px] text-sky-700 mt-0.5">
                Analyze model sensitivity, error distribution, and discrimination curves on the test dataset.
              </p>
            </div>
            <button
              onClick={onSwitchToPerformance}
              className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
            >
              View Matrix
            </button>
          </div>

          {/* WHO / EPA Guideline Violations & Recommended Treatment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>WHO Reference Standards Check</span>
              </h4>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {prediction.violations.length === 0 ? 'All Safe' : `${prediction.violations.length} Exceeded`}
              </span>
            </div>

            {prediction.violations.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All 9 physical and chemical parameters strictly satisfy WHO & EPA drinking water thresholds.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {prediction.violations.map((v) => (
                  <div
                    key={v.parameter.key}
                    className={`p-3 rounded-xl border text-xs ${
                      v.status === 'critical'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{v.parameter.label}</span>
                      <span className="font-mono">{v.currentValue} {v.parameter.unit}</span>
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-90">{v.message}</div>
                    {v.parameter.recommendedTreatment && (
                      <div className="mt-2 pt-1.5 border-t border-black/5 flex items-start gap-1.5 text-[10px] font-medium text-slate-700">
                        <Wrench className="w-3 h-3 text-sky-700 shrink-0 mt-0.5" />
                        <span><strong>Remediation:</strong> {v.parameter.recommendedTreatment}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
