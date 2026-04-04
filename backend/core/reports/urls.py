from django.urls import path
from .views import CreateReportView, DashboardView

urlpatterns = [
    path('create/', CreateReportView.as_view(), name='create-report'),
    path('dashboard/', DashboardView.as_view()),

]
