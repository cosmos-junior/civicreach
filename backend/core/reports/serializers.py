from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    severity_weight = serializers.ReadOnlyField()
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'user', 'incident_type', 'incident_type_display', 'severity_weight',
            'location_name', 'county', 'subcounty', 'division',
            'location', 'sublocation', 'ward',
            'latitude', 'longitude', 'message',
            'attendance_status', 'created_at',
        ]
        read_only_fields = ['user', 'severity_weight', 'incident_type_display']