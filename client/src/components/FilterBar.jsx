import React from "react";
import "./FilterBar.css";

function FilterBar({ filters, setFilters, applyFilters }) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search menu..."
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
      />

      <select
        value={filters.category}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, category: e.target.value }))
        }
      >
        <option value="">All Categories</option>
        <option value="Starters">Starters</option>
        <option value="Mains">Mains</option>
        <option value="Desserts">Desserts</option>
        <option value="Beverages">Beverages</option>
      </select>

      <select
        value={filters.dietary}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, dietary: e.target.value }))
        }
      >
        <option value="">All Diets</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="gluten-free">Gluten-Free</option>
      </select>

      <input
        type="number"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
        }
      />

      <button onClick={applyFilters}>Apply Filters</button>
    </div>
  );
}

export default FilterBar;