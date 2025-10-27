import React, { useState } from "react";
import { getOrders, updateOrderStatus } from "../services/orderService";
import "../styles/AdminDashboard.css";

function OrderBoard() {
  const [orders, setOrders] = useState(getOrders());

  const updateStatus = (id, newStatus) => {
    const updated = orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updated);
    updateOrderStatus(id, newStatus);
  };

  return (
    <div className="panel">
      <h2>📦 Order Tracker</h2>
      <div className="panel-section">
        {orders.map(order => (
          <div key={order.id} className="panel-card">
            <h3>Order #{order.id}</h3>
            <p>Customer: {order.customer}</p>
         <p>Status:</p>
<select
  value={order.status}
  onChange={(e) => updateStatus(order.id, e.target.value)}
>
  <option>Preparing</option>
  <option>Ready</option>
  <option>Delivered</option>
</select>

          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderBoard;