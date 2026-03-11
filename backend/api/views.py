import uuid

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Document

from services.pdf_parser import PDFParser
from services.chunking import TextChunker
from services.embeddings import embedding_service
from services.vector_store import vector_store


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_pdf(request):

    file = request.FILES.get("file")

    if not file:
        return Response(
            {"error": "No file uploaded"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not file.name.endswith(".pdf"):
        return Response(
            {"error": "Only PDF files allowed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    file_bytes = file.read()

    # Parse
    pages = PDFParser.parse_pdf(file_bytes)

    chunker = TextChunker()
    chunks = chunker.chunk_pages(pages)

    texts = [c["text"] for c in chunks]

    embeddings = embedding_service.embed_documents(texts)

    document_id = str(uuid.uuid4())

    vector_store.insert_chunks(
        document_id=document_id,
        chunks=chunks,
        embeddings=embeddings
    )

    doc = Document.objects.create(
        id=document_id,
        user=request.user,
        filename=file.name,
        pages=len(pages),
        chunks=len(chunks)
    )

    return Response({
        "document_id": str(doc.id),
        "pages": doc.pages,
        "chunks": doc.chunks
    })


from services.rag_pipeline import rag_pipeline


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def query_document(request):

    question = request.data.get("question")
    document_id = request.data.get("document_id")

    if not question:
        return Response({"error": "Question required"}, status=400)

    import asyncio
    result = asyncio.run(rag_pipeline.query(
        question=question,
        document_id=document_id
    ))

    return Response(result)
