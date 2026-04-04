from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Alert
from .serializers import AlertSerializer

# Create your views here.
class AlertListView(generics.ListAPIView):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
