from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from users.serializers import PhoneTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', PhoneTokenObtainPairView.as_view(permission_classes=[AllowAny]), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(permission_classes=[AllowAny]), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/alerts/', include('alerts.urls')),
]
