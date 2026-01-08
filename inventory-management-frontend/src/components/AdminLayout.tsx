import React, { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService, StockAlertsService, StockAlertsResponse, type Brand, type AdminProfileResponse as BaseAdminProfileResponse } from '../api/index';
import { NotificationBell } from './NotificationBell';
import { ThemeToggleButton } from './ThemeSwitcher';
import './AdminLayout.css';

// Extend AdminProfileResponse to include brands and is_global_admin
// Note: brands in Admin is string, but we parse it as Brand[] when needed
interface AdminProfileResponse extends Omit<BaseAdminProfileResponse, 'brands'> {
  brands?: Brand[] | string;
  is_global_admin?: boolean;
}

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Fetch admin profile to get roles
  const { data: adminProfile, error: adminProfileError, isLoading: isLoadingAdminProfile } = useQuery<AdminProfileResponse>({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      try {
        const profile = await ProfilesService.profilesAdminRetrieve();
        console.log('✅ Admin profile fetched successfully:', { 
          hasUser: !!profile.user, 
          is_superuser: profile.user?.is_superuser,
          is_staff: profile.user?.is_staff,
          hasRoles: !!profile.roles,
          rolesCount: profile.roles?.length || 0
        });
        return profile as AdminProfileResponse;
      } catch (error: any) {
        console.error('❌ Failed to fetch admin profile:', {
          status: error?.status,
          message: error?.message,
          user_id: user?.id,
          user_is_staff: user?.is_staff,
          user_is_superuser: user?.is_superuser
        });
        throw error;
      }
    },
    retry: false,
    enabled: !!user?.is_staff || !!user?.is_superuser, // Enable for staff OR superuser
  });

  const hasRole = (roleName: string) => {
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  // Check superuser status - use user from AuthContext as fallback if adminProfile is not available
  // This handles cases where the admin profile API fails but the user is still a superuser
  const isSuperuser = adminProfile?.user?.is_superuser === true || user?.is_superuser === true;
  
  // Debug logging for superuser status
  useEffect(() => {
    if (user) {
      console.log('🔍 AdminLayout - User status:', {
        user_id: user.id,
        user_is_staff: user.is_staff,
        user_is_superuser: user.is_superuser,
        adminProfile_exists: !!adminProfile,
        adminProfile_user_is_superuser: adminProfile?.user?.is_superuser,
        final_isSuperuser: isSuperuser,
        adminProfileError: adminProfileError ? {
          status: (adminProfileError as any)?.status,
          message: (adminProfileError as any)?.message
        } : null
      });
    }
  }, [user, adminProfile, isSuperuser, adminProfileError]);
  const isSalesperson = hasRole('SP') && !isSuperuser && !hasRole('IM'); // Salesperson only, not if superuser or IM
  const isInventoryManager = hasRole('IM') && !isSuperuser; // Inventory Manager only, not if superuser
  const isContentCreator = hasRole('CC') && !isSuperuser; // Content Creator only, not if superuser
  const isMarketingManager = hasRole('MM') && !isSuperuser; // Marketing Manager only, not if superuser
  const isOrderManager = hasRole('OM') && !isSuperuser; // Order Manager only, not if superuser
  
  // Get admin's brands (memoized to prevent unnecessary re-renders)
  // brands can be string or Brand[], parse if string
  const adminBrands = useMemo((): Brand[] => {
    if (!adminProfile?.brands) return [];
    if (typeof adminProfile.brands === 'string') {
      try {
        const parsed = JSON.parse(adminProfile.brands);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(adminProfile.brands) ? adminProfile.brands : [];
  }, [adminProfile?.brands]);
  const isGlobalAdmin = adminProfile?.is_global_admin === true;
  const hasMultipleBrands = adminBrands.length > 1 && !isGlobalAdmin;
  
  // Initialize selected brand from localStorage or first brand
  useEffect(() => {
    if (adminBrands.length > 0 && !isGlobalAdmin) {
      const savedBrandId = localStorage.getItem('selectedBrandId');
      if (savedBrandId) {
        const savedBrand = adminBrands.find((b: Brand) => b.id?.toString() === savedBrandId);
        if (savedBrand) {
          setSelectedBrand(savedBrand);
          return;
        }
      }
      // Default to first brand
      setSelectedBrand(adminBrands[0] as Brand);
    } else {
      setSelectedBrand(null);
    }
  }, [adminBrands, isGlobalAdmin]);
  
  // Save selected brand to localStorage
  useEffect(() => {
    if (selectedBrand?.id) {
      localStorage.setItem('selectedBrandId', selectedBrand.id.toString());
    } else {
      localStorage.removeItem('selectedBrandId');
    }
  }, [selectedBrand]);
  
  // Fetch stock alerts count for badge (only if user has inventory manager or superuser access)
  const { data: stockAlertsData } = useQuery<StockAlertsResponse>({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      try {
        return await StockAlertsService.stockAlertsRetrieve();
      } catch {
        return { count: 0, alerts: [] };
      }
    },
    enabled: (isInventoryManager || isSuperuser) && !!user?.is_staff,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const criticalAlertsCount = stockAlertsData?.alerts?.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length || 0;
  // const isContentCreator = hasRole('CC') && !isSuperuser; // Content Creator only, not if superuser - commented out as unused

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Shwari Admin</h2>
          <p className="user-email">{user?.email}</p>
          {adminProfile?.roles && adminProfile.roles.length > 0 && (
            <div className="user-roles">
              {adminProfile.roles.map((role) => (
                <span key={role.id} className="role-badge-small">
                  {role.display_name || role.role_name || role.name}
                </span>
              ))}
            </div>
          )}
          {/* Brand Selector */}
          {hasMultipleBrands && (
            <div className="brand-selector">
              <label className="brand-selector-label">Brand:</label>
              <select
                className="brand-select"
                value={selectedBrand?.id || ''}
                onChange={(e) => {
                  const brand = adminBrands.find((b: Brand) => b.id?.toString() === e.target.value);
                  setSelectedBrand(brand as Brand || null);
                }}
              >
                {adminBrands.map((brand: Brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name || brand.code}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isGlobalAdmin && (
            <div className="brand-badge">
              <span className="global-admin-badge">Global Admin</span>
            </div>
          )}
          {!isGlobalAdmin && adminBrands.length === 1 && (
            <div className="brand-badge">
              <span className="single-brand-badge">{adminBrands[0]?.name || adminBrands[0]?.code}</span>
            </div>
          )}
          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <ThemeToggleButton />
          </div>
        </div>
        <nav className="sidebar-nav">
          {/* Salesperson Access - Limited to Requests, Products, Orders, and Notifications */}
          {isSalesperson && (
            <>
              <div className="nav-section-header">Requests</div>
              <Link 
                to="/reservation-requests" 
                className={isActive('/reservation-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Reservation Requests
              </Link>
              <Link 
                to="/return-requests" 
                className={isActive('/return-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Return Requests
              </Link>
              <Link 
                to="/unit-transfers" 
                className={isActive('/unit-transfers')}
                onClick={() => setSidebarOpen(false)}
              >
                Unit Transfers
              </Link>
              <div className="nav-section-header">Sales</div>
              <Link to="/leads" className={isActive('/leads')} onClick={() => setSidebarOpen(false)}>
                Leads
              </Link>
              <div className="nav-section-header">Management</div>
              <Link to="/products" className={isActive('/products')} onClick={() => setSidebarOpen(false)}>
                Products
              </Link>
              <Link to="/orders" className={isActive('/orders')} onClick={() => setSidebarOpen(false)}>
                Orders
              </Link>
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* Inventory Manager Access */}
          {isInventoryManager && (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard')}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Request Management */}
              <div className="nav-section-header">Requests</div>
              <Link 
                to="/reservation-requests" 
                className={isActive('/reservation-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Reservation Requests
              </Link>
              <Link 
                to="/return-requests" 
                className={isActive('/return-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Return Requests
              </Link>
              <Link 
                to="/unit-transfers" 
                className={isActive('/unit-transfers')}
                onClick={() => setSidebarOpen(false)}
              >
                Unit Transfers
              </Link>

              {/* Inventory Management */}
              <div className="nav-section-header">Inventory</div>
              <Link to="/products" className={isActive('/products')} onClick={() => setSidebarOpen(false)}>
                Products
              </Link>
              <Link to="/units" className={isActive('/units')} onClick={() => setSidebarOpen(false)}>
                Inventory Units
              </Link>
              <Link to="/stock-alerts" className={isActive('/stock-alerts')} onClick={() => setSidebarOpen(false)}>
                Stock Alerts
                {criticalAlertsCount > 0 && (
                  <span className="nav-badge nav-badge-critical">{criticalAlertsCount}</span>
                )}
              </Link>
              <Link to="/colors" className={isActive('/colors')} onClick={() => setSidebarOpen(false)}>
                Colors
              </Link>
              <Link to="/sources" className={isActive('/sources')} onClick={() => setSidebarOpen(false)}>
                Unit Acquisition Sources
              </Link>
              <Link to="/accessories" className={isActive('/accessories')} onClick={() => setSidebarOpen(false)}>
                Product Accessories
              </Link>

              {/* Reports & Analytics */}
              <div className="nav-section-header">Reports & Analytics</div>
              <Link to="/reports" className={isActive('/reports')} onClick={() => setSidebarOpen(false)}>
                Reports Dashboard
              </Link>
              <Link to="/product-analytics" className={isActive('/product-analytics')} onClick={() => setSidebarOpen(false)}>
                Product Analytics
              </Link>
              <Link to="/audit-logs" className={isActive('/audit-logs')} onClick={() => setSidebarOpen(false)}>
                Audit Logs
              </Link>

              {/* Orders */}
              <div className="nav-section-header">Sales</div>
              <Link to="/orders" className={isActive('/orders')} onClick={() => setSidebarOpen(false)}>
                Orders
              </Link>

              {/* Other */}
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* Content Creator Access */}
          {isContentCreator && (
            <>
              <Link 
                to="/content-creator/dashboard" 
                className={isActive('/content-creator/dashboard')}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Content Management */}
              <div className="nav-section-header">Content</div>
              <Link to="/products" className={isActive('/products')} onClick={() => setSidebarOpen(false)}>
                Products
              </Link>
              <Link to="/reviews" className={isActive('/reviews')} onClick={() => setSidebarOpen(false)}>
                Reviews
              </Link>
              
              {/* Other */}
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* Marketing Manager Access */}
          {isMarketingManager && (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard')}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Promotions Management */}
              <div className="nav-section-header">Marketing</div>
              <Link to="/promotions" className={isActive('/promotions')} onClick={() => setSidebarOpen(false)}>
                Promotions
              </Link>
              
              {/* Product Selection (Read-only) */}
              <div className="nav-section-header">Products</div>
              <Link to="/products" className={isActive('/products')} onClick={() => setSidebarOpen(false)}>
                Products
              </Link>
              
              {/* Other */}
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* Order Manager Access */}
          {isOrderManager && (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard')}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Order Management */}
              <div className="nav-section-header">Sales</div>
              <Link to="/orders" className={isActive('/orders')} onClick={() => setSidebarOpen(false)}>
                Orders
              </Link>
              
              {/* Other */}
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* Superuser - Full Access */}
          {isSuperuser && (
            <>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard')}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Request Management */}
              <div className="nav-section-header">Requests</div>
              <Link 
                to="/reservation-requests" 
                className={isActive('/reservation-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Reservation Requests
              </Link>
              <Link 
                to="/return-requests" 
                className={isActive('/return-requests')}
                onClick={() => setSidebarOpen(false)}
              >
                Return Requests
              </Link>
              <Link 
                to="/unit-transfers" 
                className={isActive('/unit-transfers')}
                onClick={() => setSidebarOpen(false)}
              >
                Unit Transfers
              </Link>

              {/* Core Management */}
              <div className="nav-section-header">Sales</div>
              <Link to="/leads" className={isActive('/leads')} onClick={() => setSidebarOpen(false)}>
                Leads
              </Link>
              <Link to="/orders" className={isActive('/orders')} onClick={() => setSidebarOpen(false)}>
                Orders
              </Link>
              <div className="nav-section-header">Management</div>
              <Link to="/products" className={isActive('/products')} onClick={() => setSidebarOpen(false)}>
                Products
              </Link>
              <Link to="/units" className={isActive('/units')} onClick={() => setSidebarOpen(false)}>
                Inventory Units
              </Link>
              <Link to="/colors" className={isActive('/colors')} onClick={() => setSidebarOpen(false)}>
                Colors
              </Link>
              <Link to="/sources" className={isActive('/sources')} onClick={() => setSidebarOpen(false)}>
                Unit Acquisition Sources
              </Link>
              <Link to="/accessories" className={isActive('/accessories')} onClick={() => setSidebarOpen(false)}>
                Product Accessories
              </Link>

              {/* Reports & Analytics */}
              <div className="nav-section-header">Reports & Analytics</div>
              <Link to="/reports" className={isActive('/reports')} onClick={() => setSidebarOpen(false)}>
                Reports Dashboard
              </Link>
              <Link to="/product-analytics" className={isActive('/product-analytics')} onClick={() => setSidebarOpen(false)}>
                Product Analytics
              </Link>
              <Link to="/audit-logs" className={isActive('/audit-logs')} onClick={() => setSidebarOpen(false)}>
                Audit Logs
              </Link>
              <Link to="/stock-alerts" className={isActive('/stock-alerts')} onClick={() => setSidebarOpen(false)}>
                Stock Alerts
                {criticalAlertsCount > 0 && (
                  <span className="nav-badge nav-badge-critical">{criticalAlertsCount}</span>
                )}
              </Link>

              {/* Content */}
              <div className="nav-section-header">Content</div>
              <Link to="/reviews" className={isActive('/reviews')} onClick={() => setSidebarOpen(false)}>
                Reviews
              </Link>
              <Link to="/promotions" className={isActive('/promotions')} onClick={() => setSidebarOpen(false)}>
                Promotions
              </Link>

              {/* Administration */}
              <div className="nav-section-header">Administration</div>
              <Link to="/admins" className={isActive('/admins')} onClick={() => setSidebarOpen(false)}>
                Admins
              </Link>
              <Link to="/customers" className={isActive('/customers')} onClick={() => setSidebarOpen(false)}>
                Customers
              </Link>

              {/* Other */}
              <div className="nav-section-header">Other</div>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setSidebarOpen(false)}>
                Notifications
              </Link>
            </>
          )}

          {/* If user is not a salesperson, inventory manager, content creator, marketing manager, order manager, and not a superuser, show nothing (or minimal access) */}
          {!isSalesperson && !isInventoryManager && !isContentCreator && !isMarketingManager && !isOrderManager && !isSuperuser && (
            <div className="nav-section-header">Access Restricted</div>
          )}
        </nav>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <div className="header-content">
            <h1 className="page-title">{location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
            <NotificationBell />
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

