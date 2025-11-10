import React, { useState, useEffect } from "react";
import MenuItemCard from "../components/MenuItemCard";
import FilterBar from "../components/FilterBar";
import { getMenuItems } from "../services/menuService";
import "../styles/MenuPage.css";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dietary: "",
    maxPrice: "",
    minPrice: "",
    sortBy: "name"
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
        setFilteredItems(items); // Initialize filtered items
      } catch (error) {
        console.error('Error loading menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter and sort function
  const applyFilters = () => {
    let filtered = [...menuItems];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Dietary filter
    if (filters.dietary) {
      filtered = filtered.filter(item => 
        item.dietaryType && item.dietaryType.toLowerCase().includes(filters.dietary.toLowerCase())
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(item => parseFloat(item.price) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(item => parseFloat(item.price) <= parseFloat(filters.maxPrice));
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "category":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default: // name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredItems(filtered);
  };

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
      
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        filteredCount={filteredItems.length}
        totalCount={menuItems.length}
      />
      
      {/* Menu Items Grid */}
      <div className="menu-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))
        ) : (
          <div className="no-results">
            <p>No menu items match your filters.</p>
            <p>Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
