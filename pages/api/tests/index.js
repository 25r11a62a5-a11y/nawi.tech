/**
 * GET /api/tests — List test sessions
 * POST /api/tests — Create new test session
 */

const mockTests = [
  { id: 'TR-2026-001', instrument_id: 'inst-001', instrumentModel: 'Mettler Toledo ME204', accuracyClass: 'I', inspectorName: 'Rajesh Kumar', date: '2026-09-07T10:30:00Z', status: 'PASS', complianceScore: 94 },
  { id: 'TR-2026-002', instrument_id: 'inst-002', instrumentModel: 'Essae DS-852', accuracyClass: 'III', inspectorName: 'Priya Sharma', date: '2026-09-07T09:15:00Z', status: 'FAIL', complianceScore: 42 },
  { id: 'TR-2026-003', instrument_id: 'inst-003', instrumentModel: 'CAS CI-2001A', accuracyClass: 'III', inspectorName: 'Amit Patel', date: '2026-09-06T14:00:00Z', status: 'PASS', complianceScore: 89 },
  { id: 'TR-2026-004', instrument_id: 'inst-004', instrumentModel: 'Avery Berkel FX120i', accuracyClass: 'II', inspectorName: 'Sanjay Gupta', date: '2026-09-05T11:00:00Z', status: 'FAIL', complianceScore: 55 },
  { id: 'TR-2026-005', instrument_id: 'inst-005', instrumentModel: 'Sartorius Quintix 224-1S', accuracyClass: 'I', inspectorName: 'Neha Joshi', date: '2026-09-04T08:45:00Z', status: 'PASS', complianceScore: 97 },
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { page = 1, limit = 20, status } = req.query;
    let tests = mockTests;
    if (status) tests = tests.filter(t => t.status === status.toUpperCase());
    const start = (Number(page) - 1) * Number(limit);
    return res.status(200).json({
      success: true,
      data: tests.slice(start, start + Number(limit)),
      total: tests.length,
      page: Number(page),
    });
  }

  if (req.method === 'POST') {
    try {
      const { instrumentId, inspectorName, temperature, humidity, barometricPressure } = req.body;
      if (!instrumentId || !inspectorName) {
        return res.status(400).json({ error: 'instrumentId and inspectorName are required.' });
      }
      const newSession = {
        id: `TR-${Date.now()}`,
        instrument_id: instrumentId,
        inspectorName,
        temperature: temperature || null,
        humidity: humidity || null,
        barometricPressure: barometricPressure || null,
        date: new Date().toISOString(),
        status: 'IN_PROGRESS',
        complianceScore: null,
      };
      return res.status(201).json({ success: true, data: newSession });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
