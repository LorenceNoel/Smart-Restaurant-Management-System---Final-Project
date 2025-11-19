import axios from "axios";

const API_URL = "http://localhost:5000/api/events";

export async function getEvents() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function addEvent(event) {
  const res = await axios.post(API_URL, event);
  return res.data;
}