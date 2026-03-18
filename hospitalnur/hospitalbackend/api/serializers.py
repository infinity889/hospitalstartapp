from rest_framework import serializers
from .models import Doctor, AppointmentRequest
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentRequestSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    assigned_doctor_details = DoctorSerializer(source='assigned_doctor', read_only=True)

    class Meta:
        model = AppointmentRequest
        fields = ['id', 'patient', 'patient_details', 'illness_description', 'preferred_time', 'assigned_doctor', 'assigned_doctor_details', 'status', 'created_at']
        read_only_fields = ['patient', 'status', 'assigned_doctor', 'created_at']
