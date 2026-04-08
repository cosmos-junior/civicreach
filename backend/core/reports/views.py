from django.shortcuts import render
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.
from rest_framework import generics, permissions
from .models import Report
from .serializers import ReportSerializer
from rest_framework.permissions import IsAdminUser

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