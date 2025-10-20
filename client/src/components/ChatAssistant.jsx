import React, { useState } from "react";
import "../components/ChatAssistant.css";
import { getFakeAssistantReply } from "../services/sampleAssistant";

function ChatAssistant() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your restaurant assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply = getFakeAssistantReply(input);
      const botMessage = { sender: "bot", text: reply };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className={`chat-widget ${minimized ? "minimized" : ""}`}>
      <div className="chat-header">
        🍽️ Restaurant Assistant
        <button className="minimize-btn" onClick={() => setMinimized(!minimized)}>
          {minimized ? "🔼" : "🔽"}
        </button>
      </div>

      {!minimized && (
        <>
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
        </>
      )}
    </div>
  );
}

export default ChatAssistant;