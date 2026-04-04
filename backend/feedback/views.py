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
    name = request.data.get('name')
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=name
    )

    return Response({"message": "User created successfully"})


# 🔐 SUBMIT FEEDBACk
from rest_framework.response import Response
from rest_framework.decorators import api_view



# 🔐 GET ALL FEEDBACK (ADMIN)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feedbacks(request):
    feedbacks = Feedback.objects.all().order_by('-id')
    serializer = FeedbackSerializer(feedbacks, many=True)
    return Response(serializer.data)


# 🔓 GET DEPARTMENTS
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


# 🔓 GET GROUPS (FILTER BY DEPARTMENT)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_groups(request):
    department_id = request.GET.get('department')

    if department_id:
        data = Group.objects.filter(department_id=department_id).values()
    else:
        data = Group.objects.all().values()

    return Response(data)


# 🔓 GET SUBJECTS
@api_view(['GET'])
@permission_classes([AllowAny])
def get_subjects(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Subject.objects.filter(group_id=group_id).values()
    else:
        data = Subject.objects.all().values()

    return Response(data)


# 🔓 GET FACULTY
@api_view(['GET'])
@permission_classes([AllowAny])
def get_faculty(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Faculty.objects.filter(group_id=group_id).values()
    else:
        data = Faculty.objects.all().values()

    return Response(data)


# 🔓 GET STUDENTS
@api_view(['GET'])
@permission_classes([AllowAny])
def get_students(request):
    group_id = request.GET.get('group')

    if group_id:
        data = Student.objects.filter(group_id=group_id).values()
    else:
        data = Student.objects.all().values()

    return Response(data)


# 🔐 FEEDBACK STATUS (STUDENT)
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


# 🔐 PENDING STUDENTS (ADMIN)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_students(request):
    group_id = request.GET.get('group')

    if not group_id:
        return Response({"error": "Group ID required"}, status=400)

    students = Student.objects.filter(group_id=group_id)
    faculty_ids = Faculty.objects.filter(group_id=group_id).values_list('id', flat=True)

    pending = []

    for student in students:
        submitted = Feedback.objects.filter(
            student=student,
            faculty__group_id=group_id
        ).values_list('faculty_id', flat=True)

        if set(submitted) != set(faculty_ids):
            pending.append({
                "id": student.id,
                "name": student.name
            })

    return Response(pending)


# 🔐 DOWNLOAD REPORT (EXCEL)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_report(request):
    group_id = request.GET.get('group')

    feedbacks = Feedback.objects.filter(
        faculty__group_id=group_id
    )

    wb = Workbook()

    # 🔹 SHEET 1
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

    # 🔹 SHEET 2
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
            "group_name": student.group.name
        })

    except Exception as e:
        print("ERROR:", e)
        return Response({"error": "Server error"}, status=500)