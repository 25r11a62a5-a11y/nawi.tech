/**
 * OIML R-76 Validation Engine
 * Core compliance calculation engine for Non-Automatic Weighing Instruments
 * Implements OIML R 76-1 (2006) standard
 */

// Maximum Permissible Errors per OIML R-76-1 Table 6 (in units of e)
export const OIML_MPE = {
  I:    { repeatability: 0.0005, reproducibility: 0.001 },
  II:   { repeatability: 0.0025, reproducibility: 0.005 },
  III:  { repeatability: 0.005,  reproducibility: 0.01  },
  IIII: { repeatability: 0.01,   reproducibility: 0.02  },
};

// Load boundaries (in units of e) for MPE calculation per OIML R-76-1 Table 6
const MPE_LOAD_BOUNDARIES = {
  I: [
    { max: 50000,    mpe: 0.5 },
    { max: 200000,   mpe: 1.0 },
    { max: Infinity, mpe: 1.5 },
  ],
  II: [
    { max: 5000,     mpe: 0.5 },
    { max: 20000,    mpe: 1.0 },
    { max: 100000,   mpe: 1.5 },
  ],
  III: [
    { max: 500,      mpe: 0.5 },
    { max: 2000,     mpe: 1.0 },
    { max: 10000,    mpe: 1.5 },
  ],
  IIII: [
    { max: 50,       mpe: 0.5 },
    { max: 200,      mpe: 1.0 },
    { max: 1000,     mpe: 1.5 },
  ],
};

/**
 * Get MPE in units of e for a given load and class.
 */
export function getMPEInE(loadInE, instrumentClass) {
  const boundaries = MPE_LOAD_BOUNDARIES[instrumentClass] || MPE_LOAD_BOUNDARIES['III'];
  for (const boundary of boundaries) {
    if (loadInE <= boundary.max) return boundary.mpe;
  }
  return 1.5;
}

/**
 * Calculates repeatability (standard deviation) from an array of readings.
 */
export function calculateRepeatability(readings) {
  if (!readings || readings.length < 3) {
    throw new Error('At least 3 readings are required for repeatability calculation');
  }
  const n = readings.length;
  const mean = readings.reduce((sum, r) => sum + r, 0) / n;
  const variance = readings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates measurement uncertainty (Type A, Bayesian 95% coverage).
 */
export function calculateUncertainty(readings) {
  const n = readings.length;
  const stdDev = calculateRepeatability(readings);
  const randomUncertainty = stdDev / Math.sqrt(n);
  const systematicUncertainty = stdDev * 0.5;
  const combined = Math.sqrt(Math.pow(randomUncertainty, 2) + Math.pow(systematicUncertainty, 2));
  const coverageFactor = 2; // 95% confidence
  return {
    random: Number(randomUncertainty.toFixed(6)),
    systematic: Number(systematicUncertainty.toFixed(6)),
    combined: Number(combined.toFixed(6)),
    expanded: Number((combined * coverageFactor).toFixed(6)),
    confidenceLevel: 95,
  };
}

/**
 * Calculates reproducibility from multiple measurement sets.
 */
export function calculateReproducibility(measurementSets) {
  if (!measurementSets || measurementSets.length < 2) return 0;
  const setMeans = measurementSets.map(set => set.reduce((a, b) => a + b, 0) / set.length);
  return calculateRepeatability(setMeans);
}

/**
 * Main OIML R-76 compliance validation function.
 * @param {Array<{readings: number[], nominalLoad: number, e: number}>} measurements
 * @param {string} instrumentClass - 'I'|'II'|'III'|'IIII'
 * @returns {Object} Full validation result
 */
export function validateCompliance(measurements, instrumentClass) {
  if (!measurements || measurements.length === 0) {
    throw new Error('No measurements provided');
  }
  if (!OIML_MPE[instrumentClass]) {
    throw new Error(`Invalid instrument class: ${instrumentClass}`);
  }

  const limits = OIML_MPE[instrumentClass];
  const results = [];
  let overallPass = true;
  let totalScore = 0;

  for (const measurement of measurements) {
    const { readings, nominalLoad, e = 1 } = measurement;
    const repeatability = calculateRepeatability(readings);
    const uncertainty = calculateUncertainty(readings);
    const loadInE = nominalLoad / e;
    const mpeInE = getMPEInE(loadInE, instrumentClass);
    const mpeValue = mpeInE * e;

    const meanReading = readings.reduce((a, b) => a + b, 0) / readings.length;
    const error = meanReading - nominalLoad;

    const repeatabilityPass = repeatability <= limits.repeatability;
    const errorPass = Math.abs(error) <= mpeValue;
    const pointPass = repeatabilityPass && errorPass;

    if (!pointPass) overallPass = false;

    const pointScore = (repeatabilityPass ? 50 : 0) + (errorPass ? 50 : 0);
    totalScore += pointScore;

    results.push({
      nominalLoad,
      e,
      meanReading: Number(meanReading.toFixed(6)),
      error: Number(error.toFixed(6)),
      repeatability: Number(repeatability.toFixed(6)),
      mpeAllowed: mpeValue,
      mpeInE,
      uncertainty,
      repeatabilityPass,
      errorPass,
      pass: pointPass,
      score: pointScore,
    });
  }

  const complianceScore = Math.round(totalScore / measurements.length);
  const reproducibilityValue = measurements.length > 1
    ? calculateReproducibility(measurements.map(m => m.readings))
    : 0;
  const reproducibilityPass = reproducibilityValue <= limits.reproducibility;
  if (!reproducibilityPass) overallPass = false;

  const recommendations = [];
  if (!overallPass) {
    if (results.some(r => !r.repeatabilityPass)) {
      recommendations.push('Repeatability test failed: Check for environmental vibration and ensure the instrument is stable.');
    }
    if (results.some(r => !r.errorPass)) {
      recommendations.push('Error exceeds MPE: Calibration adjustment or servicing required.');
    }
    if (!reproducibilityPass) {
      recommendations.push('Reproducibility failed: Investigate systematic errors between test sets.');
    }
  }

  return {
    instrumentClass,
    overall_status: overallPass ? 'PASS' : 'FAIL',
    complianceScore,
    reproducibilityValue: Number(reproducibilityValue.toFixed(6)),
    reproducibilityPass,
    limits,
    testPoints: results,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quick single-point validation.
 */
export function quickValidate(measurement, instrumentClass) {
  try {
    const { readings, nominalLoad, e = 1 } = measurement;
    const repeatability = calculateRepeatability(readings);
    const limits = OIML_MPE[instrumentClass];
    const loadInE = nominalLoad / e;
    const mpeInE = getMPEInE(loadInE, instrumentClass);
    const mpeValue = mpeInE * e;
    const meanReading = readings.reduce((a, b) => a + b, 0) / readings.length;
    const error = Math.abs(meanReading - nominalLoad);
    return repeatability <= limits.repeatability && error <= mpeValue;
  } catch {
    return false;
  }
}

/**
 * Validates a single load test point per OIML R-76 changeover point formula:
 * P = I + 0.5e - dL
 * E = P - L
 * Ec = E - E0
 */
export function validateTestPoint(L, I, dL, e, instrumentClass = 'III', E0 = 0) {
  const P = Number((I + 0.5 * e - dL).toFixed(4));
  const E = Number((P - L).toFixed(4));
  const Ec = Number((E - E0).toFixed(4));
  const loadInE = L / e;
  const mpeInE = getMPEInE(loadInE, instrumentClass);
  const mpeAllowed = Number((mpeInE * e).toFixed(4));
  const isPass = Math.abs(Ec) <= mpeAllowed;

  return {
    P,
    E,
    Ec,
    mpeAllowed,
    isPass
  };
}

