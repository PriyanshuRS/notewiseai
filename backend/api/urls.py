from django.urls import path
from .views import upload_pdf, query_document

urlpatterns = [
    path("upload/", upload_pdf),
    path("query/", query_document),
]
