# Phase 1 Testing Checklist

## Prerequisites

### 1. Django Backend Setup
- [ ] Start Django server: `python manage.py runserver` (should run on port 8000)
- [ ] Verify backend is accessible at `http://localhost:8000/api/inventory/`
- [ ] Create an admin user in Django:
  ```python
  # In Django shell: python manage.py shell
  from inventory.models import User, Admin
  user = User.objects.create_user(username='admin', email='admin@test.com', password='admin123')
  user.is_staff = True
  user.save()
  admin_profile = Admin.objects.create(user=user, admin_code='ADMIN001')
  ```

### 2. Frontend Setup
- [x] `.env` file created with correct API URL
- [x] Dependencies installed (`npm install`)
- [x] TypeScript compilation errors resolved

## Testing Steps

### Test 1: Application Starts
- [ ] Run `npm start` in `inventory-management-frontend/`
- [ ] Browser should open to `http://localhost:3000`
- [ ] Should automatically redirect to `/login`
- [ ] Verify login page displays correctly (gradient background, form centered)

### Test 2: Non-Admin User Blocked
- [ ] Try logging in with a non-admin user (is_staff=False)
- [ ] Should see error: "Access denied. Admin privileges required."
- [ ] User should NOT be redirected to dashboard

### Test 3: Admin Login Success
- [ ] Enter admin credentials (user created above)
- [ ] Click "Login" button
- [ ] Should see loading state ("Logging in...")
- [ ] On success, should redirect to `/dashboard`
- [ ] Dashboard should display with sidebar navigation

### Test 4: Dashboard Display
- [ ] Verify sidebar shows: Dashboard, Products, Units, Orders, Colors, Sources, Accessories
- [ ] Verify user email displays in sidebar header
- [ ] Verify dashboard stats cards display:
  - Total Products (should load from API)
  - Total Orders (should load from API)
  - Available Units (placeholder)
  - Total Revenue (placeholder)

### Test 5: Protected Routes
- [ ] Try accessing `/dashboard` directly without logging in
- [ ] Should redirect back to `/login`
- [ ] After login, try manually navigating to `/dashboard` - should work

### Test 6: Token Persistence
- [ ] Login successfully
- [ ] Refresh the page (F5)
- [ ] Should remain logged in (token validated)
- [ ] Dashboard should still be accessible

### Test 7: Logout Functionality
- [ ] Click "Logout" button in sidebar
- [ ] Should clear authentication
- [ ] Should redirect to `/login`
- [ ] Try accessing `/dashboard` - should redirect to login

### Test 8: API Connectivity
- [ ] Open browser DevTools (F12) → Network tab
- [ ] Login and check Network requests
- [ ] Verify API calls go to `http://localhost:8000/api/inventory/`
- [ ] Check for CORS errors (should be none if backend CORS is configured)

## Expected Results

✅ **Login Page:**
- Clean, centered form with gradient background
- Username/email and password fields
- Error messages display properly
- Loading state during authentication

✅ **Dashboard:**
- Sidebar navigation with all menu items
- Stats cards with real data from API
- User email displayed in sidebar
- Responsive layout

✅ **Authentication:**
- Admin-only access enforced
- Token stored in localStorage
- Protected routes redirect to login
- Logout clears session

## Common Issues

### CORS Errors
- **Symptom:** Network requests fail with CORS error
- **Fix:** Ensure Django CORS headers are configured (already done in `store/settings.py`)

### Token Not Working
- **Symptom:** Login succeeds but dashboard redirects back to login
- **Fix:** Check browser console for API errors, verify token format in localStorage

### API Connection Failed
- **Symptom:** Stats show "..." indefinitely
- **Fix:** Verify Django server is running on port 8000

### TypeScript Errors
- **Symptom:** Compilation errors
- **Fix:** Run `npm run build` to check for errors, verify tsconfig.json target is es2015

## Next Steps After Testing

Once Phase 1 is verified working:
- [ ] Document any issues found
- [ ] Proceed to Phase 2: Products Management
- [ ] Proceed to Phase 3: Inventory Units Management

