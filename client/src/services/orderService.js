import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

export async function createOrder(orderData) {
  const res = await axios.post(API_URL, orderData);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await axios.put(`${API_URL}/${id}/status`, { status });
  return res.data;
}

export async function getOrders() {
  const res = await axios.get(API_URL);
  return res.data;
}