"use client";

import { useState } from "react";
import API from "@/lib/api";
import { ChatMessage } from "@/types/chat";

export function useChat() {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (question: string) => {

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {

      const res = await API.post("/query/", {
        question: question,
      });

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: res.data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error retrieving answer.",
        },
      ]);

    }

    setLoading(false);
  };

  return {
    messages,
    sendMessage,
    loading,
  };
}