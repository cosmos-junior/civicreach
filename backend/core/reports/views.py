from django.db.models import Count
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework.throttling import UserRateThrottle
from rest_framework.pagination import PageNumberPagination
from .models import Report
from .serializers import ReportSerializer
from rest_framework.permissions import IsAdminUser
from alerts.models import Alert
from alerts.serializers import AlertSerializer
from users.models import ContactMessage
from users.serializers import ContactMessageSerializer


# ── Throttle: max 10 report submissions per hour per user ──────────────────
class ReportSubmitThrottle(UserRateThrottle):
    rate = '10/hour'


# ── Pagination: 50 results per page ────────────────────────────────────────
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


# ── Views ───────────────────────────────────────────────────────────────────

class CreateReportView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ReportSubmitThrottle]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyReportsView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user).order_by('-created_at')


class UpdateReportFeedbackView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)


class AllReportsView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Report.objects.all().order_by('-created_at')


# Public heatmap endpoint — authenticated users can view all reports
# Supports ?incident_type=violence&date_from=2024-01-01&date_to=2024-12-31
class HeatmapReportsView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Report.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
        ).order_by('-created_at')

        incident_type = self.request.query_params.get('incident_type')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if incident_type and incident_type != 'all':
            qs = qs.filter(incident_type=incident_type)

        if date_from:
            parsed = parse_date(date_from)
            if parsed:
                qs = qs.filter(created_at__date__gte=parsed)

        if date_to:
            parsed = parse_date(date_to)
            if parsed:
                qs = qs.filter(created_at__date__lte=parsed)

        return qs


class AllContactMessagesView(generics.ListAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return ContactMessage.objects.all().order_by('-created_at')


class AllAlertsView(generics.ListAPIView):
    serializer_class = AlertSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Alert.objects.all().order_by('-sent_at')


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_reports = Report.objects.count()

        reports_by_location = list(
            Report.objects
            .values('location_name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        reports_by_type = list(
            Report.objects
            .values('incident_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            "total_reports": total_reports,
            "reports_by_location": reports_by_location,
            "reports_by_type": reports_by_type,
        })