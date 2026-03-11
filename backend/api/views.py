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

    document_id = str(uuid.uuid4())

    # Save file first
    doc = Document.objects.create(
        id=document_id,
        user=request.user,
        file=file,
        filename=file.name,
        status="processing"
    )

    file.seek(0)
    file_bytes = file.read()

    # Parse PDF
    pages = PDFParser.parse_pdf(file_bytes)
    
    # Chunk
    chunker = TextChunker()
    chunks = chunker.chunk_pages(pages)

    texts = [c["text"] for c in chunks]

    embeddings = embedding_service.embed_documents(texts)

    vector_store.insert_chunks(
        document_id=document_id,
        user_id=request.user.id,
        chunks=chunks,
        embeddings=embeddings
    )

    doc.pages = len(pages)
    doc.chunks = len(chunks)
    doc.status = "ready"
    doc.save()

    return Response({
        "document_id": document_id,
        "pages": doc.pages,
        "chunks": doc.chunks,
        "status": doc.status
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
        user_id=request.user.id,
        document_id=document_id
    ))

    return Response(result)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_document(request, document_id):
    """
    Delete a document from DB, storage, and vector store.
    """
    try:
        doc = Document.objects.get(id=document_id, user=request.user)
        
        # 1. Delete from Vector Store (Qdrant)
        vector_store.delete_document(document_id)
        
        # 2. Delete the physical file (Django handles this if we call doc.file.delete())
        doc.file.delete()
        
        # 3. Delete from Database
        doc.delete()
        
        return Response({"message": "Document deleted successfully"}, status=status.HTTP_200_OK)
        
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
