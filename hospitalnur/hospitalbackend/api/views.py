from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import Doctor, AppointmentRequest
from .serializers import (
    DoctorSerializer, AppointmentRequestSerializer, 
    UserRegistrationSerializer, UserSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

class AppointmentRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own requests unless they are staff
        user = self.request.user
        if user.is_staff:
            return AppointmentRequest.objects.all()
        return AppointmentRequest.objects.filter(patient=user)

    def perform_create(self, serializer):
        # Automatically set the patient to the current user
        serializer.save(patient=self.request.user)
