from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid

from backend.services.pdf_parser import PDFParser
from backend.services.chunking import TextChunker
from backend.services.embeddings import embedding_service
from backend.services.vector_store import vector_store


router = APIRouter()


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF and index it into the vector database.
    """

    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    try:
        # Generate document ID
        document_id = str(uuid.uuid4())

        # Read file
        file_bytes = await file.read()

        # Step 1 — Parse PDF
        pages = PDFParser.parse_pdf(file_bytes)

        if not pages:
            raise HTTPException(
                status_code=400,
                detail="PDF contains no readable text"
            )

        # Step 2 — Chunk text
        chunker = TextChunker()
        chunks = chunker.chunk_pages(pages)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Failed to create chunks from PDF"
            )

        # Step 3 — Extract chunk texts
        texts = [c["text"] for c in chunks]

        # Step 4 — Generate embeddings
        embeddings = embedding_service.embed_documents(texts)

        # Step 5 — Store in Qdrant
        vector_store.insert_chunks(
            document_id=document_id,
            chunks=chunks,
            embeddings=embeddings
        )

        return {
            "message": "PDF indexed successfully",
            "document_id": document_id,
            "pages": len(pages),
            "chunks": len(chunks)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )