import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {

  return (
    <main className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Chat with your Documents
      </h1>

      <ChatWindow />

    </main>
  );
}