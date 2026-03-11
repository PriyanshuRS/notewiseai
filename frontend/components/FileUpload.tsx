"use client";

import { useState } from "react";
import API from "@/lib/api";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        `Uploaded successfully. Pages: ${res.data.pages}, Chunks: ${res.data.chunks}`
      );
    } catch (err: any) {
      setMessage("Upload failed");
    }

    setLoading(false);
    setFile(null);
  };

  return (
    <div className="flex flex-col gap-4 max-w-md">

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files) setFile(e.target.files[0]);
        }}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {message && (
        <p className="text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}