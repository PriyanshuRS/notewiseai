from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, UserSerializer, ChatSerializer, DocumentSerializer
from .models import Chat, Document
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import QuizAttempt, UserWeakness
        from django.db.models import Avg
        
        avg_score = QuizAttempt.objects.filter(user=request.user).aggregate(Avg('score'))['score__avg']
        weaknesses = UserWeakness.objects.filter(user=request.user).order_by('-incorrect_count')[:3]
        
        return Response({
            "average_score": round(avg_score, 1) if avg_score is not None else None,
            "top_weaknesses": [{"topic": w.topic_tag, "incorrect": w.incorrect_count} for w in weaknesses]
        })

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)

class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, chat_id):
        chat = generics.get_object_or_404(Chat, id=chat_id, user=request.user)
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)
        
        doc = Document.objects.create(
            user=request.user,
            chat=chat,
            file=file_obj,
            filename=file_obj.name,
            status="processing"
        )
        
        # trigger processing in the background
        from services.pdf_parser import PDFParser
        from services.chunking import TextChunker
        from services.embeddings import embedding_service
        from services.vector_store import vector_store
        import threading
        
        def process_doc():
            try:
                pages = PDFParser.parse_pdf(doc.file.path)
                chunker = TextChunker()
                chunks = chunker.chunk_pages(pages)
                
                texts = [c["text"] for c in chunks]
                embeddings = embedding_service.embed_documents(texts)
                
                vector_store.insert_chunks(
                    document_id=str(doc.id),
                    user_id=request.user.id,
                    chunks=chunks,
                    embeddings=embeddings
                )
                
                doc.pages = len(pages)
                doc.chunks = len(chunks)
                doc.status = "ready"
                doc.save()
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Doc Processing Failed: {e}")
                doc.status = "failed"
                doc.save()
                
        threading.Thread(target=process_doc).start()
        
        return Response(DocumentSerializer(doc).data, status=201)

class DocumentDeleteView(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class MessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        chat = generics.get_object_or_404(Chat, id=chat_id, user=request.user)
        content = request.data.get('content')
        if not content:
            return Response({"error": "Content required"}, status=400)
            
        from .models import Message
        from .serializers import MessageSerializer
        user_msg = Message.objects.create(chat=chat, sender='user', content=content)
        
        doc_ids = list(chat.documents.values_list('id', flat=True))
        doc_ids = [str(d) for d in doc_ids]

        import asyncio
        from services.rag_pipeline import rag_pipeline
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(rag_pipeline.query(
                question=content,
                user_id=request.user.id,
                document_ids=doc_ids
            ))
            loop.close()
        except RuntimeError:
            # Fallback if there's already a loop
            import asgiref.sync
            result = asgiref.sync.async_to_sync(rag_pipeline.query)(
                question=content,
                user_id=request.user.id,
                document_ids=doc_ids
            )
        
        ai_msg = Message.objects.create(chat=chat, sender='ai', content=result['answer'])
        
        return Response({
             "user_message": MessageSerializer(user_msg).data,
             "ai_message": MessageSerializer(ai_msg).data,
             "sources": result.get('sources', [])
        })

class QuizGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        chat_id = request.data.get('chat_id')
        topic = request.data.get('topic')
        
        if not chat_id or not topic:
            return Response({"error": "chat_id and topic are required"}, status=400)
            
        chat = generics.get_object_or_404(Chat, id=chat_id, user=request.user)
        doc_ids = list(chat.documents.values_list('id', flat=True))
        doc_ids = [str(d) for d in doc_ids]
        
        from services.embeddings import embedding_service
        from services.vector_store import vector_store
        
        query_vector = embedding_service.embed_query(topic)
        results = vector_store.search(
            query_vector=query_vector,
            user_id=request.user.id,
            document_ids=doc_ids,
            top_k=10
        )
        
        retrieved_chunks = [r.payload['text'] for r in getattr(results, 'points', [])]
        context = "\n".join(retrieved_chunks)
        
        if not context:
            return Response({"error": "No relevant context found in this chat for the given topic."}, status=400)
            
        import json
        from services.ollama_client import ollama_client
        import asyncio
        
        prompt = f"""
CONTEXT:
{context}

Generate a 3-question multiple-choice assessment quiz about "{topic}" based ONLY on the context above.
Each question MUST have exactly 4 options.
Return ONLY valid JSON in this exact format. Do not use Markdown backticks.
{{
  "title": "Quiz Title",
  "questions": [
    {{
      "question_text": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "topic_tag": "{topic}"
    }}
  ]
}}
"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response_text = loop.run_until_complete(ollama_client.generate(prompt))
            loop.close()
        except RuntimeError:
            import asgiref.sync
            response_text = asgiref.sync.async_to_sync(ollama_client.generate)(prompt)
            
        try:
            # Strip potential markdown formatting if Ollama adds it anyway
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            quiz_data = json.loads(response_text)
            
            from .models import Quiz, Question
            quiz = Quiz.objects.create(user=request.user, title=quiz_data.get('title', f"{topic} Quiz"))
            for q in quiz_data.get('questions', []):
                Question.objects.create(
                    quiz=quiz,
                    question_text=q.get('question_text', ''),
                    options=q.get('options', []),
                    correct_answer=q.get('correct_answer', ''),
                    topic_tag=q.get('topic_tag', topic)
                )
        except Exception as e:
            return Response({"error": "Failed to parse AI response into quiz."}, status=500)
            
        from .serializers import QuizSerializer
        return Response(QuizSerializer(quiz).data, status=201)

class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        from .models import Quiz, QuizAttempt, AttemptDetail, Question, UserWeakness
        quiz = generics.get_object_or_404(Quiz, id=quiz_id, user=request.user)
        answers = request.data.get('answers', {}) # Dict of { question_id: user_answer }
        
        attempt = QuizAttempt.objects.create(user=request.user, quiz=quiz)
        correct_count = 0
        total_questions = quiz.questions.count()

        for question in quiz.questions.all():
            user_ans = answers.get(str(question.id), "")
            is_correct = (user_ans.strip().lower() == question.correct_answer.strip().lower())
            
            if is_correct:
                correct_count += 1
            else:
                # Track weakness
                weakness, _ = UserWeakness.objects.get_or_create(user=request.user, topic_tag=question.topic_tag)
                weakness.incorrect_count += 1
                weakness.save()

            AttemptDetail.objects.create(
                attempt=attempt,
                question=question,
                user_answer=user_ans,
                is_correct=is_correct
            )
            
        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
        attempt.score = score
        attempt.save()

        return Response({
            "score": score,
            "correct_count": correct_count,
            "total": total_questions,
            "attempt_id": attempt.id
        }, status=200)

class SummarizeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        topic = request.data.get('topic')
        if not topic:
            return Response({"error": "topic is required"}, status=400)
            
        chat = generics.get_object_or_404(Chat, id=chat_id, user=request.user)
        
        doc_ids = list(chat.documents.values_list('id', flat=True))
        doc_ids = [str(d) for d in doc_ids]

        from services.embeddings import embedding_service
        from services.vector_store import vector_store
        
        query_vector = embedding_service.embed_query(topic)
        results = vector_store.search(query_vector=query_vector, user_id=request.user.id, document_ids=doc_ids, top_k=15)
        
        retrieved_chunks = [r.payload['text'] for r in getattr(results, 'points', [])]
        context = "\n".join(retrieved_chunks)
        
        if not context:
            return Response({"error": "No relevant info found in notes for this topic."}, status=400)
            
        import asyncio
        from services.ollama_client import ollama_client
        
        prompt = f"""
CONTEXT:
{context}

Respond with a comprehensive and structured summary of "{topic}" using ONLY the provided context above. 
Do not hallucinate external information. Focus on the key concepts, definitions, and important facts.
"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response_text = loop.run_until_complete(ollama_client.generate(prompt))
            loop.close()
        except RuntimeError:
            import asgiref.sync
            response_text = asgiref.sync.async_to_sync(ollama_client.generate)(prompt)
            
        return Response({"summary": response_text}, status=200)

class FlashcardGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        chat_id = request.data.get('chat_id')
        
        if not topic or not chat_id:
            return Response({"error": "Topic and chat_id are required."}, status=400)
            
        from .models import Chat, Flashcard
        chat = generics.get_object_or_404(Chat, id=chat_id, user=request.user)
        
        doc_ids = list(chat.documents.values_list('id', flat=True))
        doc_ids = [str(d) for d in doc_ids]
        
        from services.vector_store import vector_store
        from services.embeddings import embedding_service
        
        query_vector = embedding_service.embed_query(topic)
        
        results = vector_store.search(
            query_vector=query_vector,
            user_id=request.user.id,
            document_ids=doc_ids,
            top_k=5
        )
        
        retrieved_chunks = [r.payload['text'] for r in getattr(results, 'points', [])]
        context = "\n".join(retrieved_chunks)
        
        if not context:
            return Response({"error": "No relevant context found in this chat for the given topic."}, status=400)
            
        import json
        from services.ollama_client import ollama_client
        import asyncio
        
        prompt = f"""
CONTEXT:
{context}

Generate 4 high-yield study flashcards about "{topic}" based ONLY on the context above.
Flashcards DO NOT have to be strictly "Questions" and "Answers". They can also formulate core concepts, important facts, definitions, or "Things to understand".

Return ONLY valid JSON in this exact format. Do not use Markdown backticks.
[
  {{
    "front_text": "Core concept, term, or question...",
    "back_text": "Detailed explanation, definition, or answer..."
  }}
]
"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response_text = loop.run_until_complete(ollama_client.generate(prompt))
            loop.close()
        except RuntimeError:
            import asgiref.sync
            response_text = asgiref.sync.async_to_sync(ollama_client.generate)(prompt)
            
        try:
            import re
            
            # Use regex to find the JSON array in case Ollama added conversational text
            match = re.search(r'\[[\s\S]*\]', response_text)
            if match:
                clean_json = match.group(0)
            else:
                clean_json = response_text
                
            cards_data = json.loads(clean_json)
            
            created_cards = []
            for c in cards_data:
                # Basic validation
                if not isinstance(c, dict) or 'front_text' not in c or 'back_text' not in c:
                    continue
                    
                card = Flashcard.objects.create(
                    user=request.user,
                    topic_tag=topic,
                    front_text=str(c.get('front_text', '')),
                    back_text=str(c.get('back_text', ''))
                )
                created_cards.append(card)
                
            from .serializers import FlashcardSerializer
            return Response(FlashcardSerializer(created_cards, many=True).data, status=201)
        except Exception as e:
            print(f"Failed to parse Flashcard AI JSON: {e}\nResponse Text:\n{response_text}")
            return Response({"error": f"Failed to parse AI response into flashcards: {str(e)}"}, status=500)

class FlashcardListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from .serializers import FlashcardSerializer
        return FlashcardSerializer

    def get_queryset(self):
        from .models import Flashcard
        # Return all flashcards for the user as notes
        return Flashcard.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FlashcardReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from .models import Flashcard
        from datetime import timedelta
        from django.utils import timezone

        card = generics.get_object_or_404(Flashcard, id=pk, user=request.user)
        difficulty = request.data.get('difficulty', 'medium') # easy, medium, hard
        
        if difficulty == 'easy':
            days_to_add = 4
        elif difficulty == 'hard':
            days_to_add = 1
        else:
            days_to_add = 2
            
        card.next_review_date = timezone.now().date() + timedelta(days=days_to_add)
        card.save()

        from .serializers import FlashcardSerializer
        return Response(FlashcardSerializer(card).data, status=200)