import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/OrderStatusPage.css";

function OrderStatusPage() {
  const { state } = useLocation();
  const method = state?.method || "pickup";
  const order = state?.order;

  return (
    <div className="order-status-page">
      <h1>Order Status</h1>
      <p>Your <strong>{method}</strong> order is being prepared.</p>
      {order ? (
        <>
          <p>Order ID: <strong>{order.id}</strong></p>
          <p>Total: <strong>${order.total}</strong></p>
          <p>Status: <strong>{order.status}</strong></p>
        </>
      ) : (
        <p>Status: <strong>Confirmed</strong></p>
      )}
      <p>Estimated time: 20–30 minutes</p>
    </div>
  );
}

export default OrderStatusPage;