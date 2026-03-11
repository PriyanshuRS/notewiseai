import DocumentList from "@/components/DocumentList";

export default function DocumentsPage() {
  return (
    <main className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Your Documents
      </h1>

      <DocumentList />

    </main>
  );
}