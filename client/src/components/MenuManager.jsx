import React, { useState, useEffect } from "react";
import { getMenu, updateMenuItem } from "../services/menuService";
import "../styles/AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

function MenuManager() {
  const [menu, setMenu] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadMenu() {
      const items = await getMenu();
      setMenu(items);
    }
    loadMenu();
  }, []);

  const toggleAvailability = async (id) => {
    const updatedMenu = menu.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setMenu(updatedMenu);
    const updatedItem = updatedMenu.find(item => item.id === id);
    await updateMenuItem(id, updatedItem, token);
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