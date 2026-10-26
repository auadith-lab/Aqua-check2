export interface WaterParameter {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  hint: string;
  whoStandard: string;
  whoSafeMin?: number;
  whoSafeMax?: number;
  description: string;
  healthSignificance: string;
  recommendedTreatment?: string;
}

export interface WaterFeatures {
  ph: number;
  Hardness: number;
  Solids: number;
  Chloramines: number;
  Sulfate: number;
  Conductivity: number;
  Organic_carbon: number;
  Trihalomethanes: number;
  Turbidity: number;
  [key: string]: number;
}

export interface PresetSample {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  values: WaterFeatures;
}

export interface DecisionTree {
  f: number[];
  t: number[];
  l: number[];
  r: number[];
  p: number[];
}

export interface ModelData {
  is_demo: boolean;
  test_accuracy: number | null;
  feature_names: string[];
  trees: DecisionTree[];
}

export interface PredictionResult {
  probability: number;
  percentage: number;
  isPotable: boolean;
  treesPotableCount: number;
  totalTrees: number;
  violations: ParameterViolation[];
}

export interface ParameterViolation {
  parameter: WaterParameter;
  currentValue: number;
  status: 'safe' | 'warning' | 'critical';
  message: string;
}

export interface TestSample {
  id: number;
  features: WaterFeatures;
  actual: 0 | 1; // 0 = Non-Potable, 1 = Potable
  predictedProb: number;
}

export interface ConfusionMatrixStats {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  total: number;
  actualPositives: number;
  actualNegatives: number;
  predictedPositives: number;
  predictedNegatives: number;

  // Primary Metrics
  accuracy: number;
  accuracyCI: [number, number]; // 95% Confidence Interval
  precision: number;            // Positive Predictive Value (PPV)
  recall: number;               // Sensitivity / True Positive Rate (TPR)
  specificity: number;          // True Negative Rate (TNR)
  f1Score: number;
  balancedAccuracy: number;

  // Advanced Statistical Metrics
  falsePositiveRate: number;    // FPR / Fall-out = FP / N
  falseNegativeRate: number;    // FNR / Miss rate = FN / P
  negativePredictiveValue: number; // NPV = TN / (TN + FN)
  falseDiscoveryRate: number;   // FDR = FP / (TP + FP)
  matthewsCorrCoef: number;     // MCC
  cohensKappa: number;          // Kappa
  threatScore: number;          // Jaccard / Critical Success Index = TP / (TP + FN + FP)
  expectedCost: number;         // Weighted penalty cost
}

export interface CurvePoint {
  threshold: number;
  fpr: number;
  tpr: number;
  precision: number;
  recall: number;
  specificity: number;
  accuracy: number;
  f1: number;
}

export interface ROCandPRData {
  rocPoints: CurvePoint[];
  prPoints: CurvePoint[];
  rocAuc: number;
  prAuc: number;
}

export interface FeatureImportance {
  name: string;
  label: string;
  splits: number;
  weight: number;
  rank: number;
}
