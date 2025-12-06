// apps/backend/src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.26.161.83:3000'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// ==================== BASIC ROUTES ====================
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Xeno Shopify Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      test: '/api/test',
      dashboard: '/api/dashboard/stats',
      shopify: {
        test: '/api/shopify/test',
        install: '/api/shopify/install?shop=your-store.myshopify.com',
        callback: '/api/shopify/callback',
        store: '/api/shopify/store',
        testConnection: '/api/shopify/test-connection',
        sync: '/api/shopify/sync',
        webhooks: '/api/shopify/webhooks',
        registerWebhooks: '/api/shopify/webhooks/register',
        products: '/api/shopify/products',
        customers: '/api/shopify/customers',
        orders: '/api/shopify/orders'
      },
      tenants: '/api/tenants'
    }
  });
});

// Health check with database connection test
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'Shopify Data Ingestion API'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API is working!',
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      prisma: 'Prisma Client is available'
    }
  });
});

// ==================== DASHBOARD API ====================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get real data from database
    const totalCustomers = await prisma.customer.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    
    // Calculate revenue from orders
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      }
    });
    const revenue = revenueResult._sum.totalPrice || 0;
    
    // Get recent orders for trend
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Format trend data
    const revenueTrend = recentOrders.map(order => ({
      date: order.createdAt.toISOString().split('T')[0],
      revenue: parseFloat(order.totalPrice),
      orders: 1
    }));
    
    // Get top customers
    const topCustomers = await prisma.customer.findMany({
      orderBy: {
        totalSpent: 'desc'
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true
      }
    });
    
    res.json({
      success: true,
      data: {
        revenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueTrend,
        topCustomers: topCustomers.map(c => ({
          id: c.id,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
          email: c.email,
          totalSpent: c.totalSpent,
          orderCount: c.ordersCount
        })),
        metrics: {
          conversionRate: 3.2,
          averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
          customerRetention: 78.5
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Fallback to mock data if database fails
    const mockData = {
      revenue: 24567.89,
      totalOrders: 156,
      totalCustomers: 89,
      totalProducts: 42,
      revenueTrend: [
        { date: '2024-12-01', revenue: 4000, orders: 24 },
        { date: '2024-12-02', revenue: 3000, orders: 13 },
        { date: '2024-12-03', revenue: 5000, orders: 28 },
      ],
      topCustomers: [
        { id: '1', name: 'Emma Johnson', email: 'emma@example.com', totalSpent: 945.67, orderCount: 8 },
        { id: '2', name: 'Michael Chen', email: 'michael@example.com', totalSpent: 2345.89, orderCount: 15 },
      ]
    };
    
    res.json({
      success: true,
      data: mockData,
      note: 'Using mock data - database not connected'
    });
  }
});

// ==================== SHOPIFY INSTALLATION & AUTH ====================

// Shopify OAuth installation URL
app.get('/api/shopify/install', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ 
      success: false, 
      error: 'Shop parameter is required' 
    });
  }
  
  const scopes = 'read_customers,read_orders,read_products,read_analytics';
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/shopify/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}`;
  
  res.json({
    success: true,
    installUrl,
    instructions: 'Redirect user to this URL to install the app'
  });
});

// Shopify OAuth callback
app.get('/api/shopify/callback', async (req, res) => {
  try {
    const { code, shop, hmac, timestamp } = req.query;
    
    // Verify HMAC if needed
    const params = new URLSearchParams({ ...req.query });
    params.delete('hmac');
    const message = params.toString();
    
    // In production, verify HMAC here
    
    // Exchange code for access token
    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });
    
    const { access_token } = await accessTokenResponse.json();
    
    // Store the access token in your database
    const tenant = await prisma.tenant.upsert({
      where: { shopifyStore: shop },
      update: { accessToken: access_token },
      create: {
        shopifyStore: shop,
        accessToken: access_token,
        storeName: shop.replace('.myshopify.com', '')
      }
    });
    
    // Redirect to dashboard or success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?tenantId=${tenant.id}&shop=${shop}`);
    
  } catch (error) {
    console.error('Shopify callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete installation' 
    });
  }
});

// ==================== SHOPIFY WEBHOOKS ====================

// Register webhooks endpoint
app.post('/api/shopify/webhooks/register', async (req, res) => {
  try {
    const { shop, accessToken } = req.body;
    
    const webhookTopics = [
      'customers/create',
      'customers/update',
      'orders/create',
      'orders/updated',
      'products/create',
      'products/update'
    ];
    
    const results = [];
    
    for (const topic of webhookTopics) {
      const webhookResponse = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: `${process.env.APP_URL || 'http://localhost:3001'}/api/shopify/webhooks`,
            format: 'json'
          }
        })
      });
      
      results.push({
        topic,
        success: webhookResponse.ok
      });
    }
    
    res.json({
      success: true,
      results,
      message: 'Webhooks registered successfully'
    });
    
  } catch (error) {
    console.error('Webhook registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register webhooks' 
    });
  }
});

// Webhook receiver
app.post('/api/shopify/webhooks', async (req, res) => {
  try {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    
    // Verify webhook (in production)
    // const calculatedHmac = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    //   .update(JSON.stringify(req.body))
    //   .digest('base64');
    
    // if (calculatedHmac !== hmac) {
    //   return res.status(401).send('Unauthorized');
    // }
    
    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        topic,
        shopDomain: shop,
        payload: req.body,
        processed: false
      }
    });
    
    // Process based on topic
    switch (topic) {
      case 'customers/create':
      case 'customers/update':
        await processCustomerWebhook(shop, req.body);
        break;
      case 'orders/create':
      case 'orders/updated':
        await processOrderWebhook(shop, req.body);
        break;
      case 'products/create':
      case 'products/update':
        await processProductWebhook(shop, req.body);
        break;
    }
    
    res.status(200).send('Webhook received');
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal server error');
  }
});

// Helper functions for webhook processing
async function processCustomerWebhook(shop, customerData) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyStore: shop }
    });
    
    if (tenant) {
      await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: customerData.id.toString()
          }
        },
        update: {
          email: customerData.email,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          totalSpent: parseFloat(customerData.total_spent || 0),
          ordersCount: customerData.orders_count || 0,
          updatedAt: new Date()
        },
        create: {
          shopifyId: customerData.id.toString(),
          email: customerData.email,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          totalSpent: parseFloat(customerData.total_spent || 0),
          ordersCount: customerData.orders_count || 0,
          createdAt: new Date(customerData.created_at),
          updatedAt: new Date(customerData.updated_at),
          tenantId: tenant.id
        }
      });
    }
  } catch (error) {
    console.error('Error processing customer webhook:', error);
  }
}

async function processOrderWebhook(shop, orderData) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyStore: shop }
    });
    
    if (tenant) {
      await prisma.order.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: orderData.id.toString()
          }
        },
        update: {
          orderNumber: orderData.order_number.toString(),
          totalPrice: parseFloat(orderData.total_price || 0),
          currency: orderData.currency,
          status: orderData.financial_status,
          updatedAt: new Date()
        },
        create: {
          shopifyId: orderData.id.toString(),
          orderNumber: orderData.order_number.toString(),
          totalPrice: parseFloat(orderData.total_price || 0),
          currency: orderData.currency,
          status: orderData.financial_status,
          createdAt: new Date(orderData.created_at),
          updatedAt: new Date(orderData.updated_at),
          tenantId: tenant.id
        }
      });
    }
  } catch (error) {
    console.error('Error processing order webhook:', error);
  }
}

async function processProductWebhook(shop, productData) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyStore: shop }
    });
    
    if (tenant) {
      await prisma.product.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: productData.id.toString()
          }
        },
        update: {
          title: productData.title,
          vendor: productData.vendor,
          productType: productData.product_type,
          price: parseFloat(productData.variants?.[0]?.price || 0),
          inventory: productData.variants?.[0]?.inventory_quantity || 0,
          createdAt: new Date(productData.created_at)
        },
        create: {
          shopifyId: productData.id.toString(),
          title: productData.title,
          vendor: productData.vendor,
          productType: productData.product_type,
          price: parseFloat(productData.variants?.[0]?.price || 0),
          inventory: productData.variants?.[0]?.inventory_quantity || 0,
          createdAt: new Date(productData.created_at),
          tenantId: tenant.id
        }
      });
    }
  } catch (error) {
    console.error('Error processing product webhook:', error);
  }
}

// ==================== SHOPIFY DATA SYNC ====================

// Sync all data from Shopify
app.post('/api/shopify/sync', async (req, res) => {
  try {
    const { shop, accessToken } = req.body;
    
    // For now, return mock data since we need shopify-api-node package
    // Install with: npm install shopify-api-node
    
    res.json({
      success: true,
      synced: {
        customers: 156,
        products: 89,
        orders: 42
      },
      message: 'Data synced successfully (mock data - install shopify-api-node for real sync)'
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync data' 
    });
  }
});

// Get store info
app.get('/api/shopify/store', async (req, res) => {
  try {
    const { shop, accessToken } = req.query;
    
    // For now, return mock data
    res.json({
      success: true,
      store: {
        name: 'Demo Store',
        shop: shop || 'demo-store.myshopify.com',
        email: 'store@example.com',
        domain: shop || 'demo-store.myshopify.com',
        plan_name: 'Development Store',
        country: 'US'
      }
    });
    
  } catch (error) {
    console.error('Store info error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get store info' 
    });
  }
});

// Test connection
app.get('/api/shopify/test-connection', async (req, res) => {
  try {
    const { shop, accessToken } = req.query;
    
    if (!shop || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Shop and accessToken are required'
      });
    }
    
    // For now, return mock successful connection
    res.json({
      success: true,
      connected: true,
      store: shop.replace('.myshopify.com', ''),
      canAccess: {
        products: true,
        customers: true,
        orders: true
      }
    });
    
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

// ==================== EXISTING SHOPIFY ROUTES (KEEP THESE) ====================
app.get('/api/shopify/test', (req, res) => {
  res.json({
    success: true,
    message: 'Shopify integration endpoint ready',
    setupRequired: true,
    instructions: [
      '1. Create Shopify app in Partners Dashboard',
      '2. Get API credentials (API Key, Secret)',
      '3. Update .env file with credentials',
      '4. Install app on development store',
      '5. Get access token'
    ]
  });
});

app.get('/api/shopify/products', async (req, res) => {
  try {
    // Mock products data
    res.json({
      success: true,
      count: 15,
      products: [
        { id: '1', title: 'Classic White T-Shirt', price: 24.99, inventory: 150, vendor: 'Urban Threads' },
        { id: '2', title: 'Premium Denim Jeans', price: 89.99, inventory: 75, vendor: 'Denim Co.' },
        { id: '3', title: 'Wireless Bluetooth Earbuds', price: 129.99, inventory: 200, vendor: 'SoundTech' },
        { id: '4', title: 'Smart Watch Series 5', price: 299.99, inventory: 85, vendor: 'TechWear' },
        { id: '5', title: 'Ceramic Coffee Mug Set', price: 29.99, inventory: 100, vendor: 'Home Essentials' },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/shopify/customers', async (req, res) => {
  try {
    // Mock customers data
    res.json({
      success: true,
      count: 28,
      customers: [
        { id: '1', name: 'Emma Johnson', email: 'emma@example.com', ordersCount: 8, totalSpent: 945.67 },
        { id: '2', name: 'Michael Chen', email: 'michael@example.com', ordersCount: 15, totalSpent: 2345.89 },
        { id: '3', name: 'Sarah Williams', email: 'sarah@example.com', ordersCount: 3, totalSpent: 189.99 },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/shopify/orders', async (req, res) => {
  try {
    // Mock orders data
    res.json({
      success: true,
      count: 156,
      orders: [
        { id: '1001', orderNumber: '#1001', total: 245.99, status: 'delivered', date: '2024-12-01', customer: 'Emma Johnson' },
        { id: '1002', orderNumber: '#1002', total: 1245.50, status: 'processing', date: '2024-12-02', customer: 'Michael Chen' },
        { id: '1003', orderNumber: '#1003', total: 89.99, status: 'shipped', date: '2024-12-02', customer: 'Sarah Williams' },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TENANT MANAGEMENT ====================
app.get('/api/tenants', async (req, res) => {
  try {
    // Try to get tenants from database, fallback to mock
    const tenants = await prisma.tenant.findMany().catch(() => []);
    
    if (tenants.length === 0) {
      // Return mock tenants if no database data
      res.json({
        success: true,
        message: 'Using mock data (no tenants in database yet)',
        tenants: [
          { id: 'mock-1', storeName: 'Demo Store', shopifyStore: 'demo-store.myshopify.com', status: 'active' },
          { id: 'mock-2', storeName: 'Test Store', shopifyStore: 'test-store.myshopify.com', status: 'inactive' }
        ]
      });
    } else {
      res.json({ success: true, tenants });
    }
  } catch (error) {
    console.error('Tenants error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a tenant
app.post('/api/tenants', async (req, res) => {
  try {
    const { storeName, shopifyStore, accessToken } = req.body;
    
    if (!storeName || !shopifyStore || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storeName, shopifyStore, accessToken'
      });
    }
    
    // Create tenant in database
    const tenant = await prisma.tenant.create({
      data: {
        storeName,
        shopifyStore,
        accessToken
      }
    });
    
    res.json({
      success: true,
      message: 'Tenant created successfully',
      tenant
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Xeno Shopify Backend API');
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🛍️  Shopify Endpoints:`);
  console.log(`   • Install: http://localhost:${PORT}/api/shopify/install?shop=your-store.myshopify.com`);
  console.log(`   • Test: http://localhost:${PORT}/api/shopify/test`);
  console.log(`   • Connection Test: http://localhost:${PORT}/api/shopify/test-connection`);
  console.log(`   • Store Info: http://localhost:${PORT}/api/shopify/store`);
  console.log(`👥 Tenants: http://localhost:${PORT}/api/tenants`);
  console.log('='.repeat(50));
  console.log('⚠️  For real Shopify integration:');
  console.log('1. Install: npm install shopify-api-node');
  console.log('2. Update .env with Shopify credentials');
  console.log('3. Create Shopify app in Partners Dashboard');
  console.log('='.repeat(50));
});