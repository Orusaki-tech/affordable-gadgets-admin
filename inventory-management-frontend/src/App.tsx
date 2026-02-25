import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './App.css';
import './api/config'; // Initialize API configuration
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { RoleBasedRedirect } from './components/RoleBasedRedirect';
import { PageLoader } from './components/PageLoader';

// Lazy-load pages for smaller initial bundle and faster first load (code splitting)
const LoginPage = lazy(() => import('./pages/Login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductUnitsPage = lazy(() => import('./pages/ProductUnitsPage').then((m) => ({ default: m.ProductUnitsPage })));
const UnitsPage = lazy(() => import('./pages/UnitsPage').then((m) => ({ default: m.UnitsPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const ColorsPage = lazy(() => import('./pages/ColorsPage').then((m) => ({ default: m.ColorsPage })));
const AcquisitionSourcesPage = lazy(() => import('./pages/AcquisitionSourcesPage').then((m) => ({ default: m.AcquisitionSourcesPage })));
const ProductAccessoriesPage = lazy(() => import('./pages/ProductAccessoriesPage').then((m) => ({ default: m.ProductAccessoriesPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })));
const AdminsPage = lazy(() => import('./pages/AdminsPage').then((m) => ({ default: m.AdminsPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const ReservationRequestsPage = lazy(() => import('./pages/ReservationRequestsPage').then((m) => ({ default: m.ReservationRequestsPage })));
const ReturnRequestsPage = lazy(() => import('./pages/ReturnRequestsPage').then((m) => ({ default: m.ReturnRequestsPage })));
const UnitTransfersPage = lazy(() => import('./pages/UnitTransfersPage').then((m) => ({ default: m.UnitTransfersPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const StockAlertsPage = lazy(() => import('./pages/StockAlertsPage').then((m) => ({ default: m.StockAlertsPage })));
const LeadsPage = lazy(() => import('./pages/LeadsPage').then((m) => ({ default: m.LeadsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const ProductAnalyticsPage = lazy(() => import('./pages/ProductAnalyticsPage').then((m) => ({ default: m.ProductAnalyticsPage })));
const ContentCreatorDashboard = lazy(() => import('./pages/ContentCreatorDashboard').then((m) => ({ default: m.ContentCreatorDashboard })));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage').then((m) => ({ default: m.PromotionsPage })));
const BrandsPage = lazy(() => import('./pages/BrandsPage').then((m) => ({ default: m.BrandsPage })));
const BundlesPage = lazy(() => import('./pages/BundlesPage').then((m) => ({ default: m.BundlesPage })));
const DeliveryRatesPage = lazy(() => import('./pages/DeliveryRatesPage').then((m) => ({ default: m.DeliveryRatesPage })));
const TagsPage = lazy(() => import('./pages/TagsPage').then((m) => ({ default: m.TagsPage })));

// Material UI Theme Wrapper Component
const AppWithMUITheme: React.FC = () => {
  const { theme } = useTheme();
  
  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme === 'dark' ? 'dark' : 'light',
          primary: {
            main: theme === 'dark' ? '#DBC66F' : '#6D5E0F',
            contrastText: theme === 'dark' ? '#393000' : '#FFFFFF',
          },
          secondary: {
            main: theme === 'dark' ? '#D1C6A1' : '#665E40',
          },
          background: {
            default: theme === 'dark' ? '#15130B' : '#FFF9ED',
            paper: theme === 'dark' ? '#222017' : '#FFF9ED',
          },
          text: {
            primary: theme === 'dark' ? '#E8E2D4' : '#1E1C13',
            secondary: theme === 'dark' ? '#CDC6B4' : '#4B4739',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: theme === 'dark' ? '#222017' : '#FFF9ED',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: theme === 'dark' ? '#222017' : '#FFF9ED',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#2C2A21' : '#F4EDDF',
                },
              },
            },
          },
        },
      }),
    [theme]
  );

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="content-creator/dashboard" element={<ContentCreatorDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:productId/units" element={<ProductUnitsPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="colors" element={<ColorsPage />} />
            <Route path="sources" element={<AcquisitionSourcesPage />} />
            <Route path="accessories" element={<ProductAccessoriesPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="reservation-requests" element={<ReservationRequestsPage />} />
            <Route path="return-requests" element={<ReturnRequestsPage />} />
            <Route path="unit-transfers" element={<UnitTransfersPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="stock-alerts" element={<StockAlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="product-analytics" element={<ProductAnalyticsPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="bundles" element={<BundlesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="delivery-rates" element={<DeliveryRatesPage />} />
            <Route path="tags" element={<TagsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </MUIThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppWithMUITheme />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
