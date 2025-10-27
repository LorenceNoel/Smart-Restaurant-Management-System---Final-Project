export function getMenuItems() {
  return [
    { id: 1, name: "Grilled Salmon", price: 18.99, available: true },
    { id: 2, name: "Mushroom Risotto", price: 14.99, available: true },
    { id: 3, name: "Caesar Salad", price: 10.99, available: false },
  ];
}

export function updateMenuItem(id, updatedItem) {
  console.log(`Menu item updated:`, id, updatedItem);
  // In a real app, you'd send a PUT request to your backend here
}