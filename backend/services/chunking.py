from typing import List, Dict
from backend.config.settings import settings


class TextChunker:
    """
    Splits page text into overlapping chunks suitable for embeddings and retrieval.
    """

    def __init__(
        self,
        chunk_size: int = settings.CHUNK_SIZE,
        overlap: int = settings.CHUNK_OVERLAP
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_pages(self, pages: List[Dict]) -> List[Dict]:
        """
        Convert page-level text into chunk-level segments.

        Input:
            [
                { "page_number": 1, "text": "..." }
            ]

        Output:
            [
                {
                    "text": "...",
                    "page_number": 1,
                    "chunk_index": 0
                }
            ]
        """

        chunks: List[Dict] = []
        chunk_index = 0

        for page in pages:

            words = page["text"].split()

            start = 0
            page_number = page["page_number"]

            while start < len(words):

                end = start + self.chunk_size

                chunk_words = words[start:end]

                chunk_text = " ".join(chunk_words)

                if chunk_text.strip():
                    if len(chunk_words) < 50:
                        break

                    chunks.append(
                        {
                            "text": chunk_text,
                            "page_number": page_number,
                            "chunk_index": chunk_index
                        }
                    )

                    chunk_index += 1

                start += self.chunk_size - self.overlap

        return chunks