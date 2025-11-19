import React from 'react';
import "../styles/FilterBar.css";

function MenuItemCard({ item, addToCart }) {
  return (
    <div className="menu-card">
      <h3>{item.name}</h3>
      <p><strong>{item.category}</strong></p>
      <p>{item.description}</p>
      <p className="price">${item.price.toFixed(2)}</p>
      <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
        Add to Cart 🛒
      </button>
    </div>
  );
}

export default MenuItemCard;