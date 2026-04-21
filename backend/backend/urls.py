from django import views
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from feedback.views import login, my_group
from feedback.views import signup

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔥 connect all feedback app APIs here
    path('api/', include('feedback.urls')),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/signup/', signup),
    path('api/login/', login),
    path('api/my-group/', my_group),
    
]
    


