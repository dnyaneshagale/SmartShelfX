# SmartShelfX - Testing & Quality Assurance Guide

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [AI Engine Testing](#ai-engine-testing)
5. [Integration Testing](#integration-testing)
6. [Manual Testing](#manual-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)

---

## Testing Overview

### Testing Strategy

SmartShelfX uses a multi-layered testing approach:

```
┌─────────────────────────────────┐
│   Manual Acceptance Testing     │  (User scenarios, UAT)
├─────────────────────────────────┤
│   Integration Testing           │  (End-to-end workflows)
├─────────────────────────────────┤
│   API Testing                   │  (REST endpoints)
├─────────────────────────────────┤
│   Component Testing             │  (UI components)
├─────────────────────────────────┤
│   Service Testing               │  (Business logic)
├─────────────────────────────────┤
│   Unit Testing                  │  (Individual methods)
└─────────────────────────────────┘
```

### Test Coverage Goals

- **Backend**: 80%+ code coverage
- **Frontend**: 70%+ code coverage
- **Critical Paths**: 100% coverage
- **AI Engine**: 75%+ coverage

---

## Backend Testing

### 1. Setup Test Environment

```bash
cd smartshelfx

# Create test database
mysql -u root -p
```

```sql
CREATE DATABASE smartshelfx_test;
CREATE USER 'smartshelfx_test'@'localhost' IDENTIFIED BY 'test@2024';
GRANT ALL PRIVILEGES ON smartshelfx_test.* TO 'smartshelfx_test'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Test Properties File

Create `src/test/resources/application-test.properties`:

```properties
spring.application.name=SmartShelfX-Test
spring.datasource.url=jdbc:mysql://localhost:3306/smartshelfx_test
spring.datasource.username=smartshelfx_test
spring.datasource.password=test@2024
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
logging.level.root=WARN
logging.level.com.infosys.smartshelfx=DEBUG
jwt.secret=test-secret-key-12345
jwt.expiration=3600000
```

### 3. Run All Backend Tests

```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report
# Coverage report: target/site/jacoco/index.html

# Run specific test class
mvn test -Dtest=ProductServiceTest

# Run specific test method
mvn test -Dtest=ProductServiceTest#testCreateProduct

# Run tests in parallel
mvn test -DparallelizeTestBuild=true
```

### 4. Sample Backend Test Structure

**ProductServiceTest.java** example:

```java
@SpringBootTest
@ActiveProfiles("test")
class ProductServiceTest {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    private Product testProduct;
    private Category testCategory;
    
    @BeforeEach
    void setUp() {
        // Setup test data
        testCategory = Category.builder()
            .name("Electronics")
            .description("Electronic devices")
            .build();
        categoryRepository.save(testCategory);
        
        testProduct = Product.builder()
            .sku("TEST-001")
            .name("Test Product")
            .category(testCategory)
            .currentStock(100)
            .reorderLevel(20)
            .reorderQuantity(50)
            .unitPrice(BigDecimal.valueOf(99.99))
            .build();
    }
    
    @Test
    void testCreateProduct() {
        // Arrange
        ProductDTO dto = new ProductDTO();
        dto.setName("New Product");
        
        // Act
        ProductDTO created = productService.createProduct(dto);
        
        // Assert
        assertNotNull(created.getId());
        assertEquals("New Product", created.getName());
    }
    
    @Test
    void testProductValidation() {
        // Arrange - invalid product
        ProductDTO invalid = new ProductDTO();
        
        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            productService.createProduct(invalid);
        });
    }
    
    @Test
    void testGetProductFilters() {
        // Arrange
        productRepository.save(testProduct);
        ProductFilterRequest filter = ProductFilterRequest.builder()
            .categoryId(testCategory.getId())
            .page(0)
            .size(20)
            .build();
        
        // Act
        Page<ProductDTO> results = productService.getAllProducts(filter);
        
        // Assert
        assertEquals(1, results.getTotalElements());
    }
    
    @AfterEach
    void tearDown() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
    }
}
```

### 5. Test Key Scenarios

#### Authentication & Authorization Tests

```java
@Test
@WithMockUser(roles = "ADMIN")
void testAdminCanAccessAdminEndpoints() {
    // Admin should have access
}

@Test
@WithMockUser(roles = "VENDOR")
void testVendorCannotAccessAdminEndpoints() {
    // Vendor should be denied
}
```

#### Transaction Tests

```java
@Test
@Transactional
void testStockInUpdateInventory() {
    // Verify stock increases
}

@Test
@Transactional
void testStockOutDecreasesInventory() {
    // Verify stock decreases
}

@Test
@Transactional
void testTriggersReorderAlert() {
    // Verify alert created when below reorder level
}
```

#### Forecasting Tests

```java
@Test
void testForecastingWithSufficientData() {
    // Test with 30+ data points
}

@Test
void testForecastingWithLimitedData() {
    // Test fallback with <10 points
}
```

---

## Frontend Testing

### 1. Setup Test Environment

```bash
cd smartshelfx-ui

# Install testing dependencies (already included)
npm install

# Verify Karma and Jasmine are available
npm list karma jasmine
```

### 2. Configure Test File

Angular automatically generates `.spec.ts` files. Example structure:

**auth.service.spec.ts**:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest, AuthResponse } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user and store token', () => {
    const credentials: LoginRequest = {
      email: 'test@test.com',
      password: 'password123'
    };
    
    const mockResponse: AuthResponse = {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      role: 'ADMIN',
      token: 'test-jwt-token',
      enabled: true,
      createdAt: new Date()
    };

    service.login(credentials).subscribe(response => {
      expect(response.token).toBe('test-jwt-token');
      expect(localStorage.getItem('token')).toBe('test-jwt-token');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/public/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear storage on logout', () => {
    localStorage.setItem('token', 'test-token');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

### 3. Run Frontend Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm test -- --watch=false --browsers=ChromeHeadless

# Run specific test file
npm test -- --include='**/auth.service.spec.ts'

# Run with coverage
npm test -- --code-coverage
# Coverage report: coverage/smartshelfx-ui/index.html

# Run in watch mode (auto-rerun on changes)
npm test -- --watch
```

### 4. Component Testing Example

**login.component.spec.ts**:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTruthy();
  });

  it('should call login on form submit', () => {
    authService.login.and.returnValue(of({
      id: 1,
      username: 'test',
      email: 'test@test.com',
      role: 'ADMIN',
      token: 'token',
      enabled: true,
      createdAt: new Date()
    }));

    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
  });
});
```

### 5. E2E Testing

```bash
# Run end-to-end tests
ng e2e

# Run specific e2e test
ng e2e --suite=auth
```

**Example e2e test** (login.e2e.spec.ts):

```typescript
import { browser, by, element } from 'protractor';

describe('Login Flow', () => {
  beforeEach(async () => {
    await browser.get('/auth/login');
  });

  it('should display login form', async () => {
    const form = element(by.css('app-login'));
    expect(await form.isDisplayed()).toBe(true);
  });

  it('should login successfully', async () => {
    await element(by.name('email')).sendKeys('admin@smartshelfx.com');
    await element(by.name('password')).sendKeys('Admin@123');
    await element(by.css('button[type="submit"]')).click();

    // Should redirect to dashboard
    expect(await browser.getCurrentUrl()).toContain('/dashboard');
  });

  it('should show error on invalid credentials', async () => {
    await element(by.name('email')).sendKeys('invalid@test.com');
    await element(by.name('password')).sendKeys('wrongpassword');
    await element(by.css('button[type="submit"]')).click();

    const error = element(by.css('.error-message'));
    expect(await error.isDisplayed()).toBe(true);
  });
});
```

---

## AI Engine Testing

### 1. Setup Test Environment

```bash
cd ai-engine

# Create virtual environment
python -m venv test-venv
source test-venv/bin/activate  # Windows: test-venv\Scripts\activate

# Install testing dependencies
pip install -r requirements.txt
pip install pytest pytest-cov pytest-flask
```

### 2. Create Test File

**test_forecasting.py**:

```python
import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app import app, DemandForecaster

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def forecaster():
    return DemandForecaster()

@pytest.fixture
def sample_historical_data():
    """Generate sample historical data for testing"""
    data = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(30):
        data.append({
            'date': (base_date + timedelta(days=i)).strftime('%Y-%m-%d'),
            'quantity': np.random.randint(80, 150)
        })
    
    return data

class TestHealthCheck:
    def test_health_endpoint(self, client):
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'

class TestForecasting:
    def test_forecast_prediction(self, client, sample_historical_data):
        payload = {
            'product_id': 1,
            'historical_data': sample_historical_data,
            'forecast_days': 7
        }
        
        response = client.post('/api/forecast/predict', json=payload)
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['product_id'] == 1
        assert len(data['predictions']) == 7
        assert 'summary' in data

    def test_forecast_requires_historical_data(self, client):
        payload = {
            'product_id': 1,
            'historical_data': [],
            'forecast_days': 7
        }
        
        response = client.post('/api/forecast/predict', json=payload)
        assert response.status_code == 400

    def test_batch_predict(self, client, sample_historical_data):
        payload = {
            'products': [
                {
                    'product_id': 1,
                    'historical_data': sample_historical_data,
                    'forecast_days': 7
                },
                {
                    'product_id': 2,
                    'historical_data': sample_historical_data,
                    'forecast_days': 7
                }
            ]
        }
        
        response = client.post('/api/forecast/batch-predict', json=payload)
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['total_products'] == 2
        assert data['processed'] == 2

class TestDemandForecaster:
    def test_forecaster_initialization(self, forecaster):
        assert forecaster is not None
        assert not forecaster.is_trained

    def test_forecaster_training(self, forecaster, sample_historical_data):
        success = forecaster.train(sample_historical_data)
        assert success
        assert forecaster.is_trained

    def test_prediction_with_untrained_model(self, forecaster, sample_historical_data):
        # Should fallback to simple average
        predictions = forecaster.predict(sample_historical_data, forecast_days=7)
        assert len(predictions) == 7
        assert all('date' in p and 'predicted_demand' in p for p in predictions)

    def test_insufficient_data_handling(self, forecaster):
        minimal_data = [{'date': '2024-01-15', 'quantity': 100}]
        predictions = forecaster.predict(minimal_data, forecast_days=7)
        assert len(predictions) == 7  # Should still return predictions

    def test_confidence_score_calculation(self, forecaster, sample_historical_data):
        forecaster.train(sample_historical_data)
        predictions = forecaster.predict(sample_historical_data, forecast_days=7)
        
        for pred in predictions:
            assert 0 <= pred['confidence_score'] <= 1
```

### 3. Run AI Engine Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
# Report: htmlcov/index.html

# Run specific test
pytest test_forecasting.py::TestForecasting::test_forecast_prediction

# Run with verbose output
pytest -v

# Run in parallel
pytest -n auto
```

---

## Integration Testing

### 1. Full Stack Test Scenario

**LoginToInventoryTest.java**:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LoginToInventoryTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    private String token;
    
    @BeforeEach
    void setup() {
        // Login and get token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@smartshelfx.com");
        loginRequest.setPassword("Admin@123");
        
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "http://localhost:" + port + "/api/auth/public/login",
            loginRequest,
            AuthResponse.class
        );
        
        token = response.getBody().getToken();
    }
    
    @Test
    void testCompleteInventoryWorkflow() {
        // 1. Create product
        // 2. Record stock-in
        // 3. Verify inventory updated
        // 4. Record stock-out
        // 5. Verify low stock alert
        // 6. Generate forecast
        // 7. Create purchase order
    }
}
```

### 2. Run Integration Tests

```bash
# Backend integration tests
cd smartshelfx
mvn verify -DskipUnitTests

# Full stack test (all services running)
npm run test:integration
```

---

## Manual Testing

### 1. UAT Checklist

#### Authentication
- [ ] Register new user (Admin, Warehouse Manager, Vendor)
- [ ] Login with valid credentials
- [ ] Logout functionality
- [ ] Invalid credentials show error
- [ ] Token expiration handling
- [ ] Password strength validation

#### Product Management
- [ ] Create new product
- [ ] Edit product details
- [ ] Delete product
- [ ] Search products
- [ ] Filter by category
- [ ] Filter by stock status
- [ ] Pagination
- [ ] Export products (CSV)
- [ ] Import products (CSV)

#### Inventory Operations
- [ ] Record stock-in
- [ ] Record stock-out
- [ ] Batch operations
- [ ] View transaction history
- [ ] Reorder alerts trigger
- [ ] Stock status updates

#### Forecasting
- [ ] View demand predictions
- [ ] Risk analysis works
- [ ] Suggestions generated
- [ ] Forecast accuracy

#### Purchase Orders
- [ ] Create PO manually
- [ ] Auto-generate POs
- [ ] Approve PO
- [ ] Receive PO
- [ ] PO status tracking

#### Analytics
- [ ] Inventory trends chart
- [ ] Sales comparison
- [ ] Top restocked items
- [ ] Export to Excel
- [ ] Export to PDF

### 2. Test Data Generation

```sql
-- Generate test products
INSERT INTO products (sku, name, category_id, vendor_id, current_stock, reorder_level, unit_price)
SELECT CONCAT('SKU-', LPAD(id, 3, '0')), 
       CONCAT('Product ', id),
       CEIL(RAND() * 5),
       CEIL(RAND() * 5),
       RAND() * 200,
       RAND() * 50,
       RAND() * 500
FROM (SELECT @row := @row + 1 as id FROM information_schema.tables, (SELECT @row:=0) t LIMIT 100) t;

-- Generate test transactions
INSERT INTO stock_movements (product_id, movement_type, quantity, performed_by)
SELECT id, 'STOCK_IN', CEIL(RAND() * 100), 1
FROM products
LIMIT 50;
```

---

## Performance Testing

### 1. Load Testing with JMeter

Create `test-plan.jmx` for load testing:

```
Create Thread Group:
  - Number of Threads: 100
  - Ramp-up Time: 60 seconds
  - Loop Count: 10

Add HTTP Sampler:
  - URL: http://localhost:8080/api/admin/products?page=0&size=20
  - Method: GET
  - Headers: Authorization: Bearer <token>

Add Listeners:
  - View Results Tree
  - Aggregate Report
  - Graph Results
```

Run tests:
```bash
jmeter -n -t test-plan.jmx -l results.jtl -j jmeter.log
```

### 2. Frontend Performance

```bash
# Run Lighthouse audit
npm run build
cd dist/smartshelfx-ui
python -m http.server 8000
# Open Chrome DevTools > Lighthouse
```

### 3. Database Performance

```sql
-- Analyze query performance
EXPLAIN SELECT * FROM products WHERE category_id = 1;
EXPLAIN SELECT * FROM stock_movements WHERE product_id = 1 ORDER BY created_at DESC;

-- Check indexes
SHOW INDEXES FROM products;
SHOW INDEXES FROM stock_movements;
```

---

## Security Testing

### 1. OWASP Top 10 Testing

#### SQL Injection
```
Try in search: '; DROP TABLE products; --
Expected: Should be sanitized/not executed
```

#### XSS (Cross-Site Scripting)
```
Product name: <script>alert('XSS')</script>
Expected: Should be escaped/sanitized
```

#### Authentication Bypass
```
Try accessing /admin endpoints without token
Expected: 401 Unauthorized
```

#### Authorization Bypass
```
Vendor tries to delete another vendor's product
Expected: 403 Forbidden
```

### 2. HTTPS/TLS Testing

```bash
# Test SSL configuration
openssl s_client -connect smartshelfx.com:443

# Check certificate validity
curl -I https://smartshelfx.com
```

### 3. Dependency Vulnerability Scanning

```bash
# Backend
mvn dependency-check:check

# Frontend
npm audit
npm audit fix

# Python
pip list --outdated
safety check
```

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/test.yml**:

```yaml
name: CI Tests

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: smartshelfx_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '21'
      - run: cd smartshelfx && mvn test
      - run: cd smartshelfx && mvn jacoco:report

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: cd smartshelfx-ui && npm install
      - run: cd smartshelfx-ui && npm test -- --watch=false
      - run: cd smartshelfx-ui && npm run build

  ai-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: cd ai-engine && pip install -r requirements.txt
      - run: cd ai-engine && pip install pytest pytest-cov
      - run: cd ai-engine && pytest
```

---

## Test Reporting

### Generate Reports

```bash
# Backend coverage report
mvn clean test jacoco:report
open target/site/jacoco/index.html

# Frontend coverage report
npm test -- --code-coverage
open coverage/smartshelfx-ui/index.html

# AI Engine coverage report
pytest --cov --cov-report=html
open htmlcov/index.html
```

### Test Dashboard

Use tools like:
- **SonarQube** - Code quality
- **Jenkins** - CI/CD
- **TestRail** - Test management
- **Allure Reports** - Test reporting

---

## Best Practices

### 1. Unit Testing
- Test one thing per test
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Aim for 80%+ coverage

### 2. Integration Testing
- Test real scenarios
- Use test containers
- Clean up after tests
- Test error scenarios

### 3. E2E Testing
- Test happy paths
- Test critical workflows
- Use explicit waits
- Run in headless mode

### 4. Performance Testing
- Load test with realistic traffic
- Monitor memory usage
- Test database queries
- Profile hot spots

### 5. Security Testing
- Test authentication/authorization
- Check input validation
- Test error handling
- Scan for vulnerabilities

---

## Troubleshooting Tests

### Backend Tests Fail
```bash
# Clear cache
mvn clean

# Check database connection
mysql -u smartshelfx_test -p
# password: test@2024

# Run with debug
mvn test -X
```

### Frontend Tests Fail
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Update Chrome
npm update karma-chrome-launcher

# Run headless
npm test -- --browsers=ChromeHeadless
```

### AI Tests Fail
```bash
# Check Python version
python --version  # Should be 3.9+

# Verify dependencies
pip list

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

---

**Testing is crucial for reliability. Always test before deployment!** ✅

---

**Last Updated**: January 15, 2025  
**Status**: Complete Testing Framework
