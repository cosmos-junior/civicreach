from django.urls import path
from .views import RegisterView, ContactMessageView, UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('contact/', ContactMessageView.as_view(), name='contact'),
]
