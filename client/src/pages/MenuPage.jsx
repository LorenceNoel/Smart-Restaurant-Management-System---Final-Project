import React, { useState, useEffect } from "react";
import MenuItemCard from "../components/MenuItemCard";
import { getMenuItems } from "../services/menuService";
import "../styles/MenuPage.css";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error loading menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="menu-page">
        <h1 className="menu-title">Our Menu</h1>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <h1 className="menu-title">Our Menu</h1>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default MenuPage;
