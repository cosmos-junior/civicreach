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

    # Incident type categories
    TYPE_LOW_REGISTRATION = 'low_registration'
    TYPE_INTIMIDATION = 'intimidation'
    TYPE_VIOLENCE = 'violence'
    TYPE_BRIBERY = 'bribery'
    TYPE_OTHER = 'other'

    INCIDENT_TYPE_CHOICES = [
        (TYPE_LOW_REGISTRATION, 'Low Voter Registration'),
        (TYPE_INTIMIDATION, 'Voter Intimidation'),
        (TYPE_VIOLENCE, 'Violence / Disruption'),
        (TYPE_BRIBERY, 'Vote Buying / Bribery'),
        (TYPE_OTHER, 'Other'),
    ]

    # Severity weights for heatmap intensity (exposed via serializer)
    SEVERITY_WEIGHTS = {
        TYPE_VIOLENCE: 1.0,
        TYPE_INTIMIDATION: 0.85,
        TYPE_BRIBERY: 0.75,
        TYPE_LOW_REGISTRATION: 0.6,
        TYPE_OTHER: 0.5,
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    incident_type = models.CharField(
        max_length=20,
        choices=INCIDENT_TYPE_CHOICES,
        default=TYPE_LOW_REGISTRATION,
    )
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

    @property
    def severity_weight(self):
        return self.SEVERITY_WEIGHTS.get(self.incident_type, 0.5)

    def __str__(self):
        return f"{self.incident_type} @ {self.location_name} - {self.user}"