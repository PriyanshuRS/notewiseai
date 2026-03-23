from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter

class TextChunker:
    """
    Splits page text into overlapping chunks using RecursiveCharacterTextSplitter
    for better semantic boundaries.
    """
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def chunk_pages(self, pages: List[Dict]) -> List[Dict]:
        chunks = []
        chunk_index = 0

        for page in pages:
            page_text = page["text"].strip()
            if not page_text:
                continue
                
            split_texts = self.splitter.split_text(page_text)
            
            for text in split_texts:
                chunks.append({
                    "text": text,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index
                })
                chunk_index += 1

        return chunks
