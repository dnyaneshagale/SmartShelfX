import { roleGuard } from './role.guard';

/**
 * Vendor Guard
 * Restricts access to VENDOR role only
 * 
 * Usage in routes:
 * canActivate: [vendorGuard]
 */
export const vendorGuard = roleGuard(['VENDOR']);
