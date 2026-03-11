import fitz
from typing import List, Dict


class PDFParser:
    """
    Service responsible for extracting structured text from PDFs.
    Uses PyMuPDF (fitz) for high-performance parsing.
    """

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> List[Dict]:
        """
        Extract text from each page of the PDF.

        Returns:
            List[Dict] with structure:
            [
                {
                    "page_number": int,
                    "text": str
                }
            ]
        """

        pages = []

        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")

            for page_index in range(len(doc)):
                page = doc.load_page(page_index)

                text = clean_text(page.get_text("text"))

                pages.append(
                    {
                        "page_number": page_index + 1,
                        "text": text
                    }
                )

            doc.close()

        except Exception as e:
            raise RuntimeError(f"Failed to parse PDF: {str(e)}")

        return pages
    
import re


def clean_text(text: str) -> str:
    """
    Normalize whitespace and remove excessive newlines.
    """

    text = re.sub(r'\s+', ' ', text)
    return text.strip()