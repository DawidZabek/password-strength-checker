from django.urls import path
from .views import check_password_strength

urlpatterns = [
    path('check/', check_password_strength),
]
