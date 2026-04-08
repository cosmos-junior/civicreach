from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Report(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ATTENDED = 'attended'
    STATUS_NOT_ATTENDED = 'not_attended'

    ATTENDANCE_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ATTENDED, 'Attended'),
        (STATUS_NOT_ATTENDED, 'Not Attended'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    location_name = models.CharField(max_length=255)
    county = models.CharField(max_length=255, blank=True)
    subcounty = models.CharField(max_length=255, blank=True)
    division = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    sublocation = models.CharField(max_length=255, blank=True)
    ward = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    message = models.TextField()
    attendance_status = models.CharField(max_length=16, choices=ATTENDANCE_CHOICES, default=STATUS_PENDING)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.location_name} - {self.user}"