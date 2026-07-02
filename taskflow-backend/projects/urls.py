from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    TaskListCreateView,
    TaskDetailView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:project_id>/tasks/", TaskListCreateView.as_view(), name="task-list"),
    path("<int:project_id>/tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]