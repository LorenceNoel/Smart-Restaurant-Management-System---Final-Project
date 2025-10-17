import React, { useState } from 'react';

function FilterBar({ onFilter }) {
  const [category, setCategory] = useState('');
  const [dietary, setDietary] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ category, dietary, maxPrice: parseFloat(maxPrice), search });
  };

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Starters">Starters</option>
        <option value="Mains">Mains</option>
        <option value="Desserts">Desserts</option>
        <option value="Beverages">Beverages</option>
      </select>
      <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
        <option value="">All Diets</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="gluten-free">Gluten-Free</option>
      </select>
      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <button type="submit">Apply Filters</button>
    </form>
  );
}

export default FilterBar;