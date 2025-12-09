# SmartShelfX - API Reference Documentation

## Overview

SmartShelfX REST API is built with Spring Boot 3.4 and provides comprehensive endpoints for inventory management, demand forecasting, and analytics.

- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token

---

## Authentication

### Login

Authenticate user and receive JWT token.

```http
POST /auth/public/login
Content-Type: application/json

{
  "email": "admin@smartshelfx.com",
  "password": "Admin@123"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@smartshelfx.com",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "enabled": true
}
```

**Headers** (Include in all subsequent requests):
```
Authorization: Bearer <token>
```

### Register

Create new user account.

```http
POST /auth/public/register
Content-Type: application/json

{
  "username": "warehouse_mgr",
  "email": "wm@smartshelfx.com",
  "password": "WM@Password123",
  "roles": "WAREHOUSEMANAGER"
}
```

**Response** (200 OK):
```json
{
  "message": "User registered successfully",
  "username": "warehouse_mgr",
  "role": "WAREHOUSEMANAGER"
}
```

---

## Product Management (Admin)

### Get All Products

List all products with optional filters.

```http
GET /admin/products?page=0&size=20&sortBy=name&sortDirection=ASC&categoryId=1&vendorId=2&stockStatus=LOW_STOCK&search=laptop
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (int): Page number (0-indexed), default: 0
- `size` (int): Items per page, default: 20
- `sortBy` (string): Sort field (name, sku, created_at), default: name
- `sortDirection` (string): ASC or DESC, default: ASC
- `categoryId` (long): Filter by category
- `vendorId` (long): Filter by vendor
- `stockStatus` (enum): IN_STOCK, LOW_STOCK, OUT_OF_STOCK
- `search` (string): Search in name/SKU

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "sku": "LAPTOP-001",
      "name": "Dell XPS 13",
      "description": "High-performance laptop",
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "vendor": {
        "id": 5,
        "username": "dell_vendor",
        "email": "vendor@dell.com"
      },
      "currentStock": 45,
      "reorderLevel": 20,
      "reorderQuantity": 50,
      "unitPrice": 999.99,
      "costPrice": 800.00,
      "stockStatus": "IN_STOCK",
      "isActive": true,
      "createdAt": "2024-01-10T10:30:00",
      "updatedAt": "2024-01-15T14:20:00"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "pageSize": 20,
  "hasNext": true,
  "hasPrevious": false
}
```

### Create Product

Add new product to inventory.

```http
POST /admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "LAPTOP-002",
  "name": "HP Pavilion 15",
  "description": "Affordable laptop for everyday use",
  "categoryId": 1,
  "vendorId": 6,
  "currentStock": 30,
  "reorderLevel": 15,
  "reorderQuantity": 40,
  "unitPrice": 599.99,
  "costPrice": 450.00,
  "unit": "pieces"
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "sku": "LAPTOP-002",
  "name": "HP Pavilion 15",
  "description": "Affordable laptop for everyday use",
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "vendor": {
    "id": 6,
    "username": "hp_vendor"
  },
  "currentStock": 30,
  "reorderLevel": 15,
  "reorderQuantity": 40,
  "unitPrice": 599.99,
  "costPrice": 450.00,
  "stockStatus": "IN_STOCK",
  "createdAt": "2024-01-15T15:00:00",
  "updatedAt": "2024-01-15T15:00:00"
}
```

### Update Product

Modify existing product details.

```http
PUT /admin/products/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dell XPS 13 (Updated)",
  "description": "Updated description",
  "unitPrice": 1099.99,
  "reorderLevel": 25,
  "reorderQuantity": 60
}
```

**Response** (200 OK): Updated product object

### Delete Product

Remove product from inventory.

```http
DELETE /admin/products/1
Authorization: Bearer <token>
```

**Response** (204 No Content)

### Import Products (CSV)

Batch upload products via CSV file.

```http
POST /admin/products/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
file: <CSV file>
```

**CSV Format**:
```csv
sku,name,description,categoryId,vendorId,currentStock,reorderLevel,reorderQuantity,unitPrice,costPrice
LAPTOP-003,Product Name,Description,1,5,50,20,40,999.99,800.00
```

**Response** (200 OK):
```json
{
  "successCount": 10,
  "failureCount": 2,
  "message": "Imported 10 products, 2 failed",
  "errors": [
    {
      "row": 5,
      "error": "Duplicate SKU: LAPTOP-001"
    }
  ]
}
```

### Export Products (CSV)

Download all products as CSV.

```http
GET /admin/products/export?categoryId=1
Authorization: Bearer <token>
```

**Response** (200 OK): CSV file download

### Get Product By ID

Retrieve specific product details.

```http
GET /admin/products/1
Authorization: Bearer <token>
```

**Response** (200 OK): Product object

---

## Transactions (Stock-In / Stock-Out)

### Record Stock-In

Record incoming shipment from vendor.

```http
POST /transactions/stock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 50,
  "vendorId": 5,
  "referenceNumber": "PO-2024-001",
  "reason": "Purchase order received",
  "expiryDate": "2025-01-15",
  "batchNumber": "BATCH-001"
}
```

**Response** (200 OK):
```json
{
  "id": 101,
  "product": {
    "id": 1,
    "sku": "LAPTOP-001",
    "name": "Dell XPS 13"
  },
  "movementType": "STOCK_IN",
  "quantity": 50,
  "previousStock": 45,
  "newStock": 95,
  "reason": "Purchase order received",
  "referenceNumber": "PO-2024-001",
  "performedBy": {
    "id": 2,
    "username": "warehouse_mgr"
  },
  "createdAt": "2024-01-15T16:00:00"
}
```

### Record Stock-Out

Record outgoing sale or dispatch.

```http
POST /transactions/stock-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5,
  "customerReference": "ORDER-2024-5001",
  "reason": "Customer sale",
  "notes": "Shipped to customer address"
}
```

**Response** (200 OK): Stock movement object

### Batch Stock-In

Record multiple incoming shipments.

```http
POST /transactions/stock-in/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactions": [
    {
      "productId": 1,
      "quantity": 50,
      "vendorId": 5,
      "referenceNumber": "PO-2024-001"
    },
    {
      "productId": 2,
      "quantity": 30,
      "vendorId": 5,
      "referenceNumber": "PO-2024-001"
    }
  ]
}
```

**Response** (200 OK): Array of stock movement objects

### Get Transaction History

Retrieve stock movement records.

```http
GET /transactions/history?page=0&size=20&productId=1&startDate=2024-01-01&endDate=2024-01-31&movementType=STOCK_IN
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (int): Page number
- `size` (int): Items per page
- `productId` (long): Filter by product
- `startDate` (string): yyyy-MM-dd format
- `endDate` (string): yyyy-MM-dd format
- `movementType` (enum): STOCK_IN, STOCK_OUT, ADJUSTMENT

**Response** (200 OK): Paginated list of stock movements

---

## Demand Forecasting

### Get Demand Predictions

Retrieve AI-generated demand forecasts.

```http
GET /api/forecast/predictions?productId=1&forecastDays=7
Authorization: Bearer <token>
```

**Query Parameters**:
- `productId` (long): Product to forecast
- `forecastDays` (int): Days to forecast, default: 7, max: 30

**Response** (200 OK):
```json
{
  "productId": 1,
  "product": {
    "id": 1,
    "sku": "LAPTOP-001",
    "name": "Dell XPS 13"
  },
  "forecastGeneratedAt": "2024-01-15T16:30:00",
  "predictions": [
    {
      "date": "2024-01-16",
      "predictedDemand": 15,
      "lowerBound": 10,
      "upperBound": 22,
      "confidenceScore": 0.85
    },
    {
      "date": "2024-01-17",
      "predictedDemand": 18,
      "lowerBound": 12,
      "upperBound": 25,
      "confidenceScore": 0.82
    }
  ],
  "summary": {
    "avgPredictedDemand": 16,
    "maxPredictedDemand": 20,
    "overallConfidence": 0.84
  }
}
```

### Generate Forecasts

Trigger AI engine to generate new forecasts for all products.

```http
POST /api/forecast/generate
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "status": "generating",
  "productsToForecast": 150,
  "generatedAt": "2024-01-15T16:35:00",
  "jobId": "forecast-job-12345"
}
```

### Get Risk Products

Identify products at risk of stockout.

```http
GET /api/forecast/risk-products?riskLevel=HIGH
Authorization: Bearer <token>
```

**Query Parameters**:
- `riskLevel` (enum): LOW, MEDIUM, HIGH, CRITICAL

**Response** (200 OK):
```json
{
  "riskAnalysisDate": "2024-01-15T16:40:00",
  "products": [
    {
      "productId": 1,
      "sku": "LAPTOP-001",
      "name": "Dell XPS 13",
      "currentStock": 15,
      "reorderLevel": 20,
      "predictedDemand7Days": 25,
      "daysUntilStockout": 1,
      "riskLevel": "CRITICAL",
      "recommendedRestockQty": 50,
      "restockUrgency": "IMMEDIATE"
    }
  ],
  "criticalCount": 3,
  "highRiskCount": 8,
  "mediumRiskCount": 15
}
```

---

## Purchase Orders

### Create Purchase Order

Generate new purchase order.

```http
POST /purchase-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendorId": 5,
  "items": [
    {
      "productId": 1,
      "quantity": 50,
      "unitPrice": 800.00
    },
    {
      "productId": 2,
      "quantity": 30,
      "unitPrice": 500.00
    }
  ],
  "expectedDeliveryDate": "2024-01-25",
  "notes": "Urgent delivery requested"
}
```

**Response** (201 Created):
```json
{
  "id": 501,
  "poNumber": "PO-2024-0501",
  "vendor": {
    "id": 5,
    "username": "dell_vendor",
    "email": "vendor@dell.com"
  },
  "items": [
    {
      "id": 1001,
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Dell XPS 13"
      },
      "quantity": 50,
      "unitPrice": 800.00,
      "totalPrice": 40000.00
    }
  ],
  "totalAmount": 55000.00,
  "status": "PENDING",
  "expectedDeliveryDate": "2024-01-25",
  "createdAt": "2024-01-15T17:00:00",
  "createdBy": {
    "id": 1,
    "username": "admin"
  }
}
```

### Auto-Generate Purchase Orders

Generate POs based on AI recommendations.

```http
POST /purchase-orders/auto-generate
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "generatedCount": 8,
  "totalAmount": 125000.00,
  "purchaseOrders": [
    {
      "id": 502,
      "poNumber": "PO-2024-0502",
      "vendor": {...},
      "items": [...],
      "totalAmount": 50000.00,
      "status": "PENDING"
    }
  ]
}
```

### Get Restock Suggestions

Retrieve AI-suggested restock items.

```http
GET /purchase-orders/suggestions
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "suggestions": [
    {
      "productId": 1,
      "sku": "LAPTOP-001",
      "name": "Dell XPS 13",
      "vendor": {
        "id": 5,
        "username": "dell_vendor"
      },
      "currentStock": 15,
      "reorderLevel": 20,
      "suggestedQuantity": 50,
      "estimatedCost": 40000.00,
      "urgency": "HIGH",
      "forecastedDemand": 25
    }
  ],
  "totalSuggestedItems": 8,
  "totalEstimatedCost": 125000.00
}
```

### Get Purchase Orders

List all purchase orders with filters.

```http
GET /purchase-orders?page=0&size=20&vendorId=5&status=PENDING&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response** (200 OK): Paginated list of POs

### Approve Purchase Order

Approve pending purchase order.

```http
PUT /purchase-orders/1/approve
Authorization: Bearer <token>
```

**Response** (200 OK): Updated PO object

### Receive Purchase Order

Mark PO items as received.

```http
PUT /purchase-orders/1/receive
Authorization: Bearer <token>
Content-Type: application/json

{
  "receivedDate": "2024-01-25",
  "receivedBy": "warehouse_mgr",
  "notes": "Items received and verified"
}
```

**Response** (200 OK): Updated PO object

---

## Analytics & Reports

### Get Inventory Trends

Analyze inventory levels over time.

```http
GET /analytics/inventory-trends?productId=1&categoryId=1&days=30
Authorization: Bearer <token>
```

**Query Parameters**:
- `productId` (long): Specific product (optional)
- `categoryId` (long): Specific category (optional)
- `days` (int): Number of days to analyze, default: 30

**Response** (200 OK):
```json
{
  "analysisPeriod": {
    "startDate": "2024-12-16",
    "endDate": "2025-01-15",
    "days": 30
  },
  "trends": [
    {
      "date": "2024-12-16",
      "totalStock": 5000,
      "averageStockPerProduct": 50,
      "productsInStock": 95,
      "productsLowStock": 4,
      "productsOutOfStock": 1
    }
  ],
  "summary": {
    "minTotalStock": 4500,
    "maxTotalStock": 5500,
    "avgTotalStock": 5100
  }
}
```

### Get Sales Comparison

Compare sales between two periods.

```http
GET /analytics/sales-comparison?startDate1=2024-12-01&endDate1=2024-12-31&startDate2=2025-01-01&endDate2=2025-01-15
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "period1": {
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "totalUnits": 500,
    "totalRevenue": 250000.00,
    "avgDailyUnits": 16.67,
    "avgDailyRevenue": 8064.52
  },
  "period2": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-15",
    "totalUnits": 250,
    "totalRevenue": 125000.00,
    "avgDailyUnits": 16.67,
    "avgDailyRevenue": 8333.33
  },
  "comparison": {
    "unitChange": 0,
    "unitChangePercent": 0.0,
    "revenueChange": -125000.00,
    "revenueChangePercent": -50.0,
    "trend": "DECLINING"
  }
}
```

### Get Top Restocked Items

Retrieve products with highest restock activity.

```http
GET /analytics/top-restocked?limit=10&days=30
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "period": {
    "startDate": "2024-12-16",
    "endDate": "2025-01-15",
    "days": 30
  },
  "topItems": [
    {
      "rank": 1,
      "productId": 1,
      "sku": "LAPTOP-001",
      "name": "Dell XPS 13",
      "restockCount": 8,
      "totalQuantityRestocked": 400,
      "lastRestockDate": "2025-01-15",
      "avgRestockInterval": 3.75
    }
  ],
  "totalRestockEvents": 50
}
```

### Export Analytics Report (Excel)

Download analytics report as Excel file.

```http
GET /analytics/export/excel?reportType=inventory_trends&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response** (200 OK): Excel file download

### Export Analytics Report (PDF)

Download analytics report as PDF.

```http
GET /analytics/export/pdf?reportType=sales_summary&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response** (200 OK): PDF file download

---

## Notifications & Alerts

### Get Notifications

Retrieve user notifications.

```http
GET /notifications?page=0&size=20&unreadOnly=false
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1001,
      "type": "LOW_STOCK",
      "priority": "HIGH",
      "title": "Low Stock Alert",
      "message": "Product LAPTOP-001 stock is below reorder level",
      "product": {
        "id": 1,
        "sku": "LAPTOP-001"
      },
      "read": false,
      "createdAt": "2024-01-15T17:30:00"
    }
  ],
  "totalElements": 45,
  "unreadCount": 12
}
```

### Mark Notification as Read

Mark notification as read.

```http
PUT /notifications/1001/read
Authorization: Bearer <token>
```

**Response** (200 OK): Notification object

### Dismiss Notification

Remove notification from inbox.

```http
DELETE /notifications/1001
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

## Error Responses

All errors follow this format:

```json
{
  "timestamp": "2024-01-15T18:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Product with SKU LAPTOP-001 already exists",
  "path": "/api/admin/products"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error - Internal error |

---

## Rate Limiting

API enforces rate limiting to prevent abuse:

- **General Endpoints**: 100 requests per minute per IP
- **Export Endpoints**: 10 requests per minute per user
- **Forecast Generation**: 5 requests per hour per user

Headers indicate rate limit status:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 89
X-RateLimit-Reset: 1705356000
```

---

## Pagination

Paginated responses include:

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {...}
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true,
  "empty": false,
  "numberOfElements": 20
}
```

---

## Sorting

Use `sortBy` and `sortDirection` query parameters:

```
GET /admin/products?sortBy=name&sortDirection=DESC
```

Supported sort fields vary by endpoint. See specific endpoint documentation.

---

## Date/Time Format

All timestamps use ISO 8601 format:
```
2024-01-15T18:30:45
```

Query parameters accept yyyy-MM-dd format:
```
startDate=2024-01-15
```

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/public/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartshelfx.com","password":"Admin@123"}'

# Get products (with token)
curl -X GET "http://localhost:8080/api/admin/products?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create product
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku":"NEW-001",
    "name":"New Product",
    "categoryId":1,
    "vendorId":5,
    "currentStock":100,
    "reorderLevel":20,
    "reorderQuantity":50,
    "unitPrice":99.99,
    "costPrice":75.00
  }'
```

---

**Last Updated**: January 15, 2025  
**API Version**: 1.0.0  
**Status**: Production Ready
