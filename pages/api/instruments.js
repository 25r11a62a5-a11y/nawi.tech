/**
 * GET /api/instruments — List instruments
 * POST /api/instruments — Add new instrument
 */

const mockInstruments = [
  { id: 'inst-001', manufacturer: 'Mettler Toledo', model: 'ME204', serialNumber: 'SN-001', accuracyClass: 'I', maxCapacity: 220, minCapacity: 0.01, e: 0.001 },
  { id: 'inst-002', manufacturer: 'Essae Teraoka', model: 'DS-852', serialNumber: 'SN-002', accuracyClass: 'III', maxCapacity: 30000, minCapacity: 10, e: 1 },
  { id: 'inst-003', manufacturer: 'CAS', model: 'CI-2001A', serialNumber: 'SN-003', accuracyClass: 'III', maxCapacity: 150000, minCapacity: 200, e: 20 },
  { id: 'inst-004', manufacturer: 'Avery Berkel', model: 'FX120i', serialNumber: 'SN-004', accuracyClass: 'II', maxCapacity: 120000, minCapacity: 100, e: 10 },
  { id: 'inst-005', manufacturer: 'Sartorius', model: 'Quintix 224-1S', serialNumber: 'SN-005', accuracyClass: 'I', maxCapacity: 220, minCapacity: 0.001, e: 0.0001 },
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: mockInstruments, total: mockInstruments.length });
  }
  if (req.method === 'POST') {
    const { manufacturer, model, serialNumber, accuracyClass, maxCapacity, minCapacity, e } = req.body;
    if (!manufacturer || !model || !serialNumber || !accuracyClass) {
      return res.status(400).json({ error: 'manufacturer, model, serialNumber, and accuracyClass are required.' });
    }
    const newInstrument = { id: `inst-${Date.now()}`, manufacturer, model, serialNumber, accuracyClass, maxCapacity, minCapacity, e };
    return res.status(201).json({ success: true, data: newInstrument });
  }
  return res.status(405).json({ error: 'Method not allowed.' });
}
