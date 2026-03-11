import uuid
from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    file = models.FileField(
        upload_to="documents/"
    )

    filename = models.CharField(
        max_length=255
    )

    pages = models.IntegerField(
        default=0
    )

    chunks = models.IntegerField(
        default=0
    )

    status = models.CharField(
        max_length=20,
        default="processing"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.filename