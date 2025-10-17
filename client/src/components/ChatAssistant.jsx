import React, { useState } from "react";
import '../components/ChatAssistant.css';

function ChatAssistant() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your restaurant assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    const botResponse = {
      sender: "bot",
      text: `You asked: "${input}". Here's a helpful response!`,
    };

    setMessages(prev => [...prev, botResponse]);
    setInput("");
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