import React from "react";
import { useLocation } from "react-router-dom";
import "../components/CartPage.css";

function OrderStatusPage() {
  const { state } = useLocation();
  const method = state?.method || "pickup";

  return (
    <div className="order-status-page">
      <h1>Order Status</h1>
      <p>Your {method} order is being prepared.</p>
      <p>Status: <strong>Confirmed</strong></p>
      <p>Estimated time: 20–30 minutes</p>
    </div>
  );
}

export default OrderStatusPage;