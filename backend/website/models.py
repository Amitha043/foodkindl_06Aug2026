from django.db import models

class WaitlistEntry(models.Model):
    full_name = models.CharField(max_length=140)
    email = models.EmailField(unique=True)
    city = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

class ContactMessage(models.Model):
    name = models.CharField(max_length=140)
    email = models.EmailField()
    subject = models.CharField(max_length=180)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.subject
