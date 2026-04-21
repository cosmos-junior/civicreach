from django.urls import path
from .views import (
    CreateReportView, DashboardView, MyReportsView,
    UpdateReportFeedbackView, AllReportsView,
    AllContactMessagesView, AllAlertsView, HeatmapReportsView,
)

urlpatterns = [
    path('create/', CreateReportView.as_view(), name='create-report'),
    path('my-reports/', MyReportsView.as_view(), name='my-reports'),
    path('<int:pk>/feedback/', UpdateReportFeedbackView.as_view(), name='report-feedback'),
    path('all-reports/', AllReportsView.as_view(), name='all-reports'),
    path('all-contact-messages/', AllContactMessagesView.as_view(), name='all-contact-messages'),
    path('all-alerts/', AllAlertsView.as_view(), name='all-alerts'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    # Heatmap: authenticated, filterable, no pagination (returns all matching)
    path('', HeatmapReportsView.as_view(), name='heatmap-reports'),
]
