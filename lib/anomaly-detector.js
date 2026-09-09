/**
 * AI/ML Anomaly Detection Engine
 * Statistical anomaly detection for NAWI measurement data
 * Uses IQR outlier detection, linear regression drift detection, and skewness analysis
 */

/**
 * Extract statistical features from a set of readings.
 */
export function extractFeatures(readings) {
  const n = readings.length;
  const sorted = [...readings].sort((a, b) => a - b);
  const mean = readings.reduce((a, b) => a + b, 0) / n;
  const variance = readings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const skewness = stdDev > 0
    ? readings.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n
    : 0;
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;
  return { mean, stdDev, variance, min, max, range, median, q1, q3, iqr, skewness, cv, n };
}

/**
 * Calculate linear trend slope using least-squares regression.
 */
export function calculateTrend(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  const numerator = xs.reduce((sum, x, i) => sum + (x - xMean) * (values[i] - yMean), 0);
  const denominator = xs.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
  return denominator !== 0 ? numerator / denominator : 0;
}

/**
 * Detect anomalies in measurement data.
 * @param {Array<{readings: number[], nominalLoad: number}>} measurements
 */
export function detectAnomalies(measurements) {
  const anomalies = [];
  let anomalyScore = 0;

  measurements.forEach((measurement, idx) => {
    const { readings, nominalLoad } = measurement;
    const features = extractFeatures(readings);

    // Check 1: High internal variation
    if (features.stdDev > 0.01) {
      anomalies.push({
        type: 'HIGH_VARIATION',
        severity: features.stdDev > 0.05 ? 'HIGH' : 'MEDIUM',
        measurementIndex: idx,
        nominalLoad,
        detail: `Standard deviation ${features.stdDev.toFixed(4)} exceeds threshold 0.01`,
        recommendation: 'Check for vibration; ensure scale is on a stable, level surface.',
      });
      anomalyScore += features.stdDev > 0.05 ? 0.3 : 0.15;
    }

    // Check 2: Outlier detection using IQR
    const lowerBound = features.q1 - 1.5 * features.iqr;
    const upperBound = features.q3 + 1.5 * features.iqr;
    readings.forEach((r, rIdx) => {
      if (r < lowerBound || r > upperBound) {
        anomalies.push({
          type: 'OUTLIER_READING',
          severity: 'HIGH',
          measurementIndex: idx,
          readingIndex: rIdx,
          value: r,
          detail: `Reading ${r} is an outlier (bounds: [${lowerBound.toFixed(4)}, ${upperBound.toFixed(4)}])`,
          recommendation: 'Repeat measurement. Outlier may indicate mechanical disturbance.',
        });
        anomalyScore += 0.25;
      }
    });

    // Check 3: Asymmetric distribution (skewness)
    if (Math.abs(features.skewness) > 2) {
      anomalies.push({
        type: 'ASYMMETRIC_READINGS',
        severity: 'MEDIUM',
        measurementIndex: idx,
        nominalLoad,
        detail: `Skewness ${features.skewness.toFixed(3)} indicates asymmetric distribution`,
        recommendation: 'Verify scale zeroing and check for load eccentricity.',
      });
      anomalyScore += 0.1;
    }
  });

  // Check 4: Drift detection across measurement points
  if (measurements.length >= 3) {
    const means = measurements.map(m => m.readings.reduce((a, b) => a + b, 0) / m.readings.length);
    const errors = measurements.map((m, i) => means[i] - (m.nominalLoad || 0));
    const slope = calculateTrend(errors);
    if (Math.abs(slope) > 0.002) {
      anomalies.push({
        type: 'DRIFT_DETECTED',
        severity: Math.abs(slope) > 0.01 ? 'HIGH' : 'MEDIUM',
        slope: Number(slope.toFixed(6)),
        detail: `Error drift slope = ${slope.toFixed(6)} per load point`,
        recommendation: 'Instrument shows systematic drift. Schedule calibration immediately.',
      });
      anomalyScore += Math.abs(slope) > 0.01 ? 0.4 : 0.2;
    }
  }

  return { anomalies, anomalyScore: Number(Math.min(anomalyScore, 1.0).toFixed(4)) };
}

/**
 * Predict compliance status using anomaly scoring.
 */
export function predictComplianceStatus(measurements, instrumentClass) {
  const { anomalies, anomalyScore } = detectAnomalies(measurements);
  let prediction, confidence;
  if (anomalyScore > 0.6) {
    prediction = 'FAIL'; confidence = 80;
  } else if (anomalyScore > 0.3) {
    prediction = 'REVIEW'; confidence = 70;
  } else {
    prediction = 'PASS'; confidence = 85;
  }
  return {
    prediction,
    confidence,
    anomalyScore,
    anomalies,
    note: 'Preliminary prediction only. Final status is determined by OIML R-76 engine.',
  };
}

/**
 * Get a human-readable summary of anomaly detection results.
 */
export function getAnomalySummary(detectionResult) {
  const { anomalies, anomalyScore } = detectionResult;
  const high = anomalies.filter(a => a.severity === 'HIGH').length;
  const medium = anomalies.filter(a => a.severity === 'MEDIUM').length;
  return {
    totalAnomalies: anomalies.length,
    highSeverity: high,
    mediumSeverity: medium,
    anomalyScore,
    riskLevel: anomalyScore > 0.6 ? 'HIGH' : anomalyScore > 0.3 ? 'MEDIUM' : 'LOW',
    summary: anomalies.length === 0
      ? 'No anomalies detected. Measurements appear stable.'
      : `Detected ${anomalies.length} anomaly(ies): ${high} high, ${medium} medium severity.`,
  };
}
