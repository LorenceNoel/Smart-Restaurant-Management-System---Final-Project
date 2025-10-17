import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/CartPage.css";

function CartPage() {
  const navigate = useNavigate();
  const [orderMethod, setOrderMethod] = useState(""); // "delivery" or "pickup"
  const [proceeding, setProceeding] = useState(false);

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Caesar Salad",
      price: 8.99,
      quantity: 2,
    },
    {
      id: 2,
      name: "Grilled Salmon",
      price: 18.99,
      quantity: 1,
    },
  ]);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price.toFixed(2)}</p>
              </div>
              <button onClick={() => handleRemove(item.id)}>Remove</button>
            </div>
          ))}

          <div className="order-method-section">
            <h3>Select Order Method</h3>
            <label>
              <input
                type="radio"
                name="orderMethod"
                value="delivery"
                checked={orderMethod === "delivery"}
                onChange={(e) => setOrderMethod(e.target.value)}
              />
              Delivery
            </label>
            <label>
              <input
                type="radio"
                name="orderMethod"
                value="pickup"
                checked={orderMethod === "pickup"}
                onChange={(e) => setOrderMethod(e.target.value)}
              />
              Pickup
            </label>
          </div>

          <div className="cart-total">
            <h2>Total: ${total}</h2>
            <button
              className="checkout-btn"
              disabled={!orderMethod}
              onClick={() => {
                setProceeding(true);
                navigate("/checkout", { state: { method: orderMethod } });
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;