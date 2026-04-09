from django.shortcuts import render
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import Report
from .serializers import ReportSerializer
from rest_framework.permissions import IsAdminUser
from alerts.models import Alert
from alerts.serializers import AlertSerializer
from users.models import ContactMessage
from users.serializers import ContactMessageSerializer

class CreateReportView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyReportsView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user).order_by('-created_at')

class UpdateReportFeedbackView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)

class AllReportsView(generics.ListAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]

class AllContactMessagesView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]

class AllAlertsView(generics.ListAPIView):
    queryset = Alert.objects.all().order_by('-sent_at')
    serializer_class = AlertSerializer
    permission_classes = [IsAdminUser]

class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_reports = Report.objects.count()

        reports_by_location = (
            Report.objects
            .values('location_name')
            .annotate(count=Count('id'))
        )

        return Response({
            "total_reports": total_reports,
            "reports_by_location": list(reports_by_location)
        })        