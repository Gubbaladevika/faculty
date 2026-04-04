from django.urls import path
from . import views

urlpatterns = [
    path('departments/', views.get_departments),
    path('groups/', views.get_groups),
    path('subjects/', views.get_subjects),
    path('faculty/', views.get_faculty),
    path('students/', views.get_students),

    path('feedback/', views.get_feedbacks),
    path('feedback-status/', views.feedback_status),
    path('pending-students/', views.pending_students),

    path('submit-feedback/', views.submit_feedback),
    path('download-report/', views.download_report),
]