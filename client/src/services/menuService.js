const API_BASE_URL = 'http://localhost:5000/api';

export async function getMenuItems() {
  try {
    // Use admin endpoint to get ALL menu items (available and unavailable)
    const response = await fetch(`${API_BASE_URL}/menu/admin`);
    const data = await response.json();
    
    if (data.success) {
      // Transform database format to match frontend expectations
      return data.data.map(item => ({
        id: item.MenuItemID,
        name: item.Name,
        description: item.Description,
        ingredients: item.Ingredients,
        price: item.Price,
        category: item.CategoryName,
        dietary: item.DietaryType,
        available: item.IsAvailable
      }));
    } else {
      console.error('Failed to fetch menu items:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

export async function updateMenuItem(id, updatedItem) {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isAvailable: updatedItem.available
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.error('Failed to update menu item:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    return false;
  }
}

export async function editMenuItem(id, editedItem) {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedItem.name,
        description: editedItem.description,
        price: editedItem.price,
        categoryId: editedItem.categoryId,
        ingredients: editedItem.ingredients,
        dietaryType: editedItem.dietaryType,
        isAvailable: editedItem.isAvailable
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.error('Failed to edit menu item:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error editing menu item:', error);
    return false;
  }
}

export async function createMenuItem(newItem) {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        categoryId: newItem.categoryId,
        ingredients: newItem.ingredients,
        dietaryType: newItem.dietaryType,
        isAvailable: newItem.isAvailable
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.menuItemId;
    } else {
      console.error('Failed to create menu item:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch categories:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
