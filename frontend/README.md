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
- Role-based access control
- Auto token refresh
- Route guards

### 2. Dashboard
- Total products count
- Low stock alerts
- Pending purchase orders
- Vendor statistics
- Quick action buttons

### 3. Product Management
- View all products
- Stock level indicators
- View forecasts
- Material table with sorting

### 4. Stock Transactions
- Record stock IN/OUT
- Transaction history
- Real-time stock updates
- Remarks and notes

### 5. Demand Forecasting
- Select product for forecast
- AI-powered predictions
- Visual recommendations
- Reorder suggestions

### 6. Purchase Orders
- View all purchase orders
- Status tracking (Pending, Approved, Rejected, Completed)
- Approve/Reject workflow
- Vendor information

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

- **Angular 19**: Latest Angular framework
- **Angular Material 19**: Material Design components
- **RxJS 7.8**: Reactive programming
- **TypeScript 5.5**: Type safety

## 🎯 Routing

| Route | Component | Guard | Description |
|-------|-----------|-------|-------------|
| `/login` | LoginComponent | - | User authentication |
| `/dashboard` | DashboardComponent | ✓ | Main dashboard |
| `/products` | ProductListComponent | ✓ | Product list |
| `/stock` | StockTransactionComponent | ✓ | Stock management |
| `/forecast` | ForecastViewComponent | ✓ | Demand forecasting |
| `/purchase-orders` | PurchaseOrderListComponent | ✓ | Purchase orders |

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

- Desktop: Full feature set with sidebar navigation
- Tablet: Optimized grid layouts
- Mobile: Single column layouts, touch-friendly

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
