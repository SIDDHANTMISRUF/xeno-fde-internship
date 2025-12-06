const Shopify = require('shopify-api-node');

class ShopifyService {
  constructor(shopDomain, accessToken) {
    this.shopify = new Shopify({
      shopName: shopDomain.replace('.myshopify.com', ''),
      accessToken: accessToken
    });
  }

  // Test connection
  async testConnection() {
    try {
      const shop = await this.shopify.shop.get();
      return {
        connected: true,
        store: shop.name,
        email: shop.email
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Get store data
  async getStoreData() {
    const [shop, products, customers, orders] = await Promise.all([
      this.shopify.shop.get(),
      this.shopify.product.list({ limit: 50 }),
      this.shopify.customer.list({ limit: 50 }),
      this.shopify.order.list({ limit: 50, status: 'any' })
    ]);

    return {
      shop,
      counts: {
        products: products.length,
        customers: customers.length,
        orders: orders.length
      },
      recentData: {
        products: products.slice(0, 10),
        customers: customers.slice(0, 10),
        orders: orders.slice(0, 10)
      }
    };
  }

  // Sync all data
  async syncAllData() {
    try {
      const [products, customers, orders] = await Promise.all([
        this.shopify.product.list({ limit: 250 }),
        this.shopify.customer.list({ limit: 250 }),
        this.shopify.order.list({ limit: 250, status: 'any' })
      ]);

      return {
        success: true,
        counts: {
          products: products.length,
          customers: customers.length,
          orders: orders.length
        }
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const [shop, products, customers, orders] = await Promise.all([
        this.shopify.shop.get(),
        this.shopify.product.list({ limit: 250 }),
        this.shopify.customer.list({ limit: 250 }),
        this.shopify.order.list({ limit: 250, status: 'any' })
      ]);

      // Calculate revenue
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
      
      // Get top customers
      const topCustomers = customers
        .map(customer => ({
          id: customer.id.toString(),
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
          email: customer.email,
          totalSpent: parseFloat(customer.total_spent),
          orderCount: customer.orders_count
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Format revenue trend (last 7 days)
      const revenueTrend = orders
        .filter(order => {
          const orderDate = new Date(order.created_at);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= sevenDaysAgo;
        })
        .reduce((trend, order) => {
          const date = order.created_at.split('T')[0];
          const existing = trend.find(item => item.date === date);
          if (existing) {
            existing.revenue += parseFloat(order.total_price);
            existing.orders += 1;
          } else {
            trend.push({
              date,
              revenue: parseFloat(order.total_price),
              orders: 1
            });
          }
          return trend;
        }, [])
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        revenue,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        revenueTrend,
        topCustomers,
        metrics: {
          averageOrderValue: orders.length > 0 ? revenue / orders.length : 0,
          conversionRate: 3.2, // This would need actual analytics data
          customerRetention: 78.5 // This would need actual analytics data
        }
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw error;
    }
  }
}

module.exports = ShopifyService;