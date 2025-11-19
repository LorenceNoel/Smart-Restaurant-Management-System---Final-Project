import axios from "axios";

const API_URL = "http://localhost:5000/api/reservations";

export async function createReservation(data) {
  const res = await axios.post(API_URL, data);
  return res.data;
}

export async function getReservations() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function updateReservation(id, data) {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
}