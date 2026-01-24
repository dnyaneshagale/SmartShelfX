# SmartShelfX Frontend

Angular 19 frontend for the SmartShelfX inventory management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on http://localhost:8080
- AI Service running on http://localhost:8000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at http://localhost:4200

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Login page
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── products/           # Product list
│   │   │   ├── stock/              # Stock transactions
│   │   │   ├── forecast/           # Demand forecasting
│   │   │   ├── purchase-orders/    # Purchase order management
│   │   │   └── navbar/             # Navigation bar
│   │   ├── services/               # API services
│   │   ├── guards/                 # Route guards
│   │   ├── interceptors/           # HTTP interceptors
│   │   ├── models/                 # TypeScript interfaces
│   │   ├── app.component.ts        # Root component
│   │   ├── app.routes.ts           # Route configuration
│   │   └── app.config.ts           # App configuration
│   ├── environments/               # Environment configs
│   ├── index.html                  # HTML entry point
│   ├── main.ts                     # Bootstrap file
│   └── styles.css                  # Global styles
├── angular.json                    # Angular CLI config
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## 🔑 Demo Credentials

Use these credentials to log in:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Manager User:**
- Username: `manager1`
- Password: `manager123`

**Vendor User:**
- Username: `vendor1`
- Password: `vendor123`

## 📚 Features

### 1. Authentication
- JWT-based authentication
- Role-based access control (ADMIN, MANAGER, VENDOR)
- Auto token refresh
- Route guards
- Session management with auto-logout

### 2. Dashboard
- Role-specific dashboards (Admin, Manager, Vendor)
- Total products count
- Low stock alerts (configurable thresholds)
- Pending/Approved/Rejected purchase orders
- Vendor statistics
- Quick action buttons
- Real-time data updates

### 3. Product Management
- View all products
- Stock level indicators (color-coded)
- View demand forecasts
- Material table with sorting, pagination, filtering
- Vendor assignment tracking
- Category-based organization

### 4. Stock Transactions
- Record stock IN/OUT
- Transaction history with timestamps
- Real-time stock updates
- Remarks and notes
- Transaction type filtering

### 5. Demand Forecasting
- Select product for forecast
- AI-powered predictions using ARIMA models
- Visual recommendations
- Reorder suggestions
- Forecast accuracy tracking

### 6. Purchase Orders
- View all purchase orders
- Status tracking (Pending, Approved, Rejected, Completed)
- Approve/Reject workflow (Manager/Vendor roles)
- Vendor information display
- Order history and audit trail

### 7. Reports & Analytics
- **Excel Export**: Multi-sheet .xlsx files with 6 sections
  - Overview (KPIs with trends)
  - Stock by Category
  - Low Stock Alerts
  - Vendor Performance (with ratings)
  - Purchase Order Statistics
  - Recent Purchase Orders
- **Smart Calculations**:
  - Stock Turnover: COGS/Average Inventory
  - Vendor Response Time: Actual duration calculation
  - Vendor Ratings: 5-star system based on fulfillment & speed
- **Interactive Charts**: Line, Bar, and Pie charts using Chart.js
- **Date Range Filters**: 7d, 30d, 90d, 1y options
- **Real-time Updates**: Auto-refresh on data changes

### 8. Mobile Responsive UI
- Hamburger menu navigation
- Touch-optimized interface
- Smooth animations and transitions
- Safe area support for mobile devices
- Adaptive layouts for all screen sizes
- Cross-platform compatibility

## 🎨 UI Components

Built with **Angular Material 19**:
- Material Cards
- Material Tables
- Material Forms
- Material Icons
- Material Toolbar
- Material Buttons
- Material Chips
- Material Snackbar

## 🔧 Configuration

### API Endpoints

Configure in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  aiServiceUrl: 'http://localhost:8000'
};
```

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## 📦 Key Dependencies

- **Angular 19**: Latest Angular framework with standalone components
- **Angular Material 19**: Material Design 3 components
- **RxJS 7.8**: Reactive programming with observables
- **TypeScript 5.5**: Type safety and modern JavaScript
- **Chart.js 4.x**: Data visualization and interactive charts
- **SheetJS (xlsx)**: Excel file generation with multi-sheet support

## 🎯 Routing

| Route | Component | Guard | Description |
|-------|-----------|-------|-------------|
| `/login` | LoginComponent | - | User authentication |
| `/admin/dashboard` | AdminDashboardComponent | ✓ | Admin overview with system stats |
| `/manager/dashboard` | ManagerDashboardComponent | ✓ | Manager view with approvals |
| `/vendor/dashboard` | VendorDashboardComponent | ✓ | Vendor portal with orders |
| `/warehouse/dashboard` | WarehouseDashboardComponent | ✓ | Warehouse stock management |
| `/admin/products` | ProductListComponent | ✓ | Product catalog management |
| `/admin/stock` | StockTransactionComponent | ✓ | Stock IN/OUT operations |
| `/admin/forecast` | ForecastViewComponent | ✓ | AI demand forecasting |
| `/admin/purchase-orders` | PurchaseOrderListComponent | ✓ | Purchase order management |
| `/admin/reports` | ReportsComponent | ✓ | Analytics & Excel export |

## 🔐 Security Features

1. **JWT Authentication**: Tokens stored in localStorage
2. **HTTP Interceptor**: Auto-adds JWT to requests
3. **Route Guards**: Protects authenticated routes
4. **Auto Logout**: On token expiration or invalid token

## 🎨 Styling

- **Global Styles**: `src/styles.css`
- **Material Theme**: Indigo-Pink prebuilt theme
- **Component Styles**: Scoped to each component
- **Responsive Design**: Mobile-friendly layouts

## 📱 Responsive Design

- **Desktop**: Full feature set with sidebar navigation and expanded views
- **Tablet**: Optimized grid layouts with collapsible sections
- **Mobile**: Hamburger menu, single column layouts, touch-friendly buttons
- **Animations**: Smooth transitions, loading states, and user feedback
- **Safe Areas**: Support for notches and system UI on mobile devices

## 🐛 Troubleshooting

### CORS Issues
Ensure backend has CORS enabled for `http://localhost:4200`

### API Connection Failed
1. Check backend is running on port 8080
2. Check AI service is running on port 8000
3. Verify environment.ts has correct URLs

### Login Issues
1. Ensure database is seeded with demo users
2. Check browser console for errors
3. Verify JWT secret matches backend

## 📄 License

Demo application for educational purposes.
