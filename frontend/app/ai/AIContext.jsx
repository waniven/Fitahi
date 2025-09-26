import React, { createContext, useState } from "react";
import AIChatbox from "./AIChatbox";

// Context for sharing AI chat state across the application
export const AIContext = createContext();

/**
 * Provider component that manages global AI chat state and renders the chatbox
 * Wraps the entire app to provide chat functionality to any component
 */
export default function AIProvider({ children }) {
  // Controls the visibility state of the AI chatbox modal
  const [chatVisible, setChatVisible] = useState(false);

  // Stores all messages in the current conversation with Darwin AI
  // Initialized with a welcome message from the AI
  const [messages, setMessages] = useState([
    {
      id: "0",
      text: "Hey there! I'm Darwin. What can I assist you with today?",
      fromAI: true,
    },
  ]);

  /**
   * Toggles the chatbox between open and closed states
   */
  const toggleChat = () => setChatVisible((prev) => !prev);

  return (
    // Provides chat state and controls to all child components
    <AIContext.Provider
      value={{ chatVisible, toggleChat, messages, setMessages }}
    >
      {children}

      {/* Conditionally renders the AI chatbox when visibility is enabled */}
      {chatVisible && (
        <AIChatbox
          onClose={() => setChatVisible(false)}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </AIContext.Provider>
  );
}
