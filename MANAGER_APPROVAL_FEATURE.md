# Manager Approval Workflow - Implementation Guide

## Overview
Enhanced SmartShelfX security by implementing a manager approval workflow where new users registering as MANAGER must be approved by an admin before receiving manager privileges.

## Feature Description
- **User Experience**: When users signup and select "Warehouse Manager" role, they are temporarily assigned VENDOR role
- **Approval Process**: A pending approval request is created and admins can review/approve/reject these requests
- **Notification**: Users see a message: "Your manager role request is pending admin approval. You are temporarily assigned as VENDOR."
- **Admin Control**: Admins have a new "Approvals" page in their dashboard to manage requests
- **Auto-upgrade**: Upon approval, user's role is automatically upgraded from VENDOR to MANAGER

## Database Changes

### New Table: `manager_approval_requests`
```sql
CREATE TABLE manager_approval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    remarks VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

**Indexes**:
- `idx_manager_approval_status` on `status` column
- `idx_manager_approval_user` on `user_id` column

### Migration File
Location: `database/migrations/add_manager_approvals.sql`

**To apply this migration on Railway MySQL**:
1. Connect to Railway MySQL via MySQL Workbench
2. Connection: `trolley.proxy.rlwy.net:30891`
3. Username: `root`
4. Password: `oGxiBAhSMwexbCAzFpObFXjKgFZwSAVu`
5. Database: `railway`
6. Run the migration SQL file

## Backend Changes

### New Entity Classes
1. **ManagerApprovalRequest.java**
   - Location: `backend/src/main/java/com/smartshelfx/model/`
   - Fields: id, user, requestedAt, status, reviewedBy, reviewedAt, remarks
   - Enum: `ApprovalStatus` (PENDING, APPROVED, REJECTED)

### New Repository
2. **ManagerApprovalRequestRepository.java**
   - Location: `backend/src/main/java/com/smartshelfx/repository/`
   - Methods: findByStatus, findByUserAndStatus, existsByUserAndStatus

### New Service
3. **ManagerApprovalService.java**
   - Location: `backend/src/main/java/com/smartshelfx/service/`
   - Methods:
     - `createApprovalRequest(User user)` - Creates new approval request
     - `getPendingRequests()` - Gets all pending requests
     - `getAllRequests()` - Gets all requests (any status)
     - `approveRequest(Long requestId, User admin, String remarks)` - Approves and upgrades user to MANAGER
     - `rejectRequest(Long requestId, User admin, String remarks)` - Rejects request
     - `hasPendingRequest(User user)` - Checks if user has pending request

### Modified Files

4. **AuthService.java**
   - Added: `@Autowired ManagerApprovalService`
   - Modified: `signup()` method
   - Logic: When role is MANAGER:
     - Assign VENDOR role temporarily
     - Create approval request
     - Return response with special message

5. **LoginResponse.java**
   - Added: `String message` field (optional)
   - New constructor: `LoginResponse(token, userId, username, role, fullName, message)`

### New Controller
6. **AdminController.java**
   - Location: `backend/src/main/java/com/smartshelfx/controller/`
   - Endpoints:
     - `GET /api/admin/approval-requests` - Get pending requests
     - `GET /api/admin/approval-requests/all` - Get all requests
     - `POST /api/admin/approval-requests/{id}/approve` - Approve request
     - `POST /api/admin/approval-requests/{id}/reject` - Reject request

## Frontend Changes

### New Service
1. **manager-approval.service.ts**
   - Location: `frontend/src/app/services/`
   - Interface: `ManagerApprovalRequest`
   - Methods:
     - `getPendingRequests()` - Fetch pending requests
     - `getAllRequests()` - Fetch all requests
     - `approveRequest(id, remarks)` - Approve a request
     - `rejectRequest(id, remarks)` - Reject a request

### New Component
2. **ApprovalRequestsComponent**
   - Location: `frontend/src/app/components/approval-requests/`
   - Files: `.ts`, `.html`, `.css`
   - Features:
     - Material table displaying requests
     - Toggle between pending/all requests view
     - Approve/Reject buttons with remarks input
     - Status chips (color-coded: PENDING=accent, APPROVED=primary, REJECTED=warn)
     - Empty state message when no requests

### Modified Files

3. **models.ts**
   - Updated: `LoginResponse` interface
   - Added: `message?: string` field

4. **signup.component.ts**
   - Modified: `onSubmit()` method
   - Added: Special message display when `response.message` exists
   - Enhanced: Role-based navigation after signup

5. **app.routes.ts**
   - Added: Import for `ApprovalRequestsComponent`
   - Added: Route `{ path: 'admin/approvals', component: ApprovalRequestsComponent }`

6. **navbar.component.ts**
   - Added: New navigation link for admins
   - Link: `/admin/approvals` with icon `how_to_reg`

## API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - Modified to handle manager approval workflow

### Admin Endpoints (Requires ADMIN role)
- `GET /api/admin/approval-requests` - Get pending manager approval requests
- `GET /api/admin/approval-requests/all` - Get all approval requests
- `POST /api/admin/approval-requests/{id}/approve` - Approve a manager request
  - Body: `{ "remarks": "string (optional)" }`
- `POST /api/admin/approval-requests/{id}/reject` - Reject a manager request
  - Body: `{ "remarks": "string (optional)" }`

## Testing Workflow

### Test Manager Signup
1. Go to signup page: https://smartshelfx.netlify.app/signup
2. Fill in details
3. Select role: "Warehouse Manager"
4. Submit form
5. **Expected**: 
   - Success message: "Your manager role request is pending admin approval..."
   - User logged in as VENDOR (temporary)
   - Redirected to vendor dashboard

### Test Admin Approval
1. Login as admin: `admin@smartshelfx.com` / `password123`
2. Navigate to "Approvals" in navbar
3. **Expected**: See pending approval request with user details
4. Click "Approve" button
5. Enter optional remarks
6. **Expected**: 
   - Success message
   - Request moves to "APPROVED" status
   - User's role upgraded to MANAGER in database

### Test Rejection
1. On approvals page, click "Reject" button
2. Enter rejection reason
3. **Expected**:
   - Success message
   - Request marked as "REJECTED"
   - User remains VENDOR

### Verify User Role Upgrade
1. After approval, have the user logout and login again
2. **Expected**: User now sees warehouse manager dashboard and navigation

## Deployment Steps

### 1. Update Database (Railway MySQL)
```bash
# Connect via MySQL Workbench and run:
# File: database/migrations/add_manager_approvals.sql
```

### 2. Deploy Backend (Render)
```bash
cd backend
git add .
git commit -m "feat: Add manager approval workflow"
git push origin main
# Render auto-deploys from GitHub
# Wait for deployment: https://smartshelfx.onrender.com
```

### 3. Deploy Frontend (Netlify)
```bash
cd frontend
git add .
git commit -m "feat: Add admin approvals page for manager requests"
git push origin main
# Netlify auto-deploys from GitHub
# Wait for deployment: https://smartshelfx.netlify.app
```

### 4. Verify Environment Variables
**Backend (Render)**:
- `DATABASE_URL`: jdbc:mysql://trolley.proxy.rlwy.net:30891/railway?useSSL=true&requireSSL=false
- `DATABASE_USERNAME`: root
- `DATABASE_PASSWORD`: oGxiBAhSMwexbCAzFpObFXjKgFZwSAVu
- `JWT_SECRET`: (your secret)
- `AI_SERVICE_URL`: https://smartshelfx-ai-service.onrender.com
- `FRONTEND_URL`: https://smartshelfx.netlify.app

**Frontend (Netlify)**:
- API URL configured in `environment.prod.ts`: https://smartshelfx.onrender.com/api

## Security Benefits
1. **Access Control**: Prevents unauthorized manager access to inventory data
2. **Audit Trail**: Tracks who requested manager access and who approved/rejected
3. **Admin Oversight**: Gives admins full control over sensitive role assignments
4. **Temporary Access**: Users can still use the system (as VENDOR) while waiting for approval
5. **Traceability**: Records timestamps, remarks, and reviewer information

## User Experience Flow

```
User Signup (MANAGER)
    ↓
System assigns VENDOR role temporarily
    ↓
Approval request created (PENDING)
    ↓
User receives notification message
    ↓
User can access system as VENDOR
    ↓
Admin reviews request
    ↓
    ├─→ APPROVED → User role upgraded to MANAGER
    └─→ REJECTED → User remains VENDOR
```

## Files Created/Modified Summary

### Backend (7 files)
- ✅ New: `model/ManagerApprovalRequest.java`
- ✅ New: `repository/ManagerApprovalRequestRepository.java`
- ✅ New: `service/ManagerApprovalService.java`
- ✅ New: `controller/AdminController.java`
- ✅ Modified: `service/AuthService.java`
- ✅ Modified: `dto/LoginResponse.java`
- ✅ Modified: `database/schema.sql`

### Frontend (6 files)
- ✅ New: `services/manager-approval.service.ts`
- ✅ New: `components/approval-requests/approval-requests.component.ts`
- ✅ New: `components/approval-requests/approval-requests.component.html`
- ✅ New: `components/approval-requests/approval-requests.component.css`
- ✅ Modified: `models/models.ts`
- ✅ Modified: `components/signup/signup.component.ts`
- ✅ Modified: `app.routes.ts`
- ✅ Modified: `components/navbar/navbar.component.ts`

### Database (2 files)
- ✅ Modified: `database/schema.sql`
- ✅ New: `database/migrations/add_manager_approvals.sql`

## Troubleshooting

### Issue: Approval request created but user not upgraded
**Solution**: Check that `ManagerApprovalService.approveRequest()` is properly updating the user's role and saving to database.

### Issue: Admin can't see approval requests
**Solution**: Verify admin authentication and that `/api/admin/approval-requests` endpoint is accessible (check CORS and JWT token).

### Issue: Database migration fails
**Solution**: Ensure the `users` table exists before running migration (foreign key constraint requirement).

### Issue: Frontend shows 404 for approvals page
**Solution**: Verify route is properly added to `app.routes.ts` and component is imported.

## Next Steps (Future Enhancements)
1. Email notifications when approval status changes
2. Manager request history on user profile
3. Bulk approve/reject functionality
4. Auto-rejection after X days of inactivity
5. Request reason field during signup
6. Admin dashboard widget showing pending request count

## Conclusion
This feature adds enterprise-grade security to SmartShelfX by implementing role-based access control with admin approval. It demonstrates best practices in:
- Database schema design (foreign keys, indexes, enums)
- Spring Boot service architecture (entities, repositories, services, controllers)
- Angular component development (Material Design, reactive forms, services)
- Full-stack feature implementation (backend + frontend + database)
- Security-conscious design patterns

Perfect addition to a recruiter portfolio showcasing full-stack development skills!
