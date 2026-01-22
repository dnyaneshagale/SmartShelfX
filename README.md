# SmartShelfX - AI-Based Inventory Forecast & Auto-Replenishment

> **Demo-Ready Full-Stack Application**

A simplified inventory management system with AI-powered demand forecasting and automatic replenishment suggestions.

---

## 📋 Overview

SmartShelfX is a demo application that showcases:
- AI-based demand forecasting
- Automated purchase order creation
- Real-time inventory tracking
- Role-based access control
- Modern microservices architecture

**Status:** Backend & AI Service ✅ COMPLETE | Frontend: Pending

---

## 🏗️ Architecture

```
┌─────────────────────┐
│  Angular Frontend   │  ← To be implemented
│  (Port 4200)        │
└──────────┬──────────┘
           │
           │ HTTP + JWT
           ▼
┌──────────────────────┐
│  Spring Boot Backend │  ✅ COMPLETE
│  (Port 8080)         │
│  - REST APIs         │
│  - JWT Auth          │
│  - Business Logic    │
└──────┬──────┬────────┘
       │      │
       │      └──────────────────┐
       ▼                         ▼
┌─────────────┐      ┌──────────────────────┐
│   MySQL     │      │  FastAPI AI Service  │  ✅ COMPLETE
│  Database   │      │  (Port 8000)         │
└─────────────┘      │  - Demand Forecast   │
                     └──────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Python 3.9+

### 1️⃣ Setup Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed_data.sql
```

### 2️⃣ Start AI Service
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
🟢 AI Service: http://localhost:8000

### 3️⃣ Start Backend
```bash
cd backend
mvn spring-boot:run
```
🟢 Backend: http://localhost:8080  
📚 API Docs: http://localhost:8080/swagger-ui.html

### 4️⃣ Test Integration
```bash
python test_integration.py
```

---

## 🎯 Features

### ✅ Implemented (Backend + AI)

**Authentication & Authorization**
- JWT-based authentication
- Role-based access (ADMIN, MANAGER, VENDOR)

**Product Management**
- CRUD operations
- Vendor assignment
- Low stock alerts
- Category filtering

**Inventory Tracking**
- Stock IN/OUT transactions
- Real-time stock updates
- Transaction history

**AI Forecasting**
- Demand prediction using ensemble methods
- Moving average, weighted average, linear trend
- Integration with FastAPI service

**Purchase Orders**
- Auto-create based on forecast
- Vendor approval workflow
- Stock auto-update on approval

**Dashboard**
- Statistics overview
- Low stock count
- Pending orders
- Quick insights

### 🔜 Pending (Frontend)
- Angular 19 UI
- Material Design components
- Responsive layouts
- Chart visualizations

---

## 📊 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 19, Material UI *(pending)* |
| **Backend** | Java 17, Spring Boot 3.2.1 |
| **AI Service** | Python 3.9+, FastAPI |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (JSON Web Tokens) |
| **API Docs** | Swagger/OpenAPI |
| **Build Tools** | Maven, pip |

---

## 🔐 Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| manager1 | password123 | MANAGER |
| vendor1 | password123 | VENDOR |
| vendor2 | password123 | VENDOR |

---

## 📡 API Endpoints

### Backend (http://localhost:8080)

**Authentication**
- `POST /api/auth/login` - User login

**Products**
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `GET /api/products/low-stock` - Low stock items

**Stock**
- `POST /api/stock/transaction` - Record IN/OUT
- `GET /api/stock/transactions/{productId}` - History

**Forecast**
- `GET /api/forecast/{sku}` - Get prediction

**Purchase Orders**
- `GET /api/purchase-orders` - List orders
- `POST /api/purchase-orders` - Create order
- `PUT /api/purchase-orders/{id}/approve` - Approve

**Dashboard**
- `GET /api/dashboard/stats` - Statistics

### AI Service (http://localhost:8000)

- `GET /forecast/{sku}` - Demand forecast
- `GET /health` - Health check
- `GET /docs` - Swagger UI

---

## 📁 Project Structure

```
SmartShelfX/
├── backend/              ✅ Spring Boot application
│   ├── src/main/java/
│   ├── pom.xml
│   └── README.md
│
├── ai-service/           ✅ FastAPI service
│   ├── main.py
│   ├── forecast_logic.py
│   ├── requirements.txt
│   └── README.md
│
├── database/             ✅ SQL scripts
│   ├── schema.sql
│   └── seed_data.sql
│
├── spec.md               📄 Project specification
├── PROJECT_OVERVIEW.md   📄 Complete overview
├── BACKEND_SUMMARY.md    📄 Backend details
├── AI_SERVICE_SUMMARY.md 📄 AI service details
└── test_integration.py   🧪 Integration tests
```

---

## 🧪 Testing

### Test AI Service
```bash
cd ai-service
python test_service.py
```

### Test Backend (Unit Tests)
```bash
cd backend
mvn test
```

### Test Full Integration
```bash
python test_integration.py
```

### Manual Testing
- Backend Swagger: http://localhost:8080/swagger-ui.html
- AI Service Swagger: http://localhost:8000/docs

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [spec.md](spec.md) | Original project specification |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Complete system overview |
| [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md) | Backend implementation details |
| [AI_SERVICE_SUMMARY.md](AI_SERVICE_SUMMARY.md) | AI service documentation |
| [backend/README.md](backend/README.md) | Backend setup guide |
| [ai-service/README.md](ai-service/README.md) | AI service setup guide |

---

## 🎓 Demo Flow

1. **Login** as admin (username: `admin`, password: `password123`)
2. **View Dashboard** - See statistics and alerts
3. **Browse Products** - Check inventory levels
4. **Get Forecast** - Request prediction for a product (e.g., PROD-001)
5. **Check Low Stock** - View products below reorder level
6. **Create PO** - Generate purchase order for low-stock items
7. **Switch to Vendor** - Login as vendor1
8. **Approve PO** - Stock automatically updated
9. **View Transactions** - Check stock IN/OUT history

---

## 🔧 Configuration

### Backend (application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/smartshelfx
spring.datasource.username=root
spring.datasource.password=root
ai.service.url=http://localhost:8000
```

### AI Service (main.py)
```python
host="0.0.0.0"
port=8000
reload=True
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Backend: Change server.port in application.properties
# AI Service: python main.py --port 8001
```

### Database Connection Error
- Verify MySQL is running
- Check credentials in application.properties
- Ensure database 'smartshelfx' exists

### AI Service Connection Error
- Ensure AI service runs on port 8000
- Check firewall settings
- Verify backend can reach localhost:8000

---

## 📦 Sample Data

**Pre-seeded:**
- 4 Users (1 admin, 1 manager, 2 vendors)
- 10 Products (Electronics, Furniture, Stationery)
- 25 Stock Transactions (last 10 days)
- 3 Purchase Orders

---

## ⚠️ Important Notes

**This is a DEMO implementation:**
- Simplified security (not production-grade)
- CORS enabled for all origins
- Basic forecasting (not advanced ML)
- No rate limiting or caching
- No comprehensive validation

**For Production, Add:**
- Advanced security (OAuth2, API keys)
- Real ML models (ARIMA, LSTM, Prophet)
- Caching layer (Redis)
- Monitoring (ELK stack)
- CI/CD pipeline
- Docker deployment
- Load balancing

---

## 🎯 Next Steps

1. ✅ Backend Implementation - COMPLETE
2. ✅ AI Service Implementation - COMPLETE
3. 🔲 Frontend Implementation (Angular 19)
4. 🔲 Docker Compose setup
5. 🔲 Final integration testing
6. 🔲 Demo video/screenshots

---

## 📊 Project Statistics

- **Backend API Endpoints:** 24
- **Database Tables:** 5
- **JPA Entities:** 5
- **Service Classes:** 7
- **Controllers:** 6
- **AI Endpoints:** 3
- **Forecasting Methods:** 3 (ensemble)
- **Lines of Code:** ~3000+

---

## 🤝 Contributing

This is a demo project for learning purposes. Feel free to:
- Explore the code
- Modify features
- Add enhancements
- Use as reference

---

## 📝 License

This is an educational demo project.

---

## 🎉 Status

**Backend:** ✅ COMPLETE  
**AI Service:** ✅ COMPLETE  
**Database:** ✅ COMPLETE  
**Frontend:** 🔲 PENDING  

**Overall Progress:** 75% Complete

---

**Built with ❤️ for learning and demonstration purposes**

For detailed documentation, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
