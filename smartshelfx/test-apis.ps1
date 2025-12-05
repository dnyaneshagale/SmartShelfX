# SmartShelfX API Test Script
# Run this after starting the application with: .\mvnw spring-boot:run
# Usage: .\test-apis.ps1

$baseUrl = "http://localhost:8080"

function Test-API {
    param (
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            Headers     = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "[PASS] $Name" -ForegroundColor Green
        return @{
            Name     = $Name
            Status   = "PASS"
            Response = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus -or ($ExpectedStatus -eq 200 -and $statusCode -eq 201)) {
            Write-Host "[PASS] $Name (Status: $statusCode)" -ForegroundColor Green
            return @{
                Name     = $Name
                Status   = "PASS"
                Response = $null
            }
        }
        if ($statusCode -eq 403 -and $ExpectedStatus -eq 403) {
            Write-Host "[PASS] $Name (Access Denied as expected)" -ForegroundColor Green
            return @{
                Name     = $Name
                Status   = "PASS"
                Response = $null
            }
        }
        Write-Host "[FAIL] $Name - Status: $statusCode, Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Name       = $Name
            Status     = "FAIL"
            Error      = $_.Exception.Message
            StatusCode = $statusCode
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SmartShelfX API Testing Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ==========================================
# 1. USER & ROLE MANAGEMENT
# ==========================================
Write-Host "`n--- 1. USER & ROLE MANAGEMENT ---" -ForegroundColor Yellow

$testResults = @()

# Register Admin
$result = Test-API -Name "1.1 Register Admin" -Method "POST" -Url "$baseUrl/api/auth/public/register" `
    -Body '{"username":"testadmin","email":"admin@smartshelfx.com","password":"Admin123!","roles":"ADMIN"}'
$testResults += $result

# Register Warehouse Manager
$result = Test-API -Name "1.2 Register Warehouse Manager" -Method "POST" -Url "$baseUrl/api/auth/public/register" `
    -Body '{"username":"warehousemgr","email":"warehouse@smartshelfx.com","password":"Warehouse123!","roles":"WAREHOUSEMANAGER"}'
$testResults += $result

# Register Vendor
$result = Test-API -Name "1.3 Register Vendor" -Method "POST" -Url "$baseUrl/api/auth/public/register" `
    -Body '{"username":"testvendor","email":"vendor@smartshelfx.com","password":"Vendor123!","roles":"VENDOR"}'
$testResults += $result

# Login Admin
$result = Test-API -Name "1.4 Login Admin" -Method "POST" -Url "$baseUrl/api/auth/public/login" `
    -Body '{"username":"testadmin","password":"Admin123!"}'
$testResults += $result
$adminToken = $result.Response.token
$adminId = $result.Response.id

# Login Warehouse Manager
$result = Test-API -Name "1.5 Login Warehouse Manager" -Method "POST" -Url "$baseUrl/api/auth/public/login" `
    -Body '{"username":"warehousemgr","password":"Warehouse123!"}'
$testResults += $result
$whToken = $result.Response.token

# Login Vendor
$result = Test-API -Name "1.6 Login Vendor" -Method "POST" -Url "$baseUrl/api/auth/public/login" `
    -Body '{"username":"testvendor","password":"Vendor123!"}'
$testResults += $result
$vendorToken = $result.Response.token
$vendorId = $result.Response.id

if ($adminToken) {
    Write-Host "`nTokens received successfully!" -ForegroundColor Cyan
}

# Dashboard Tests
$result = Test-API -Name "1.7 Dashboard (Admin)" -Method "GET" -Url "$baseUrl/api/dashboard" -Token $adminToken
$testResults += $result

$result = Test-API -Name "1.8 Inventory Level Card" -Method "GET" -Url "$baseUrl/api/dashboard/inventory-level" -Token $adminToken
$testResults += $result

$result = Test-API -Name "1.9 Low Stock Alerts Card" -Method "GET" -Url "$baseUrl/api/dashboard/low-stock-alerts" -Token $adminToken
$testResults += $result

$result = Test-API -Name "1.10 Auto-Restock Status Card" -Method "GET" -Url "$baseUrl/api/dashboard/auto-restock-status" -Token $adminToken
$testResults += $result

# ==========================================
# 2. INVENTORY CATALOG & PRODUCT MANAGEMENT
# ==========================================
Write-Host "`n--- 2. INVENTORY CATALOG & PRODUCT MANAGEMENT ---" -ForegroundColor Yellow

# Create Category
$result = Test-API -Name "2.1 Create Category (Admin)" -Method "POST" `
    -Url "$baseUrl/api/admin/categories?name=Electronics&description=Electronic%20items" -Token $adminToken
$testResults += $result
$categoryId = $result.Response.id

# Create Product
$productBody = @{
    name            = "Laptop Dell XPS 15"
    sku             = "LAPTOP-001"
    description     = "High-performance laptop"
    categoryId      = $categoryId
    vendorId        = $vendorId
    unitPrice       = 1299.99
    costPrice       = 999.99
    currentStock    = 50
    reorderLevel    = 10
    reorderQuantity = 20
    unit            = "PCS"
} | ConvertTo-Json

$result = Test-API -Name "2.2 Create Product (Admin)" -Method "POST" -Url "$baseUrl/api/admin/products" `
    -Body $productBody -Token $adminToken
$testResults += $result
$productId = $result.Response.id

# Get All Products
$result = Test-API -Name "2.3 Get All Products (Admin)" -Method "GET" -Url "$baseUrl/api/admin/products" -Token $adminToken
$testResults += $result

# Update Product
$updateBody = @{
    name        = "Laptop Dell XPS 15 Pro"
    description = "High-performance laptop - Updated"
    unitPrice   = 1399.99
} | ConvertTo-Json

$result = Test-API -Name "2.4 Update Product (Admin)" -Method "PUT" -Url "$baseUrl/api/admin/products/$productId" `
    -Body $updateBody -Token $adminToken
$testResults += $result

# Get Product by ID
$result = Test-API -Name "2.5 Get Product by ID" -Method "GET" -Url "$baseUrl/api/admin/products/$productId" -Token $adminToken
$testResults += $result

# Get Low Stock Products
$result = Test-API -Name "2.6 Get Low Stock Products" -Method "GET" -Url "$baseUrl/api/admin/products/low-stock" -Token $adminToken
$testResults += $result

# Get Audit Logs
$result = Test-API -Name "2.7 Get Audit Logs (Admin)" -Method "GET" -Url "$baseUrl/api/admin/audit-logs" -Token $adminToken
$testResults += $result

# Warehouse Manager Tests
$result = Test-API -Name "2.8 Get Products (Warehouse)" -Method "GET" -Url "$baseUrl/api/warehouse/products" -Token $whToken
$testResults += $result

# Update Stock (POST to /stock/update)
$stockBody = @{
    productId    = $productId
    quantity     = 5
    movementType = "ADJUSTMENT"
    reason       = "Stock adjustment"
} | ConvertTo-Json

$result = Test-API -Name "2.9 Update Stock (Warehouse)" -Method "POST" -Url "$baseUrl/api/warehouse/stock/update" `
    -Body $stockBody -Token $whToken
$testResults += $result

# Vendor Tests
$result = Test-API -Name "2.10 Get Own Products (Vendor)" -Method "GET" -Url "$baseUrl/api/vendor/products" -Token $vendorToken
$testResults += $result

# ==========================================
# 3. TRANSACTIONS (STOCK-IN / STOCK-OUT)
# ==========================================
Write-Host "`n--- 3. TRANSACTIONS (STOCK-IN / STOCK-OUT) ---" -ForegroundColor Yellow

# Stock-In
$stockInBody = @{
    productId        = $productId
    quantity         = 100
    vendorId         = $vendorId
    invoiceReference = "INV-2024-001"
    notes            = "Initial shipment"
} | ConvertTo-Json

$result = Test-API -Name "3.1 Stock-In Transaction" -Method "POST" -Url "$baseUrl/api/transactions/stock-in" `
    -Body $stockInBody -Token $whToken
$testResults += $result

# Stock-Out
$stockOutBody = @{
    productId         = $productId
    quantity          = 10
    orderReference    = "ORD-2024-001"
    customerReference = "CUST-001"
    notes             = "Customer order"
} | ConvertTo-Json

$result = Test-API -Name "3.2 Stock-Out Transaction" -Method "POST" -Url "$baseUrl/api/transactions/stock-out" `
    -Body $stockOutBody -Token $whToken
$testResults += $result

# Get Stock Movements
$result = Test-API -Name "3.3 Get Stock Movements" -Method "GET" -Url "$baseUrl/api/transactions/movements" -Token $whToken
$testResults += $result

# Get Movements by Product (using query param)
$result = Test-API -Name "3.4 Get Movements by Product" -Method "GET" `
    -Url "$baseUrl/api/transactions/movements?productId=$productId" -Token $whToken
$testResults += $result

# ==========================================
# 4. AI-BASED DEMAND FORECASTING
# ==========================================
Write-Host "`n--- 4. AI-BASED DEMAND FORECASTING ---" -ForegroundColor Yellow

# Generate Forecast
$forecastBody = @{
    productId = $productId
    period    = "DAILY"
    horizon   = 14
} | ConvertTo-Json

$result = Test-API -Name "4.1 Generate Forecast" -Method "POST" -Url "$baseUrl/api/forecast/generate" `
    -Body $forecastBody -Token $adminToken
$testResults += $result

# Get At-Risk Products
$result = Test-API -Name "4.2 Get At-Risk Products" -Method "GET" -Url "$baseUrl/api/forecast/at-risk" -Token $adminToken
$testResults += $result

# Get Latest Forecast
$result = Test-API -Name "4.3 Get Latest Forecast" -Method "GET" -Url "$baseUrl/api/forecast/latest/$productId" -Token $adminToken
$testResults += $result

# Get Forecast History
$result = Test-API -Name "4.4 Get Forecast History" -Method "GET" -Url "$baseUrl/api/forecast/history/$productId" -Token $adminToken
$testResults += $result

# ==========================================
# 5. AUTO-RESTOCK & PURCHASE ORDERS
# ==========================================
Write-Host "`n--- 5. AUTO-RESTOCK & PURCHASE ORDERS ---" -ForegroundColor Yellow

# Get Restock Suggestions
$result = Test-API -Name "5.1 Get Restock Suggestions" -Method "GET" -Url "$baseUrl/api/purchase-orders/suggestions" -Token $adminToken
$testResults += $result

# Create Purchase Order
$poBody = @{
    vendorId = $vendorId
    items    = @(
        @{
            productId = $productId
            quantity  = 50
            unitPrice = 999.99
        }
    )
    notes    = "Restocking order"
} | ConvertTo-Json

$result = Test-API -Name "5.2 Create Purchase Order" -Method "POST" -Url "$baseUrl/api/purchase-orders" `
    -Body $poBody -Token $adminToken
$testResults += $result
$poId = $result.Response.id

# Get All Purchase Orders
$result = Test-API -Name "5.3 Get All Purchase Orders" -Method "GET" -Url "$baseUrl/api/purchase-orders" -Token $adminToken
$testResults += $result

# Get Purchase Order by ID
if ($poId) {
    $result = Test-API -Name "5.4 Get PO by ID" -Method "GET" -Url "$baseUrl/api/purchase-orders/$poId" -Token $adminToken
    $testResults += $result

    # Submit for Approval
    $result = Test-API -Name "5.5 Submit PO for Approval" -Method "PUT" -Url "$baseUrl/api/purchase-orders/$poId/submit" -Token $adminToken
    $testResults += $result

    # Approve Purchase Order
    $result = Test-API -Name "5.6 Approve PO" -Method "PUT" -Url "$baseUrl/api/purchase-orders/$poId/approve" -Token $adminToken
    $testResults += $result
}

# Get Vendor's POs
$result = Test-API -Name "5.7 Get Vendor POs" -Method "GET" -Url "$baseUrl/api/purchase-orders/vendor" -Token $vendorToken
$testResults += $result

# ==========================================
# 6. ALERTS & NOTIFICATIONS
# ==========================================
Write-Host "`n--- 6. ALERTS & NOTIFICATIONS ---" -ForegroundColor Yellow

# Get All Notifications
$result = Test-API -Name "6.1 Get All Notifications" -Method "GET" -Url "$baseUrl/api/notifications" -Token $adminToken
$testResults += $result

# Get Unread Notifications
$result = Test-API -Name "6.2 Get Unread Notifications" -Method "GET" -Url "$baseUrl/api/notifications/unread" -Token $adminToken
$testResults += $result

# Get Unread Count
$result = Test-API -Name "6.3 Get Unread Count" -Method "GET" -Url "$baseUrl/api/notifications/count" -Token $adminToken
$testResults += $result

# Mark All as Read
$result = Test-API -Name "6.4 Mark All as Read" -Method "PUT" -Url "$baseUrl/api/notifications/read-all" -Token $adminToken
$testResults += $result

# ==========================================
# 7. ANALYTICS DASHBOARD & REPORTS
# ==========================================
Write-Host "`n--- 7. ANALYTICS DASHBOARD & REPORTS ---" -ForegroundColor Yellow

# Get Inventory Trends
$result = Test-API -Name "7.1 Get Inventory Trends" -Method "GET" -Url "$baseUrl/api/analytics/inventory-trends" -Token $adminToken
$testResults += $result

# Get Top Restocked Items
$result = Test-API -Name "7.2 Get Top Restocked Items" -Method "GET" -Url "$baseUrl/api/analytics/top-restocked" -Token $adminToken
$testResults += $result

# Get Category Distribution
$result = Test-API -Name "7.3 Get Category Distribution" -Method "GET" -Url "$baseUrl/api/analytics/category-distribution" -Token $adminToken
$testResults += $result

# Get Stock Status Summary
$result = Test-API -Name "7.4 Get Stock Status Summary" -Method "GET" -Url "$baseUrl/api/analytics/stock-status-summary" -Token $adminToken
$testResults += $result

# Get Vendor Performance
$result = Test-API -Name "7.5 Get Vendor Performance" -Method "GET" -Url "$baseUrl/api/analytics/vendor-performance" -Token $adminToken
$testResults += $result

# Export to Excel
$result = Test-API -Name "7.6 Export to Excel" -Method "GET" -Url "$baseUrl/api/analytics/export/excel" -Token $adminToken
$testResults += $result

# Export to PDF
$result = Test-API -Name "7.7 Export to PDF" -Method "GET" -Url "$baseUrl/api/analytics/export/pdf" -Token $adminToken
$testResults += $result

# ==========================================
# ROLE-BASED ACCESS CONTROL TESTS
# ==========================================
Write-Host "`n--- ROLE-BASED ACCESS CONTROL TESTS ---" -ForegroundColor Yellow

# Vendor trying to delete product (should fail with 403)
$result = Test-API -Name "RBAC.1 Vendor Delete (Expect 403)" -Method "DELETE" `
    -Url "$baseUrl/api/admin/products/$productId" -Token $vendorToken -ExpectedStatus 403
$testResults += $result

# Warehouse Manager trying to delete (should fail with 403)
$result = Test-API -Name "RBAC.2 WH Delete (Expect 403)" -Method "DELETE" `
    -Url "$baseUrl/api/admin/products/$productId" -Token $whToken -ExpectedStatus 403
$testResults += $result

# ==========================================
# SUMMARY
# ==========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "`nTotal Tests: $($testResults.Count)" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Name): Status $($_.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
