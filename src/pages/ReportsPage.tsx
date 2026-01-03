import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';

interface InventoryValueReport {
  total_value: string;
  available_value: string;
  by_product: Array<{
    product_template__id: number;
    product_template__product_name: string;
    unit_count: number;
    available_count: number;
    total_value: string;
    avg_price: string;
  }>;
  by_status: Array<{
    sale_status: string;
    unit_count: number;
    total_value: string;
  }>;
}

interface StockMovementReport {
  summary: {
    units_sourced: number;
    units_sold: number;
    net_change: number;
  };
  daily_sourced: Array<{ date: string; count: number }>;
  daily_sold: Array<{ date: string; count: number }>;
}

interface ProductPerformance {
  id: number;
  product_name: string;
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  sell_through_rate: string;
  avg_selling_price: string;
  total_revenue: string;
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(30);
  
  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const { data: inventoryValue, isLoading: loadingInventory } = useQuery<InventoryValueReport>({
    queryKey: ['reports-inventory-value'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/reports/inventory_value/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch inventory value report');
      return response.json();
    },
  });

  const { data: stockMovement, isLoading: loadingMovement } = useQuery<StockMovementReport>({
    queryKey: ['reports-stock-movement', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/reports/stock_movement/?days=${dateRange}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stock movement report');
      return response.json();
    },
  });

  const { data: productPerformance, isLoading: loadingPerformance } = useQuery<ProductPerformance[]>({
    queryKey: ['reports-product-performance'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/reports/product_performance/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch product performance report');
      return response.json();
    },
  });

  // Role checks and redirect (after all hooks are declared)
  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isInventoryManager = hasRole('IM');
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isSalesperson = hasRole('SP') && !isSuperuser;

  // Redirect unauthorized users (only Inventory Managers and Superusers can access)
  if (!isLoadingProfile && !isInventoryManager && !isSuperuser) {
    if (isContentCreator) {
      return <Navigate to="/content-creator/dashboard" replace />;
    }
    if (isSalesperson) {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `KES ${num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'AV': 'Available',
      'SD': 'Sold',
      'RS': 'Reserved',
      'RT': 'Returned',
    };
    return labels[status] || status;
  };

  const isLoading = loadingInventory || loadingMovement || loadingPerformance;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive inventory insights and performance metrics</p>
        </div>
        <div className="date-range-selector">
          <label>Time Period:</label>
          <select value={dateRange} onChange={(e) => setDateRange(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card metric-primary">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-label">Total Inventory Value</div>
                <div className="metric-value">
                  {inventoryValue ? formatCurrency(inventoryValue.total_value) : '-'}
                </div>
              </div>
            </div>

            <div className="metric-card metric-success">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-label">Available Stock Value</div>
                <div className="metric-value">
                  {inventoryValue ? formatCurrency(inventoryValue.available_value) : '-'}
                </div>
              </div>
            </div>

            <div className="metric-card metric-info">
              <div className="metric-icon">📦</div>
              <div className="metric-content">
                <div className="metric-label">Units Sourced ({dateRange}d)</div>
                <div className="metric-value">
                  {stockMovement?.summary.units_sourced || 0}
                </div>
              </div>
            </div>

            <div className="metric-card metric-warning">
              <div className="metric-icon">🛒</div>
              <div className="metric-content">
                <div className="metric-label">Units Sold ({dateRange}d)</div>
                <div className="metric-value">
                  {stockMovement?.summary.units_sold || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Movement Summary */}
          {stockMovement && (
            <div className="report-section">
              <h2 className="section-title">Stock Movement Summary</h2>
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-label">Net Change</div>
                  <div className={`summary-value ${stockMovement.summary.net_change >= 0 ? 'positive' : 'negative'}`}>
                    {stockMovement.summary.net_change >= 0 ? '+' : ''}{stockMovement.summary.net_change}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Units In</div>
                  <div className="summary-value positive">+{stockMovement.summary.units_sourced}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Units Out</div>
                  <div className="summary-value negative">-{stockMovement.summary.units_sold}</div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory by Status */}
          {inventoryValue && inventoryValue.by_status.length > 0 && (
            <div className="report-section">
              <h2 className="section-title">Inventory by Status</h2>
              <div className="status-grid">
                {inventoryValue.by_status.map((item) => (
                  <div key={item.sale_status} className="status-card">
                    <div className="status-header">
                      <span className={`status-badge status-${item.sale_status.toLowerCase()}`}>
                        {getStatusLabel(item.sale_status)}
                      </span>
                      <span className="status-count">{item.unit_count} units</span>
                    </div>
                    <div className="status-value">{formatCurrency(item.total_value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Products by Performance */}
          {productPerformance && productPerformance.length > 0 && (
            <div className="report-section">
              <h2 className="section-title">Product Performance (Top 10)</h2>
              <div className="table-container">
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Total Units</th>
                      <th>Available</th>
                      <th>Sold</th>
                      <th>Reserved</th>
                      <th>Sell-Through</th>
                      <th>Avg Price</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPerformance.slice(0, 10).map((product) => (
                      <tr key={product.id}>
                        <td className="product-name">{product.product_name}</td>
                        <td>{product.total_units}</td>
                        <td className="text-success">{product.available_units}</td>
                        <td className="text-primary">{product.sold_units}</td>
                        <td className="text-warning">{product.reserved_units}</td>
                        <td>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${Math.min(parseFloat(product.sell_through_rate || '0'), 100)}%` }}
                            >
                              {parseFloat(product.sell_through_rate || '0').toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td>{formatCurrency(product.avg_selling_price || 0)}</td>
                        <td className="revenue">{formatCurrency(product.total_revenue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Products by Value */}
          {inventoryValue && inventoryValue.by_product.length > 0 && (
            <div className="report-section">
              <h2 className="section-title">Top Products by Inventory Value</h2>
              <div className="table-container">
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Total Units</th>
                      <th>Available</th>
                      <th>Avg Price</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryValue.by_product.slice(0, 10).map((product) => (
                      <tr key={product.product_template__id}>
                        <td className="product-name">{product.product_template__product_name}</td>
                        <td>{product.unit_count}</td>
                        <td className="text-success">{product.available_count}</td>
                        <td>{formatCurrency(product.avg_price || 0)}</td>
                        <td className="revenue">{formatCurrency(product.total_value || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

