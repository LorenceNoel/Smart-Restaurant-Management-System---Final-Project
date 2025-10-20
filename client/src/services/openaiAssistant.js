
export async function getAssistantReply(userMessage) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4", 
      messages: [
        { role: "system", content: "You are a helpful restaurant assistant." },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    console.error("OpenAI response error:", data);
    return "Sorry, I couldn't understand that. Please try again.";
  }

  return data.choices[0].message.content;
}