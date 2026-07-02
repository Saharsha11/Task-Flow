from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    """
    Object-level permission: only the project's owner can access it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user