import sys
import os
import asyncio
import uuid

# Add the parent directory (notewiseai) to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.pdf_parser import PDFParser
from backend.services.chunking import TextChunker
from backend.services.embeddings import embedding_service
from backend.services.vector_store import vector_store
from backend.services.rag_pipeline import rag_pipeline

async def test_rag():
    # 1. Configuration
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(script_dir, "sample.pdf")
    question = "Who is the team lead of Deep Azure? what is the name of the project" # Sample question from the PDF content
    document_id = str(uuid.uuid4())

    print(f"--- Testing RAG Pipeline with Document ID: {document_id} ---")

    # 2. Parse PDF
    print(f"Parsing {pdf_path}...")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    pages = PDFParser.parse_pdf(pdf_bytes)
    print(f"Extracted {len(pages)} pages.")

    # 3. Chunking
    print("Chunking text...")
    chunker = TextChunker()
    chunks = chunker.chunk_pages(pages)
    print(f"Created {len(chunks)} chunks.")

    # 4. Embeddings
    print("Generating embeddings...")
    texts = [c["text"] for c in chunks]
    embeddings = embedding_service.embed_documents(texts)

    # 5. Ingest into Vector Store
    print("Ingesting into vector store...")
    vector_store.insert_chunks(document_id, chunks, embeddings)

    # 6. Query RAG Pipeline
    print(f"Asking question: '{question}'")
    result = await rag_pipeline.query(question, document_id=document_id)

    # 7. Output Result
    print("\n--- RAG ANSWER ---")
    print(result["answer"])
    print("\n--- SOURCES ---")
    for source in result["sources"]:
        print(f"Page {source.page_number}: {source.text[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_rag())
