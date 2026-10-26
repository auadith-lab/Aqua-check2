import { WaterParameter, PresetSample, WaterFeatures } from '../types';

export const WATER_PARAMETERS: WaterParameter[] = [
  {
    key: 'ph',
    label: 'pH Level',
    unit: 'pH',
    min: 0.0,
    max: 14.0,
    step: 0.1,
    defaultValue: 7.2,
    hint: '0 to 14 (acidic to basic), neutral is 7.0',
    whoStandard: '6.5 – 8.5',
    whoSafeMin: 6.5,
    whoSafeMax: 8.5,
    description: 'Measure of hydrogen ion concentration indicating acidity or alkalinity of water.',
    healthSignificance: 'Water with pH < 6.5 can corrode pipes and leach toxic heavy metals (lead, copper). Water with pH > 8.5 feels slippery, tastes bitter, and causes mineral encrustation.',
    recommendedTreatment: 'Soda ash / calcite injection for low pH; food-grade acid injection or reverse osmosis for high pH.'
  },
  {
    key: 'Hardness',
    label: 'Hardness (CaCO₃)',
    unit: 'mg/L',
    min: 0,
    max: 350,
    step: 1,
    defaultValue: 196,
    hint: 'Dissolved calcium & magnesium mineral salts',
    whoStandard: '< 300 mg/L',
    whoSafeMin: 0,
    whoSafeMax: 300,
    description: 'Aggregate dissolved polyvalent metallic ions, predominantly calcium and magnesium carbonates.',
    healthSignificance: 'Excess hardness causes severe scale build-up in boilers, heat exchangers, and household piping. Moderately hard water may offer protective cardiovascular benefits.',
    recommendedTreatment: 'Ion-exchange resin water softeners, nanofiltration, or polyphosphate sequestration.'
  },
  {
    key: 'Solids',
    label: 'Total Dissolved Solids (TDS)',
    unit: 'ppm',
    min: 0,
    max: 60000,
    step: 100,
    defaultValue: 22000,
    hint: 'Total organic & inorganic dissolved substances',
    whoStandard: '< 1,000 ppm (Ideal < 500)',
    whoSafeMin: 0,
    whoSafeMax: 1000,
    description: 'Total concentration of dissolved chemical compounds and salts including chlorides, calcium, magnesium, and sulfates.',
    healthSignificance: 'Elevated TDS (>1000 ppm) imparts unpalatable brackish or metallic taste, causes gastrointestinal distress, and can harbor toxic dissolved industrial minerals.',
    recommendedTreatment: 'Multi-stage Reverse Osmosis (RO) filtration or electrodialysis reversal.'
  },
  {
    key: 'Chloramines',
    label: 'Chloramines',
    unit: 'ppm (mg/L)',
    min: 0.0,
    max: 15.0,
    step: 0.1,
    defaultValue: 7.1,
    hint: 'Disinfectant compound formed from chlorine & ammonia',
    whoStandard: '< 4.0 ppm',
    whoSafeMin: 0,
    whoSafeMax: 4.0,
    description: 'Chlorine combined with ammonia used as a stable residual disinfectant in municipal drinking distribution grids.',
    healthSignificance: 'Concentrations above 4.0 mg/L cause mucous membrane irritation, eye inflammation, strong chemical odor, and potential anemia in dialysis patients.',
    recommendedTreatment: 'Granular Activated Carbon (GAC) filtration or sodium metabisulfite reduction.'
  },
  {
    key: 'Sulfate',
    label: 'Sulfate (SO₄²⁻)',
    unit: 'mg/L',
    min: 0,
    max: 500,
    step: 1,
    defaultValue: 333,
    hint: 'Naturally occurring mineral compound',
    whoStandard: '< 250 mg/L',
    whoSafeMin: 0,
    whoSafeMax: 250,
    description: 'Naturally occurring salts resulting from mineral deposits, atmospheric deposition, and industrial effluents.',
    healthSignificance: 'High levels (>250 mg/L) exert a temporary cathartic (laxative) effect, leading to dehydration and taste alteration, particularly in infants and non-acclimatized consumers.',
    recommendedTreatment: 'Reverse osmosis, ion-exchange demineralization, or distillation.'
  },
  {
    key: 'Conductivity',
    label: 'Electrical Conductivity (EC)',
    unit: 'μS/cm',
    min: 0,
    max: 800,
    step: 1,
    defaultValue: 426,
    hint: 'Capacity of water to carry electrical current',
    whoStandard: '< 400 μS/cm',
    whoSafeMin: 0,
    whoSafeMax: 400,
    description: 'Proxy measure of dissolved ionic salts and dissolved minerals directly proportional to ionic salinity.',
    healthSignificance: 'Surges in electrical conductivity often indicate agricultural runoff, sewage discharge, or seawater intrusion into freshwater aquifers.',
    recommendedTreatment: 'Reverse osmosis demineralization or continuous electrodeionization (CEDI).'
  },
  {
    key: 'Organic_carbon',
    label: 'Total Organic Carbon (TOC)',
    unit: 'ppm',
    min: 0.0,
    max: 30.0,
    step: 0.1,
    defaultValue: 14.3,
    hint: 'Organic matter from decaying flora or contamination',
    whoStandard: '< 4.0 ppm (Ideal < 2.0)',
    whoSafeMin: 0,
    whoSafeMax: 4.0,
    description: 'Direct measurement of total carbon tied up in organic compounds within the water column.',
    healthSignificance: 'TOC serves as food for microbial regrowth in pipe distribution networks and reacts with chlorine disinfectants to produce carcinogenic byproducts.',
    recommendedTreatment: 'Advanced oxidation processes (UV/H₂O₂), coagulation, or biological activated carbon.'
  },
  {
    key: 'Trihalomethanes',
    label: 'Trihalomethanes (THMs)',
    unit: 'μg/L (ppb)',
    min: 0,
    max: 140,
    step: 1,
    defaultValue: 66,
    hint: 'Disinfection byproducts (chloroform, bromoform)',
    whoStandard: '< 80 μg/L',
    whoSafeMin: 0,
    whoSafeMax: 80,
    description: 'Volatile halogenated disinfection byproducts generated when chlorine reacts with natural organic matter.',
    healthSignificance: 'Chronic ingestion of THMs over extended periods is classified as carcinogenic by the WHO and EPA, correlated with elevated bladder and colorectal cancer risks.',
    recommendedTreatment: 'Air stripping aeration towers, enhanced coagulation prior to chlorination, or granular carbon adsorption.'
  },
  {
    key: 'Turbidity',
    label: 'Turbidity',
    unit: 'NTU',
    min: 0.0,
    max: 8.0,
    step: 0.1,
    defaultValue: 3.97,
    hint: 'Water cloudiness / clarity measured in Nephelometric Turbidity Units',
    whoStandard: '< 5.0 NTU (Ideal < 1.0)',
    whoSafeMin: 0,
    whoSafeMax: 5.0,
    description: 'Optical measure of suspended silt, clay, microscopic colloids, and particulate matter scattering incident light.',
    healthSignificance: 'High turbidity shields waterborne pathogens (Cryptosporidium, Giardia, Salmonella) from ultraviolet radiation and chlorine disinfectant penetration.',
    recommendedTreatment: 'Flocculation, dual-media sand filtration, and ultrafiltration membrane cartridges (0.02 micron).'
  }
];

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'tap',
    name: 'Municipal Tap Water',
    icon: '🚰',
    tagline: 'Standard treated municipal distribution compliant with drinking standards',
    values: {
      ph: 7.2,
      Hardness: 185,
      Solids: 480,
      Chloramines: 2.1,
      Sulfate: 180,
      Conductivity: 320,
      Organic_carbon: 2.2,
      Trihalomethanes: 38,
      Turbidity: 1.1
    }
  },
  {
    id: 'spring',
    name: 'Pristine Mountain Spring',
    icon: '⛰️',
    tagline: 'Untouched alpine water with low turbidity and natural mineral balance',
    values: {
      ph: 7.5,
      Hardness: 140,
      Solids: 260,
      Chloramines: 0.3,
      Sulfate: 65,
      Conductivity: 195,
      Organic_carbon: 1.1,
      Trihalomethanes: 8,
      Turbidity: 0.6
    }
  },
  {
    id: 'industrial',
    name: 'Industrial Chemical Runoff',
    icon: '🏭',
    tagline: 'Severely contaminated effluent with toxic sulfates, chloramines & high TDS',
    values: {
      ph: 4.8,
      Hardness: 310,
      Solids: 38500,
      Chloramines: 11.2,
      Sulfate: 465,
      Conductivity: 740,
      Organic_carbon: 24.5,
      Trihalomethanes: 115,
      Turbidity: 6.8
    }
  },
  {
    id: 'stagnant',
    name: 'Stagnant Turbid Pond',
    icon: '🍂',
    tagline: 'High organic carbon, severe microbial shielding turbidity, and mineral build-up',
    values: {
      ph: 8.9,
      Hardness: 245,
      Solids: 24000,
      Chloramines: 5.8,
      Sulfate: 340,
      Conductivity: 590,
      Organic_carbon: 22.0,
      Trihalomethanes: 92,
      Turbidity: 6.4
    }
  },
  {
    id: 'ro_purified',
    name: 'Reverse Osmosis Purified',
    icon: '💎',
    tagline: 'Multi-stage ultra-filtered water with virtually zero dissolved minerals',
    values: {
      ph: 6.9,
      Hardness: 45,
      Solids: 85,
      Chloramines: 0.1,
      Sulfate: 18,
      Conductivity: 65,
      Organic_carbon: 0.4,
      Trihalomethanes: 4,
      Turbidity: 0.2
    }
  },
  {
    id: 'brackish_well',
    name: 'Brackish Agricultural Well',
    icon: '🌾',
    tagline: 'High salinity agricultural runoff with elevated sulfates and conductivity',
    values: {
      ph: 7.9,
      Hardness: 280,
      Solids: 32000,
      Chloramines: 6.5,
      Sulfate: 395,
      Conductivity: 680,
      Organic_carbon: 16.8,
      Trihalomethanes: 74,
      Turbidity: 4.2
    }
  }
];

export const DEFAULT_WATER_VALUES: WaterFeatures = {
  ph: 7.2,
  Hardness: 196,
  Solids: 22000,
  Chloramines: 7.1,
  Sulfate: 333,
  Conductivity: 426,
  Organic_carbon: 14.3,
  Trihalomethanes: 66,
  Turbidity: 3.97
};
