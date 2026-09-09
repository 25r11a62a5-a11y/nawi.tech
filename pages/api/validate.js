/**
 * POST /api/validate
 * Runs OIML R-76 compliance validation on provided measurements
 * Input: { measurements: [{readings, nominalLoad, e}], instrumentClass: 'III' }
 */
import { validateCompliance } from '../../lib/oiml-engine';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  try {
    const { measurements, instrumentClass } = req.body;
    if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
      return res.status(400).json({ error: 'measurements array is required and must not be empty.' });
    }
    if (!instrumentClass || !['I', 'II', 'III', 'IIII'].includes(instrumentClass)) {
      return res.status(400).json({ error: 'instrumentClass must be one of: I, II, III, IIII' });
    }
    const result = validateCompliance(measurements, instrumentClass);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[/api/validate] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
