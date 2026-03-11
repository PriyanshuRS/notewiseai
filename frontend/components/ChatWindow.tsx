"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import ChatBubble from "./ChatBubble";

export default function ChatWindow() {

  const { messages, sendMessage, loading } = useChat();
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {

    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  return (
    <div className="flex flex-col h-[80vh] border rounded">

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}

        {loading && (
          <p className="text-gray-500 text-sm">
            Thinking...
          </p>
        )}

        <div ref={bottomRef} />

      </div>

      {/* Input */}

      <div className="border-t p-3 flex gap-2">

        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask about your documents..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>

      </div>

    </div>
  );
}