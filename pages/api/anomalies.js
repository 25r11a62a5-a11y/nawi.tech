/**
 * POST /api/anomalies
 * Runs anomaly detection and returns compliance prediction
 */
import { detectAnomalies, predictComplianceStatus, getAnomalySummary } from '../../lib/anomaly-detector';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  try {
    const { measurements, instrumentClass = 'III' } = req.body;
    if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
      return res.status(400).json({ error: 'measurements array is required.' });
    }
    const detectionResult = detectAnomalies(measurements);
    const prediction = predictComplianceStatus(measurements, instrumentClass);
    const summary = getAnomalySummary(detectionResult);
    return res.status(200).json({
      success: true,
      data: { ...detectionResult, prediction, summary },
    });
  } catch (error) {
    console.error('[/api/anomalies] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
