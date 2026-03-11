import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
  return (
    <main className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Upload PDF
      </h1>

      <FileUpload />

    </main>
  );
}