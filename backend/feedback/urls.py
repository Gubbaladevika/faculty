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
    path('my-group/', views.my_group),
    path('my-faculty/', views.my_faculty),
    path("send-improvement-email/", views.send_improvement_email, name="send_improvement_email"),
    path("total-students-count/", views.total_students_count, name="total_students_count"),
    path("student-counts/", views.student_counts, name="student_counts"),
    path("student-lists/", views.student_lists, name="student_lists"),
]