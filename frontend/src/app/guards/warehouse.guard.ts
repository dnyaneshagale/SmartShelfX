import { roleGuard } from './role.guard';

/**
 * Warehouse Guard
 * Allows access to ADMIN and MANAGER roles
 * 
 * Usage in routes:
 * canActivate: [warehouseGuard]
 */
export const warehouseGuard = roleGuard(['ADMIN', 'MANAGER']);
