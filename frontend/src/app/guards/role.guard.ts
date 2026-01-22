import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Generic role guard factory
 * Creates a guard that checks if user has any of the allowed roles
 * 
 * @param allowedRoles - Array of role strings that are allowed to access the route
 * @returns CanActivateFn that returns true if user has permission, false otherwise
 * 
 * Usage:
 * canActivate: [roleGuard(['ADMIN', 'WAREHOUSE_MANAGER'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    
    const userRole = authService.getUserRole();
    
    // Check if user has one of the allowed roles
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    
    // Redirect to role-specific dashboard if unauthorized
    if (userRole) {
      const rolePath = getRoleDashboardPath(userRole);
      router.navigate([rolePath]);
    } else {
      router.navigate(['/login']);
    }
    
    return false;
  };
};

/**
 * Helper function to get dashboard path based on role
 */
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'MANAGER':
      return '/warehouse/dashboard';
    case 'VENDOR':
      return '/vendor/dashboard';
    default:
      return '/login';
  }
}
