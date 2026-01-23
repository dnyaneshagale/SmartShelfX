# SmartShelfX Deployment Guide

Complete guide for deploying SmartShelfX full-stack application to production using free hosting services.

## 🏗️ Architecture Overview

- **Frontend**: Angular 19 → Netlify (Free Tier)
- **Backend**: Spring Boot 3.2 → Render (Free Tier)
- **AI Service**: FastAPI → Render (Free Tier)
- **Database**: MySQL → Railway/Render PostgreSQL (Free Tier)

---

## 📋 Prerequisites

1. GitHub account with repository pushed
2. Render account (sign up at render.com)
3. Netlify account (sign up at netlify.com)
4. Railway account for MySQL (optional - sign up at railway.app)

---

## 🚀 Deployment Steps

### Step 1: Deploy Database (Railway MySQL or Render PostgreSQL)

#### Option A: Railway MySQL (Recommended)
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Provision MySQL"
3. Copy the connection details:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
4. Construct DATABASE_URL:
   ```
   jdbc:mysql://MYSQL_HOST:MYSQL_PORT/MYSQL_DATABASE?useSSL=true&requireSSL=false
   ```

#### Option B: Render PostgreSQL
1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `smartshelfx-db`
4. Copy the "Internal Database URL"

**Setup Database Schema:**
1. Connect to your database using MySQL Workbench or DBeaver
2. Execute SQL files in order:
   ```
   database/schema.sql
   database/seed_data.sql
   ```

---

### Step 2: Deploy AI Service (Render)

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select your GitHub repository: `SmartShelfX`
   - Click "Connect"

3. **Configure Service**
   - **Name**: `smartshelfx-ai-service`
   - **Region**: Oregon (US West) or your preferred region
   - **Branch**: `main`
   - **Root Directory**: `ai-service`
   - **Runtime**: Docker
   - **Plan**: Free

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   PORT=8000
   CORS_ORIGINS=https://your-app.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy the service URL: `https://smartshelfx-ai-service.onrender.com`

---

### Step 3: Deploy Backend (Render)

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select your GitHub repository: `SmartShelfX`

3. **Configure Service**
   - **Name**: `smartshelfx-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Plan**: Free

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   SPRING_PROFILES_ACTIVE=prod
   PORT=8080
   DATABASE_URL=jdbc:mysql://your-railway-host:port/database?useSSL=true
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=3a4c18ff14cde780c200bb15e6c48684ad3725e189c60e0c5d3f88ff8a2a4d12
   AI_SERVICE_URL=https://smartshelfx-ai-service.onrender.com
   FRONTEND_URL=https://your-app.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the service URL: `https://smartshelfx-backend.onrender.com`

6. **Test Backend**
   - Visit: `https://smartshelfx-backend.onrender.com/actuator/health`
   - Should return: `{"status":"UP"}`

---

### Step 4: Deploy Frontend (Netlify)

1. **Update Environment File**
   
   Edit `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://smartshelfx-backend.onrender.com/api'
   };
   ```

2. **Commit and Push Changes**
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "Update production API URL"
   git push origin main
   ```

3. **Deploy to Netlify**
   
   **Option A: Netlify Dashboard (Recommended)**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your `SmartShelfX` repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist/smartshelfx-frontend/browser`
   - Click "Deploy site"

   **Option B: Netlify CLI**
   ```bash
   cd frontend
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Configure Site Settings**
   - Go to Site settings → Build & deploy
   - Under "Build settings", verify:
     - Build command: `npm run build`
     - Publish directory: `dist/smartshelfx-frontend/browser`
   - Under "Environment variables", add:
     - No variables needed (handled by environment.prod.ts)

5. **Copy Site URL**
   - Your site will be available at: `https://your-app-name.netlify.app`

---

### Step 5: Update CORS Configuration

1. **Update Backend Environment Variables on Render**
   - Go to your backend service on Render
   - Click "Environment" tab
   - Update `FRONTEND_URL` to your actual Netlify URL:
     ```
     FRONTEND_URL=https://your-actual-app.netlify.app
     ```
   - Save changes (service will redeploy)

2. **Update AI Service Environment Variables**
   - Go to your AI service on Render
   - Update `CORS_ORIGINS`:
     ```
     CORS_ORIGINS=https://your-actual-app.netlify.app,https://smartshelfx-backend.onrender.com
     ```
   - Save changes

---

## ✅ Post-Deployment Verification

### Test All Services

1. **Test AI Service**
   ```bash
   curl https://smartshelfx-ai-service.onrender.com/
   # Should return: {"service": "SmartShelfX AI Forecasting", "status": "running"}
   ```

2. **Test Backend**
   ```bash
   curl https://smartshelfx-backend.onrender.com/actuator/health
   # Should return: {"status":"UP"}
   ```

3. **Test Frontend**
   - Visit: `https://your-app.netlify.app`
   - Try logging in with:
     - Email: `admin@smartshelfx.com`
     - Password: `password123`

4. **Test Full Integration**
   - Login to application
   - Navigate to Forecast page
   - Verify forecasts are loading (tests AI service integration)
   - Create a product (tests backend integration)

---

## 🔧 Troubleshooting

### Frontend Not Loading
- Check browser console for errors
- Verify environment.prod.ts has correct backend URL
- Clear Netlify cache: Settings → Build & deploy → Clear cache and deploy site

### Backend 502 Error
- Check Render logs: Dashboard → Service → Logs
- Verify database connection string is correct
- Ensure all environment variables are set
- Wait 2-3 minutes for cold start (free tier)

### CORS Errors
- Verify FRONTEND_URL in backend matches actual Netlify URL
- Check CORS_ORIGINS in AI service
- Ensure no trailing slashes in URLs

### Database Connection Failed
- Verify DATABASE_URL format is correct
- Check database is running on Railway/Render
- Ensure IP whitelist allows connections (Railway: set to 0.0.0.0/0)
- Test connection using MySQL Workbench first

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- 750 hours/month (enough for 24/7 if only one service)

**Netlify Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Railway Free Tier:**
- $5 credit/month
- ~500 hours of database runtime

---

## 🔒 Security Best Practices

1. **Change Default Credentials**
   - Generate new JWT secret:
     ```bash
     openssl rand -hex 32
     ```
   - Update in Render environment variables

2. **Enable HTTPS Only**
   - Both Render and Netlify provide automatic HTTPS
   - Verify all URLs use `https://`

3. **Protect Environment Variables**
   - Never commit `.env` files
   - Use Render/Netlify dashboards to manage secrets

4. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict IP access if possible

---

## 📊 Monitoring

### Render Dashboard
- Monitor service health and logs
- View deployment history
- Check resource usage

### Netlify Analytics
- View site traffic and build logs
- Monitor build times
- Check for failed deployments

---

## 🔄 Continuous Deployment

Both Render and Netlify support automatic deployments:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**
   - Netlify: Deploys frontend automatically
   - Render: Deploys backend and AI service automatically

3. **Monitor Deployments**
   - Check Netlify dashboard for frontend builds
   - Check Render dashboard for service deployments

---

## 📝 Environment Variables Reference

### Backend (Render)
```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080
DATABASE_URL=jdbc:mysql://host:port/database?useSSL=true
DB_USERNAME=username
DB_PASSWORD=password
JWT_SECRET=your_secret_here
AI_SERVICE_URL=https://smartshelfx-ai-service.onrender.com
FRONTEND_URL=https://your-app.netlify.app
```

### AI Service (Render)
```env
PORT=8000
CORS_ORIGINS=https://your-app.netlify.app,https://smartshelfx-backend.onrender.com
```

### Frontend (Netlify)
- No environment variables needed
- API URL configured in `environment.prod.ts`

---

## 🎉 Success!

Your SmartShelfX application is now live and accessible worldwide!

**Live URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://smartshelfx-backend.onrender.com`
- AI Service: `https://smartshelfx-ai-service.onrender.com`

**Demo Credentials:**
- Admin: `admin@smartshelfx.com` / `password123`
- Manager: `manager1@smartshelfx.com` / `password123`
- Vendor: `vendor1@supplies.com` / `password123`

---

## 📞 Support

If you encounter issues:
1. Check service logs on Render
2. Check build logs on Netlify
3. Verify all environment variables are set correctly
4. Ensure database is accessible and has data

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Railway Documentation](https://docs.railway.app)
- [Spring Boot Deployment Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Production Build](https://angular.io/guide/deployment)
