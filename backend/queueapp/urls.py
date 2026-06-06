from django.urls import path
from .views import *

urlpatterns = [
    path('queue/', get_queue),
    path('add/', add_customer),
    path('home/', home),
    path('reset/', reset_queue),
    path('delete/<int:id>/', delete_customer),
    path('update/<int:id>/', update_status),
]