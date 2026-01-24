export interface User {
  id?: number;
  username: string;
  fullName?: string;
  email?: string;
  role: 'ADMIN' | 'MANAGER' | 'VENDOR';
  active?: boolean;
  createdAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'MANAGER' | 'VENDOR';
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
  fullName: string;
  message?: string;
}

export interface Product {
  id?: number;
  sku: string;
  name: string;
  category?: string;
  price: number;
  currentStock: number;
  reorderLevel: number;
  vendor?: User;
  vendorId?: number;
  vendorName?: string;
  createdAt?: string;
}

export interface StockTransaction {
  id?: number;
  product?: Product;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  transactionDate?: string;
  remarks?: string;
}

export interface StockTransactionRequest {
  productId: number;
  transactionType: string;
  quantity: number;
  remarks?: string;
  requestedById?: number;
}

export interface StockApprovalRequest {
  id: number;
  product: Product;
  vendor: User;
  requestedBy: User;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  vendorRemarks?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface Forecast {
  id?: number;
  sku: string;
  predictedQuantity: number;
  currentStock: number;
  needsReorder: boolean;
  forecastDate?: string;
  reorderLevel?: number;
  method?: string;
}

export interface ForecastResponse {
  sku: string;
  predictedQuantity: number;
  currentStock: number;
  needsReorder: boolean;
  reorderLevel: number;
  forecastDate: string;
  method: string;
}

export interface PurchaseOrder {
  id?: number;
  poNumber?: string;
  product?: Product;
  productId?: number;
  productName?: string;
  vendor?: User;
  vendorId?: number;
  vendorName?: string;
  quantity: number;
  totalCost?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  expectedDeliveryDate?: string;
  createdAt?: string;
  approvedAt?: string;
  date?: Date | string;
}

export interface PurchaseOrderRequest {
  productId: number;
  quantity: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingPurchaseOrders: number;
  approvedPurchaseOrders: number;
  rejectedPurchaseOrders: number;
  totalVendors: number;
  totalUsers: number;
  reorderProducts: Product[];
  recentPurchaseOrders: PurchaseOrder[];
}
