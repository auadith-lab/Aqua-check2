import React, { useState, useMemo } from 'react';
import { ModelData, TestSample, WaterFeatures } from '../types';
import {
  calculateConfusionMatrix,
  computeROCandPRCurves,
  computeFeatureImportances,
  parseCSVToTestSamples
} from '../services/modelEngine';
import { ConfusionMatrixView } from './ConfusionMatrixView';
import { ThresholdSlider } from './ThresholdSlider';
import { MetricsCards } from './MetricsCards';
import { CurvesChart } from './CurvesChart';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { TestSampleExplorer } from './TestSampleExplorer';
import { CostAnalysisCard } from './CostAnalysisCard';
import { Activity, ShieldCheck, Database, RefreshCw, CheckCircle, FileText } from 'lucide-react';

interface PerformanceDashboardProps {
  model: ModelData | null;
  samples: TestSample[];
  setSamples: React.Dispatch<React.SetStateAction<TestSample[]>>;
  onLoadSample: (features: WaterFeatures) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  model,
  samples,
  setSamples,
  onLoadSample
}) => {
  const [threshold, setThreshold] = useState<number>(0.50);
  const [costFP, setCostFP] = useState<number>(6); // High penalty for contaminated water
  const [costFN, setCostFN] = useState<number>(1); // Lower penalty for re-treating safe water
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Compute confusion matrix & metrics for current threshold & cost weights
  const stats = useMemo(() => {
    return calculateConfusionMatrix(samples, threshold, costFP, costFN);
  }, [samples, threshold, costFP, costFN]);

  // Compute ROC & PR curves
  const curvesData = useMemo(() => {
    return computeROCandPRCurves(samples);
  }, [samples]);

  // Compute Feature Importances
  const featureImportances = useMemo(() => {
    if (!model) return [];
    return computeFeatureImportances(model);
  }, [model]);

  // Find optimal threshold that maximizes F1-score
  const optimalF1Threshold = useMemo(() => {
    let maxF1 = -1;
    let bestT = 0.5;
    curvesData.rocPoints.forEach((p) => {
      if (p.f1 > maxF1) {
        maxF1 = p.f1;
        bestT = p.threshold;
      }
    });
    return bestT;
  }, [curvesData]);

  // Handle uploaded batch CSV
  const handleUploadCSV = (csvText: string) => {
    if (!model) return;
    try {
      const parsed = parseCSVToTestSamples(csvText, model);
      setSamples(parsed);
      setUploadNotice(`Successfully evaluated ${parsed.length} uploaded samples!`);
      setTimeout(() => setUploadNotice(null), 4000);
    } catch (err: any) {
      alert(`CSV Error: ${err.message}`);
    }
  };

  const baselinePositiveRate = samples.length > 0
    ? samples.filter((s) => s.actual === 1).length / samples.length
    : 0.4;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-300 font-semibold">
                Model Evaluation & Diagnostic Dashboard
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Random Forest Classifier Performance Analysis
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time statistical evaluation, dynamic 2×2 confusion matrix, ROC/PR discrimination curves, and sensitivity tuning for water potability prediction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs">
              <div className="text-slate-300 text-[10px] uppercase tracking-wider font-semibold">Evaluation Set</div>
              <div className="font-mono font-bold text-base text-cyan-200 mt-0.5">{samples.length} Samples</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs">
              <div className="text-slate-300 text-[10px] uppercase tracking-wider font-semibold">Model Architecture</div>
              <div className="font-mono font-bold text-base text-white mt-0.5">100 Trees (Depth 12)</div>
            </div>
          </div>
        </div>

        {uploadNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{uploadNotice}</span>
          </div>
        )}
      </div>

      {/* Decision Threshold Controller */}
      <ThresholdSlider
        threshold={threshold}
        setThreshold={setThreshold}
        optimalThreshold={optimalF1Threshold}
      />

      {/* Core Evaluation Metrics Grid */}
      <MetricsCards
        stats={stats}
        rocAuc={curvesData.rocAuc}
        prAuc={curvesData.prAuc}
      />

      {/* Confusion Matrix Section */}
      <ConfusionMatrixView
        stats={stats}
        threshold={threshold}
      />

      {/* Side-by-side: Diagnostic Curves & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurvesChart
          rocPoints={curvesData.rocPoints}
          prPoints={curvesData.prPoints}
          rocAuc={curvesData.rocAuc}
          prAuc={curvesData.prAuc}
          currentThreshold={threshold}
          baselinePositiveRate={baselinePositiveRate}
        />

        <FeatureImportanceChart
          importances={featureImportances}
        />
      </div>

      {/* Public Health Risk & Cost Utility Analysis */}
      <CostAnalysisCard
        stats={stats}
        costFP={costFP}
        costFN={costFN}
        setCostFP={setCostFP}
        setCostFN={setCostFN}
        currentThreshold={threshold}
      />

      {/* Test Sample Explorer & Error Diagnostic Table */}
      <TestSampleExplorer
        samples={samples}
        threshold={threshold}
        onLoadSample={onLoadSample}
        onUploadCSV={handleUploadCSV}
      />
    </div>
  );
};
