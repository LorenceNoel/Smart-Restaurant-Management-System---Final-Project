import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MenuItemCard from '../components/MenuItemCard';
import { useAuth } from "../context/AuthContext";
import './MenuPage.css';


function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: 'Caesar Salad',
        description: 'Crisp romaine, parmesan, croutons',
        ingredients: 'Romaine, Parmesan, Croutons, Caesar Dressing',
        category: 'Starters',
        price: 8.99,
        dietary: 'vegetarian',
      },
      {
        id: 2,
        name: 'Grilled Salmon',
        description: 'Served with lemon butter sauce',
        ingredients: 'Salmon, Lemon, Butter, Herbs',
        category: 'Mains',
        price: 18.99,
        dietary: 'gluten-free',
      },
      {
        id: 3,
        name: 'Chocolate Cake',
        description: 'Rich and moist vegan dessert',
        ingredients: 'Cocoa, Almond Milk, Flour, Sugar',
        category: 'Desserts',
        price: 6.5,
        dietary: 'vegan',
      },
    ];
    setMenuItems(mockData);
    setFilteredItems(mockData);
  }, []);

  const handleFilter = ({ category, dietary, maxPrice, search }) => {
    let filtered = [...menuItems];
    if (category) filtered = filtered.filter(item => item.category === category);
    if (dietary) filtered = filtered.filter(item => item.dietary === dietary);
    if (maxPrice) filtered = filtered.filter(item => item.price <= maxPrice);
    if (search) filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  return (
    <div className="menu-page">
      <h1 className="menu-title">Explore Our Menu</h1>
      <FilterBar onFilter={handleFilter} />
      <div className="menu-grid">
        {filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default MenuPage;