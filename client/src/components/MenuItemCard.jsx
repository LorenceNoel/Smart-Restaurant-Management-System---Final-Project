import React from 'react';
import "./FilterBar.css";

function MenuItemCard({ item }) {
  return (
    <div className="menu-card">
      <h3>{item.name}</h3>
      <p><strong>{item.category}</strong> • {item.dietary}</p>
      <p>{item.description}</p>
      <p><em>{item.ingredients}</em></p>
      <p className="price">${item.price.toFixed(2)}</p>
<button className="add-to-cart-btn" onClick={() => addToCart(item)}>
  Add to Cart  🛒 
</button>

    </div>
  );
}

export default MenuItemCard;