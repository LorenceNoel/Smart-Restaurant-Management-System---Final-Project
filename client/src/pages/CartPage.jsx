import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrder, getOrders } from "../services/orderService";
import "../styles/CartPage.css";

function CartPage() {
  const { user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const data = await getOrders();
        const myOrders = data.filter((o) => o.UserId === user.id);
        setOrders(myOrders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  function addToCart(item) {
    setCartItems([...cartItems, item]);
  }

  async function handleCheckout() {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    const total = cartItems.reduce((sum, item) => sum + item.Price, 0);
    try {
      const result = await createOrder({ userId: user.id, total });
      alert(`Order placed! ID: ${result.orderId}`);
      setCartItems([]);
    } catch (err) {
      console.error("Checkout failed", err);
    }
  }

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="cart-page">
      <h2>My Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Price</td>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.Name}</td>
                <td>${item.Price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={handleCheckout} disabled={cartItems.length === 0}>
        Checkout
      </button>

      <h2>Past Orders</h2>
      {orders.length === 0 ? (
        <p>No past orders yet.</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <td>Order ID</td>
              <td>Total</td>
              <td>Status</td>
              <td>Date</td>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.Id}>
                <td>{order.Id}</td>
                <td>${order.Total}</td>
                <td>{order.Status}</td>
                <td>{new Date(order.CreatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CartPage;