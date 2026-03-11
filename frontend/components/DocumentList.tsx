"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

interface Document {
  id: string;
  filename: string;
  pages: number;
  chunks: number;
  status: string;
}

export default function DocumentList() {

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents");
    }

    setLoading(false);
  };

  if (loading) {
    return <p>Loading documents...</p>;
  }

  if (documents.length === 0) {
    return <p>No documents uploaded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">

      {documents.map((doc) => (

        <div
          key={doc.id}
          className="border rounded p-4 flex justify-between items-center"
        >

          <div>

            <h3 className="font-semibold">
              {doc.filename}
            </h3>

            <p className="text-sm text-gray-600">
              Pages: {doc.pages} • Chunks: {doc.chunks}
            </p>

          </div>

          <span className="text-sm text-blue-600">
            {doc.status}
          </span>

        </div>

      ))}

    </div>
  );
}