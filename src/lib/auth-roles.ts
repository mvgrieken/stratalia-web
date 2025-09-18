/**
 * Authentication roles and permissions system
 * Defines user roles and their capabilities within Stratalia
 */

export type UserRole = 'user' | 'moderator' | 'admin';

export interface RolePermissions {
  canViewAdminPanel: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canDeleteUsers: boolean;
  canChangeUserRoles: boolean;
  canViewAuditLogs: boolean;
  canManageSystemSettings: boolean;
  canAccessAnalytics: boolean;
  canManageKnowledgeBase: boolean;
  canApproveSubmissions: boolean;
}

/**
 * Role hierarchy and permissions matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canViewAdminPanel: false,
    canModerateContent: false,
    canManageUsers: false,
    canDeleteUsers: false,
    canChangeUserRoles: false,
    canViewAuditLogs: false,
    canManageSystemSettings: false,
    canAccessAnalytics: false,
    canManageKnowledgeBase: false,
    canApproveSubmissions: false,
  },
  moderator: {
    canViewAdminPanel: true,
    canModerateContent: true,
    canManageUsers: false,
    canDeleteUsers: false,
    canChangeUserRoles: false,
    canViewAuditLogs: true,
    canManageSystemSettings: false,
    canAccessAnalytics: true,
    canManageKnowledgeBase: true,
    canApproveSubmissions: true,
  },
  admin: {
    canViewAdminPanel: true,
    canModerateContent: true,
    canManageUsers: true,
    canDeleteUsers: true,
    canChangeUserRoles: true,
    canViewAuditLogs: true,
    canManageSystemSettings: true,
    canAccessAnalytics: true,
    canManageKnowledgeBase: true,
    canApproveSubmissions: true,
  },
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission];
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdmin(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canViewAdminPanel');
}

/**
 * Check if user can moderate content
 */
export function canModerateContent(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canModerateContent');
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canManageUsers');
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'Gebruiker';
    case 'moderator':
      return 'Moderator';
    case 'admin':
      return 'Administrator';
    default:
      return 'Onbekend';
  }
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case 'moderator':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

/**
 * Validate role change permissions
 */
export function canChangeRole(
  currentUserRole: UserRole, 
  targetCurrentRole: UserRole, 
  targetNewRole: UserRole,
  isSelf: boolean = false
): { allowed: boolean; reason?: string } {
  // Users cannot change any roles
  if (currentUserRole === 'user') {
    return { allowed: false, reason: 'Onvoldoende rechten' };
  }

  // Prevent self-demotion to user (lock out protection)
  if (isSelf && targetNewRole === 'user' && (currentUserRole === 'moderator' || currentUserRole === 'admin')) {
    return { allowed: false, reason: 'Je kunt je eigen rol niet verlagen naar gebruiker' };
  }

  // Moderators can only promote users to moderator
  if (currentUserRole === 'moderator') {
    if (targetCurrentRole !== 'user' || targetNewRole !== 'moderator') {
      return { allowed: false, reason: 'Moderators kunnen alleen gebruikers promoveren tot moderator' };
    }
    return { allowed: true };
  }

  // Admins can change any role (with self-protection)
  if (currentUserRole === 'admin') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Onbekende rol' };
}

/**
 * Get available roles for promotion by current user
 */
export function getAvailableRoles(currentUserRole: UserRole): UserRole[] {
  switch (currentUserRole) {
    case 'user':
      return ['user']; // Users can't change roles
    case 'moderator':
      return ['user', 'moderator']; // Moderators can manage up to moderator
    case 'admin':
      return ['user', 'moderator', 'admin']; // Admins can manage all roles
    default:
      return ['user'];
  }
}

/**
 * Role-based route access control
 */
export function getAccessibleRoutes(userRole: UserRole): string[] {
  const baseRoutes = [
    '/',
    '/search',
    '/knowledge',
    '/word-of-the-day',
    '/dashboard',
    '/profile'
  ];

  const moderatorRoutes = [
    '/admin',
    '/admin/content',
    '/admin/moderation'
  ];

  const adminRoutes = [
    '/admin/users',
    '/admin/analytics',
    '/admin/settings',
    '/admin/audit'
  ];

  switch (userRole) {
    case 'user':
      return baseRoutes;
    case 'moderator':
      return [...baseRoutes, ...moderatorRoutes];
    case 'admin':
      return [...baseRoutes, ...moderatorRoutes, ...adminRoutes];
    default:
      return baseRoutes;
  }
}

/**
 * Check if user can access specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(userRole);
  return accessibleRoutes.some(allowedRoute => 
    route === allowedRoute || route.startsWith(allowedRoute + '/')
  );
}
