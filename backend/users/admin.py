from django.contrib import admin
from .models import User, UserProfile, ApplicationHistory


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    ordering = ('-date_joined',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'city', 'state', 'occupation', 'gender', 'updated_at')
    search_fields = ('user__username', 'user__email', 'phone_number', 'city', 'state')
    list_filter = ('gender', 'city', 'state')
    ordering = ('-updated_at',)


@admin.register(ApplicationHistory)
class ApplicationHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_type', 'object_id', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    ordering = ('-created_at',)
