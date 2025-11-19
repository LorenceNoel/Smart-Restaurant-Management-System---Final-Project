const API_URL = "http://localhost:5000/api/ai";

export async function getRecommendations(token) {
  const res = await fetch(`${API_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function chatAssistant(message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}