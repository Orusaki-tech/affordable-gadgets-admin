import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService, BrandsService, type Brand } from '../api/index';

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

interface AdminCreatePayload {
  username: string;
  email: string;
  password: string;
  admin_code: string;
}

const ROLE_DESCRIPTION_OVERRIDES: Record<string, string> = {
  OM: 'Ensures paid online orders are delivered to customers. Reviews order details, contacts customers to confirm delivery, and marks orders as delivered.',
};

const getRoleCode = (role: AdminRole) =>
  role.name || role.role_code || role.role_name || role.display_name || '';

const getRoleDescription = (role: AdminRole) =>
  role.description || ROLE_DESCRIPTION_OVERRIDES[getRoleCode(role)] || '';

export const AdminsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleAdmin, setRoleAdmin] = useState<AdminProfile | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandAdmin, setBrandAdmin] = useState<AdminProfile | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile | null>(null);
  const queryClient = useQueryClient();

  // Fetch current admin profile
  const { data: currentAdminProfile, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false, // Don't retry on 404
    enabled: !!user?.is_staff,
  });

  // Fetch ALL admins - fetch all pages to get complete list
  const { data: allAdminsData, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admins', 'all'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const allAdmins: AdminProfile[] = [];
      let currentPage = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const response = await fetch(`${baseUrl}/admins/?page=${currentPage}&page_size=100`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admins');
        }
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          allAdmins.push(...data.results);
        }
        
        // Check if there are more pages
        hasMore = !!data.next;
        currentPage++;
        
        // Safety limit to prevent infinite loops
        if (currentPage > 100) {
          break;
        }
      }

      return {
        results: allAdmins,
        count: allAdmins.length,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AdminCreatePayload) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } else {
          // Handle HTML error responses (e.g., 403 Forbidden page)
          await response.text(); // Read response but don't use it
          throw new Error(`Server error (${response.status}): ${response.statusText}. Access denied.`);
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      alert('Admin created successfully');
      setShowCreateModal(false);
      setEditingAdmin(null);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create admin: ';
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === 'object') {
            errorMessage += JSON.stringify(parsed, null, 2);
          } else {
            errorMessage += err.message;
          }
        } catch {
          errorMessage += err.message;
        }
      }
      alert(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { admin_code: string }) => {
      if (!editingAdmin?.id) throw new Error('Admin ID required');
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/${editingAdmin.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } else {
          // Handle HTML error responses (e.g., 403 Forbidden page)
          await response.text(); // Read response but don't use it
          throw new Error(`Server error (${response.status}): ${response.statusText}. Access denied.`);
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      alert('Admin updated successfully');
      setShowCreateModal(false);
      setEditingAdmin(null);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to update admin: ';
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === 'object') {
            errorMessage += JSON.stringify(parsed, null, 2);
          } else {
            errorMessage += err.message;
          }
        } catch {
          errorMessage += err.message;
        }
      }
      alert(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      alert('Admin deleted successfully');
    },
    onError: (err: any) => {
      alert(`Failed to delete admin: ${err.message || 'Unknown error'}`);
    },
  });

  // Fetch available roles from dedicated endpoint
  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admin-roles/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data; // Returns array of all available roles
      }
      return [];
    },
  });

  const assignRolesMutation = useMutation({
    mutationFn: async ({ adminId, roleIds }: { adminId: number; roleIds: number[] }) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/${adminId}/roles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_ids: roleIds }),
      });
      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } else {
          // Handle HTML error responses (e.g., 403 Forbidden page)
          await response.text(); // Read response but don't use it
          throw new Error(`Server error (${response.status}): ${response.statusText}. Access denied.`);
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      alert('Roles assigned successfully');
      setShowRoleModal(false);
      setRoleAdmin(null);
    },
    onError: (err: any) => {
      alert(`Failed to assign roles: ${err.message || 'Unknown error'}`);
    },
  });

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await BrandsService.brandsList(1);
      return response.results || [];
    },
    enabled: showBrandModal, // Only fetch when modal is open
  });

  // Brand assignment mutation
  const assignBrandsMutation = useMutation({
    mutationFn: async ({ adminId, brandIds, isGlobalAdmin }: { 
      adminId: number; 
      brandIds: number[];
      isGlobalAdmin: boolean;
    }) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/${adminId}/brands/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          brand_ids: brandIds,
          is_global_admin: isGlobalAdmin 
        }),
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || JSON.stringify(errorData));
        } else {
          await response.text();
          throw new Error(`Server error (${response.status}): ${response.statusText}. Access denied.`);
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      alert('Brands assigned successfully');
      setShowBrandModal(false);
      setBrandAdmin(null);
    },
    onError: (err: any) => {
      alert(`Failed to assign brands: ${err.message || 'Unknown error'}`);
    },
  });

  // Check superuser status - redirect if not superuser (after all hooks are declared)
  const isSuperuser = currentAdminProfile?.user?.is_superuser === true;

  // Only Superusers can access this page
  if (!isLoadingCurrent && !isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDelete = (admin: AdminProfile) => {
    if (!admin.id) return;
    if (window.confirm(`Are you sure you want to delete admin "${admin.username || admin.user?.username}"?`)) {
      deleteMutation.mutate(admin.id);
    }
  };

  const handleEdit = (admin: AdminProfile) => {
    setEditingAdmin(admin);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setShowCreateModal(true);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleAssignRoles = (admin: AdminProfile) => {
    setRoleAdmin(admin);
    setShowRoleModal(true);
  };

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case 'SP': return '#3498db';
      case 'IM': return '#2ecc71';
      case 'CC': return '#9b59b6';
      case 'OM': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  if (isLoadingAdmins || isLoadingCurrent) {
    return <div className="loading">Loading admin information...</div>;
  }

  // Additional check after loading (in case redirect didn't catch it)
  if (!isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="admins-page">
      <div className="page-header">
        <h1>Admin Management</h1>
        {isSuperuser && (
          <button className="btn-primary" onClick={handleCreate}>
            + Create Admin
          </button>
        )}
      </div>

      {/* Current Admin Info Card */}
      {currentAdminProfile && (
        <div className="info-card">
          <h2>Your Admin Profile</h2>
          <div className="admin-details">
            <div className="detail-row">
              <span className="detail-label">Admin Code:</span>
              <span className="detail-value">{currentAdminProfile.admin_code || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{currentAdminProfile.username || currentAdminProfile.user?.username || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{currentAdminProfile.email || currentAdminProfile.user?.email || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Login:</span>
              <span className="detail-value">{formatDate(currentAdminProfile.last_login || currentAdminProfile.user?.last_login)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date Joined:</span>
              <span className="detail-value">{formatDate(currentAdminProfile.date_joined || currentAdminProfile.user?.date_joined)}</span>
            </div>
            {currentAdminProfile.roles && currentAdminProfile.roles.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Roles:</span>
                <div className="roles-container">
                  {currentAdminProfile.roles.map((role) => (
                    <span
                      key={role.id}
                      className="role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(role.name) }}
                    >
                      {role.display_name || role.role_name || role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentAdminProfile.reserved_units_count !== undefined && (
              <div className="detail-row">
                <span className="detail-label">Reserved Units:</span>
                <span className="detail-value">{currentAdminProfile.reserved_units_count}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Admins List */}
      <div className="admins-cards-container">
        <h2>All Admins ({allAdminsData?.count || 0} total)</h2>
        {!allAdminsData?.results || allAdminsData.results.length === 0 ? (
          <div className="empty-state">
            No admins found
          </div>
        ) : (
          <div className="admins-grid">
            {allAdminsData.results.map((admin: AdminProfile) => (
              <div 
                key={admin.id} 
                className="admin-card"
                onClick={() => setSelectedAdmin(admin)}
                style={{ cursor: 'pointer' }}
              >
                <div className="admin-card-header">
                  <div className="admin-card-title">
                    <h3>{admin.username || admin.user?.username || 'Unknown'}</h3>
                    {admin.user?.is_superuser && (
                      <span className="superuser-badge">Superuser</span>
                    )}
                  </div>
                </div>
                
                <div className="admin-card-body">
                  <div className="admin-info-row">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">{formatDateShort(admin.last_login || admin.user?.last_login)}</span>
                  </div>
                  
                  <div className="admin-info-row">
                    <span className="info-label">Date Joined:</span>
                    <span className="info-value">{formatDateShort(admin.date_joined || admin.user?.date_joined)}</span>
                  </div>
                </div>
                
                {isSuperuser && (
                  <div className="admin-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-small btn-roles"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignRoles(admin);
                      }}
                      title="Assign Roles"
                    >
                      Roles
                    </button>
                    <button
                      className="btn-small btn-roles"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBrandAdmin(admin);
                        setShowBrandModal(true);
                      }}
                      title="Assign Brands"
                    >
                      Brands
                    </button>
                    <button
                      className="btn-small btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(admin);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(admin);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <AdminForm
          admin={editingAdmin}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAdmin(null);
          }}
          onSuccess={(data) => {
            if (editingAdmin) {
              updateMutation.mutate(data as { admin_code: string });
            } else {
              createMutation.mutate(data as AdminCreatePayload);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && roleAdmin && (
        <RoleAssignmentModal
          admin={roleAdmin}
          availableRoles={rolesData || []}
          onClose={() => {
            setShowRoleModal(false);
            setRoleAdmin(null);
          }}
          onAssign={(roleIds) => {
            if (roleAdmin.id) {
              assignRolesMutation.mutate({ adminId: roleAdmin.id, roleIds });
            }
          }}
          isLoading={assignRolesMutation.isPending}
        />
      )}

      {/* Brand Assignment Modal */}
      {showBrandModal && brandAdmin && (
        <BrandAssignmentModal
          admin={brandAdmin}
          availableBrands={brandsData || []}
          onClose={() => {
            setShowBrandModal(false);
            setBrandAdmin(null);
          }}
          onAssign={(brandIds, isGlobalAdmin) => {
            if (brandAdmin.id) {
              assignBrandsMutation.mutate({ 
                adminId: brandAdmin.id, 
                brandIds,
                isGlobalAdmin 
              });
            }
          }}
          isLoading={assignBrandsMutation.isPending}
        />
      )}

      {/* Admin Details Modal */}
      {selectedAdmin && (
        <AdminDetailsModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
          getRoleBadgeColor={getRoleBadgeColor}
          formatDate={formatDate}
          formatDateShort={formatDateShort}
        />
      )}
    </div>
  );
};

// Admin Form Component
interface AdminFormProps {
  admin: AdminProfile | null;
  onClose: () => void;
  onSuccess: (data: AdminCreatePayload | { admin_code: string }) => void;
  isLoading: boolean;
}

const AdminForm: React.FC<AdminFormProps> = ({ admin, onClose, onSuccess, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    admin_code: '',
  });

  React.useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || admin.user?.username || '',
        email: admin.email || admin.user?.email || '',
        password: '', // Don't show password when editing
        admin_code: admin.admin_code || '',
      });
    } else {
      setFormData({ username: '', email: '', password: '', admin_code: '' });
    }
  }, [admin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin) {
      // Update: only send admin_code
      if (!formData.admin_code.trim()) {
        alert('Admin code is required');
        return;
      }
      onSuccess({ admin_code: formData.admin_code });
    } else {
      // Create: send all fields
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.admin_code.trim()) {
        alert('All fields are required');
        return;
      }
      onSuccess(formData as AdminCreatePayload);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{admin ? 'Edit Admin' : 'Create Admin'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          {!admin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username <span className="required">*</span></label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  Minimum 8 characters
                </small>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="admin_code">Admin Code <span className="required">*</span></label>
            <input
              id="admin_code"
              type="text"
              value={formData.admin_code}
              onChange={(e) => setFormData({ ...formData, admin_code: e.target.value.toUpperCase() })}
              required
              disabled={isLoading}
              maxLength={20}
              placeholder="e.g., ADM-001"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : admin ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Assignment Modal Component
interface RoleAssignmentModalProps {
  admin: AdminProfile;
  availableRoles: AdminRole[];
  onClose: () => void;
  onAssign: (roleIds: number[]) => void;
  isLoading: boolean;
}

const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  admin,
  availableRoles,
  onClose,
  onAssign,
  isLoading,
}) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  React.useEffect(() => {
    if (admin.roles) {
      setSelectedRoleIds(admin.roles.filter(r => r.id).map(r => r.id!));
    }
  }, [admin]);

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedRoleIds);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Roles to {admin.username || admin.user?.username}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label className="form-label">
              Select Roles
              {selectedRoleIds.length > 0 && (
                <span className="role-selection-counter">
                  ({selectedRoleIds.length} {selectedRoleIds.length === 1 ? 'role' : 'roles'} selected)
                </span>
              )}
            </label>
            <div className="roles-grid">
              {availableRoles.map((role) => {
                const isSelected = role.id ? selectedRoleIds.includes(role.id) : false;
                return (
                  <div key={role.id} className="role-card-wrapper">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={isSelected}
                      onChange={() => role.id && handleToggleRole(role.id)}
                      disabled={isLoading}
                      className="role-checkbox"
                    />
                    <label 
                      htmlFor={`role-${role.id}`}
                      className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
                    >
                      <span className="role-card-name">
                        {role.display_name || role.role_name || role.name}
                      </span>
                      {getRoleDescription(role) && (
                        <span className="role-card-description">
                          {getRoleDescription(role)}
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-small btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-small btn-primary" disabled={isLoading}>
              {isLoading ? 'Assigning...' : 'Assign Roles'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand Assignment Modal Component
interface BrandAssignmentModalProps {
  admin: AdminProfile;
  availableBrands: Brand[];
  onClose: () => void;
  onAssign: (brandIds: number[], isGlobalAdmin: boolean) => void;
  isLoading: boolean;
}

const BrandAssignmentModal: React.FC<BrandAssignmentModalProps> = ({
  admin,
  availableBrands,
  onClose,
  onAssign,
  isLoading,
}) => {
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  React.useEffect(() => {
    if (admin.brands) {
      setSelectedBrandIds(admin.brands.filter(b => b.id !== undefined).map(b => b.id!));
    }
    if (admin.is_global_admin !== undefined) {
      setIsGlobalAdmin(admin.is_global_admin);
    }
  }, [admin]);

  const handleToggleBrand = (brandId: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedBrandIds, isGlobalAdmin);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Brands to {admin.username || admin.user?.username}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isGlobalAdmin}
                onChange={(e) => setIsGlobalAdmin(e.target.checked)}
                disabled={isLoading}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Global Admin (Access to all brands)</span>
            </label>
          </div>
          {!isGlobalAdmin && (
            <div className="form-group">
              <label className="form-label">Select Brands</label>
              <div className="roles-grid">
                {availableBrands
                  .filter((brand) => brand.id !== undefined)
                  .map((brand) => {
                    const brandId = brand.id!;
                    const isSelected = selectedBrandIds.includes(brandId);
                    return (
                      <div key={brandId} className="role-card-wrapper">
                        <input
                          type="checkbox"
                          id={`brand-${brandId}`}
                          checked={isSelected}
                          onChange={() => handleToggleBrand(brandId)}
                          disabled={isLoading}
                          className="role-checkbox"
                        />
                        <label 
                          htmlFor={`brand-${brandId}`}
                          className={`role-card ${isSelected ? 'role-card-selected' : ''}`}
                        >
                          <span className="role-card-name">
                            {brand.name || brand.code || 'Unknown Brand'}
                          </span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-small btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-small btn-primary" disabled={isLoading}>
              {isLoading ? 'Assigning...' : 'Assign Brands'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Details Modal Component
interface AdminDetailsModalProps {
  admin: AdminProfile;
  onClose: () => void;
  getRoleBadgeColor: (roleName?: string) => string;
  formatDate: (dateString?: string | null) => string;
  formatDateShort: (dateString?: string | null) => string;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({
  admin,
  onClose,
  getRoleBadgeColor,
  formatDate,
  formatDateShort,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{admin.username || admin.user?.username || 'Unknown'} Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-section">
          <div className="admin-details-modal-content">
            <div className="detail-row">
              <span className="detail-label">Admin ID:</span>
              <span className="detail-value">#{admin.id}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{admin.username || admin.user?.username || '-'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{admin.email || admin.user?.email || '-'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Admin Code:</span>
              <span className="detail-value">{admin.admin_code || '-'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Superuser:</span>
              <span className="detail-value">
                {admin.user?.is_superuser ? (
                  <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Yes</span>
                ) : (
                  <span style={{ color: '#95a5a6' }}>No</span>
                )}
              </span>
            </div>

            {admin.roles && admin.roles.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Roles:</span>
                <div className="roles-container">
                  {admin.roles.map((role) => (
                    <span
                      key={role.id}
                      className="role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(role.name || role.role_code || role.role_name) }}
                      title={getRoleDescription(role) || role.display_name || role.role_name || role.name}
                    >
                      {role.display_name || role.role_name || role.name || role.role_code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {admin.brands && admin.brands.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Brands:</span>
                <div className="roles-container">
                  {admin.brands.map((brand) => (
                    <span
                      key={brand.id}
                      className="role-badge"
                      style={{ backgroundColor: '#9b59b6' }}
                    >
                      {brand.name} ({brand.code})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {admin.is_global_admin && (
              <div className="detail-row">
                <span className="detail-label">Global Admin:</span>
                <span className="detail-value" style={{ color: '#2ecc71', fontWeight: 'bold' }}>Yes</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">Reserved Units:</span>
              <span className="detail-value">{admin.reserved_units_count ?? 0}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Last Login:</span>
              <span className="detail-value">{formatDate(admin.last_login || admin.user?.last_login)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Date Joined:</span>
              <span className="detail-value">{formatDate(admin.date_joined || admin.user?.date_joined)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
