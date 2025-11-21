const API_BASE_URL = 'http://localhost:5000/api';

export async function getOrders() {
  try {
    console.log('Making API request to:', `${API_BASE_URL}/orders`);
    const response = await fetch(`${API_BASE_URL}/orders`);
    console.log('API response status:', response.status);
    const data = await response.json();
    console.log('Raw API data:', data);
    
    if (data.success) {
      const mappedOrders = data.data.map(order => ({
        id: order.OrderID,
        customer: order.CustomerName,
        status: order.Status,
        total: order.TotalAmount,
        orderDate: order.OrderDate,
        orderType: order.OrderType,
        estimatedTime: order.EstimatedTime,
        menuName: order.MenuName,
        customerPhone: order.CustomerPhone,
        deliveryAddress: order.DeliveryAddress,
        customerEmail: order.CustomerEmail
      }));
      console.log('Mapped orders:', mappedOrders);
      return mappedOrders;
    } else {
      console.error('Failed to fetch orders:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, orderId: data.data.orderId };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function getOrderDetails(orderId) {
  try {
    console.log('📋 Fetching order details for OrderID:', orderId);
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`);
    console.log('📡 Order details response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Raw order details data:', data);
    
    if (data.success) {
      const mappedItems = data.data.map(item => ({
        id: item.OrderItemID,
        name: item.ItemName,
        description: item.ItemDescription,
        quantity: item.Quantity,
        price: item.ItemPrice,
        total: item.ItemTotal
      }));
      console.log('📋 Mapped order items:', mappedItems);
      return mappedItems;
    } else {
      console.error('❌ Failed to fetch order details:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    return [];
  }
}

export async function updateOrderStatus(id, status, estimatedTime = null) {
  try {
    console.log('🔄 Updating order status:', { id, status, estimatedTime });
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        estimatedTime
      }),
    });
    
    console.log('📡 Update status response status:', response.status);
    
    const data = await response.json();
    console.log('🔄 Update status response data:', data);
    
    if (data.success) {
      console.log("✅ Order status updated successfully");
      return true;
    } else {
      console.error('❌ Failed to update order status:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return false;
  }
}
