import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export async function registerUser(userData) {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
}

export async function loginUser(credentials) {
  const res = await axios.post(`${API_URL}/login`, credentials);
  return res.data;
}