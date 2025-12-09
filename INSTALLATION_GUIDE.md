# SmartShelfX - Complete Installation & Setup Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [AI Engine Setup](#ai-engine-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## System Requirements

### Hardware
- **CPU**: Dual-core or better
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 50GB for development, 100GB+ for production
- **Network**: Stable internet connection

### Software

#### Windows
- Windows 10/11 or Windows Server 2019+
- Administrator privileges required

#### macOS
- macOS 10.15 or later
- Xcode Command Line Tools

#### Linux (Ubuntu/Debian)
- Ubuntu 18.04 LTS or later
- sudo privileges

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 21+ | Spring Boot backend |
| Node.js | 20+ | Angular frontend |
| npm | 10+ | Package manager |
| MySQL | 8.0+ | Database |
| Maven | 3.8+ | Build tool |
| Python | 3.9+ | AI engine |
| Docker | 20.10+ | Containerization (optional) |
| Git | 2.25+ | Version control |

---

## Database Setup

### Option 1: MySQL Installation (Recommended)

#### Windows
1. Download MySQL Community Edition from https://dev.mysql.com/downloads/mysql/
2. Run the MSI installer
3. Choose "Server only" or "Full" installation
4. Select "MySQL Server 8.0.x - X64"
5. Configure MySQL as a Windows Service
6. Create root password (use `0000` for development)

#### macOS
```bash
# Install via Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install mysql-server

# Secure installation
sudo mysql_secure_installation

# Start service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Create Database and User

```bash
# Connect to MySQL
mysql -u root -p

# Enter password: 0000
```

```sql
-- Create database
CREATE DATABASE smartshelfx;

-- Create user
CREATE USER 'smartshelfx'@'localhost' IDENTIFIED BY 'smartshelfx@2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON smartshelfx.* TO 'smartshelfx'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
EXIT;
```

### Option 2: Docker MySQL

```bash
docker run --name smartshelfx-db \
  -e MYSQL_ROOT_PASSWORD=0000 \
  -e MYSQL_DATABASE=smartshelfx \
  -e MYSQL_USER=smartshelfx \
  -e MYSQL_PASSWORD=smartshelfx@2024 \
  -p 3306:3306 \
  -d mysql:8.0

# Verify
docker ps
docker logs smartshelfx-db
```

---

## Backend Setup

### 1. Install Java 21

#### Windows
1. Download from https://adoptium.net/ (Temurin 21)
2. Run installer and follow setup wizard
3. Add to PATH environment variable

Verify:
```bash
java -version
javac -version
```

#### macOS
```bash
brew install openjdk@21
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
java -version
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install openjdk-21-jdk

java -version
```

### 2. Install Maven

#### Windows
1. Download from https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add `C:\Program Files\Apache\maven\bin` to PATH

#### macOS
```bash
brew install maven
mvn -version
```

#### Linux
```bash
sudo apt-get install maven
mvn -version
```

### 3. Configure Backend Application

```bash
# Navigate to backend
cd d:\SmartShelfX\smartshelfx

# Edit configuration
# Windows (use notepad or VS Code)
# File: src\main\resources\application.properties

# Content should be:
# spring.application.name=SmartShelfX
# spring.datasource.url=jdbc:mysql://localhost:3306/smartshelfx
# spring.datasource.username=smartshelfx
# spring.datasource.password=smartshelfx@2024
# spring.jpa.hibernate.ddl-auto=update
# jwt.secret=9b3bbbdb4c9043f58d703b19922a05e7a7b33c1579d977d8471e6b4579dcc3ef
# jwt.expiration=86400000
# frontend.url=http://localhost:4200
# ai.forecast.service.url=http://localhost:8000
# ai.forecast.service.enabled=false
```

### 4. Build Backend

```bash
cd d:\SmartShelfX\smartshelfx

# Clean and build
mvn clean install -DskipTests

# Expected output:
# [INFO] BUILD SUCCESS
# [INFO] Total time: ~2-3 minutes
```

### 5. Run Backend

```bash
# Option A: Using Maven
mvn spring-boot:run

# Option B: Using JAR
java -jar target/smartshelfx-0.0.1-SNAPSHOT.jar

# Server will start at http://localhost:8080
```

---

## Frontend Setup

### 1. Install Node.js and npm

#### Windows
1. Download from https://nodejs.org/ (v20 LTS)
2. Run installer and follow wizard
3. Verify installation:
```bash
node --version
npm --version
```

#### macOS
```bash
brew install node@20
brew link node@20
node --version
npm --version
```

#### Linux
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 2. Install Dependencies

```bash
cd d:\SmartShelfX\smartshelfx-ui

# Install npm packages
npm install

# This may take 2-3 minutes
```

### 3. Configure Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api',
  production: false
};
```

### 4. Run Frontend

```bash
npm start

# Angular CLI will compile and serve at http://localhost:4200
# Application will auto-reload on file changes
```

---

## AI Engine Setup

### 1. Install Python

#### Windows
1. Download Python 3.11 from https://www.python.org/downloads/
2. Run installer
3. **Important**: Check "Add Python to PATH"
4. Verify:
```bash
python --version
pip --version
```

#### macOS
```bash
brew install python@3.11
brew link python@3.11
python3 --version
```

#### Linux
```bash
sudo apt-get install python3.11 python3-pip python3-venv
python3 --version
pip3 --version
```

### 2. Setup Virtual Environment

```bash
cd d:\SmartShelfX\ai-engine

# Create virtual environment
python -m venv venv

# Activate (choose based on OS)
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# You should see (venv) in prompt
```

### 3. Install Python Dependencies

```bash
# With venv activated
pip install -r requirements.txt

# This will install:
# - Flask & Flask-CORS
# - NumPy, Pandas
# - Scikit-learn, TensorFlow
# - Other dependencies
```

### 4. Configure AI Engine

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file:
# FLASK_ENV=development
# PORT=8000
# MAX_FORECAST_DAYS=30
# JAVA_BACKEND_URL=http://localhost:8080/api
```

### 5. Run AI Engine

```bash
# With venv activated
python app.py

# Server will start at http://localhost:8000
# You should see:
# * Running on http://0.0.0.0:8000
```

---

## Running the Application

### Startup Sequence

1. **Start MySQL** (if not running as service)
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

2. **Start Backend**
```bash
cd d:\SmartShelfX\smartshelfx
mvn spring-boot:run
# Wait for: "Started SmartShelfXApplication"
```

3. **Start AI Engine** (in new terminal)
```bash
cd d:\SmartShelfX\ai-engine
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
# Wait for: "Running on http://0.0.0.0:8000"
```

4. **Start Frontend** (in new terminal)
```bash
cd d:\SmartShelfX\smartshelfx-ui
npm start
# Wait for: "Application bundle generated successfully"
```

### Access Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **AI Engine**: http://localhost:8000

### Test Login Credentials

Since database auto-generates data, you need to create a user first. Use registration:

1. Go to http://localhost:4200
2. Click "Register"
3. Fill in details:
   - Email: admin@smartshelfx.com
   - Username: admin
   - Password: Admin@123
   - Role: ADMIN
4. Click Register
5. Login with credentials

---

## Troubleshooting

### Issue: MySQL connection refused

**Solution**:
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# Check MySQL service status
# Windows: Services app or net start MySQL80
# macOS: brew services list
# Linux: sudo systemctl status mysql
```

### Issue: Port 8080 already in use

**Solution**:
```bash
# Windows - Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Or change backend port in application.properties
# server.port=8090
```

### Issue: npm dependencies fail to install

**Solution**:
```bash
cd smartshelfx-ui

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Or use specific npm version
npm install --no-audit --legacy-peer-deps
```

### Issue: "Module not found" errors in Angular

**Solution**:
```bash
# Ensure all dependencies are installed
npm install

# Check for version mismatches
npm list @angular/core

# If issues persist
npm update
```

### Issue: Python dependencies installation fails

**Solution**:
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# Or install individually
pip install Flask Flask-CORS numpy pandas scikit-learn
```

### Issue: "JWT token expired" errors

**Solution**:
```
Clear browser localStorage:
1. Press F12 (Developer Tools)
2. Go to Application/Storage tab
3. Clear all cookies and local storage
4. Logout and login again
```

### Issue: CORS errors

**Solution**:
```
This is usually caused by frontend and backend on different origins.
Verify in application.properties:
frontend.url=http://localhost:4200

And in SecurityConfig, CORS is properly configured for this URL.
```

---

## Production Deployment

### Using Docker Compose

```bash
cd d:\SmartShelfX

# Create docker-compose.yml in root with services for:
# - MySQL
# - Backend (JAR)
# - Frontend (Nginx)
# - AI Engine (Python)

docker-compose up -d

# Verify all services
docker-compose ps
```

### Manual Production Setup

1. **Environment Setup**
   - Use production OS (Ubuntu LTS recommended)
   - Install Java 21 LTS
   - Install MySQL 8.0 LTS
   - Install Node.js LTS
   - Install Python 3.11 LTS

2. **SSL/HTTPS**
   - Obtain SSL certificate (Let's Encrypt)
   - Configure reverse proxy (Nginx/Apache)
   - Update API URLs to use https://

3. **Database**
   - Setup production MySQL with backups
   - Configure connection pooling
   - Create database users with minimal privileges

4. **Backend**
   - Build: `mvn clean package -DskipTests`
   - Configure: Update all properties for production
   - Deploy: `java -jar smartshelfx-*.jar`
   - Use process manager: systemd, supervisord, or PM2

5. **Frontend**
   - Build: `ng build --configuration production`
   - Host on web server (Nginx/Apache)
   - Configure gzip compression
   - Setup caching headers

6. **AI Engine**
   - Deploy as systemd service
   - Use Gunicorn: `gunicorn -w 4 app:app`
   - Setup reverse proxy

7. **Monitoring & Logging**
   - Setup ELK stack or similar
   - Configure application logging
   - Setup health checks

### Production Configuration Checklist

- [ ] Update JWT secret to strong value
- [ ] Disable debug mode in all services
- [ ] Configure production database
- [ ] Setup SSL/HTTPS certificates
- [ ] Configure CORS for production domain
- [ ] Setup email service for notifications
- [ ] Configure backup strategy
- [ ] Setup monitoring and alerts
- [ ] Configure rate limiting
- [ ] Setup CDN for frontend assets
- [ ] Enable database connection pooling
- [ ] Configure log aggregation
- [ ] Setup automated deployments
- [ ] Test disaster recovery

---

## Performance Optimization

### Backend
- Enable query caching in MySQL
- Configure connection pooling
- Use pagination for large datasets
- Add database indexes on frequently queried columns
- Configure Spring cache

### Frontend
- Enable production build optimization
- Implement lazy loading for modules
- Use OnPush change detection
- Optimize images and assets
- Configure service worker for caching

### AI Engine
- Batch process requests
- Cache model predictions
- Use multiprocessing
- Optimize feature engineering

---

## Security Considerations

1. **Database**
   - Use strong passwords
   - Restrict database access
   - Enable SSL for database connections
   - Regular backups

2. **Backend**
   - Keep dependencies updated
   - Use strong JWT secrets
   - Implement rate limiting
   - Setup WAF (Web Application Firewall)
   - Enable HTTPS/TLS

3. **Frontend**
   - Sanitize user input
   - Use HttpOnly cookies for tokens
   - Implement CSP headers
   - Regular dependency updates

4. **Infrastructure**
   - Use firewall rules
   - Enable logging and auditing
   - Regular security patches
   - Intrusion detection

---

## Useful Commands

```bash
# Backend
mvn clean compile          # Compile only
mvn clean test             # Run tests
mvn clean package          # Build JAR
mvn spring-boot:run        # Run directly

# Frontend
ng serve                   # Development server
ng build --configuration production  # Production build
ng test                    # Run tests
ng lint                    # Code quality check

# AI Engine
python app.py              # Development
gunicorn -w 4 app:app      # Production
pytest                     # Run tests (if added)

# Database
mysql -u root -p           # Connect to MySQL
mysqldump -u root smartshelfx > backup.sql  # Backup

# Docker
docker-compose up          # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

---

**Happy coding! 🚀**

For issues and questions, refer to DEVELOPMENT_STATUS.md and individual README files in each module.
