from django.urls import path
from .views import CreateReportView, DashboardView, MyReportsView, UpdateReportFeedbackView

urlpatterns = [
    path('create/', CreateReportView.as_view(), name='create-report'),
    path('my-reports/', MyReportsView.as_view(), name='my-reports'),
    path('<int:pk>/feedback/', UpdateReportFeedbackView.as_view(), name='report-feedback'),
    path('dashboard/', DashboardView.as_view()),
]
