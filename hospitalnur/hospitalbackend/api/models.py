from django.db import models
from django.contrib.auth.models import User

class Doctor(models.Model):
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    experience_years = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.name} - {self.specialization}"

class AppointmentRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending AI Assignment'),
        ('assigned', 'Doctor Assigned'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    )

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    illness_description = models.TextField()
    preferred_time = models.CharField(max_length=255) # Can be a string like "tomorrow morning" or specific time
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request by {self.patient.username} - {self.status}"
