export function getOrders() {
  return [
    { id: 101, customer: "Alice", status: "Preparing" },
    { id: 102, customer: "Bob", status: "Ready" },
  ];
}

export function updateOrderStatus(id, status) {
  console.log("Updated order:", id, status);
}