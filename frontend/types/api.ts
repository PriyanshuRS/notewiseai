export interface Document {
  id: string;
  filename: string;
  pages: number;
  chunks: number;
  status: string;
}

export interface QueryResponse {
  answer: string;
  sources: {
    document_id: string;
    page_number: number;
    chunk_index: number;
    text: string;
  }[];
}