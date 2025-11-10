/**
 * Menu Management System Component
 * 
 * Comprehensive admin interface for managing restaurant menu items.
 * Provides full CRUD (Create, Read, Update, Delete) operations with:
 * 
 * - Real-time menu item management
 * - Category-based organization
 * - Availability toggle functionality
 * - Dietary restriction labeling
 * - Price and ingredient management
 * - Form validation and error handling
 * - Responsive design for all devices
 * 
 * This component is the core of the restaurant's menu administration system,
 * allowing staff to maintain accurate and up-to-date menu information.
 * 
 * @author SODV2201 Web Programming Course
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import { getMenuItems, updateMenuItem, createMenuItem, editMenuItem, getCategories } from "../services/menuService";

/**
 * Main Menu Manager Component
 * 
 * Handles all menu item operations and provides the administrative interface
 * for restaurant staff to manage the complete menu system.
 */
function MenuManager() {
  // Core data state management
  const [menu, setMenu] = useState([]);              // Complete menu items list
  const [categories, setCategories] = useState([]);  // Available menu categories
  const [loading, setLoading] = useState(true);      // Loading state for data fetching
  
  // UI state management
  const [showCreateForm, setShowCreateForm] = useState(false);  // Toggle create form visibility
  const [editingItem, setEditingItem] = useState(null);        // Currently editing item ID
  
  // Form data for creating new menu items
  const [newItem, setNewItem] = useState({
    name: '',           // Menu item name
    description: '',    // Item description
    price: '',          // Item price
    categoryId: '',     // Category assignment
    ingredients: '',    // Ingredient list
    dietaryType: '',    // Dietary classification (vegetarian, vegan, etc.)
    isAvailable: true   // Availability status
  });
  
  // Form data for editing existing menu items
  const [editItem, setEditItem] = useState({
    id: '',             // Item ID for updates
    name: '',           // Updated item name
    description: '',    // Updated description
    price: '',          // Updated price
    categoryId: '',     // Updated category
    ingredients: '',    // Updated ingredients
    dietaryType: '',    // Updated dietary type
    isAvailable: true   // Updated availability
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, categoriesData] = await Promise.all([
          getMenuItems(),
          getCategories()
        ]);
        setMenu(items);
        
        // If no categories from API, extract from existing menu items as fallback
        if (categoriesData.length === 0 && items.length > 0) {
          const uniqueCategories = [...new Set(items.map(item => item.category))];
          const fallbackCategories = uniqueCategories.map((categoryName, index) => ({
            CategoryID: index + 1,
            CategoryName: categoryName
          }));
          setCategories(fallbackCategories);
        } else {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAvailability = async (id) => {
    const item = menu.find(item => item.id === id);
    const updatedItem = { available: !item.available };
    
    try {
      const success = await updateMenuItem(id, updatedItem);
      
      if (success) {
        const updatedMenu = menu.map(menuItem =>
          menuItem.id === id ? { ...menuItem, available: !menuItem.available } : menuItem
        );
        setMenu(updatedMenu);
        console.log(`${item.name} is now ${!item.available ? 'Available' : 'Unavailable'}`);
      } else {
        console.error('Failed to update menu item availability');
        alert('Failed to update menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error updating menu item. Please try again.');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.categoryId) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const menuItemId = await createMenuItem(newItem);
      
      if (menuItemId) {
        // Refresh the menu items to include the new item
        const updatedItems = await getMenuItems();
        setMenu(updatedItems);
        
        // Reset form and hide it
        setNewItem({
          name: '',
          description: '',
          price: '',
          categoryId: '',
          ingredients: '',
          dietaryType: '',
          isAvailable: true
        });
        setShowCreateForm(false);
        alert('Menu item created successfully!');
      } else {
        alert('Failed to create menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Error creating menu item. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startEditing = (item) => {
    // Find the category ID from the category name
    const category = categories.find(cat => cat.CategoryName === item.category);
    
    setEditItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: category ? category.CategoryID.toString() : '',
      ingredients: item.ingredients || '',
      dietaryType: item.dietary || '',
      isAvailable: item.available
    });
    setEditingItem(item.id);
    setShowCreateForm(false); // Close create form if open
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    
    if (!editItem.name || !editItem.description || !editItem.price || !editItem.categoryId) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const success = await editMenuItem(editItem.id, editItem);
      
      if (success) {
        // Refresh the menu items to show updated data
        const updatedItems = await getMenuItems();
        setMenu(updatedItems);
        
        // Reset edit state
        setEditingItem(null);
        setEditItem({
          id: '',
          name: '',
          description: '',
          price: '',
          categoryId: '',
          ingredients: '',
          dietaryType: '',
          isAvailable: true
        });
        alert('Menu item updated successfully!');
      } else {
        alert('Failed to update menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error updating menu item. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditItem({
      id: '',
      name: '',
      description: '',
      price: '',
      categoryId: '',
      ingredients: '',
      dietaryType: '',
      isAvailable: true
    });
  };

  if (loading) {
    return (
      <div className="panel">
        <h2>Menu Management</h2>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Menu Management</h2>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Menu Item'}
        </button>
      </div>

      {showCreateForm && (
        <div className="panel-section" style={{ 
          backgroundColor: '#f8f9fa', 
          border: '2px solid #007bff', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#007bff', marginBottom: '15px' }}>Create New Menu Item</h3>
          <form onSubmit={handleCreateItem}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Price * ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={newItem.categoryId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Dietary Type
                </label>
                <select
                  name="dietaryType"
                  value={newItem.dietaryType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Regular</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Ingredients
              </label>
              <input
                type="text"
                name="ingredients"
                value={newItem.ingredients}
                onChange={handleInputChange}
                placeholder="e.g., Chicken, Tomatoes, Cheese"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={newItem.isAvailable}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Available to customers
              </label>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Menu Item
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editingItem && (
        <div className="panel-section" style={{ 
          backgroundColor: '#fff3cd', 
          border: '2px solid #ffc107', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#856404', marginBottom: '15px' }}>Edit Menu Item</h3>
          <form onSubmit={handleEditItem}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editItem.name}
                  onChange={handleEditInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Price * ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editItem.price}
                  onChange={handleEditInputChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={editItem.categoryId}
                  onChange={handleEditInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Dietary Type
                </label>
                <select
                  name="dietaryType"
                  value={editItem.dietaryType}
                  onChange={handleEditInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Regular</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={editItem.description}
                onChange={handleEditInputChange}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Ingredients
              </label>
              <input
                type="text"
                name="ingredients"
                value={editItem.ingredients}
                onChange={handleEditInputChange}
                placeholder="e.g., Chicken, Tomatoes, Cheese"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={editItem.isAvailable}
                  onChange={handleEditInputChange}
                  style={{ marginRight: '8px' }}
                />
                Available to customers
              </label>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Update Menu Item
              </button>
              <button 
                type="button"
                onClick={cancelEdit}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-section">
        {menu.map(item => (
          <div 
            key={item.id} 
            className="panel-card"
            style={{
              opacity: item.available ? 1 : 0.7,
              border: item.available ? '2px solid #28a745' : '2px solid #dc3545'
            }}
          >
            <h3 style={{ color: item.available ? '#28a745' : '#dc3545' }}>
              {item.name} {item.available ? '✅' : '❌'}
            </h3>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Category:</strong> {item.category}</p>
            {item.dietary && <p><strong>Dietary:</strong> {item.dietary}</p>}
            <p><strong>Status:</strong> 
              <span style={{ 
                color: item.available ? '#28a745' : '#dc3545',
                fontWeight: 'bold',
                marginLeft: '5px'
              }}>
                {item.available ? 'Available for customers' : 'Hidden from customers'}
              </span>
            </p>
            <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => startEditing(item)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => toggleAvailability(item.id)}
                style={{
                  backgroundColor: item.available ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {item.available ? 'Make Unavailable' : 'Make Available'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuManager;
