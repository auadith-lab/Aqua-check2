import React, { useState, useEffect, useMemo } from 'react';
import { WaterFeatures, ModelData, PresetSample, TestSample } from './types';
import { DEFAULT_WATER_VALUES, PRESET_SAMPLES } from './data/parameters';
import { loadModel, predictFromTrees, DEFAULT_TEST_SAMPLES } from './services/modelEngine';
import { Header } from './components/Header';
import { WaterPredictor } from './components/WaterPredictor';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { StandardsGuide } from './components/StandardsGuide';
import { Droplets, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'predictor' | 'performance' | 'guidelines'>('performance');
  const [model, setModel] = useState<ModelData | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [currentValues, setCurrentValues] = useState<WaterFeatures>(DEFAULT_WATER_VALUES);
  const [testSamples, setTestSamples] = useState<TestSample[]>(DEFAULT_TEST_SAMPLES);

  // Load 100-Tree Random Forest model
  useEffect(() => {
    loadModel()
      .then((loaded) => {
        setModel(loaded);
        setModelLoading(false);
      })
      .catch((err) => {
        console.error('Model load error:', err);
        setModelLoading(false);
      });
  }, []);

  // Compute live prediction for WaterPredictor
  const prediction = useMemo(() => {
    if (!model) {
      return {
        probability: 0.5,
        percentage: 50,
        isPotable: false,
        treesPotableCount: 50,
        totalTrees: 100,
        violations: []
      };
    }
    return predictFromTrees(currentValues, model, 0.5);
  }, [currentValues, model]);

  // Apply quick preset
  const handleApplyPreset = (preset: PresetSample) => {
    setCurrentValues({ ...preset.values });
  };

  // Reset to default
  const handleReset = () => {
    setCurrentValues({ ...DEFAULT_WATER_VALUES });
  };

  // Load sample from test explorer into live predictor
  const handleLoadSampleIntoPredictor = (features: WaterFeatures) => {
    setCurrentValues({ ...features });
    setActiveTab('predictor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Global Header & Nav */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          treesCount={model?.trees.length ?? 100}
          modelReady={!modelLoading && model !== null}
        />

        {/* Tab Content */}
        <main>
          {activeTab === 'performance' && (
            <PerformanceDashboard
              model={model}
              samples={testSamples}
              setSamples={setTestSamples}
              onLoadSample={handleLoadSampleIntoPredictor}
            />
          )}

          {activeTab === 'predictor' && (
            <WaterPredictor
              currentValues={currentValues}
              setCurrentValues={setCurrentValues}
              prediction={prediction}
              onApplyPreset={handleApplyPreset}
              onReset={handleReset}
              onSwitchToPerformance={() => setActiveTab('performance')}
            />
          )}

          {activeTab === 'guidelines' && (
            <StandardsGuide />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>
              <strong>AquaCheck</strong> — AI Water Potability & Model Performance Analytics Platform
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by 100-Tree Random Forest Ensemble</span>
            <span>•</span>
            <span>Client-side Float32 Traversal Engine</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
