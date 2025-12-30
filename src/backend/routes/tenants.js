// backend/routes/tenants.js
import express from 'express';
const router = express.Router();

// Mock data - replace with database calls later
const mockTenants = [
  {
    id: 1,
    name: 'GLDMF',
    code: 'GLDMF',
    plan: 'Enterprise',
    status: 'Active',
    users: 127,
    created: '2024-01-01T00:00:00Z',
    contact: 'admin@gldmf.com',
    subscription: 'Annual',
    maxUsers: 500,
    features: ['loan_management', 'user_management', 'analytics']
  }
];

// GET /api/tenants - List all tenants
router.get('/', (req, res) => {
  try {
    res.json(mockTenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// GET /api/tenants/:id - Get specific tenant
router.get('/:id', (req, res) => {
  try {
    const tenant = mockTenants.find(t => t.id === parseInt(req.params.id));
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// POST /api/tenants - Create new tenant
router.post('/', (req, res) => {
  try {
    const { name, code, plan, contact } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const newTenant = {
      id: mockTenants.length + 1,
      name,
      code,
      plan: plan || 'Starter',
      status: 'Active',
      users: 0,
      created: new Date().toISOString(),
      contact: contact || '',
      subscription: 'Monthly',
      maxUsers: plan === 'Enterprise' ? 500 : plan === 'Professional' ? 100 : 10,
      features: []
    };

    mockTenants.push(newTenant);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

export default router;