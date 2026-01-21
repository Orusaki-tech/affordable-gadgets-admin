# Role Permissions Verification

This document shows what permissions each role **currently has** in the codebase.

## 🔴 **SUPERUSER** (Django superuser flag)
**Navigation Access (AdminLayout.tsx):**
- ✅ Dashboard
- ✅ All Requests (Reservation, Return, Transfers)
- ✅ Sales (Leads, Orders)
- ✅ Management (Products, Units, Colors, Sources, Accessories)
- ✅ Reports & Analytics (Reports, Product Analytics, Audit Logs, Stock Alerts)
- ✅ Content (Reviews, Promotions)
- ✅ Administration (Brands, Admins, Customers)
- ✅ Notifications

**Dashboard Data Access (Dashboard.tsx):**
- ✅ Products count (line 122-125)
- ✅ Orders count (line 127-130)
- ✅ All Units data (line 176: `enabled: isSuperuser || ...`)
- ✅ Pending Requests (line 112: `enabled: isInventoryManager || isSuperuser`)
- ✅ Unread Notifications (line 119: `enabled: isSuperuser`)

**Page-Level Access:**
- ✅ All pages accessible (no redirects)

---

## 🟢 **SALESPERSON (SP)**
**Navigation Access (AdminLayout.tsx lines 224-263):**
- ✅ Reservation Requests
- ✅ Return Requests
- ✅ Unit Transfers
- ✅ Leads
- ✅ Products
- ✅ Orders
- ✅ Notifications

**Dashboard Access:**
- ❌ Redirected to `/products` (Dashboard.tsx line 205-207)
- ✅ Can see their own reservations (line 74-78)
- ✅ Can see unclaimed leads (line 81-91)

**Page-Level Access:**
- ✅ Orders Page: Can access (no redirect for SP)
- ❌ Reports Page: Redirected (line 114-122)
- ❌ Stock Alerts Page: Redirected (line 264-272)
- ❌ Product Analytics Page: Redirected (line 60-68)

**Role Definition:**
- Line 79: `isSalesperson = hasRole('SP') && !isSuperuser && !hasRole('IM')`
- Note: If user has IM role, they are NOT considered a salesperson

---

## 🔵 **INVENTORY MANAGER (IM)**
**Navigation Access (AdminLayout.tsx lines 267-348):**
- ✅ Dashboard
- ✅ All Requests (Reservation, Return, Transfers)
- ✅ Inventory (Products, Units, Stock Alerts, Colors, Sources, Accessories)
- ✅ Reports & Analytics (Reports, Product Analytics, Audit Logs)
- ✅ Sales (Orders)
- ✅ Notifications

**Dashboard Data Access (Dashboard.tsx):**
- ✅ Products count
- ✅ Orders count
- ✅ All Units data (line 176: `enabled: ... || (isInventoryManager && !isContentCreator && !isOrderManager)`)
- ✅ Pending Requests (line 112: `enabled: isInventoryManager || isSuperuser`)

**Page-Level Access:**
- ✅ Reports Page: Can access (line 114)
- ✅ Stock Alerts Page: Can access (line 264)
- ✅ Product Analytics Page: Can access (line 60)
- ✅ Orders Page: Can access (no redirect)

**Role Definition:**
- Line 80: `isInventoryManager = hasRole('IM') && !isSuperuser`
- Note: Superusers are NOT considered Inventory Managers

**Special Note:**
- Dashboard Units query (line 176) excludes IM if they also have CC or OM roles

---

## 🟡 **CONTENT CREATOR (CC)**
**Navigation Access (AdminLayout.tsx lines 352-376):**
- ✅ Content Creator Dashboard (`/content-creator/dashboard`)
- ✅ Products
- ✅ Reviews
- ✅ Notifications

**Dashboard Access:**
- ❌ Main Dashboard: Redirected to `/content-creator/dashboard` (Dashboard.tsx line 210-212)

**Page-Level Access:**
- ❌ Orders Page: Redirected (line 233-235)
- ❌ Reports Page: Redirected (line 115-117)
- ❌ Stock Alerts Page: Redirected (line 265-267)
- ❌ Product Analytics Page: Redirected (line 61-63)

**Role Definition:**
- Line 81: `isContentCreator = hasRole('CC') && !isSuperuser`

---

## 🟣 **MARKETING MANAGER (MM)**
**Navigation Access (AdminLayout.tsx lines 380-407):**
- ✅ Dashboard
- ✅ Promotions
- ✅ Products (read-only implied)
- ✅ Notifications

**Dashboard Access:**
- ✅ Can access main Dashboard (no redirect found)

**Page-Level Access:**
- ⚠️ No explicit redirects found in checked pages
- ⚠️ ProductsPage.tsx line 154: `enabled: isMarketingManager` - fetches promotions data

**Role Definition:**
- Line 82: `isMarketingManager = hasRole('MM') && !isSuperuser`

---

## 🟠 **ORDER MANAGER (OM)**
**Navigation Access (AdminLayout.tsx lines 411-432):**
- ✅ Dashboard
- ✅ Orders
- ✅ Notifications

**Dashboard Access:**
- ✅ Can access main Dashboard (no redirect found)
- ⚠️ Units data excluded (line 176: `... && !isOrderManager`)

**Page-Level Access:**
- ✅ Orders Page: Can access (no redirect for OM)

**Role Definition:**
- Line 83: `isOrderManager = hasRole('OM') && !isSuperuser`

---

## ⚠️ **ISSUES FOUND:**

1. **Dashboard Units Access (line 176):**
   - Current: `enabled: !isLoadingProfile && (isSuperuser || (isInventoryManager && !isContentCreator && !isOrderManager))`
   - Issue: If IM also has CC or OM role, they can't see units
   - Should probably be: `enabled: !isLoadingProfile && (isSuperuser || isInventoryManager)`

2. **Salesperson Role Logic:**
   - Line 79: `isSalesperson = hasRole('SP') && !isSuperuser && !hasRole('IM')`
   - If user has both SP and IM, they are treated as IM only
   - This might be intentional, but worth confirming

3. **Order Manager Dashboard Access:**
   - Order Manager can access Dashboard but Units data is excluded
   - This might be intentional (they manage orders, not inventory)

4. **Marketing Manager:**
   - Limited page-level permission checks found
   - May need more explicit restrictions

5. **Missing Permission Checks:**
   - Some pages may not have explicit role checks
   - Need to verify all pages have proper access control

---

## 📋 **SUMMARY TABLE:**

| Feature | Superuser | Salesperson | Inventory Manager | Content Creator | Marketing Manager | Order Manager |
|---------|-----------|-------------|-------------------|-----------------|-------------------|---------------|
| **Dashboard** | ✅ | ❌ (redirect) | ✅ | ❌ (redirect) | ✅ | ✅ |
| **Products** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Units** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Orders** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Leads** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reservation Requests** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Return Requests** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Unit Transfers** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reports** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Stock Alerts** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Product Analytics** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Reviews** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Promotions** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Brands** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Admins** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customers** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔍 **NEXT STEPS:**

1. Review this document and confirm if permissions match expectations
2. Identify any discrepancies
3. Update code to match desired permissions
4. Add missing permission checks where needed
