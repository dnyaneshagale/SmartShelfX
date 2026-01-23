# Quick Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## ☐ Pre-Deployment

- [ ] Create GitHub account and push repository
- [ ] Sign up for Render account
- [ ] Sign up for Netlify account
- [ ] Sign up for Railway account (for MySQL)

## ☐ Database Setup (Railway/Render)

- [ ] Create MySQL database on Railway
- [ ] Copy connection credentials (host, port, username, password, database)
- [ ] Connect to database using MySQL Workbench/DBeaver
- [ ] Execute `database/schema.sql`
- [ ] Execute `database/seed_data.sql`
- [ ] Verify 4 users exist in database

## ☐ AI Service Deployment (Render)

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `ai-service`
- [ ] Select Docker runtime
- [ ] Add environment variable: `PORT=8000`
- [ ] Add environment variable: `CORS_ORIGINS` (will update later)
- [ ] Deploy service
- [ ] Copy AI service URL: `https://smartshelfx-ai-service.onrender.com`
- [ ] Test: `curl https://your-ai-service.onrender.com/`

## ☐ Backend Deployment (Render)

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Select Docker runtime
- [ ] Add environment variables:
  - [ ] `SPRING_PROFILES_ACTIVE=prod`
  - [ ] `PORT=8080`
  - [ ] `DATABASE_URL=jdbc:mysql://...`
  - [ ] `DB_USERNAME`
  - [ ] `DB_PASSWORD`
  - [ ] `JWT_SECRET`
  - [ ] `AI_SERVICE_URL` (from step above)
  - [ ] `FRONTEND_URL` (will update later)
- [ ] Deploy service
- [ ] Copy backend URL: `https://smartshelfx-backend.onrender.com`
- [ ] Test health: `https://your-backend.onrender.com/actuator/health`

## ☐ Frontend Deployment (Netlify)

- [ ] Update `frontend/src/environments/environment.prod.ts` with backend URL
- [ ] Commit and push changes to GitHub
- [ ] Create new site on Netlify
- [ ] Connect GitHub repository
- [ ] Set base directory to `frontend`
- [ ] Set build command to `npm run build`
- [ ] Set publish directory to `dist/smartshelfx-frontend/browser`
- [ ] Deploy site
- [ ] Copy Netlify URL: `https://your-app.netlify.app`

## ☐ Update CORS Configuration

- [ ] Go to backend service on Render
- [ ] Update `FRONTEND_URL` with actual Netlify URL
- [ ] Go to AI service on Render
- [ ] Update `CORS_ORIGINS` with Netlify URL and backend URL
- [ ] Wait for services to redeploy

## ☐ Testing

- [ ] Visit Netlify URL
- [ ] Login with: `admin@smartshelfx.com` / `password123`
- [ ] Navigate to Dashboard (verify data loads)
- [ ] Navigate to Products (verify products display)
- [ ] Navigate to Forecast (verify AI service works)
- [ ] Create a test product
- [ ] Logout and login as manager/vendor

## ☐ Final Verification

- [ ] All services show "healthy" status
- [ ] No CORS errors in browser console
- [ ] All pages load without errors
- [ ] Data persists after reload
- [ ] Forecast data displays correctly

## 🎉 Deployment Complete!

**Your Live URLs:**
- Frontend: https://your-app.netlify.app
- Backend: https://smartshelfx-backend.onrender.com
- AI Service: https://smartshelfx-ai-service.onrender.com

**Demo Credentials:**
- Admin: admin@smartshelfx.com / password123
- Manager: manager1@smartshelfx.com / password123
- Vendor: vendor1@supplies.com / password123

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Frontend shows blank page | Check browser console, verify API URL in environment.prod.ts |
| Backend returns 502 | Wait 30-60 seconds for cold start, check Render logs |
| CORS error | Update FRONTEND_URL in backend, verify no trailing slashes |
| Database connection failed | Check DATABASE_URL format, verify Railway database is running |
| Login fails | Verify seed_data.sql was executed, check database has users |

---

## 📊 Service Status

After deployment, bookmark these URLs to monitor your services:

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **Railway Dashboard**: https://railway.app/dashboard

---

**Note:** Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.
