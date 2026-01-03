import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';

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

export const ProductAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductPerformance | null>(null);
  const navigate = useNavigate();
  
  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const { data: products, isLoading } = useQuery<ProductPerformance[]>({
    queryKey: ['product-performance'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/reports/product_performance/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch product performance');
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

  const filteredProducts = products?.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `KES ${num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 75) return '#28a745';
    if (rate >= 50) return '#ffc107';
    if (rate >= 25) return '#ff9800';
    return '#dc3545';
  };

  return (
    <div className="product-analytics-page">
      <div className="page-header">
        <div>
          <h1>Product Analytics</h1>
          <p className="page-subtitle">Detailed performance metrics and insights for each product</p>
        </div>
      </div>

      <div className="analytics-container">
        {/* Product List */}
        <div className="products-panel">
          <div className="panel-header">
            <h2>Products</h2>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="products-list">
              {filteredProducts.map((product) => {
                const sellThrough = parseFloat(product.sell_through_rate || '0');
                return (
                  <div
                    key={product.id}
                    className={`product-item ${selectedProduct?.id === product.id ? 'active' : ''}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="product-item-header">
                      <h3>{product.product_name}</h3>
                      <span 
                        className="performance-indicator"
                        style={{ backgroundColor: getPerformanceColor(sellThrough) }}
                      >
                        {sellThrough.toFixed(0)}%
                      </span>
                    </div>
                    <div className="product-item-stats">
                      <span>{product.total_units} units</span>
                      <span className="separator">•</span>
                      <span>{product.sold_units} sold</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analytics Details */}
        <div className="analytics-panel">
          {selectedProduct ? (
            <>
              <div className="panel-header">
                <h2>{selectedProduct.product_name}</h2>
                <button
                  className="btn-secondary btn-small"
                  onClick={() => navigate(`/products/${selectedProduct.id}/units`)}
                >
                  View Units →
                </button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">📦</div>
                  <div className="metric-content">
                    <div className="metric-value">{selectedProduct.total_units}</div>
                    <div className="metric-label">Total Units</div>
                  </div>
                </div>

                <div className="metric-card metric-success">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <div className="metric-value">{selectedProduct.available_units}</div>
                    <div className="metric-label">Available</div>
                  </div>
                </div>

                <div className="metric-card metric-primary">
                  <div className="metric-icon">🛒</div>
                  <div className="metric-content">
                    <div className="metric-value">{selectedProduct.sold_units}</div>
                    <div className="metric-label">Sold</div>
                  </div>
                </div>

                <div className="metric-card metric-warning">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-content">
                    <div className="metric-value">{selectedProduct.reserved_units}</div>
                    <div className="metric-label">Reserved</div>
                  </div>
                </div>
              </div>

              <div className="analytics-sections">
                {/* Sell-Through Rate */}
                <div className="analytics-section">
                  <h3>Sell-Through Rate</h3>
                  <div className="progress-container">
                    <div className="progress-bar-large">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(parseFloat(selectedProduct.sell_through_rate || '0'), 100)}%`,
                          backgroundColor: getPerformanceColor(parseFloat(selectedProduct.sell_through_rate || '0'))
                        }}
                      >
                        <span className="progress-text">
                          {parseFloat(selectedProduct.sell_through_rate || '0').toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="help-text">
                    Percentage of total units that have been sold
                  </p>
                </div>

                {/* Pricing */}
                <div className="analytics-section">
                  <h3>Pricing & Revenue</h3>
                  <div className="stats-row">
                    <div className="stat-item">
                      <div className="stat-label">Average Price</div>
                      <div className="stat-value">{formatCurrency(selectedProduct.avg_selling_price || 0)}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-value revenue">{formatCurrency(selectedProduct.total_revenue || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="analytics-section">
                  <h3>Stock Distribution</h3>
                  <div className="distribution-chart">
                    <div 
                      className="distribution-bar available"
                      style={{ 
                        width: `${(selectedProduct.available_units / selectedProduct.total_units) * 100}%` 
                      }}
                    >
                      <span>{selectedProduct.available_units}</span>
                    </div>
                    <div 
                      className="distribution-bar sold"
                      style={{ 
                        width: `${(selectedProduct.sold_units / selectedProduct.total_units) * 100}%` 
                      }}
                    >
                      <span>{selectedProduct.sold_units}</span>
                    </div>
                    <div 
                      className="distribution-bar reserved"
                      style={{ 
                        width: `${(selectedProduct.reserved_units / selectedProduct.total_units) * 100}%` 
                      }}
                    >
                      <span>{selectedProduct.reserved_units}</span>
                    </div>
                  </div>
                  <div className="distribution-legend">
                    <div className="legend-item">
                      <span className="legend-color available"></span>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color sold"></span>
                      <span>Sold</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color reserved"></span>
                      <span>Reserved</span>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="analytics-section">
                  <h3>Performance Insights</h3>
                  <div className="insights-list">
                    {parseFloat(selectedProduct.sell_through_rate || '0') >= 75 && (
                      <div className="insight-item success">
                        <span className="insight-icon">✅</span>
                        <span>Excellent sell-through rate - product is performing well</span>
                      </div>
                    )}
                    {parseFloat(selectedProduct.sell_through_rate || '0') < 25 && (
                      <div className="insight-item warning">
                        <span className="insight-icon">⚠️</span>
                        <span>Low sell-through rate - consider promotional strategies</span>
                      </div>
                    )}
                    {selectedProduct.available_units === 0 && selectedProduct.reserved_units === 0 && (
                      <div className="insight-item warning">
                        <span className="insight-icon">📦</span>
                        <span>Out of stock - consider restocking if demand is high</span>
                      </div>
                    )}
                    {selectedProduct.available_units > 0 && selectedProduct.sold_units === 0 && (
                      <div className="insight-item info">
                        <span className="insight-icon">ℹ️</span>
                        <span>No units sold yet - new product or requires attention</span>
                      </div>
                    )}
                    {selectedProduct.reserved_units > selectedProduct.available_units && (
                      <div className="insight-item info">
                        <span className="insight-icon">⏳</span>
                        <span>High reservation activity - strong demand indicator</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Select a Product</h3>
              <p>Choose a product from the list to view detailed analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

