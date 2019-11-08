from django.contrib import admin
from .models import GenbankSummary

# Register your models here.
@admin.register(GenbankSummary)
class MyGenbankSummary(admin.ModelAdmin):
    pass