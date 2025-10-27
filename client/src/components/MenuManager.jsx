import React, { useState, useEffect } from "react";
import { getMenuItems, updateMenuItem } from "../services/menuService";
import "../styles/AdminDashboard.css";

function MenuManager() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const items = getMenuItems();
    setMenu(items);
  }, []);

  const toggleAvailability = (id) => {
    const updatedMenu = menu.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setMenu(updatedMenu);
    const updatedItem = updatedMenu.find(item => item.id === id);
    updateMenuItem(id, updatedItem);
  };

  return (
    <div className="panel">
      <h2>📋 Menu Manager</h2>
      <div className="panel-section">
        {menu.map(item => (
          <div key={item.id} className="panel-card">
            <h3>{item.name}</h3>
            <p>Price: ${item.price.toFixed(2)}</p>
            <p>Status: {item.available ? "Available" : "Unavailable"}</p>
            <button onClick={() => toggleAvailability(item.id)}>
  {item.available ? "Disable" : "Enable"}
</button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuManager;