from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, login_view, current_user,
    DoctorViewSet, AppointmentRequestViewSet
)

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentRequestViewSet, basename='appointment')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('me/', current_user, name='me'),
    path('', include(router.urls)),
]
