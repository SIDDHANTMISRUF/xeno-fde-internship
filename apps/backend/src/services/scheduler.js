// apps/backend/src/services/scheduler.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const ShopifyService = require('./shopifyService');

const prisma = new PrismaClient();

class DataScheduler {
  constructor() {
    this.initScheduler();
  }

  initScheduler() {
    // Run every hour
    cron.schedule('0 * * * *', () => {
      console.log('Running scheduled data sync...');
      this.syncAllTenants();
    });
  }

  async syncAllTenants() {
    try {
      const tenants = await prisma.tenant.findMany();
      
      for (const tenant of tenants) {
        try {
          const shopifyService = new ShopifyService(
            tenant.shopifyStore,
            tenant.accessToken
          );
          
          await shopifyService.syncAllData(tenant.id);
          console.log(`Synced data for tenant: ${tenant.storeName}`);
        } catch (error) {
          console.error(`Failed to sync tenant ${tenant.storeName}:`, error);
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }
}

module.exports = DataScheduler;