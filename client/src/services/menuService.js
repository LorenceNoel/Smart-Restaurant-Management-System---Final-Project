import axios from "axios";

const API_URL = "http://localhost:5000/api/menu";

export async function getMenu() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function addMenuItem(item) {
  const res = await axios.post(API_URL, item);
  return res.data;
}

export async function updateMenuItem(id, item) {
  const res = await axios.put(`${API_URL}/${id}`, item);
  return res.data;
}