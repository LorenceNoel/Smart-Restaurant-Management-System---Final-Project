import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method, order } = location.state || {};

  const handleConfirm = () => {
    alert(`Your ${method} order has been confirmed!`);
    navigate("/order-status", { state: { method, order } });
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <p>Order Method: <strong>{method}</strong></p>
      <p>Total: ${order?.total}</p>
      <button className="confirm-btn" onClick={handleConfirm}>
        Confirm Order
      </button>
    </div>
  );
}

export default CheckoutPage;