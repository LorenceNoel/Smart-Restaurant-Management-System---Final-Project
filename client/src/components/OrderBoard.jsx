import React, { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "../services/orderService";
import "../styles/AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

function OrderBoard() {
  const [orders, setOrders] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadOrders() {
      const data = await getOrders(token);
      setOrders(data);
    }
    loadOrders();
  }, [token]);

  const updateStatus = async (id, newStatus) => {
    const updated = await updateOrderStatus(id, newStatus, token);
    setOrders(orders.map(order => (order.id === id ? updated : order)));
  };

  return (
    <div className="panel">
      <h2>📦 Order Tracker</h2>
      <div className="panel-section">
        {orders.map(order => (
          <div key={order.id} className="panel-card">
            <h3>Order #{order.id}</h3>
            <p>Total: ${order.total}</p>
            <p>Status:</p>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderBoard;