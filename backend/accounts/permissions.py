from rest_framework import permissions


def get_employee(user):
    """Return the active Employee record for this user, or None."""
    try:
        emp = user.employee_profile
        return emp if emp.is_active else None
    except Exception:
        return None


def has_role(user, *roles):
    """True if the user is a merchant OR an active employee with one of the given roles."""
    if user.is_merchant or user.is_superuser:
        return True
    emp = get_employee(user)
    return emp is not None and emp.role in roles


class IsStoreStaff(permissions.BasePermission):
    """Authenticated merchant OR any active employee of any store."""
    message = 'Only store staff can perform this action.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_merchant or user.is_superuser:
            return True
        return get_employee(user) is not None


class IsMerchantOnly(permissions.BasePermission):
    """Only the merchant (store owner) or superuser."""
    message = 'Only the store owner can perform this action.'

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_merchant or user.is_superuser))


class CanManageProducts(permissions.BasePermission):
    """Merchant, manager, or product_editor employee."""
    message = 'You do not have permission to manage products.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return has_role(request.user, 'manager', 'product_editor')


class CanManageOrders(permissions.BasePermission):
    """Merchant, manager, or order_handler employee."""
    message = 'You do not have permission to manage orders.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return has_role(request.user, 'manager', 'order_handler', 'viewer')
        return has_role(request.user, 'manager', 'order_handler')


class CanViewAnalytics(permissions.BasePermission):
    """Merchant, manager, or viewer employee."""
    message = 'You do not have permission to view analytics.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return has_role(request.user, 'manager', 'viewer')


class CanManageEmployees(permissions.BasePermission):
    """Merchant or manager employee can manage employees."""
    message = 'Only the store owner or manager can manage employees.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return has_role(request.user, 'manager')
