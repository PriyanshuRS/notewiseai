from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
import uuid


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

    filename = models.CharField(max_length=255)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    pages = models.IntegerField(default=0)

    chunks = models.IntegerField(default=0)

    def __str__(self):
        return self.filename
