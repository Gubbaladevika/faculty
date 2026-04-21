import email
from urllib import request

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpResponse
from .models import Department, Group, Subject, Faculty, Student, Feedback
from .serializers import FeedbackSerializer
from openpyxl import Workbook
from io import BytesIO
from collections import defaultdict
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.conf import settings
from .models import Faculty

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)

        # ✅ ADD ROLE LOGIC
        role = "admin" if user.is_staff else "student"

        return Response({
            'access': str(refresh.access_token),
            'role': role   # ✅ THIS IS IMPORTANT
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
def signup(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "").strip()

    if not username or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({"message": "User created successfully"})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_feedbacks(request):
    feedbacks = Feedback.objects.all().order_by('-id')
    serializer = FeedbackSerializer(feedbacks, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_departments(request):
    data = Department.objects.all().values()
    return Response(data)



@api_view(['POST'])
def submit_feedback(request):
    try:
        student = Student.objects.filter(user=request.user).first()

        if not student:
            return Response({"error": "Student not found"}, status=400)

        faculty_id = request.data.get('faculty')

        if Feedback.objects.filter(student=student, faculty_id=faculty_id).exists():
            return Response({"error": "Already submitted"}, status=400)

        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=student)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": "Server error"}, status=500)
    return Response(data)




@api_view(['GET'])
@permission_classes([AllowAny])
def get_groups(request):
    department_id = request.GET.get('department')

    if department_id:
        data = Group.objects.filter(department_id=department_id).values()
    else:
        data = Group.objects.all().values()

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_subjects(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Subject.objects.filter(group_id=group_id).values()
    else:
        data = Subject.objects.all().values()

    return Response(data)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_faculty(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Faculty.objects.filter(group_id=group_id).values()
    else:
        data = Faculty.objects.all().values()

    return Response(data)



@api_view(['GET'])
@permission_classes([AllowAny])
def get_students(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Student.objects.filter(group_id=group_id).values()
    else:
        data = Student.objects.all().values()

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feedback_status(request):
    student = Student.objects.get(user=request.user)
    group_id = request.GET.get('group')

    submitted = Feedback.objects.filter(
        student=student,
        faculty__group_id=group_id
    )

    faculty_ids = submitted.values_list('faculty_id', flat=True)

    return Response(list(faculty_ids))



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_students(request):
    pending_list = []

    students = Student.objects.select_related("group", "group__department").all()

    for student in students:
        group = student.group
        faculties = Faculty.objects.filter(group=group)

        submitted_ids = set(
            Feedback.objects.filter(student=student)
            .values_list("faculty_id", flat=True)
            .distinct()
        )

        pending_faculties = faculties.exclude(id__in=submitted_ids)

        if pending_faculties.exists():
            pending_list.append({
                "id": student.id,
                "name": student.user.username if student.user else "",
                "group_name": group.name if group else "",
                "department_name": group.department.name if group and group.department else "",
                "pending_faculties": [f.name for f in pending_faculties],
            })

    return Response(pending_list)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_report(request):
    group_id = request.GET.get('group')

    feedbacks = Feedback.objects.filter(
        faculty__group_id=group_id
    )

    wb = Workbook()

    
    ws1 = wb.active
    ws1.title = "All Feedback"

    ws1.append([
        "Student", "Faculty", "Teaching", "Knowledge",
        "Communication", "Interaction", "Behaviour",
        "Punctuality", "Overall", "Comments"
    ])

    faculty_data = defaultdict(list)

    for f in feedbacks:
        ws1.append([
            f.student.name,
            f.faculty.name,
            f.teaching,
            f.knowledge,
            f.communication,
            f.interaction,
            f.behaviour,
            f.punctuality,
            f.overall,
            f.comments,
        ])

        avg = (
            f.teaching + f.knowledge + f.communication +
            f.interaction + f.behaviour + f.punctuality + f.overall
        ) / 7

        faculty_data[f.faculty.name].append(avg)

    ws2 = wb.create_sheet(title="Summary")
    ws2.append(["Faculty", "Responses", "Average Rating"])

    for faculty, ratings in faculty_data.items():
        total = len(ratings)
        avg_rating = sum(ratings) / total

        ws2.append([
            faculty,
            total,
            round(avg_rating, 2)
        ])

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response['Content-Disposition'] = 'attachment; filename=report.xlsx'

    return response


@api_view(['GET'])
def my_group(request):
    try:
        student = Student.objects.filter(user=request.user).first()

        if not student:
            return Response({"error": "Student not found"}, status=400)

        return Response({
            "group": student.group.id,
            "group_name": student.group.name,   
            "year": student.group.year,
            "department": student.group.department.name,
        })

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": "Server error"}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_faculty(request):
    try:
        student = Student.objects.filter(user=request.user).first()

        if not student:
            return Response({"error": "Student not found"}, status=400)

        faculty = Faculty.objects.filter(group=student.group).values('id', 'name')

        return Response(list(faculty))

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": "Server error"}, status=500)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_improvement_email(request):
    faculty_name = request.data.get("faculty_name")
    average = request.data.get("average")
    weak_areas = request.data.get("weak_areas", [])

    weak_area_text = (
        "\n".join([f"- {area}" for area in weak_areas])
        if weak_areas
        else "- No specific weak category found, but overall performance can still be improved."
    )

    subject = "Faculty Performance Improvement Notice"

    message = f"""
Dear {faculty_name},

This is to inform you that recent student feedback indicates that there are certain areas where improvement may be beneficial.

Overall Average Rating: {average}

Areas needing improvement:
{weak_area_text}

Suggestions for Improvement:
- Encourage more student interaction during class
- Improve communication clarity while explaining topics
- Focus on maintaining punctuality and class discipline
- Provide more practical examples for better understanding
- Increase student engagement through questions and discussions
- Maintain a positive and approachable behaviour with students

These suggestions are intended to support continuous improvement and enhance the overall classroom experience for students.

Thank you.
"""

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        ["gubbaladevika65@gmail.com"],
        fail_silently=False,
    )

    return Response({"message": "Email sent successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def total_students_count(request):
    total_students = Student.objects.count()

    return Response({
        "total_students": total_students
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_counts(request):
    total_students = Student.objects.count()
    pending_students = []

    students = Student.objects.select_related("group", "group__department").all()

    for student in students:
        group = student.group

        faculties = Faculty.objects.filter(group=group)
        total_faculty_count = faculties.count()

        submitted_faculty_ids = Feedback.objects.filter(
            student=student
        ).values_list("faculty_id", flat=True).distinct()

        submitted_count = submitted_faculty_ids.count()

        if submitted_count < total_faculty_count:
            pending_students.append(student.id)

    pending_count = len(pending_students)
    completed_count = total_students - pending_count

    return Response({
        "total_students": total_students,
        "completed_students": completed_count,
        "pending_students": pending_count
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_lists(request):
    students = Student.objects.select_related("group").all()

    total_students = []
    completed_students = []
    pending_students = []

    for student in students:
        group = student.group

        faculties = Faculty.objects.filter(group=group)
        total_faculty_count = faculties.count()

        submitted_count = (
            Feedback.objects.filter(student=student)
            .values_list("faculty_id", flat=True)
            .distinct()
            .count()
        )

        student_data = {
            "id": student.id,
            "name": student.name,
            "group": group.name if group else "",
            "submitted_count": submitted_count,
            "total_faculty_count": total_faculty_count,
        }

        total_students.append(student_data)

        if submitted_count >= total_faculty_count and total_faculty_count > 0:
            completed_students.append(student_data)
        else:
            pending_students.append(student_data)

    return Response({
        "total_students": total_students,
        "completed_students": completed_students,
        "pending_students": pending_students,
    })