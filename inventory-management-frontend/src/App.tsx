import React from 'react';
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
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ProductUnitsPage } from './pages/ProductUnitsPage';
import { UnitsPage } from './pages/UnitsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ColorsPage } from './pages/ColorsPage';
import { AcquisitionSourcesPage } from './pages/AcquisitionSourcesPage';
import { ProductAccessoriesPage } from './pages/ProductAccessoriesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AdminsPage } from './pages/AdminsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReservationRequestsPage } from './pages/ReservationRequestsPage';
import { ReturnRequestsPage } from './pages/ReturnRequestsPage';
import { UnitTransfersPage } from './pages/UnitTransfersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { StockAlertsPage } from './pages/StockAlertsPage';
import { LeadsPage } from './pages/LeadsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { ContentCreatorDashboard } from './pages/ContentCreatorDashboard';
import { PromotionsPage } from './pages/PromotionsPage';

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
        </Route>
      </Routes>
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
