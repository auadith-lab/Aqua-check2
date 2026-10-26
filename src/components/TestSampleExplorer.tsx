import React, { useState, useMemo } from 'react';
import { TestSample, WaterFeatures } from '../types';
import { Search, Filter, Download, Upload, ArrowUpRight, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TestSampleExplorerProps {
  samples: TestSample[];
  threshold: number;
  onLoadSample: (features: WaterFeatures) => void;
  onUploadCSV: (csvText: string) => void;
}

export const TestSampleExplorer: React.FC<TestSampleExplorerProps> = ({
  samples,
  threshold,
  onLoadSample,
  onUploadCSV
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'tp' | 'tn' | 'fp' | 'fn'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Classify each sample according to the active threshold
  const enrichedSamples = useMemo(() => {
    return samples.map((s) => {
      const predicted = s.predictedProb >= threshold ? 1 : 0;
      let quadrant: 'tp' | 'tn' | 'fp' | 'fn';
      if (s.actual === 1 && predicted === 1) quadrant = 'tp';
      else if (s.actual === 0 && predicted === 0) quadrant = 'tn';
      else if (s.actual === 0 && predicted === 1) quadrant = 'fp';
      else quadrant = 'fn';

      return {
        ...s,
        predicted,
        quadrant
      };
    });
  }, [samples, threshold]);

  // Counts for tabs
  const counts = useMemo(() => {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    enrichedSamples.forEach((s) => {
      if (s.quadrant === 'tp') tp++;
      else if (s.quadrant === 'tn') tn++;
      else if (s.quadrant === 'fp') fp++;
      else fn++;
    });
    return { tp, tn, fp, fn, total: enrichedSamples.length };
  }, [enrichedSamples]);

  // Filtered samples
  const filtered = useMemo(() => {
    return enrichedSamples.filter((s) => {
      if (filterCategory !== 'all' && s.quadrant !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = String(s.id).includes(q);
        const matchesPh = String(s.features.ph).includes(q);
        const matchesSolids = String(s.features.Solids).includes(q);
        return matchesId || matchesPh || matchesSolids;
      }
      return true;
    });
  }, [enrichedSamples, filterCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Sample_ID',
      'pH',
      'Hardness',
      'Solids_TDS',
      'Chloramines',
      'Sulfate',
      'Conductivity',
      'Organic_Carbon',
      'Trihalomethanes',
      'Turbidity',
      'Actual_Potability',
      'Predicted_Probability',
      'Predicted_Class',
      'Confusion_Quadrant'
    ];

    const rows = enrichedSamples.map((s) => [
      s.id,
      s.features.ph,
      s.features.Hardness,
      s.features.Solids,
      s.features.Chloramines,
      s.features.Sulfate,
      s.features.Conductivity,
      s.features.Organic_carbon,
      s.features.Trihalomethanes,
      s.features.Turbidity,
      s.actual,
      s.predictedProb,
      s.predicted,
      s.quadrant.toUpperCase()
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aquacheck_evaluation_report_threshold_${threshold.toFixed(2)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onUploadCSV(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Validation Test Samples Explorer & Error Analysis</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect individual laboratory samples, diagnose false positives and false negatives, or test custom batches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-sky-600" />
            <span>Upload Batch CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Quadrant tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => { setFilterCategory('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Samples ({counts.total})
          </button>
          <button
            onClick={() => { setFilterCategory('tp'); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filterCategory === 'tp'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>TP: Potable ({counts.tp})</span>
          </button>
          <button
            onClick={() => { setFilterCategory('tn'); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filterCategory === 'tn'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            <span>TN: Non-Potable ({counts.tn})</span>
          </button>
          <button
            onClick={() => { setFilterCategory('fp'); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filterCategory === 'fp'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-600" />
            <span>FP: Critical Errors ({counts.fp})</span>
          </button>
          <button
            onClick={() => { setFilterCategory('fn'); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filterCategory === 'fn'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>FN: Rejections ({counts.fn})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-56">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sample ID / pH..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Ground Truth</th>
              <th className="py-2.5 px-3">Tree Voting (Prob)</th>
              <th className="py-2.5 px-3">Prediction</th>
              <th className="py-2.5 px-3">Outcome</th>
              <th className="py-2.5 px-3">pH</th>
              <th className="py-2.5 px-3">Solids (ppm)</th>
              <th className="py-2.5 px-3">Chloramines</th>
              <th className="py-2.5 px-3">Turbidity</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No samples found matching criteria.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-500 font-medium">#{s.id}</td>
                  <td className="py-2 px-3">
                    {s.actual === 1 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Potable (1)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        Non-Potable (0)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full"
                          style={{ width: `${s.predictedProb * 100}%` }}
                        />
                      </div>
                      <span>{(s.predictedProb * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    {s.predicted === 1 ? (
                      <span className="text-emerald-700 font-bold">Potable</span>
                    ) : (
                      <span className="text-slate-600 font-medium">Non-Potable</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {s.quadrant === 'tp' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        TP (Hit)
                      </span>
                    )}
                    {s.quadrant === 'tn' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        TN (Rejection)
                      </span>
                    )}
                    {s.quadrant === 'fp' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                        FP (Risk!)
                      </span>
                    )}
                    {s.quadrant === 'fn' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        FN (Waste)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700">{s.features.ph}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{s.features.Solids.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{s.features.Chloramines}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{s.features.Turbidity}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onLoadSample(s.features)}
                      title="Load sample parameters into the live Water Predictor simulator"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <span>Simulate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 text-xs text-slate-500">
        <div>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} samples
        </div>

        <div className="flex items-center gap-1 self-center sm:self-auto">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="px-2 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
