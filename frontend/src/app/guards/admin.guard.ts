import { roleGuard } from './role.guard';

/**
 * Admin Guard
 * Restricts access to ADMIN role only
 * 
 * Usage in routes:
 * canActivate: [adminGuard]
 */
export const adminGuard = roleGuard(['ADMIN']);
