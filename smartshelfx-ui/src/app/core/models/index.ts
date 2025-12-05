// User and Auth models
export interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: Date;
}

export type Role = 'ADMIN' | 'WAREHOUSEMANAGER' | 'VENDOR' | 'USER';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name?: string;
  email: string;
  password: string;
  roles?: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: Role;
}

// Product models
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  unitPrice: number;
  costPrice: number;
  status: StockStatus;
  location: string;
  vendorId?: number;
  vendorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';

export interface ProductCreateRequest {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  unitPrice: number;
  costPrice: number;
  location?: string;
  vendorId?: number;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}

export interface ProductFilter {
  categoryId?: number;
  status?: StockStatus;
  searchTerm?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

// Category models
export interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
}

// Stock Movement models
export interface StockMovement {
  id: number;
  productId: number;
  productName?: string;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
  createdAt: Date;
}

export type MovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';

export interface StockInRequest {
  productId: number;
  quantity: number;
  reason: string;
  reference?: string;
}

export interface StockOutRequest {
  productId: number;
  quantity: number;
  reason: string;
  reference?: string;
}

export interface StockUpdateRequest {
  productId: number;
  newQuantity: number;
  reason: string;
}

// Forecast models
export interface DemandForecast {
  productId: number;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedReorder: number;
  suggestedReorderQty?: number;
  confidence?: number;
  confidenceScore: number;
  forecastDate: Date;
  trendData?: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface ForecastRequest {
  productId: number;
  days?: number;
}

// Reorder Request models
export interface ReorderRequest {
  id: number;
  productId: number;
  productName?: string;
  requestedQuantity: number;
  status: ReorderStatus;
  priority: string;
  vendorId?: number;
  vendorName?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReorderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';

export interface ReorderCreateRequest {
  productId: number;
  requestedQuantity: number;
  priority?: string;
  vendorId?: number;
  notes?: string;
}

// Purchase Order models (using ReorderRequest as base)
export interface PurchaseOrder extends ReorderRequest { }
export interface PurchaseOrderCreateRequest extends ReorderCreateRequest { }
export interface PurchaseOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}
export type PurchaseOrderStatus = ReorderStatus;

export interface RestockSuggestion {
  productId: number;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  priority: string;
}

// Notification models
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  productId?: number;
  productName?: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_APPROVED' | 'REORDER_REJECTED' | 'STOCK_RECEIVED' | 'SYSTEM';

// Dashboard models
export interface DashboardResponse {
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  recentMovements: StockMovement[];
  pendingReorders: number;
}

// Analytics models
export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryBreakdown: CategoryStat[];
  movementTrend: TrendDataPoint[];
}

export interface CategoryStat {
  categoryName: string;
  productCount: number;
  totalValue: number;
}

export interface VendorStats {
  vendorId: number;
  vendorName: string;
  productCount: number;
  totalValue: number;
  pendingOrders: number;
}

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  username: string;
  details: string;
  timestamp: Date;
}

// Pagination
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
}
