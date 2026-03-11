from django.urls import path
from .views import upload_pdf, query_document, delete_document, list_documents

urlpatterns = [
    path("upload/", upload_pdf),
    path("query/", query_document),
    path("delete/<uuid:document_id>/", delete_document),
    path("documents", list_documents),
]
