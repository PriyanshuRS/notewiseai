import fitz
import re
from typing import List, Dict

class PDFParser:
    """
    Service responsible for extracting structured text from PDFs.
    Uses PyMuPDF (fitz) for high-performance parsing.
    """
    
    @staticmethod
    def parse_pdf(file_path: str) -> List[Dict]:
        """
        Extract text from each page of the PDF.
        Returns a list of dicts with page_number and text.
        """
        pages = []
        try:
            doc = fitz.open(file_path)
            for page_index in range(len(doc)):
                page = doc.load_page(page_index)
                text = clean_text(page.get_text("text"))
                pages.append({
                    "page_number": page_index + 1,
                    "text": text
                })
            doc.close()
        except Exception as e:
            raise RuntimeError(f"Failed to parse PDF: {str(e)}")
            
        return pages

def clean_text(text: str) -> str:
    """Normalize whitespace and remove excessive newlines."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
