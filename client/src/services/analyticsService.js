const API_BASE_URL = 'http://localhost:5000/api';

export async function getAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    const data = await response.json();
    
    if (data.success) {
      const [orderStats, popularItems, statusDistribution] = data.data;
      
      // Extract data from multiple result sets
      const stats = orderStats[0] || {};
      const topItem = popularItems[0] || {};
      
      return {
        totalOrders: stats.TotalOrders || 0,
        totalRevenue: stats.TotalRevenue || 0,
        averageOrderValue: stats.AverageOrderValue || 0,
        popularItem: topItem.Name || "No data",
        popularItemQuantity: topItem.TotalQuantity || 0,
        orderStatuses: statusDistribution || []
      };
    } else {
      console.error('Failed to fetch analytics:', data.error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        popularItem: "No data",
        popularItemQuantity: 0,
        orderStatuses: []
      };
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      popularItem: "No data",
      popularItemQuantity: 0,
      orderStatuses: []
    };
  }
}
