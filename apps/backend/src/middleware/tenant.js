// apps/backend/src/middleware/tenant.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tenantMiddleware = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    req.tenant = tenant;
    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = tenantMiddleware;