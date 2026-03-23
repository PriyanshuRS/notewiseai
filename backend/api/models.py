import uuid
from django.db import models
from django.contrib.auth.models import User

class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats")
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class Message(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}..."

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="documents", null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="documents/")
    filename = models.CharField(max_length=255)
    pages = models.IntegerField(default=0)
    chunks = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="processing")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class NoteSummary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="summaries")
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quizzes")
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="quizzes", null=True, blank=True)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.TextField()
    topic_tag = models.CharField(max_length=100)

class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

class AttemptDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="details")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)

class UserWeakness(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weaknesses")
    topic_tag = models.CharField(max_length=100)
    incorrect_count = models.IntegerField(default=0)

class Flashcard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="flashcards")
    topic_tag = models.CharField(max_length=100)
    front_text = models.TextField()
    back_text = models.TextField()
    next_review_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

from django.db.models.signals import post_delete
from django.dispatch import receiver
import os
import logging

logger = logging.getLogger(__name__)

@receiver(post_delete, sender=Document)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    # Delete from Qdrant database
    if instance.id:
        try:
            from services.vector_store import vector_store
            vector_store.delete_document(str(instance.id))
            logger.info(f"Deleted vectors for document {instance.id}")
        except Exception as e:
            logger.error(f"Failed to delete vectors for doc {instance.id}: {e}")
            
    # Delete from local filesystem media folder
    if instance.file:
        if os.path.isfile(instance.file.path):
            try:
                os.remove(instance.file.path)
                logger.info(f"Deleted file {instance.file.path}")
            except Exception as e:
                logger.error(f"Failed to delete file {instance.file.path}: {e}")