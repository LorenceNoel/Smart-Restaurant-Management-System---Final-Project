import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import "./FilterBar.css";

function MenuItemCard({ item }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleAddToCart = () => {
    if (!item.available) {
      alert('❌ This item is currently unavailable');
      return;
    }

    // Pass user information to addToCart for authentication check
    const success = addToCart(item, user);
    
    // If user is not logged in, the addToCart function will show the login prompt
  };

  return (
    <div className="menu-card">
      <h3>{item.name}</h3>
      <p><strong>{item.category}</strong> • {item.dietary || 'Regular'}</p>
      <p>{item.description}</p>
      <p><em>{item.ingredients}</em></p>
      <p className="price">${item.price?.toFixed(2) || '0.00'}</p>
      
      {/* Hide Add to Cart button for admin users */}
      {!isAdmin && (
        <button 
          className={`add-to-cart-btn ${!item.available ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={!item.available}
        >
          {item.available ? 'Add to Cart 🛒' : 'Unavailable'}
        </button>
      )}
      
      {/* Show status for admin users instead */}
      {isAdmin && (
        <div className="admin-status" style={{ 
          padding: '10px', 
          textAlign: 'center', 
          fontWeight: 'bold',
          color: item.available ? '#28a745' : '#dc3545',
          border: `2px solid ${item.available ? '#28a745' : '#dc3545'}`,
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {item.available ? '✅ Available to Customers' : '❌ Hidden from Customers'}
        </div>
      )}
    </div>
  );
}

export default MenuItemCard;
