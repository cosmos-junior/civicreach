from django.db import models
from reports.models import Report


class Alert(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
    ]

    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='alerts')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Alert for {self.report} - {self.status}"