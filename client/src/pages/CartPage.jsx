import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/CartPage.css";

function CartPage() {
  const [orderMethod, setOrderMethod] = useState(""); // "delivery" or "pickup"
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [view, setView] = useState("cart"); // "cart" or "status"
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="cart-page">
        <h2>🛒 Shopping Cart</h2>
        <div className="empty-cart">
          <p>Please log in to view your cart.</p>
          <a href="/login" className="login-link">Go to Login</a>
        </div>
      </div>
    );
  }

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
  };

  const total = getCartTotal().toFixed(2);

  const handleCheckout = async () => {
    if (!orderMethod) {
      alert("Please select an order method (delivery or pickup)");
      return;
    }

    if (orderMethod === "delivery" && !deliveryAddress.trim()) {
      alert("Please enter a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        userId: user?.userId || null,
        customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest Customer',
        customerEmail: user?.email || null,
        customerPhone: user?.phone || null,
        orderType: orderMethod,
        deliveryAddress: orderMethod === "delivery" ? deliveryAddress : null,
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      };

      const result = await createOrder(orderData);

      if (result.success) {
        setOrderPlaced(true);
        setOrderStatus("Order placed successfully! Preparing your food...");
        setView("status");
        clearCart();
      } else {
        alert("❌ Failed to place order: " + result.error);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("❌ Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      {view === "cart" ? (
        <>
          <h1>Your Cart</h1>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <h3>{item.name}</h3>
                    <p>Unit Price: ${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                      <span>Quantity: {item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
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
                
                {orderMethod === "delivery" && (
                  <div className="delivery-address">
                    <input
                      type="text"
                      placeholder="Enter your delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="cart-total">
                <h2>Total: ${total}</h2>
                <button
                  className="checkout-btn"
                  disabled={!orderMethod || orderPlaced || submitting || cartItems.length === 0}
                  onClick={handleCheckout}
                >
                  {submitting ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <LoadingSpinner size="small" message="" />
                      Placing Order...
                    </div>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {orderPlaced && (
                  <button
                    className="checkout-btn"
                    onClick={() => setView("status")}
                  >
                    Check Order Status
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h1>Order Status</h1>
          <p>Your <strong>{orderMethod}</strong> order has been confirmed!</p>
          <p>Status: <strong>Preparing</strong></p>
          <p>Estimated time: 20–30 minutes</p>
          <p>{orderStatus}</p>
          <button className="checkout-btn" onClick={() => setView("cart")}>
            Return to Menu
          </button>
        </>
      )}
    </div>
  );
}

export default CartPage;
