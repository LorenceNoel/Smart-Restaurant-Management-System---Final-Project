import React, { useState, useEffect } from "react";
import "./FilterBar.css";

function FilterBar({ filters, setFilters, applyFilters, filteredCount, totalCount }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50]);

  // Auto-apply filters when they change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, filters.search ? 300 : 0); // Debounce search, instant for others

    return () => clearTimeout(timeoutId);
  }, [filters, applyFilters]);

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "",
      dietary: "",
      maxPrice: "",
      minPrice: "",
      sortBy: "name"
    });
    setPriceRange([0, 50]);
  };

  const hasActiveFilters = () => {
    return filters.search || filters.category || filters.dietary || filters.maxPrice || filters.minPrice;
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
    setFilters(prev => ({ 
      ...prev, 
      minPrice: min > 0 ? min.toString() : "",
      maxPrice: max < 50 ? max.toString() : ""
    }));
  };

  return (
    <div className="filter-container">
      {/* Filter Header */}
      <div className="filter-header">
        <div className="filter-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="filter-icon">🔍</span>
          <span className="filter-text">Filters</span>
          <span className={`filter-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
          {hasActiveFilters() && <span className="active-indicator"></span>}
        </div>
        
        <div className="filter-results">
          <span className="results-count">
            {filteredCount} of {totalCount} dishes
          </span>
          {hasActiveFilters() && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className={`filter-controls ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-row">
          {/* Search */}
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search dishes..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="search-input"
              />
              {filters.search && (
                <button 
                  className="clear-search"
                  onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Starters">🥗 Starters</option>
              <option value="Mains">🍝 Mains</option>
              <option value="Desserts">🍰 Desserts</option>
              <option value="Beverages">🥤 Beverages</option>
            </select>
          </div>

          {/* Dietary */}
          <div className="filter-group">
            <label>Dietary</label>
            <select
              value={filters.dietary}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dietary: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Diets</option>
              <option value="vegetarian">🌱 Vegetarian</option>
              <option value="vegan">🥬 Vegan</option>
              <option value="gluten-free">🌾 Gluten-Free</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy || "name"}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="filter-select"
            >
              <option value="name">A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-row">
          <div className="filter-group price-range-group">
            <label>Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
            <div className="price-range-container">
              <input
                type="range"
                min="0"
                max="50"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(parseInt(e.target.value), priceRange[1])}
                className="price-slider min-price"
              />
              <input
                type="range"
                min="0"
                max="50"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
                className="price-slider max-price"
              />
              <div className="price-labels">
                <span>$0</span>
                <span>$50+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="quick-filters">
          <span className="quick-filter-label">Quick Filters:</span>
          <button 
            className={`quick-filter-tag ${filters.dietary === 'vegetarian' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              dietary: prev.dietary === 'vegetarian' ? '' : 'vegetarian' 
            }))}
          >
            🌱 Vegetarian
          </button>
          <button 
            className={`quick-filter-tag ${filters.category === 'Desserts' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              category: prev.category === 'Desserts' ? '' : 'Desserts' 
            }))}
          >
            🍰 Desserts
          </button>
          <button 
            className={`quick-filter-tag ${filters.sortBy === 'price-low' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              sortBy: prev.sortBy === 'price-low' ? 'name' : 'price-low' 
            }))}
          >
            💰 Budget Friendly
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
