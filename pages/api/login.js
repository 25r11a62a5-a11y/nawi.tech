/**
 * POST /api/login
 * Authenticates Employee (Inspector) or Manager (Lab Admin)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Pre-configured accounts for hackathon demo & production testing
  const USERS = [
    {
      username: 'employee',
      password: 'password123',
      name: 'Rajesh Kumar',
      role: 'EMPLOYEE',
      title: 'Field Metrology Inspector',
      badgeId: 'LM-IN-2026-042',
      department: 'Legal Metrology Department'
    },
    {
      username: 'inspector',
      password: 'password123',
      name: 'Priya Sharma',
      role: 'EMPLOYEE',
      title: 'Senior Verification Officer',
      badgeId: 'LM-IN-2026-088',
      department: 'Legal Metrology Department'
    },
    {
      username: 'manager',
      password: 'admin123',
      name: 'Dr. Vikramaditya Roy',
      role: 'MANAGER',
      title: 'Laboratory Director & Chief Manager',
      badgeId: 'LM-MGR-2026-001',
      department: 'National Metrology Institute'
    },
    {
      username: 'admin',
      password: 'admin123',
      name: 'System Administrator',
      role: 'MANAGER',
      title: 'Super Administrator',
      badgeId: 'LM-ADMIN-000',
      department: 'Quality Assurance & Calibration'
    }
  ];

  const user = USERS.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: 'Invalid username or password. Please use demo credentials:\n• Employee: employee / password123\n• Manager: manager / admin123'
    });
  }

  // Omit password from returned payload
  const { password: _, ...userSession } = user;

  return res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: userSession,
    token: `jwt_token_demo_${Date.now()}`
  });
}
