/**
 * Smart Analytics Engine
 * Business intelligence for NAWI test history
 * Instrument ranking, failure analysis, predictive maintenance, compliance trends
 */

import { calculateTrend } from './anomaly-detector';

/**
 * Rank instruments by performance (pass rate + stability) over 90 days.
 */
export function rankInstruments(testHistory) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const byInstrument = {};

  testHistory.forEach(test => {
    const testDate = new Date(test.date || test.test_date || Date.now());
    if (testDate < ninetyDaysAgo) return;
    const key = test.instrument_id || test.instrumentId || 'unknown';
    if (!byInstrument[key]) {
      byInstrument[key] = {
        id: key,
        name: test.instrumentModel || test.model || key,
        serial: test.serialNumber || '',
        manufacturer: test.manufacturer || '',
        tests: [],
      };
    }
    byInstrument[key].tests.push(test);
  });

  const rankings = Object.values(byInstrument).map(inst => {
    const total = inst.tests.length;
    const passed = inst.tests.filter(t => t.status === 'PASS' || t.result === 'PASS').length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const uncertainties = inst.tests.filter(t => t.uncertainty != null).map(t => t.uncertainty);
    const avgUncertainty = uncertainties.length > 0
      ? uncertainties.reduce((a, b) => a + b, 0) / uncertainties.length : 0;
    const recentPassRates = inst.tests.slice(-5).map(t =>
      (t.status === 'PASS' || t.result === 'PASS') ? 100 : 0
    );
    const trend = calculateTrend(recentPassRates);
    const stabilityScore = Math.max(0, 100 - avgUncertainty * 1000);
    const score = passRate * 0.6 + stabilityScore * 0.4;
    return {
      id: inst.id,
      name: inst.name,
      serial: inst.serial,
      manufacturer: inst.manufacturer,
      totalTests: total,
      passedTests: passed,
      passRate: Number(passRate.toFixed(1)),
      averageUncertainty: Number(avgUncertainty.toFixed(6)),
      trend: trend > 0 ? 'IMPROVING' : trend < 0 ? 'DECLINING' : 'STABLE',
      trendValue: Number(trend.toFixed(4)),
      score: Number(score.toFixed(1)),
    };
  });

  rankings.sort((a, b) => b.score - a.score);
  return {
    rankings,
    topPerformer: rankings[0] || null,
    atRisk: rankings.filter(r => r.passRate < 70),
    totalInstruments: rankings.length,
  };
}

/**
 * Analyze failures and categorize root causes.
 */
export function analyzeFailures(testHistory) {
  const failures = testHistory.filter(t => t.status === 'FAIL' || t.result === 'FAIL');
  const causeCounts = {};
  const actionMap = {
    'Repeatability': 'Check leveling & environmental conditions',
    'Reproducibility': 'Perform multi-point calibration',
    'Linearity': 'Replace load cell or re-linearize',
    'Temperature Effect': 'Control lab temperature to 18–22°C',
    'Display Error': 'Inspect display module & software',
    'Mechanical Wear': 'Schedule preventive maintenance',
    'Calibration Drift': 'Immediate recalibration required',
    'Environmental': 'Mitigate vibration, EMI, and air currents',
  };
  const priorityMap = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  failures.forEach(f => {
    const reason = f.failureReason || 'Repeatability';
    causeCounts[reason] = (causeCounts[reason] || 0) + 1;
  });

  const causes = Object.entries(causeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cause, count], i) => ({
      cause,
      count,
      percentage: failures.length > 0 ? Number(((count / failures.length) * 100).toFixed(1)) : 0,
      priority: priorityMap[Math.min(i, 3)],
      action: actionMap[cause] || 'Investigate and service',
    }));

  return {
    totalFailures: failures.length,
    failureRate: testHistory.length > 0
      ? Number(((failures.length / testHistory.length) * 100).toFixed(1)) : 0,
    causes,
    mostCommonCause: causes[0] || null,
  };
}

/**
 * Predict maintenance needs based on uncertainty trends.
 */
export function predictMaintenance(testHistory) {
  const byInstrument = {};
  testHistory.forEach(t => {
    const key = t.instrument_id || t.instrumentId || 'unknown';
    if (!byInstrument[key]) byInstrument[key] = { id: key, name: t.instrumentModel || key, tests: [] };
    byInstrument[key].tests.push(t);
  });

  const predictions = [];
  Object.values(byInstrument).forEach(inst => {
    const recent = inst.tests.slice(-5);
    const uncertainties = recent.map(t => t.uncertainty || 0);
    const slope = calculateTrend(uncertainties);
    const latestUncertainty = uncertainties[uncertainties.length - 1] || 0;
    const threshold = 0.01;
    let daysToFailure = Infinity;
    if (slope > 0 && latestUncertainty > 0) {
      daysToFailure = Math.round((threshold - latestUncertainty) / slope);
    }
    const urgency = daysToFailure < 30 ? 'URGENT' : daysToFailure < 60 ? 'SOON' : 'NORMAL';
    predictions.push({
      instrumentId: inst.id,
      instrumentName: inst.name,
      currentUncertainty: Number(latestUncertainty.toFixed(6)),
      uncertaintyTrend: slope > 0.0001 ? 'INCREASING' : slope < -0.0001 ? 'DECREASING' : 'STABLE',
      estimatedDaysToMaintenance: daysToFailure === Infinity ? 'N/A' : daysToFailure,
      urgency,
      recommendation: urgency === 'URGENT'
        ? 'Schedule maintenance immediately'
        : urgency === 'SOON'
        ? 'Plan maintenance within 30 days'
        : 'Continue routine monitoring',
      estimatedCostSavings: urgency !== 'NORMAL' ? '₹15,000' : null,
    });
  });

  predictions.sort((a, b) => {
    const urgencyOrder = { URGENT: 0, SOON: 1, NORMAL: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
  return predictions;
}

/**
 * Analyze compliance trends month-by-month.
 */
export function analyzeTrends(testHistory) {
  const byMonth = {};
  testHistory.forEach(t => {
    const date = new Date(t.date || t.test_date || Date.now());
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[monthKey]) byMonth[monthKey] = { total: 0, passed: 0 };
    byMonth[monthKey].total++;
    if (t.status === 'PASS' || t.result === 'PASS') byMonth[monthKey].passed++;
  });

  const monthlyData = Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month,
      total: data.total,
      passed: data.passed,
      passRate: data.total > 0 ? Number(((data.passed / data.total) * 100).toFixed(1)) : 0,
    }));

  const passRates = monthlyData.map(m => m.passRate);
  const trendSlope = calculateTrend(passRates);
  const currentRate = passRates[passRates.length - 1] || 0;
  const projectedRate = Math.min(100, Math.max(0, currentRate + trendSlope * 3));

  return {
    monthlyData,
    overallTrend: trendSlope > 0.5 ? 'IMPROVING' : trendSlope < -0.5 ? 'DECLINING' : 'STABLE',
    trendMagnitude: Number(Math.abs(trendSlope).toFixed(2)),
    currentPassRate: currentRate,
    projectedPassRate: Number(projectedRate.toFixed(1)),
  };
}

/**
 * Get dashboard KPI statistics.
 */
export function getDashboardStats(testHistory) {
  const total = testHistory.length;
  const passed = testHistory.filter(t => t.status === 'PASS' || t.result === 'PASS').length;
  const failed = testHistory.filter(t => t.status === 'FAIL' || t.result === 'FAIL').length;
  const review = total - passed - failed;
  const passRate = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0;
  return { total, passed, failed, review, passRate, complianceScore: Math.round(passRate) };
}
