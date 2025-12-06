// apps/backend/src/routes/webhooks.js
const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const ShopifyService = require('../services/shopifyService');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/shopify/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];

    // Verify webhook
    const calculatedHmac = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(JSON.stringify(req.body))
      .digest('base64');

    if (calculatedHmac !== hmac) {
      return res.status(401).send('Unauthorized');
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        topic,
        shopDomain: shop,
        payload: req.body
      }
    });

    // Process based on topic
    switch (topic) {
      case 'customers/create':
      case 'customers/update':
        await processCustomerUpdate(tenantId, req.body);
        break;
      case 'orders/create':
      case 'orders/updated':
        await processOrderUpdate(tenantId, req.body);
        break;
      case 'products/create':
      case 'products/update':
        await processProductUpdate(tenantId, req.body);
        break;
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

async function processCustomerUpdate(tenantId, customerData) {
  // Update customer in database
}

async function processOrderUpdate(tenantId, orderData) {
  // Update order in database
}

async function processProductUpdate(tenantId, productData) {
  // Update product in database
}

module.exports = router;