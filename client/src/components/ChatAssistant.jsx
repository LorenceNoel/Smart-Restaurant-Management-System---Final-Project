import React, { useState } from "react";
import "../components/ChatAssistant.css";
import { getAssistantReply } from "../services/openaiAssistant";

function ChatAssistant() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your restaurant assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await getAssistantReply(input);
      const botMessage = { sender: "bot", text: reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I couldn't respond right now." }]);
      console.error("OpenAI error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">🍽️ Restaurant Assistant</div>
      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-msg bot">Typing...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask about menu, reservations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatAssistant;