import React from 'react';
import { Droplets, Activity, BookOpen, ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'predictor' | 'performance' | 'guidelines';
  setActiveTab: (tab: 'predictor' | 'performance' | 'guidelines') => void;
  treesCount: number;
  modelReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  treesCount,
  modelReady
}) => {
  return (
    <header className="bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-800 text-white rounded-2xl shadow-xl shadow-sky-900/10 mb-6 overflow-hidden relative border border-sky-600/30">
      {/* Background radial glow */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Droplets className="w-7 h-7 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  AquaCheck
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-400/20 text-cyan-200 rounded-full border border-cyan-400/30">
                  ML Engine v2.0
                </span>
              </div>
              <p className="text-xs md:text-sm text-sky-100 font-medium mt-0.5">
                Water Potability Analyzer & ML Performance Evaluation Dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-900/50 backdrop-blur-sm border border-sky-500/30 text-xs text-sky-100">
              <Cpu className="w-4 h-4 text-cyan-300" />
              <span>Random Forest: <strong className="text-white">{treesCount} Trees</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 backdrop-blur-sm border border-emerald-500/30 text-xs text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{modelReady ? 'Model Active' : 'Loading Model...'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('predictor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'predictor'
                ? 'bg-white text-sky-900 shadow-md shadow-sky-950/20 scale-[1.02]'
                : 'bg-white/10 text-white/90 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Water Quality Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-white text-sky-900 shadow-md shadow-sky-950/20 scale-[1.02]'
                : 'bg-white/10 text-white/90 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Performance Dashboard & Confusion Matrix</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'guidelines'
                ? 'bg-white text-sky-900 shadow-md shadow-sky-950/20 scale-[1.02]'
                : 'bg-white/10 text-white/90 hover:bg-white/15 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>WHO / EPA Standards</span>
          </button>
        </div>
      </div>
    </header>
  );
};
