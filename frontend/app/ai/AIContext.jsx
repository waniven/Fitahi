import React, { createContext, useState, useRef } from "react";
import AIChatbox from "./AIChatbox";

export const AIContext = createContext();

export default function AIProvider({ children }) {
    //controls visiblity of chatbox
  const [chatVisible, setChatVisible] = useState(false);
  //store messages with darwin
  const [messages, setMessages] = useState([
    { id: "0", text: "Hey there! I'm Darwin. What can I assist you with today?", fromAI: true }
  ]);

  //toggles the chatbox open and close
  const toggleChat = () => setChatVisible((prev) => !prev);

  return (
    //provide chat visiblity and message state to components
    <AIContext.Provider value={{ chatVisible, toggleChat, messages, setMessages }}>
      {children}

      {/* Floating AI Button & Chatbox */}
      {chatVisible && (
        <AIChatbox
          onClose={() => setChatVisible(false)} //close chatbox when x is pressed
          messages={messages}   
          setMessages={setMessages}
        />
      )}
    </AIContext.Provider>
  );
}
