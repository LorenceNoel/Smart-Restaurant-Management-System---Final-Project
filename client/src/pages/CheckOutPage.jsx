import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method } = location.state || {};

  const handleConfirm = () => {
    // Simulate order confirmation
    alert(`Your ${method} order has been confirmed!`);
    navigate("/order-status", { state: { method } });
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <p>Order Method: <strong>{method}</strong></p>
      <p>Your order total and items have been received.</p>
      <button className="confirm-btn" onClick={handleConfirm}>
        Confirm Order
      </button>
    </div>
  );
}

export default CheckoutPage;