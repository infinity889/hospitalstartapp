from django.contrib import admin
from .models import Doctor, AppointmentRequest

admin.site.register(Doctor)
admin.site.register(AppointmentRequest)
