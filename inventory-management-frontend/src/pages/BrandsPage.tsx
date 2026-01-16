import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BrandsService,
  Brand,
  BrandRequest,
} from '../api/index';

interface AdminRole {
  id?: number;
  name?: string;
  display_name?: string;
  description?: string;
  role_code?: string;
  role_name?: string;
}

interface AdminProfile {
  id?: number;
  user?: { 
    id: number; 
    username: string; 
    email: string; 
    last_login?: string; 
    date_joined?: string;
    is_superuser?: boolean;
    is_staff?: boolean;
  };
  username?: string;
  email?: string;
  admin_code?: string;
  last_login?: string;
  date_joined?: string;
  roles?: AdminRole[];
  brands?: Brand[];
  is_global_admin?: boolean;
  reserved_units_count?: number;
}

// Brand Card Component
interface BrandCardProps {
  brand: Brand;
  adminCount: number;
  onEdit: (brand: Brand) => void;
  onManageAdmins: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  isDeleting: boolean;
}

const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  adminCount,
  onEdit,
  onManageAdmins,
  onDelete,
  isDeleting,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const handleTestConnection = () => {
    if (!brand.ecommerce_domain) return;
    const url = brand.ecommerce_domain.startsWith('http') 
      ? brand.ecommerce_domain 
      : `https://${brand.ecommerce_domain}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      backgroundColor: '#2d2d2d',
      border: '1px solid #3a3a3a',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      {/* Header with Logo and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          {/* Logo */}
          <div style={{ flexShrink: 0 }}>
            {brand.logo_url ? (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '8px',
                border: '1px solid #e9ecef',
                overflow: 'hidden'
              }}>
                <img 
                  src={brand.logo_url} 
                  alt={brand.name || 'Brand logo'} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                color: '#adb5bd',
                fontSize: '32px'
              }} title="No logo uploaded">
                🏢
              </div>
            )}
          </div>

          {/* Brand Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#ffffff',
                flex: 1,
                minWidth: 0
              }}>
                {brand.name || 'Unnamed Brand'}
              </h3>
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#b0b0b0',
                backgroundColor: '#363636',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                border: '1px solid #4a4a4a'
              }}>
                #{brand.id}
              </span>
            </div>
            {brand.code && (
              <div style={{ marginBottom: '8px' }}>
                <code style={{ 
                  backgroundColor: '#363636', 
                  padding: '4px 10px', 
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  border: '1px solid #4a4a4a'
                }}>{brand.code}</code>
              </div>
            )}
            {brand.description && (
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: '#b0b0b0',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {brand.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(!showActionsMenu);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#363636',
              border: '1px solid #4a4a4a',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#ffffff',
              whiteSpace: 'nowrap'
            }}
            title="Actions"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#404040';
              e.currentTarget.style.borderColor = '#505050';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#363636';
              e.currentTarget.style.borderColor = '#4a4a4a';
            }}
          >
            Actions
          </button>
          {showActionsMenu && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998
                }}
                onClick={() => setShowActionsMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 999,
                minWidth: '180px',
                padding: '4px 0'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    onEdit(brand);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#363636'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    onManageAdmins(brand);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#363636'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Manage Admins
                </button>
                <div style={{ 
                  height: '1px', 
                  backgroundColor: '#3a3a3a', 
                  margin: '4px 0' 
                }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    onDelete(brand);
                  }}
                  disabled={isDeleting}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.9em',
                    color: isDeleting ? '#666' : '#ff4444'
                  }}
                  onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#3a1f1f')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#3a3a3a', margin: '0 -20px' }} />

      {/* Footer with Stats and Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Status Badge */}
        {brand.is_active !== false ? (
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '16px',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: '1px solid #c3e6cb'
          }}>
            ✓ Active
          </span>
        ) : (
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '16px',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: '1px solid #f5c6cb'
          }}>
            ✗ Inactive
          </span>
        )}

        {/* Admin Count */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onManageAdmins(brand);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            backgroundColor: '#363636',
            color: '#ffffff',
            border: '1px solid #4a4a4a',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}
          title={`${adminCount} admin(s) assigned. Click to manage.`}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#404040';
            e.currentTarget.style.borderColor = '#505050';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#363636';
            e.currentTarget.style.borderColor = '#4a4a4a';
          }}
        >
          {adminCount} Admin{adminCount !== 1 ? 's' : ''}
        </button>

        {/* E-commerce Domain */}
        {brand.ecommerce_domain ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flex: 1,
            minWidth: 0
          }}>
            <a 
              href={brand.ecommerce_domain.startsWith('http') ? brand.ecommerce_domain : `https://${brand.ecommerce_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#90caf9', 
                textDecoration: 'none',
                fontSize: '0.85rem',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {brand.ecommerce_domain}
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTestConnection();
              }}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                backgroundColor: '#363636',
                color: '#ffffff',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: '500'
              }}
              title="Test connection"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#404040';
                e.currentTarget.style.borderColor = '#505050';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#363636';
                e.currentTarget.style.borderColor = '#4a4a4a';
              }}
            >
              Test
            </button>
          </div>
        ) : (
          <span style={{ 
            color: '#b0b0b0', 
            fontStyle: 'italic',
            fontSize: '0.85rem'
          }}>
            Domain not set
          </span>
        )}
      </div>
    </div>
  );
};

export const BrandsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['brands', page, pageSize],
    queryFn: () => BrandsService.brandsList(page),
  });

  // Fetch all admins for assignment and statistics (always fetch)
  const { data: adminsData } = useQuery({
    queryKey: ['admins', 'all'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      return response.json();
    },
  });

  // Calculate admin count per brand
  const adminCountsByBrand = useMemo(() => {
    if (!adminsData?.results || !data?.results) return new Map<number, number>();
    const counts = new Map<number, number>();
    
    data.results.forEach((brand) => {
      if (brand.id) {
        const count = adminsData.results.filter((admin: AdminProfile) => 
          admin.is_global_admin || admin.brands?.some((b: Brand) => b.id === brand.id)
        ).length;
        counts.set(brand.id, count);
      }
    });
    
    return counts;
  }, [adminsData, data]);

  // Client-side filtering
  const filteredBrands = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((brand) => {
        const nameMatch = brand.name?.toLowerCase().includes(searchLower);
        const codeMatch = brand.code?.toLowerCase().includes(searchLower);
        const domainMatch = brand.ecommerce_domain?.toLowerCase().includes(searchLower);
        return nameMatch || codeMatch || domainMatch;
      });
    }
    
    return filtered;
  }, [data, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) {
      return { total: 0, active: 0, inactive: 0, withDomain: 0 };
    }
    return {
      total: data.results.length,
      active: data.results.filter(b => b.is_active !== false).length,
      inactive: data.results.filter(b => b.is_active === false).length,
      withDomain: data.results.filter(b => b.ecommerce_domain).length,
    };
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => BrandsService.brandsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      alert('Brand deleted successfully');
    },
    onError: (err: any) => {
      alert(`Failed to delete brand: ${err.message || 'Unknown error'}`);
    },
  });

  const handleDelete = (brand: Brand) => {
    if (!brand.id) return;
    if (window.confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(brand.id);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingBrand(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingBrand(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  };

  const handleManageAdmins = (brand: Brand) => {
    setSelectedBrand(brand);
    setShowAdminModal(true);
  };

  const clearFilters = () => {
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    return count;
  }, [search]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  if (isLoading) {
    return <div className="loading">Loading brands...</div>;
  }

  if (error) {
    return <div className="error">Error loading brands: {(error as Error).message}</div>;
  }

  return (
    <div className="brands-page">
      <div className="page-header">
        <h1>Brands Management</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Create Brand
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {data && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${activeTab === 'list' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('list')}
            title={`Total Brands: ${stats.total}`}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--active ${activeTab === 'stats' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('stats')}
            title={`Active Brands: ${stats.active}`}
          >
            <span className="summary-stat-label">Active</span>
            <span className="summary-stat-value">{(stats.active ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className="summary-stat-button summary-stat-button--inactive"
            title={`Inactive Brands: ${stats.inactive}`}
          >
            <span className="summary-stat-label">Inactive</span>
            <span className="summary-stat-value">{(stats.inactive ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className="summary-stat-button summary-stat-button--domain"
            title={`Brands with E-commerce Domain: ${stats.withDomain}`}
          >
            <span className="summary-stat-label">With Domain</span>
            <span className="summary-stat-value">{(stats.withDomain ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search brands by name, code, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Search filters are applied above. Use the search bar to find specific brands.</label>
            </div>
          </div>
        )}
      </div>

      {/* Brands Cards Grid */}
      {filteredBrands.length === 0 ? (
        <div className="empty-state">
          <h3>
            {search
              ? 'No matching brands found' 
              : 'No brands'}
          </h3>
          <p>
            {search
              ? 'Try adjusting your search terms to see more brands.'
              : 'There are no brands in the system. Create one to get started.'}
          </p>
          {search && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px',
          padding: '20px 0'
        }}>
          {filteredBrands.map((brand) => {
            const adminCount = brand.id ? adminCountsByBrand.get(brand.id) || 0 : 0;
            return (
              <BrandCard
                key={brand.id}
                brand={brand}
                adminCount={adminCount}
                onEdit={handleEdit}
                onManageAdmins={handleManageAdmins}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.count && data.count > 0 ? (
        <div className="pagination">
          <div className="pagination-controls">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data?.previous || page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {Math.ceil((data.count || 0) / pageSize)} ({data.count || 0} total)
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.next}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
          <div className="page-size-selector">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      ) : null}

      {/* Brand Form Modal */}
      {showCreateModal && (
        <BrandFormModal
          brand={editingBrand}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Admin Assignment Modal */}
      {showAdminModal && selectedBrand && (
        <BrandAdminAssignmentModal
          brand={selectedBrand}
          availableAdmins={adminsData?.results || []}
          onClose={() => {
            setShowAdminModal(false);
            setSelectedBrand(null);
          }}
        />
      )}
    </div>
  );
};

// Brand Form Modal Component
interface BrandFormModalProps {
  brand: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BrandFormModal: React.FC<BrandFormModalProps> = ({
  brand,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    code: brand?.code || '',
    name: brand?.name || '',
    description: brand?.description || '',
    ecommerce_domain: brand?.ecommerce_domain || '',
    primary_color: brand?.primary_color || '#000000',
    is_active: brand?.is_active !== undefined ? brand.is_active : true,
    logo: null as File | null,
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: BrandRequest) => {
      // If there's a logo file, use FormData
      if (formData.logo) {
        const formDataToSend = new FormData();
        formDataToSend.append('code', data.code);
        formDataToSend.append('name', data.name);
        if (data.description) formDataToSend.append('description', data.description);
        if (data.ecommerce_domain) formDataToSend.append('ecommerce_domain', data.ecommerce_domain);
        if (data.primary_color) formDataToSend.append('primary_color', data.primary_color);
        formDataToSend.append('is_active', data.is_active ? 'true' : 'false');
        formDataToSend.append('logo', formData.logo);

        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        const response = await fetch(`${baseUrl}/brands/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || JSON.stringify(errorData));
        }

        return response.json();
      } else {
        return BrandsService.brandsCreate(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      onSuccess();
    },
    onError: (err: any) => {
      alert(`Failed to create brand: ${err.message || 'Unknown error'}`);
      console.error('Create brand error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BrandRequest) => {
      if (!brand?.id) throw new Error('Brand ID is required');
      
      // If there's a logo file, use FormData
      if (formData.logo) {
        const formDataToSend = new FormData();
        formDataToSend.append('code', data.code);
        formDataToSend.append('name', data.name);
        if (data.description) formDataToSend.append('description', data.description);
        if (data.ecommerce_domain) formDataToSend.append('ecommerce_domain', data.ecommerce_domain);
        if (data.primary_color) formDataToSend.append('primary_color', data.primary_color);
        formDataToSend.append('is_active', data.is_active ? 'true' : 'false');
        formDataToSend.append('logo', formData.logo);

        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        const response = await fetch(`${baseUrl}/brands/${brand.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || JSON.stringify(errorData));
        }

        return response.json();
      } else {
        return BrandsService.brandsPartialUpdate(brand.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      onSuccess();
    },
    onError: (err: any) => {
      alert(`Failed to update brand: ${err.message || 'Unknown error'}`);
      console.error('Update brand error:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Code and name are required');
      return;
    }

    const submitData: BrandRequest = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      ecommerce_domain: formData.ecommerce_domain?.trim() || undefined,
      primary_color: formData.primary_color || undefined,
      is_active: formData.is_active,
      logo: formData.logo || null,
    };

    if (brand?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{brand ? 'Edit Brand' : 'Create Brand'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="code">
              Brand Code <span className="required">*</span>
            </label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              disabled={isLoading}
              placeholder="e.g., AG, SP"
              maxLength={20}
            />
            <small className="form-help">Unique identifier for the brand (uppercase)</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Brand Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              placeholder="e.g., Affordable Gadgets"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
              placeholder="Brief description of the brand..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="ecommerce_domain">
              E-commerce Domain
            </label>
            <input
              id="ecommerce_domain"
              type="text"
              value={formData.ecommerce_domain}
              onChange={(e) => setFormData({ ...formData, ecommerce_domain: e.target.value })}
              disabled={isLoading}
              placeholder="e.g., https://affordablegadgets.com or affordablegadgets.com"
            />
            <small className="form-help">
              Frontend website URL for this brand. Products added in admin will appear on this site.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="primary_color">
              Primary Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value.toUpperCase() })}
                style={{
                  width: '60px',
                  height: '36px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                disabled={isLoading}
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9A-Fa-f#]/g, '').toUpperCase();
                  if (value.length > 7) value = value.slice(0, 7);
                  setFormData({ ...formData, primary_color: value });
                }}
                onBlur={(e) => {
                  let value = e.target.value.trim().toUpperCase();
                  if (!value || value === '#') {
                    value = '#000000';
                  } else {
                    if (!value.startsWith('#')) {
                      value = '#' + value.replace(/#/g, '');
                    }
                    value = '#' + value.slice(1).replace(/#/g, '');
                    const hexPart = value.slice(1).replace(/[^0-9A-F]/g, '');
                    if (hexPart.length === 0) {
                      value = '#000000';
                    } else if (hexPart.length < 6) {
                      value = '#' + hexPart.padEnd(6, '0');
                    } else {
                      value = '#' + hexPart.slice(0, 6);
                    }
                  }
                  setFormData({ ...formData, primary_color: value });
                }}
                placeholder="#000000"
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                }}
                disabled={isLoading}
              />
            </div>
            <small className="form-help">Brand's primary color (hex code)</small>
          </div>

          <div className="form-group">
            <label htmlFor="logo">Logo</label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, logo: file });
                }
              }}
              disabled={isLoading}
            />
            {brand?.logo_url && !formData.logo && (
              <div style={{ marginTop: '8px' }}>
                <img 
                  src={brand.logo_url} 
                  alt="Current logo" 
                  style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                />
              </div>
            )}
            <small className="form-help">Upload a logo image for this brand</small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={isLoading}
              />
              <span>Active</span>
            </label>
            <small className="form-help">Inactive brands won't appear in dropdowns</small>
          </div>

          <div className="form-actions" style={{
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Saving...' : brand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand Admin Assignment Modal Component
interface BrandAdminAssignmentModalProps {
  brand: Brand;
  availableAdmins: AdminProfile[];
  onClose: () => void;
}

const BrandAdminAssignmentModal: React.FC<BrandAdminAssignmentModalProps> = ({
  brand,
  availableAdmins,
  onClose,
}) => {
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Get admins currently assigned to this brand (excluding global admins from selection)
  const assignedAdmins = useMemo(() => {
    return availableAdmins.filter(admin => 
      admin.brands?.some((b: Brand) => b.id === brand.id) && !admin.is_global_admin
    );
  }, [availableAdmins, brand.id]);

  React.useEffect(() => {
    // Only set selected admins for non-global admins
    setSelectedAdminIds(assignedAdmins.filter(a => a.id && !a.is_global_admin).map(a => a.id!));
  }, [assignedAdmins]);


  const handleToggleAdmin = (adminId: number) => {
    setSelectedAdminIds((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleAssignAll = () => {
    const allAdminIds = availableAdmins.filter(a => a.id).map(a => a.id!);
    setSelectedAdminIds(allAdminIds);
  };

  const handleUnassignAll = () => {
    setSelectedAdminIds([]);
  };

  const handleSave = async () => {
    if (!brand.id) {
      alert('Brand ID is missing');
      return;
    }

    setIsSaving(true);
    try {
      // For each admin, update their brand assignment if it changed
      const updatePromises: Promise<any>[] = [];
      
      for (const admin of availableAdmins) {
        if (!admin.id) continue;
        
        const adminId = admin.id;
        const isGlobalAdmin = admin.is_global_admin || false;
        
        // Skip global admins - they already have access to all brands
        if (isGlobalAdmin) continue;
        
        const shouldHaveBrand = selectedAdminIds.includes(adminId);
        const currentlyHasBrand = admin.brands?.some((b: Brand) => b.id === brand.id) || false;

        // Only update if assignment changed
        if (shouldHaveBrand !== currentlyHasBrand) {
          // Get current brand IDs for this admin
          const currentBrandIds = admin.brands?.filter((b: Brand) => b.id).map((b: Brand) => b.id!) || [];
          
          // If admin should have this brand, add it; otherwise remove it
          const newBrandIds = shouldHaveBrand
            ? [...new Set([...currentBrandIds, brand.id])]
            : currentBrandIds.filter((id: number) => id !== brand.id);

          // Create a promise for this admin's update
          const token = localStorage.getItem('auth_token');
          const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
          
          updatePromises.push(
            fetch(`${baseUrl}/admins/${adminId}/brands/`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                brand_ids: newBrandIds,
                is_global_admin: isGlobalAdmin 
              }),
            }).then(async (response) => {
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || JSON.stringify(errorData));
              }
              return response.json();
            })
          );
        }
      }

      // Wait for all updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      
      alert('Admin assignments updated successfully');
      onClose();
    } catch (err: any) {
      alert(`Failed to update admin assignments: ${err.message || 'Unknown error'}`);
      console.error('Admin assignment error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#282828',
        border: '1px solid #3a3a3a',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="modal-header" style={{
          padding: '20px',
          borderBottom: '1px solid #3a3a3a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>Manage Admins for {brand.name}</h2>
          <button className="modal-close" onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#ffffff',
            padding: 0,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}>×</button>
        </div>

        <div className="form-section" style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden'
        }}>
          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0, flexWrap: 'wrap', gap: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: 0, color: '#212529' }}>
                Select Admins
                {selectedAdminIds.length > 0 && (
                  <span className="role-selection-counter" style={{ marginLeft: '8px', color: '#6c757d', fontSize: '0.85rem', fontWeight: 'normal' }}>
                    ({selectedAdminIds.length} {selectedAdminIds.length === 1 ? 'admin' : 'admins'} selected)
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleAssignAll}
                  className="btn-small btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    color: '#212529',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleUnassignAll}
                  className="btn-small btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    color: '#212529',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="roles-grid" style={{ 
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '8px 4px'
            }}>
              {availableAdmins.map((admin) => {
                const adminId = admin.id!;
                const isGlobalAdmin = admin.is_global_admin || false;
                // Global admins are always "selected" (checked) but disabled
                // Non-global admins are selected if in selectedAdminIds
                const isSelected = isGlobalAdmin || selectedAdminIds.includes(adminId);
                const adminName = admin.username || admin.user?.username || 'Unknown';
                const adminEmail = admin.email || admin.user?.email || '';
                
                return (
                  <div 
                    key={adminId} 
                    className={`role-card-wrapper ${isSelected ? 'role-card-wrapper-selected' : ''} ${isGlobalAdmin ? 'role-card-wrapper-disabled' : ''}`}
                    style={{
                      cursor: isSaving || isGlobalAdmin ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`admin-${adminId}`}
                      checked={isSelected}
                      onChange={() => handleToggleAdmin(adminId)}
                      disabled={isSaving || isGlobalAdmin}
                      className="role-checkbox"
                    />
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-sm)',
                      minWidth: 0
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        flexWrap: 'wrap'
                      }}>
                        <div className="role-card-avatar">
                          {adminName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            flexWrap: 'wrap'
                          }}>
                            <label 
                              htmlFor={`admin-${adminId}`}
                              className={`role-card ${isSelected ? 'role-card-selected' : ''} ${isGlobalAdmin ? 'role-card-disabled' : ''}`}
                              title={isGlobalAdmin ? 'Global admins have access to all brands' : ''}
                              style={{
                                cursor: isSaving || isGlobalAdmin ? 'not-allowed' : 'pointer',
                                margin: 0
                              }}
                            >
                              <span className="role-card-name">
                                {adminName}
                              </span>
                              {isGlobalAdmin && (
                                <span className="role-card-global-badge">
                                  Global Admin
                                </span>
                              )}
                            </label>
                          </div>
                          {adminEmail && (
                            <div className="role-card-email">
                              {adminEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <small className="form-help" style={{
              marginTop: '12px',
              fontSize: '0.85rem',
              color: '#b0b0b0',
              flexShrink: 0,
              lineHeight: '1.5'
            }}>
              Global admins automatically have access to all brands and cannot be assigned/unassigned.
            </small>
          </div>

          <div className="form-actions" style={{
            paddingTop: '20px',
            borderTop: '1px solid #3a3a3a',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #4a4a4a',
                backgroundColor: '#363636',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#404040';
                  e.currentTarget.style.borderColor = '#505050';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#363636';
                e.currentTarget.style.borderColor = '#4a4a4a';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isSaving ? '#505050' : '#007bff',
                color: '#fff',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              {isSaving ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
