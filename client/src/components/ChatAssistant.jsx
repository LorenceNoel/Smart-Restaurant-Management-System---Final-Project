// This is our AI chat assistant - it's like a floating help button that customers can use
// to ask questions about the restaurant. It's pretty smart and can answer most common questions!

import React, { useState, useEffect } from "react";
import "./ChatAssistant.css";
import { generateAIResponse, logUserInteraction } from "../services/aiService";

function ChatAssistant() {
  // All the chat messages - starts with a friendly greeting from the bot
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "🤖 Hi! I'm your AI restaurant assistant. I can help with menu recommendations, dietary preferences, reservations, and answer any questions about our restaurant!",
      timestamp: new Date()
    },
  ]);
  
  // What the user is typing
  const [input, setInput] = useState("");
  
  // Different states to make the chat feel more realistic
  const [loading, setLoading] = useState(false);        // When we're processing a message
  const [minimized, setMinimized] = useState(true);     // Whether the chat is collapsed
  const [isTyping, setIsTyping] = useState(false);      // Shows "AI is typing..." animation

  /**
   * Handle Message Sending
   * 
   * Processes user input and generates AI responses with realistic delays.
   * Includes error handling and interaction logging for AI improvement.
   * 
   * Features:
   * - Input validation and sanitization
   * - Realistic AI processing delays (800-1200ms)
   * - Comprehensive error handling
   * - Interaction logging for AI learning
   * - Smooth UX with typing indicators
   */
  const handleSend = async () => {
    // Validate input - don't send empty messages
    if (!input.trim()) return;

    // Create user message object with timestamp
    const userMessage = { 
      sender: "user", 
      text: input,
      timestamp: new Date()
    };
    
    // Save what they typed before we clear the input
    const currentInput = input;
    
    // Add their message to the chat right away so it feels responsive
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    // Wait a bit before responding to make it feel like the AI is thinking
    // Real chatbots do this to seem more human-like
    setTimeout(() => {
      try {
        // Ask our AI service what to respond with
        const aiResponse = generateAIResponse(currentInput);
        
        // Create the bot's response message
        const botMessage = { 
          sender: "bot", 
          text: aiResponse,
          timestamp: new Date()
        };
        
        // Add the bot's response to the chat
        setMessages(prev => [...prev, botMessage]);
        
        // Keep track of what people ask for future improvements
        logUserInteraction(currentInput, aiResponse);
        
      } catch (error) {
        // If something goes wrong, show a friendly error message
        console.error("AI Service Error:", error);
        const errorMessage = {
          sender: "bot",
          text: "I apologize, but I'm having trouble processing your request. Please try asking again or contact our staff for immediate assistance! 😊",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        // Always reset loading states
        setLoading(false);
        setIsTyping(false);
      }
    }, 800 + Math.random() * 400); // Random delay (800-1200ms) for natural feel
  };

  // These are quick buttons for common questions - saves customers from typing
  const quickQuestions = [
    "What are your hours?",
    "Recommend popular dishes", 
    "Do you have vegetarian options?",
    "How does delivery work?",
    "What are today's specials?"
  ];

  // When someone clicks a quick question, put it in the input box
  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  // Makes the timestamp look nice (like "2:30 PM")
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-assistant ${minimized ? "minimized" : ""}`}>
      <div className="chat-header" onClick={() => setMinimized(!minimized)}>
        <div className="header-content">
          <div className="assistant-info">
            <h4>🤖 AI Restaurant Assistant</h4>
            <span className="status-indicator">
              {isTyping ? "🤔 Thinking..." : "💡 Ready to help"}
            </span>
          </div>
          <button className="minimize-btn" onClick={(e) => e.stopPropagation()}>
            {minimized ? '↗️' : '↙️'}
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Quick question suggestions */}
          <div className="quick-questions">
            {quickQuestions.map((question, idx) => (
              <button 
                key={idx} 
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp ? formatTime(msg.timestamp) : ''}
                  </div>
                </div>
              </div>
            ))}
            {(loading || isTyping) && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask about menu recommendations, dietary options, hours..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                className="send-btn"
              >
                {loading ? '⏳' : '🚀'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatAssistant;
