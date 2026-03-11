import { ChatMessage } from "@/types/chat";

export default function ChatBubble({ message }: { message: ChatMessage }) {

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div
        className={`
          max-w-xl p-3 rounded-lg
          ${isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-black"}
        `}
      >
        {message.content}
      </div>

    </div>
  );
}