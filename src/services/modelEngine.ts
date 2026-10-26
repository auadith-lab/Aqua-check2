import {
  ModelData,
  WaterFeatures,
  PredictionResult,
  ParameterViolation,
  TestSample,
  ConfusionMatrixStats,
  CurvePoint,
  ROCandPRData,
  FeatureImportance
} from '../types';
import { WATER_PARAMETERS } from '../data/parameters';
import testDatasetRaw from '../data/testDataset.json';

// Cached model instance
let cachedModel: ModelData | null = null;

export const DEFAULT_TEST_SAMPLES: TestSample[] = testDatasetRaw as TestSample[];

export async function loadModel(): Promise<ModelData> {
  if (cachedModel) return cachedModel;

  try {
    const res = await fetch('/rf_model.json');
    if (!res.ok) {
      throw new Error(`Failed to load rf_model.json: ${res.statusText}`);
    }
    const data: ModelData = await res.json();
    cachedModel = data;
    return data;
  } catch (err) {
    console.warn('Falling back or error fetching model:', err);
    throw err;
  }
}

export function predictFromTrees(
  features: WaterFeatures,
  model: ModelData,
  decisionThreshold: number = 0.5
): PredictionResult {
  const featureNames = model.feature_names || [
    'ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate',
    'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity'
  ];

  // Map features to float32 precision array matching Kotlin & Python
  const x = featureNames.map((name) => Math.fround(Number(features[name] ?? 0)));
  const trees = model.trees;

  let totalProb = 0.0;
  let treesPotableCount = 0;

  for (let i = 0; i < trees.length; i++) {
    const tr = trees[i];
    let n = 0;
    while (tr.l[n] !== -1) {
      const featIdx = tr.f[n];
      n = x[featIdx] <= tr.t[n] ? tr.l[n] : tr.r[n];
    }
    const treePotableProb = tr.p[n];
    totalProb += treePotableProb;
    if (treePotableProb > 0.5) {
      treesPotableCount++;
    }
  }

  const avgProb = trees.length > 0 ? totalProb / trees.length : 0.5;
  const isPotable = avgProb >= decisionThreshold;

  // Check WHO violations
  const violations: ParameterViolation[] = [];
  WATER_PARAMETERS.forEach((p) => {
    const val = Number(features[p.key] ?? 0);
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    let message = 'Within recommended WHO drinking guideline';

    if (p.whoSafeMin !== undefined && val < p.whoSafeMin) {
      status = val < p.whoSafeMin * 0.75 ? 'critical' : 'warning';
      message = `Sub-optimal: Below WHO limit (${p.whoSafeMin} ${p.unit})`;
    } else if (p.whoSafeMax !== undefined && val > p.whoSafeMax) {
      status = val > p.whoSafeMax * 1.5 ? 'critical' : 'warning';
      message = `Exceeds WHO guideline threshold (${p.whoSafeMax} ${p.unit})`;
    }

    if (status !== 'safe') {
      violations.push({ parameter: p, currentValue: val, status, message });
    }
  });

  return {
    probability: avgProb,
    percentage: Math.round(avgProb * 100),
    isPotable,
    treesPotableCount,
    totalTrees: trees.length,
    violations
  };
}

export function computeFeatureImportances(model: ModelData): FeatureImportance[] {
  const counts: Record<string, number> = {};
  const names = model.feature_names;
  names.forEach((f) => (counts[f] = 0));

  for (const tr of model.trees) {
    for (let i = 0; i < tr.f.length; i++) {
      const featIdx = tr.f[i];
      if (featIdx >= 0 && featIdx < names.length) {
        counts[names[featIdx]] = (counts[names[featIdx]] || 0) + 1;
      }
    }
  }

  const totalSplits = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  const result = Object.entries(counts).map(([name, splits]) => {
    const p = WATER_PARAMETERS.find((param) => param.key === name);
    return {
      name,
      label: p ? p.label : name,
      splits,
      weight: splits / totalSplits,
      rank: 0
    };
  });

  result.sort((a, b) => b.weight - a.weight);
  result.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return result;
}

export function calculateConfusionMatrix(
  samples: TestSample[],
  threshold: number,
  costFP: number = 5,
  costFN: number = 2
): ConfusionMatrixStats {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  const total = samples.length;

  for (let i = 0; i < total; i++) {
    const s = samples[i];
    const predictedPositive = s.predictedProb >= threshold;
    const actualPositive = s.actual === 1;

    if (actualPositive && predictedPositive) {
      tp++;
    } else if (!actualPositive && !predictedPositive) {
      tn++;
    } else if (!actualPositive && predictedPositive) {
      fp++;
    } else {
      fn++;
    }
  }

  const actualPositives = tp + fn;
  const actualNegatives = tn + fp;
  const predictedPositives = tp + fp;
  const predictedNegatives = tn + fn;

  // Primary Metrics
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  
  // 95% Wald CI for accuracy: acc +/- 1.96 * sqrt(acc*(1-acc)/N)
  const se = total > 0 ? Math.sqrt((accuracy * (1 - accuracy)) / total) : 0;
  const ciLower = Math.max(0, accuracy - 1.96 * se);
  const ciUpper = Math.min(1, accuracy + 1.96 * se);

  const precision = predictedPositives > 0 ? tp / predictedPositives : 0;
  const recall = actualPositives > 0 ? tp / actualPositives : 0; // Sensitivity / TPR
  const specificity = actualNegatives > 0 ? tn / actualNegatives : 0; // TNR
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const balancedAccuracy = (recall + specificity) / 2;

  // Error rates
  const falsePositiveRate = actualNegatives > 0 ? fp / actualNegatives : 0; // Fall-out (1 - Specificity)
  const falseNegativeRate = actualPositives > 0 ? fn / actualPositives : 0; // Miss rate (1 - Recall)
  const negativePredictiveValue = predictedNegatives > 0 ? tn / predictedNegatives : 0;
  const falseDiscoveryRate = predictedPositives > 0 ? fp / predictedPositives : 0;

  // Matthews Correlation Coefficient
  const mccDenominator = Math.sqrt(
    (tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)
  );
  const matthewsCorrCoef = mccDenominator > 0 ? (tp * tn - fp * fn) / mccDenominator : 0;

  // Cohen's Kappa
  const pObserved = accuracy;
  const pChance = total > 0 ?
    ((actualPositives / total) * (predictedPositives / total)) +
    ((actualNegatives / total) * (predictedNegatives / total))
    : 0;
  const cohensKappa = 1 - pChance !== 0 ? (pObserved - pChance) / (1 - pChance) : 0;

  // Threat score (CSI)
  const threatDenominator = tp + fn + fp;
  const threatScore = threatDenominator > 0 ? tp / threatDenominator : 0;

  // Weighted cost penalty: Cost = (FP * costFP + FN * costFN) / Total
  const expectedCost = total > 0 ? (fp * costFP + fn * costFN) / total : 0;

  return {
    tp,
    tn,
    fp,
    fn,
    total,
    actualPositives,
    actualNegatives,
    predictedPositives,
    predictedNegatives,
    accuracy,
    accuracyCI: [ciLower, ciUpper],
    precision,
    recall,
    specificity,
    f1Score,
    balancedAccuracy,
    falsePositiveRate,
    falseNegativeRate,
    negativePredictiveValue,
    falseDiscoveryRate,
    matthewsCorrCoef,
    cohensKappa,
    threatScore,
    expectedCost
  };
}

export function computeROCandPRCurves(samples: TestSample[]): ROCandPRData {
  const steps = 101;
  const rocPoints: CurvePoint[] = [];
  const prPoints: CurvePoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const threshold = i / steps;
    const stats = calculateConfusionMatrix(samples, threshold);

    const point: CurvePoint = {
      threshold,
      fpr: stats.falsePositiveRate,
      tpr: stats.recall,
      precision: stats.precision,
      recall: stats.recall,
      specificity: stats.specificity,
      accuracy: stats.accuracy,
      f1: stats.f1Score
    };

    rocPoints.push(point);
    prPoints.push(point);
  }

  // Calculate ROC-AUC using Trapezoidal Rule
  // Sort points by FPR ascending
  const sortedRoc = [...rocPoints].sort((a, b) => a.fpr - b.fpr);
  let rocAuc = 0;
  for (let i = 1; i < sortedRoc.length; i++) {
    const prev = sortedRoc[i - 1];
    const curr = sortedRoc[i];
    const width = curr.fpr - prev.fpr;
    const avgHeight = (curr.tpr + prev.tpr) / 2;
    rocAuc += width * avgHeight;
  }
  // Guarantee within bounds [0.5, 1.0]
  rocAuc = Math.min(1.0, Math.max(0.0, rocAuc));

  // Calculate PR-AUC using Trapezoidal Rule
  // Sort points by Recall ascending
  const sortedPr = [...prPoints].sort((a, b) => a.recall - b.recall);
  let prAuc = 0;
  for (let i = 1; i < sortedPr.length; i++) {
    const prev = sortedPr[i - 1];
    const curr = sortedPr[i];
    const width = curr.recall - prev.recall;
    const avgHeight = (curr.precision + prev.precision) / 2;
    prAuc += width * avgHeight;
  }
  prAuc = Math.min(1.0, Math.max(0.0, prAuc));

  return {
    rocPoints,
    prPoints,
    rocAuc: +rocAuc.toFixed(4),
    prAuc: +prAuc.toFixed(4)
  };
}

export function parseCSVToTestSamples(csvText: string, model: ModelData): TestSample[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row.');

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const targetColIndex = headers.findIndex((h) =>
    ['potability', 'potable', 'target', 'is_potable', 'class'].includes(h.toLowerCase())
  );

  const samples: TestSample[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',').map((v) => v.trim());

    const featObj: WaterFeatures = {
      ph: 7.0,
      Hardness: 190,
      Solids: 20000,
      Chloramines: 7.0,
      Sulfate: 330,
      Conductivity: 420,
      Organic_carbon: 14.0,
      Trihalomethanes: 65,
      Turbidity: 4.0
    };

    WATER_PARAMETERS.forEach((p) => {
      const idx = headers.findIndex((h) => h.toLowerCase() === p.key.toLowerCase());
      if (idx !== -1 && parts[idx] !== '' && !isNaN(Number(parts[idx]))) {
        featObj[p.key] = Number(parts[idx]);
      }
    });

    let actualLabel: 0 | 1 = 0;
    if (targetColIndex !== -1 && parts[targetColIndex] !== '') {
      actualLabel = Number(parts[targetColIndex]) === 1 ? 1 : 0;
    } else {
      // Default rule if no target provided
      actualLabel = (featObj.ph >= 6.5 && featObj.ph <= 8.5 && featObj.Turbidity <= 4.0) ? 1 : 0;
    }

    const pred = predictFromTrees(featObj, model, 0.5);

    samples.push({
      id: i,
      features: featObj,
      actual: actualLabel,
      predictedProb: +pred.probability.toFixed(4)
    });
  }

  return samples;
}
