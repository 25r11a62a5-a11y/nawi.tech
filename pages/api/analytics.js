/**
 * GET /api/analytics
 * Returns full analytics dashboard: stats, rankings, failures, maintenance, trends
 */
import { rankInstruments, analyzeFailures, predictMaintenance, analyzeTrends, getDashboardStats } from '../../lib/analytics-engine';

// Realistic mock test history — replace with DB query in production
const MOCK_TEST_HISTORY = [
  { instrument_id: 'inst-001', instrumentModel: 'Mettler Toledo ME204', manufacturer: 'Mettler Toledo', serialNumber: 'SN-001', date: '2026-07-10', status: 'PASS', uncertainty: 0.002 },
  { instrument_id: 'inst-001', instrumentModel: 'Mettler Toledo ME204', manufacturer: 'Mettler Toledo', serialNumber: 'SN-001', date: '2026-07-20', status: 'PASS', uncertainty: 0.0022 },
  { instrument_id: 'inst-001', instrumentModel: 'Mettler Toledo ME204', manufacturer: 'Mettler Toledo', serialNumber: 'SN-001', date: '2026-08-05', status: 'PASS', uncertainty: 0.0025 },
  { instrument_id: 'inst-002', instrumentModel: 'Essae DS-852', manufacturer: 'Essae Teraoka', serialNumber: 'SN-002', date: '2026-07-12', status: 'FAIL', uncertainty: 0.008, failureReason: 'Repeatability' },
  { instrument_id: 'inst-002', instrumentModel: 'Essae DS-852', manufacturer: 'Essae Teraoka', serialNumber: 'SN-002', date: '2026-08-01', status: 'FAIL', uncertainty: 0.009, failureReason: 'Calibration Drift' },
  { instrument_id: 'inst-002', instrumentModel: 'Essae DS-852', manufacturer: 'Essae Teraoka', serialNumber: 'SN-002', date: '2026-08-15', status: 'PASS', uncertainty: 0.007 },
  { instrument_id: 'inst-003', instrumentModel: 'CAS CI-2001A', manufacturer: 'CAS', serialNumber: 'SN-003', date: '2026-06-20', status: 'PASS', uncertainty: 0.003 },
  { instrument_id: 'inst-003', instrumentModel: 'CAS CI-2001A', manufacturer: 'CAS', serialNumber: 'SN-003', date: '2026-07-15', status: 'PASS', uncertainty: 0.0032 },
  { instrument_id: 'inst-003', instrumentModel: 'CAS CI-2001A', manufacturer: 'CAS', serialNumber: 'SN-003', date: '2026-08-10', status: 'PASS', uncertainty: 0.0034 },
  { instrument_id: 'inst-004', instrumentModel: 'Avery Berkel FX120i', manufacturer: 'Avery Berkel', serialNumber: 'SN-004', date: '2026-07-01', status: 'FAIL', uncertainty: 0.011, failureReason: 'Mechanical Wear' },
  { instrument_id: 'inst-004', instrumentModel: 'Avery Berkel FX120i', manufacturer: 'Avery Berkel', serialNumber: 'SN-004', date: '2026-07-25', status: 'FAIL', uncertainty: 0.013, failureReason: 'Repeatability' },
  { instrument_id: 'inst-005', instrumentModel: 'Sartorius Quintix 224-1S', manufacturer: 'Sartorius', serialNumber: 'SN-005', date: '2026-08-20', status: 'PASS', uncertainty: 0.0015 },
  { instrument_id: 'inst-005', instrumentModel: 'Sartorius Quintix 224-1S', manufacturer: 'Sartorius', serialNumber: 'SN-005', date: '2026-08-28', status: 'PASS', uncertainty: 0.0016 },
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }
  try {
    const stats = getDashboardStats(MOCK_TEST_HISTORY);
    const { rankings, topPerformer, atRisk } = rankInstruments(MOCK_TEST_HISTORY);
    const failures = analyzeFailures(MOCK_TEST_HISTORY);
    const maintenance = predictMaintenance(MOCK_TEST_HISTORY);
    const trends = analyzeTrends(MOCK_TEST_HISTORY);
    return res.status(200).json({
      success: true,
      data: { stats, rankings, topPerformer, atRisk, failures, maintenance, trends },
    });
  } catch (error) {
    console.error('[/api/analytics] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
