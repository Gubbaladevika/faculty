from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    group_name = serializers.CharField(source='faculty.group.name', read_only=True)
    department = serializers.IntegerField(source='faculty.group.department.id', read_only=True)
    year = serializers.IntegerField(source='faculty.group.year', read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        extra_kwargs = {
            'student': {'required': False}
        }
    