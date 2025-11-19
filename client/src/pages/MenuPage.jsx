import React, { useEffect, useState } from "react";
import { getMenu } from "../services/menuService";
import "../styles/MenuPage.css";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await getMenu(); // calls backend via axios
        setMenuItems(data);
      } catch (err) {
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="menu-page">
      <h1>Our Menu</h1>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item.Id} className="menu-card">
            <h2>{item.Name}</h2>
            <p>{item.Description}</p>
            <p><strong>Category:</strong> {item.Category}</p>
            <p><strong>Price:</strong> ${item.Price}</p>
            <p><strong>Tags:</strong> {item.Tags}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;