# SmartShelfX - AI-Based Inventory Forecast & Auto-Restock Platform

![SmartShelfX Logo](https://img.shields.io/badge/SmartShelfX-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen)

---

## 📋 Project Overview

**SmartShelfX** is a next-generation inventory management platform designed to optimize stock levels using AI-powered demand forecasting. The system analyzes historical sales, seasonal trends, and real-time data to recommend and automate restocking operations.

### Key Features

✅ **AI-Powered Forecasting** - ML-based demand predictions with confidence intervals
✅ **Auto-Restock Automation** - Automatic purchase order generation
✅ **Real-Time Inventory** - Live stock level updates and alerts
✅ **Role-Based Access** - Admin, Warehouse Manager, and Vendor roles
✅ **Analytics Dashboard** - Comprehensive inventory insights and reports
✅ **Multi-User Management** - Support for multiple warehouses and vendors
✅ **Export Capabilities** - Excel and PDF report generation
✅ **RESTful API** - Full-featured REST API for integrations

---

## 🏗️ Tech Stack

### Frontend

- **Angular 19** - Modern TypeScript-based SPA framework
- **Angular Material** - UI component library
- **ngx-charts** - Data visualization
- **RxJS** - Reactive programming

### Backend

- **Java 21** - Latest LTS version
- **Spring Boot 3.4** - Enterprise application framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database access layer
- **JWT** - Stateless authentication

### Database

- **MySQL 8.0** - Relational database
- **Hibernate** - ORM framework

### AI Engine

- **Python 3.11** - ML/Data processing
- **Flask** - Lightweight web framework
- **Scikit-learn** - Machine learning algorithms
- **TensorFlow** - Deep learning (optional)
- **Pandas** - Data manipulation

### Reporting

- **Apache POI** - Excel export
- **iText** - PDF generation

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

---

## 📁 Project Structure

```
SmartShelfX/
├── smartshelfx/                          # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/infosys/smartshelfx/
│   │   │   │   ├── controller/           # REST endpoints
│   │   │   │   ├── service/              # Business logic
│   │   │   │   ├── entity/               # JPA entities
│   │   │   │   ├── repository/           # Data access
│   │   │   │   ├── dto/                  # Data transfer objects
│   │   │   │   ├── security/             # JWT & security config
│   │   │   │   └── util/                 # Utility classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── static/               # Static assets
│   │   └── test/                         # Unit tests
│   ├── pom.xml                           # Maven configuration
│   └── mvnw                              # Maven wrapper
│
├── smartshelfx-ui/                       # Frontend (Angular)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/             # HTTP services
│   │   │   │   ├── guards/               # Route guards
│   │   │   │   ├── models/               # TypeScript interfaces
│   │   │   │   └── interceptors/         # HTTP interceptors
│   │   │   ├── features/
│   │   │   │   ├── auth/                 # Authentication module
│   │   │   │   ├── dashboard/            # Dashboard module
│   │   │   │   ├── inventory/            # Product management
│   │   │   │   ├── transactions/         # Stock operations
│   │   │   │   ├── forecasting/          # Demand forecast
│   │   │   │   ├── purchase-orders/      # PO management
│   │   │   │   ├── analytics/            # Reports & analytics
│   │   │   │   ├── admin/                # Admin panel
│   │   │   │   ├── notifications/        # Alerts & notifications
│   │   │   │   └── profile/              # User profile
│   │   │   ├── shared/                   # Shared components
│   │   │   ├── layout/                   # Main layout
│   │   │   └── app.routes.ts             # Main routing
│   │   ├── environments/                 # Environment config
│   │   └── styles.scss                   # Global styles
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
│
├── ai-engine/                            # Python AI Microservice
│   ├── app.py                            # Flask application
│   ├── requirements.txt                  # Python dependencies
│   ├── Dockerfile                        # Docker image
│   ├── docker-compose.yml                # Compose config
│   ├── .env.example                      # Environment template
│   └── README.md                         # AI Engine documentation
│
├── DEVELOPMENT_STATUS.md                 # Current implementation status
├── INSTALLATION_GUIDE.md                 # Setup instructions
├── API_REFERENCE.md                      # API documentation
├── README.md                             # This file
└── .git/                                 # Git repository
```

---

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Node.js 20+
- Python 3.11+
- MySQL 8.0+
- Maven 3.8+
- Git

### Installation (5 minutes)

1. **Clone Repository**

```bash
git clone https://github.com/dnyaneshagale/SmartShelfX.git
cd SmartShelfX
```

2. **Setup Database**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE smartshelfx;
CREATE USER 'smartshelfx'@'localhost' IDENTIFIED BY 'smartshelfx@2024';
GRANT ALL PRIVILEGES ON smartshelfx.* TO 'smartshelfx'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **Start Backend**

```bash
cd smartshelfx
mvn spring-boot:run
# Backend: http://localhost:8080
```

4. **Start Frontend** (new terminal)

```bash
cd smartshelfx-ui
npm install
npm start
# Frontend: http://localhost:4200
```

5. **Start AI Engine** (new terminal)

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# AI Engine: http://localhost:8000
```

### First Login

- Navigate to http://localhost:4200
- Register as Admin
- Use credentials to login

**For detailed setup**, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

---

## 📚 Documentation

| Document                                          | Purpose                                  |
| ------------------------------------------------- | ---------------------------------------- |
| [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)       | Implementation progress & feature status |
| [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)       | Detailed setup for all platforms         |
| [API_REFERENCE.md](API_REFERENCE.md)                 | Complete API endpoint documentation      |
| [smartshelfx/README.md](smartshelfx/README.md)       | Backend setup & architecture             |
| [smartshelfx-ui/README.md](smartshelfx-ui/README.md) | Frontend setup & development             |
| [ai-engine/README.md](ai-engine/README.md)           | AI engine setup & ML models              |

---

## 🎯 Core Features

### 1. User & Role Management

- Multi-role authentication (Admin, Warehouse Manager, Vendor)
- JWT-based secure authentication
- Role-based access control (RBAC)
- User management dashboard

### 2. Inventory Management

- Product catalog with full CRUD operations
- Category organization
- Vendor assignment
- Batch import/export (CSV)
- Real-time stock level updates
- Stock status tracking (In Stock, Low Stock, Out of Stock)

### 3. Stock Transactions

- Stock-in (incoming shipments)
- Stock-out (sales/dispatches)
- Batch transaction processing
- Transaction history & audit trails
- Movement tracking

### 4. Demand Forecasting

- AI-powered demand predictions
- Historical data analysis
- Confidence intervals
- Stockout risk identification
- 7-30 day forecasting capability
- Automated retraining

### 5. Purchase Order Management

- Auto-generate POs based on forecasts
- Vendor management
- PO workflow (Pending → Approved → Received)
- Email notifications
- PO tracking

### 6. Analytics & Reports

- Inventory trends analysis
- Sales comparison
- Top restocked items
- Category distribution
- Excel/PDF export
- Dashboard visualizations

### 7. Notifications & Alerts

- Low stock alerts
- Expiry date warnings
- Real-time notifications
- Email alerts
- Notification management

---

## 📊 API Overview

### Main Endpoints

**Authentication**

```
POST   /api/auth/public/login              - User login
POST   /api/auth/public/register           - User registration
```

**Products (Admin)**

```
GET    /api/admin/products                 - List products
POST   /api/admin/products                 - Create product
PUT    /api/admin/products/{id}            - Update product
DELETE /api/admin/products/{id}            - Delete product
POST   /api/admin/products/import          - Batch import (CSV)
GET    /api/admin/products/export          - Export (CSV)
```

**Transactions**

```
POST   /api/transactions/stock-in          - Record stock-in
POST   /api/transactions/stock-out         - Record stock-out
POST   /api/transactions/stock-in/batch    - Batch stock-in
GET    /api/transactions/history           - Transaction history
```

**Forecasting**

```
GET    /api/forecast/predictions           - Get forecasts
POST   /api/forecast/generate              - Generate forecasts
GET    /api/forecast/risk-products         - Risk analysis
```

**Purchase Orders**

```
POST   /api/purchase-orders                - Create PO
POST   /api/purchase-orders/auto-generate  - Auto-generate POs
GET    /api/purchase-orders/suggestions    - Restock suggestions
GET    /api/purchase-orders                - List POs
```

**Analytics**

```
GET    /api/analytics/inventory-trends     - Inventory trends
GET    /api/analytics/sales-comparison     - Sales comparison
GET    /api/analytics/top-restocked        - Top items
GET    /api/analytics/export/excel         - Export Excel
GET    /api/analytics/export/pdf           - Export PDF
```

**Full API documentation**: [API_REFERENCE.md](API_REFERENCE.md)

---

## 🔐 Security

### Authentication

- JWT (JSON Web Tokens) for stateless authentication
- 24-hour token expiration
- Refresh token support (planned)

### Authorization

- Role-based access control (RBAC)
- Method-level security with @PreAuthorize
- Endpoint-level access restrictions

### Data Protection

- Password hashing with bcrypt
- SQL injection prevention via JPA
- CORS configuration
- HTTPS/TLS for production

### Audit Trail

- All changes logged in audit_logs table
- User action tracking
- Timestamp recording
- Entity change history

---

## 🧪 Testing

### Backend Testing

```bash
cd smartshelfx
mvn test                           # Run all tests
mvn test -Dtest=ProductServiceTest  # Run specific test
mvn test -Dtest=*Service           # Run pattern tests
```

### Frontend Testing

```bash
cd smartshelfx-ui
npm test                           # Run unit tests
npm run test:coverage              # Coverage report
ng e2e                             # End-to-end tests
```

### Integration Testing

```bash
# Start all services
# Run integration test suite
npm run test:integration
```

---

## 🐳 Docker Deployment

### Single Service

```bash
cd smartshelfx
docker build -t smartshelfx-backend .
docker run -p 8080:8080 smartshelfx-backend
```

### Full Stack (Recommended)

```bash
docker-compose up -d

# Services:
# - MySQL: localhost:3306
# - Backend: localhost:8080
# - Frontend: localhost:4200
# - AI Engine: localhost:8000
```

---

## 📈 Performance Optimization

### Backend

- Connection pooling (HikariCP)
- Query optimization with JPA projections
- Database indexing
- Caching layer (Spring Cache)
- Pagination for large datasets

### Frontend

- Lazy loading of modules
- OnPush change detection
- Tree-shaking & minification
- Service workers for caching
- Optimized bundle size

### Database

- Proper indexing strategy
- Query optimization
- Partitioning for large tables
- Regular maintenance

### AI Engine

- Batch processing
- Model caching
- Vectorized operations
- Efficient feature engineering

---

## 🚨 Troubleshooting

### Common Issues

**Backend won't start**

- Check MySQL is running
- Verify database credentials
- Check port 8080 availability

**Frontend build fails**

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

**AI predictions not generating**

- Verify AI engine is running
- Check at least 10 data points available
- Review Flask logs

**Database connection errors**

- Verify MySQL service
- Check connection string in application.properties
- Test connection: `mysql -u smartshelfx -p`

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed troubleshooting

---

## 📋 Development Roadmap

### Completed ✅

- User authentication & RBAC
- Product inventory management
- Stock transactions
- Database schema & entities
- REST API endpoints
- Angular frontend components
- AI forecasting foundation
- Analytics & reporting

### In Progress 🔄

- Complete AI ML models integration
- Email notification system
- Real-time WebSocket updates
- Advanced analytics

### Planned 📅

- Mobile app (React Native)
- Advanced ML models (LSTM)
- Warehouse localization
- Multi-language support
- OAuth2 integration
- Advanced reporting features

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/feature-name`
5. Submit a pull request

### Coding Standards

- Follow Spring Boot conventions
- Use meaningful variable names
- Add comments for complex logic
- Write unit tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Support & Contact

### Resources

- 📖 [Full Documentation](./DEVELOPMENT_STATUS.md)
- 🔧 [Installation Guide](./INSTALLATION_GUIDE.md)
- 📡 [API Reference](./API_REFERENCE.md)

### Getting Help

- Create an issue on GitHub
- Check existing issues for solutions
- Review documentation for common questions

---

## 🙏 Acknowledgments

Built with:

- Spring Boot community
- Angular team
- Open-source ML libraries
- Contributors and testers

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Entities**: 20+
- **API Endpoints**: 50+
- **Angular Components**: 30+
- **Services**: 15+
- **Test Coverage**: 70%+

---

## 🎓 Learning Resources

### Backend

- [Spring Boot Official Guide](https://spring.io/guides/gs/spring-boot/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JPA/Hibernate Guide](https://hibernate.org/orm/documentation/)

### Frontend

- [Angular Official Tutorial](https://angular.io/tutorial)
- [Angular Material Components](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)

### AI/ML

- [Scikit-learn Documentation](https://scikit-learn.org/)
- [TensorFlow Guide](https://www.tensorflow.org/guide)
- [Time Series Forecasting](https://www.tensorflow.org/tutorials/structured_data/time_series)

---

## 📱 Screenshots & Demo

[Screenshots and demo video available in documentation]

---

**SmartShelfX** - Intelligent Inventory Management Platform
*Last Updated: January 15, 2025*
*Version: 1.0.0*
*Status: Active Development* 

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star!**

[GitHub](https://github.com/dnyaneshagale/SmartShelfX) | [Issues](https://github.com/dnyaneshagale/SmartShelfX/issues) | [Discussions](https://github.com/dnyaneshagale/SmartShelfX/discussions)

</div>
