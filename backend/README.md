# SmartShelfX Backend

## Overview
Spring Boot backend for SmartShelfX - AI-Based Inventory Forecast & Auto-Replenishment System.

## Technology Stack
- **Java**: 17
- **Spring Boot**: 3.2.1
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Prerequisites
1. JDK 17 or higher
2. Maven 3.6+
3. MySQL 8.0+

## Setup Instructions

### 1. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run schema and seed data
source database/schema.sql
source database/seed_data.sql
```

### 2. Configure Database
Update `src/main/resources/application.properties`:
```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

### 3. Build and Run
```bash
# Navigate to backend directory
cd backend

# Clean and install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## API Documentation
Access Swagger UI: `http://localhost:8080/swagger-ui.html`

## Default Users
| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| manager1 | password123 | MANAGER |
| vendor1 | password123 | VENDOR |
| vendor2 | password123 | VENDOR |

## Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (ADMIN)
- `PUT /api/products/{id}` - Update product (ADMIN)

### Stock Management
- `POST /api/stock/transaction` - Record stock IN/OUT
- `GET /api/stock/transactions/{productId}` - Get transaction history

### Forecast
- `GET /api/forecast/{sku}` - Get demand forecast for product

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/{id}/approve` - Approve order (VENDOR)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Reports
- `GET /api/reports/stats` - Get comprehensive report statistics
  - Stock turnover (COGS/Average Inventory)
  - Vendor performance with calculated metrics
  - Actual response times (order creation → approval)
  - Intelligent 5-star vendor ratings

## Report Calculations

### Stock Turnover
```
Stock Turnover = Cost of Goods Sold (COGS) / Average Inventory Value
- COGS = Total value of approved purchase orders
- Average Inventory Value = Sum of (current stock × price) for all products
```

### Vendor Response Time
```
Avg Response Time = Average duration between order creation and approval
- Calculated from actual timestamps (createdAt → approvedAt)
- Only includes approved orders
- Displayed in days with 1 decimal precision
```

### Vendor Rating (5-Star System)
```
Rating criteria (based on fulfillment rate and response time):
- 5 stars: >95% fulfillment + <2 days response
- 4 stars: >80% fulfillment + <4 days response
- 3 stars: >60% fulfillment OR <6 days response
- 2 stars: >40% fulfillment
- 1 star: <40% fulfillment
```

## Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/smartshelfx/
│   │   │   ├── config/         # Configuration classes
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── exception/      # Exception handlers
│   │   │   ├── model/          # JPA entities
│   │   │   ├── repository/     # Data repositories
│   │   │   ├── service/        # Business logic
│   │   │   ├── util/           # Utility classes
│   │   │   └── SmartShelfXApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Testing
```bash
# Run tests
mvn test
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Database Connection Issues
- Verify MySQL is running
- Check database credentials
- Ensure database `smartshelfx` exists

### Build Errors
```bash
# Clean Maven cache
mvn clean
rm -rf ~/.m2/repository

# Rebuild
mvn clean install
```

## Development Notes
- JWT token expires in 24 hours
- CORS is enabled for all origins (demo only)
- Security is simplified for demonstration
- Auto-restock triggers when forecast > current stock
