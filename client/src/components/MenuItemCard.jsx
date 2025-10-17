import React from 'react';

function MenuItemCard({ item }) {
  return (
    <div className="menu-card">
      <h3>{item.name}</h3>
      <p><strong>{item.category}</strong> • {item.dietary}</p>
      <p>{item.description}</p>
      <p><em>{item.ingredients}</em></p>
      <p className="price">${item.price.toFixed(2)}</p>
      <button>Add to Cart</button>
    </div>
  );
}

export default MenuItemCard;