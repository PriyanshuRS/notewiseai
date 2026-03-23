from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailView, UserAnalyticsView,
    ChatListCreateView, ChatDetailView, DocumentUploadView, DocumentDeleteView, MessageCreateView,
    QuizGenerateView, QuizSubmitView, SummarizeView,
    FlashcardListCreateView, FlashcardReviewView, FlashcardGenerateView
)

urlpatterns = [
    # Auth
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', UserDetailView.as_view(), name='auth_me'),
    path('auth/analytics/', UserAnalyticsView.as_view(), name='auth_analytics'),

    # Chats
    path('chats/', ChatListCreateView.as_view(), name='chat_list_create'),
    path('chats/<uuid:pk>/', ChatDetailView.as_view(), name='chat_detail'),
    path('chats/<uuid:chat_id>/documents/', DocumentUploadView.as_view(), name='document_upload'),
    path('chats/<uuid:chat_id>/documents/<uuid:pk>/', DocumentDeleteView.as_view(), name='document_delete'),
    path('chats/<uuid:chat_id>/messages/', MessageCreateView.as_view(), name='message_create'),
    path('chats/<uuid:chat_id>/summarize/', SummarizeView.as_view(), name='summarize_chat'),
    
    # Quizzes
    path('quizzes/generate/', QuizGenerateView.as_view(), name='quiz_generate'),
    path('quizzes/<uuid:quiz_id>/submit/', QuizSubmitView.as_view(), name='quiz_submit'),

    # Flashcards
    path('study/flashcards/', FlashcardListCreateView.as_view(), name='flashcard_list_create'),
    path('study/flashcards/generate/', FlashcardGenerateView.as_view(), name='flashcard_generate'),
    path('study/flashcards/<uuid:pk>/review/', FlashcardReviewView.as_view(), name='flashcard_review'),
]
