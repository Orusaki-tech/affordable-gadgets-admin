import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { ReturnRequestsService, ProfilesService, ReturnRequestStatusEnum } from '../api/index';

export const ReturnRequestsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch admin profile to check roles
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const adminId = adminProfile?.id;
  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role: { name?: string; role_code?: string }) => 
      role.name === roleName || role.role_code === roleName
    );
  };
  const isInventoryManager = hasRole('IM');
  const isSalesperson = hasRole('SP');

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const requestIdParam = searchParams.get('requestId');
    if (requestIdParam) {
      setSearch(requestIdParam);
      setPage(1);
      searchParams.delete('requestId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch return requests
  // Status filtering is done client-side (API has no filter param)
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['return-requests', page],
    queryFn: async () => {
      const response = await ReturnRequestsService.returnRequestsList(page);
      return response;
    },
  });

  // Fetch all return requests for accurate stats calculation (without status filter)
  const { data: allRequestsDataForStats } = useQuery({
    queryKey: ['return-requests', 'all', 'stats'],
    queryFn: async () => {
      const response = await ReturnRequestsService.returnRequestsList(1);
      return response;
    },
  });

  // Filter by search client-side (status filtering is now done server-side)
  const shouldLimitToMyRequests = isSalesperson && !isInventoryManager && !isSuperuser;

  const scopedRequests = React.useMemo(() => {
    if (!requestsData?.results) return [];
    if (!shouldLimitToMyRequests) return requestsData.results;
    return requestsData.results.filter((req) => {
      if (adminId && req.requesting_salesperson === adminId) {
        return true;
      }
      if (user?.username && req.requesting_salesperson_username === user.username) {
        return true;
      }
      return false;
    });
  }, [requestsData, shouldLimitToMyRequests, adminId, user?.username]);

  const filteredRequests = React.useMemo(() => {
    let filtered = scopedRequests;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((req) => {
        const idMatch = req.id?.toString().includes(searchLower);
        const salespersonMatch = req.requesting_salesperson_username?.toLowerCase().includes(searchLower);
        const unitsMatch = req.inventory_units_count?.toString().includes(searchLower);
        return idMatch || salespersonMatch || unitsMatch;
      });
    }
    return filtered;
  }, [scopedRequests, search, statusFilter]);

  // Calculate statistics from all requests (not filtered by status)
  const allScopedRequestsForStats = React.useMemo(() => {
    if (!allRequestsDataForStats?.results) return [];
    if (!shouldLimitToMyRequests) return allRequestsDataForStats.results;
    return allRequestsDataForStats.results.filter((req) => {
      if (adminId && req.requesting_salesperson === adminId) {
        return true;
      }
      if (user?.username && req.requesting_salesperson_username === user.username) {
        return true;
      }
      return false;
    });
  }, [allRequestsDataForStats, shouldLimitToMyRequests, adminId, user?.username]);

  const stats = React.useMemo(() => {
    if (allScopedRequestsForStats.length === 0) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    const results = allScopedRequestsForStats;
    return {
      total: allRequestsDataForStats?.count || results.length,
      pending: results.filter((req) => req.status === 'PE').length,
      approved: results.filter((req) => req.status === 'AP').length,
      rejected: results.filter((req) => req.status === 'RE').length,
    };
  }, [allScopedRequestsForStats, allRequestsDataForStats]);

  // Fetch user's reserved units for creating return request
  const { data: reservedUnitsData } = useQuery({
    queryKey: ['my-reserved-units'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/units/?sale_status=RS&page_size=100`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        return response.json();
      }
      return { results: [] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { unit_ids?: number[]; notes?: string }) => {
      return ReturnRequestsService.returnRequestsCreate({
        unit_ids: data.unit_ids || [],
        notes: data.notes || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-reserved-units'] });
      alert('Return request created successfully');
      setShowCreateModal(false);
    },
    onError: (err: any) => {
      alert(`Failed to create return request: ${err.message || 'Unknown error'}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return ReturnRequestsService.returnRequestsPartialUpdate(id, {
        status: status as ReturnRequestStatusEnum,
        notes: notes || '',
      });
    },
    onSuccess: (updatedRequest, variables) => {
      queryClient.setQueryData(
        ['return-requests', page],
        (oldData: any) => {
          if (!oldData?.results) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((req: any) =>
              req.id === variables.id ? { ...req, ...updatedRequest } : req
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      alert('Request status updated successfully');
    },
    onError: (err: any) => {
      alert(`Failed to update request: ${err.message || 'Unknown error'}`);
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (requestIds: number[]) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/return-requests/bulk_approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_ids: requestIds }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      setSelectedRequestIds(new Set());
      alert('Bulk approval completed successfully');
    },
    onError: (err: any) => {
      alert(`Failed to bulk approve: ${err.message || 'Unknown error'}`);
    },
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PE': return 'status-pending';
      case 'AP': return 'status-approved';
      case 'RE': return 'status-rejected';
      default: return 'status-unknown';
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequestIds.size === 0) {
      alert('Please select at least one request to approve');
      return;
    }
    if (window.confirm(`Approve ${selectedRequestIds.size} return request(s)?`)) {
      bulkApproveMutation.mutate(Array.from(selectedRequestIds));
    }
  };

  const toggleSelectRequest = (requestId: number, event?: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRequestIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (search) count++;
    if (statusFilter !== 'all') count++;
    return count;
  }, [search, statusFilter]);

  if (isLoading) {
    return <div className="loading">Loading return requests...</div>;
  }

  return (
    <div className="return-requests-page">
      <div className="page-header">
        <h1>Return Requests</h1>
        <div className="page-header-actions">
          {isSalesperson && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create Return Request
            </button>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {requestsData && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
            title={`Total Requests: ${stats.total}`}
            aria-pressed={statusFilter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--pending ${statusFilter === 'PE' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('PE')}
            title={`Pending Requests: ${stats.pending}`}
            aria-pressed={statusFilter === 'PE'}
          >
            <span className="summary-stat-label">Pending</span>
            <span className="summary-stat-value">{(stats.pending ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--approved ${statusFilter === 'AP' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('AP')}
            title={`Approved Requests: ${stats.approved}`}
            aria-pressed={statusFilter === 'AP'}
          >
            <span className="summary-stat-label">Approved</span>
            <span className="summary-stat-value">{(stats.approved ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--rejected ${statusFilter === 'RE' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('RE')}
            title={`Rejected Requests: ${stats.rejected}`}
            aria-pressed={statusFilter === 'RE'}
          >
            <span className="summary-stat-label">Rejected</span>
            <span className="summary-stat-value">{(stats.rejected ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {isInventoryManager && selectedRequestIds.size > 0 && (
        <div className="bulk-actions-toolbar">
          <span className="selected-count">
            {selectedRequestIds.size} selected
          </span>
          <div className="bulk-actions-buttons">
            <button
              className="btn-small btn-success"
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
            >
              ✓ Approve Selected
            </button>
            <button 
              className="btn-small btn-secondary" 
              onClick={() => setSelectedRequestIds(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by ID, salesperson, or units count..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <span>🔍 Filters</span>
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
              <label>Filter by Status:</label>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'PE' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('PE')}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'AP' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('AP')}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'RE' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('RE')}
                >
                  Rejected ({stats.rejected})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requests Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search || statusFilter !== 'all' 
              ? 'No matching requests found' 
              : 'No return requests'}
          </h3>
          <p>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more requests.'
              : isSalesperson 
                ? 'You haven\'t created any return requests yet.'
                : 'There are no return requests in the system.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => (
            <ReturnRequestCard
              key={request.id}
              request={request}
              isSelected={selectedRequestIds.has(request.id!)}
              onToggleSelect={isInventoryManager ? toggleSelectRequest : undefined}
              onApprove={isInventoryManager && request.status === 'PE' ? () => {
                            if (window.confirm('Approve this return request?')) {
                              updateStatusMutation.mutate({ id: request.id!, status: 'AP' });
                            }
              } : undefined}
              onReject={isInventoryManager && request.status === 'PE' ? () => {
                            if (window.confirm('Reject this return request?')) {
                              updateStatusMutation.mutate({ id: request.id!, status: 'RE' });
                            }
              } : undefined}
              isPending={updateStatusMutation.isPending}
              formatDate={formatDate}
              getStatusBadgeClass={getStatusBadgeClass}
              isInventoryManager={isInventoryManager}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {requestsData && requestsData.count && requestsData.count > 25 ? (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!requestsData?.previous || page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {Math.ceil((requestsData.count || 0) / 25)} ({requestsData.count || 0} total)
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!requestsData?.next}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      ) : null}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateReturnModal
          reservedUnits={reservedUnitsData?.results || []}
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          isLoadingUnits={!reservedUnitsData}
        />
      )}
    </div>
  );
};

// Return Request Card Component
interface ReturnRequestCardProps {
  request: any;
  isSelected: boolean;
  onToggleSelect?: (requestId: number, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onApprove?: () => void;
  onReject?: () => void;
  isPending: boolean;
  formatDate: (dateString?: string | null) => string;
  getStatusBadgeClass: (status?: string) => string;
  isInventoryManager: boolean;
}

const ReturnRequestCard: React.FC<ReturnRequestCardProps> = ({
  request,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
  isPending,
  formatDate,
  getStatusBadgeClass,
  isInventoryManager,
}) => {
  const [showNetHoldingsModal, setShowNetHoldingsModal] = useState(false);
  const [showViewUnitsModal, setShowViewUnitsModal] = useState(false);
  const statusClass = getStatusBadgeClass(request.status);

  return (
    <div className={`request-card ${statusClass} ${isSelected ? 'card-selected' : ''}`}>
      {onToggleSelect && (
        <div className="card-checkbox-overlay">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect?.(request.id!, e)}
            onClick={(e) => e.stopPropagation()}
            disabled={request.status !== 'PE'}
          />
        </div>
      )}
      
      <div className="request-card-header">
        <div className="request-id">#{request.id}</div>
        <span className={`status-badge ${statusClass}`}>
          {request.status_display || request.status}
        </span>
      </div>

      <div className="request-card-body">
        <div className="request-info-item">
          <span className="info-label">Units:</span>
          <span className="info-value">{request.inventory_units_count || 0}</span>
        </div>

        <div className="request-info-item">
          <span className="info-label">Salesperson:</span>
          <span className="info-value">{request.requesting_salesperson_username || '-'}</span>
        </div>

        <div className="request-info-item">
          <span className="info-label">Requested:</span>
          <span className="info-value">{formatDate(request.requested_at)}</span>
        </div>

        {request.approved_by_username && (
          <div className="request-info-item">
            <span className="info-label">Approved By:</span>
            <span className="info-value">{request.approved_by_username}</span>
          </div>
        )}

        {request.inventory_units_detail && request.inventory_units_detail.length > 0 && (
          <button
            className="request-details-summary"
            onClick={(e) => {
              e.stopPropagation();
              setShowViewUnitsModal(true);
            }}
            type="button"
          >
            View Units ({request.inventory_units_detail.length})
          </button>
        )}

        {isInventoryManager && (request as any).net_holdings_info && (
          <button
            className="request-details-summary request-details-summary--success"
            onClick={(e) => {
              e.stopPropagation();
              setShowNetHoldingsModal(true);
            }}
            type="button"
          >
            Net Holdings Info
          </button>
        )}

        {isInventoryManager && (request as any).transfer_history && (request as any).transfer_history.length > 0 && (
          <details className="request-details">
            <summary className="request-details-summary">Transfer History ({(request as any).transfer_history.length})</summary>
            <div className="request-details-scrollable">
              {(request as any).transfer_history.map((transfer: any) => (
                <div key={transfer.id} className="request-transfer-item">
                  <div className="request-transfer-item-header">
                    <strong>{transfer.unit_name}</strong> (Unit #{transfer.unit_id})
                  </div>
                  <div className="request-transfer-item-body">
                    {transfer.from_salesperson} → {transfer.to_salesperson}
                  </div>
                  <div className="request-transfer-item-footer">
                    {transfer.status_display} • {transfer.requested_at ? new Date(transfer.requested_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {onApprove && onReject && (
        <div className="request-card-footer">
          <button
            className="btn-action btn-approve"
            onClick={(e) => {
              e.stopPropagation();
              onApprove();
            }}
            disabled={isPending}
          >
            Approve
          </button>
          <button
            className="btn-action btn-reject"
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            disabled={isPending}
          >
            Reject
          </button>
        </div>
      )}

      {/* View Units Modal */}
      {showViewUnitsModal && request.inventory_units_detail && request.inventory_units_detail.length > 0 && (
        <div className="net-holdings-modal-overlay" onClick={() => setShowViewUnitsModal(false)}>
          <div className="net-holdings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="net-holdings-modal-header">
              <h3>View Units ({request.inventory_units_detail.length})</h3>
              <button 
                className="net-holdings-modal-close" 
                onClick={() => setShowViewUnitsModal(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="net-holdings-modal-body">
              <ul className="request-details-list" style={{ marginTop: 0, paddingLeft: 0, listStyle: 'none' }}>
                {request.inventory_units_detail.map((unit: any) => (
                  <li key={unit.id} style={{ 
                    padding: 'var(--spacing-sm)', 
                    marginBottom: 'var(--spacing-xs)',
                    backgroundColor: 'var(--md-surface-container-low)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--md-outline-variant)'
                  }}>
                    {unit.product_name || 'Unknown'} {unit.serial_number && `(SN: ${unit.serial_number})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Net Holdings Info Modal */}
      {showNetHoldingsModal && (request as any).net_holdings_info && (
        <div className="net-holdings-modal-overlay" onClick={() => setShowNetHoldingsModal(false)}>
          <div className="net-holdings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="net-holdings-modal-header">
              <h3>Net Holdings Info</h3>
              <button 
                className="net-holdings-modal-close" 
                onClick={() => setShowNetHoldingsModal(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="net-holdings-modal-body">
              <div className="request-details-row">
                <span className="request-details-label">Reserved:</span>
                <span className="request-details-value">{(request as any).net_holdings_info.directly_reserved || 0}</span>
              </div>
              <div className="request-details-row">
                <span className="request-details-label">Received via Transfer:</span>
                <span className="request-details-value">{(request as any).net_holdings_info.received_via_transfer || 0}</span>
              </div>
              <div className="request-details-row">
                <span className="request-details-label">Transferred Out:</span>
                <span className="request-details-value">{(request as any).net_holdings_info.transferred_out || 0}</span>
              </div>
              <div className="request-details-row request-details-row--total">
                <span className="request-details-label">Net Holdings:</span>
                <span className="request-details-value" style={{ 
                  color: ((request as any).net_holdings_info.net_holdings >= 0) 
                    ? 'var(--md-tertiary)' 
                    : 'var(--md-error)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  {(request as any).net_holdings_info.net_holdings || 0}
                </span>
              </div>
            </div>
            {onApprove && onReject && (
              <div className="net-holdings-modal-footer">
                <button
                  className="btn-action btn-approve"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNetHoldingsModal(false);
                    onApprove();
                  }}
                  disabled={isPending}
                >
                  Approve
                </button>
                <button
                  className="btn-action btn-reject"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNetHoldingsModal(false);
                    onReject();
                  }}
                  disabled={isPending}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Create Return Modal
interface CreateReturnModalProps {
  reservedUnits: any[];
  onClose: () => void;
  onCreate: (data: { unit_ids?: number[]; notes?: string }) => void;
  isLoading: boolean;
  isLoadingUnits?: boolean;
}

const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  reservedUnits,
  onClose,
  onCreate,
  isLoading,
  isLoadingUnits = false,
}) => {
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [returnAll, setReturnAll] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      unit_ids: returnAll ? undefined : selectedUnitIds.length > 0 ? selectedUnitIds : undefined,
      notes,
    });
  };

  const handleToggleUnit = (unitId: number) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Return Request</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          {isLoadingUnits ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-xl)', minHeight: '200px' }}>
              <div className="image-loading-spinner"></div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-md)', 
                  cursor: 'pointer', 
                  padding: 'var(--spacing-md)', 
                  borderRadius: 'var(--radius-lg)', 
                  backgroundColor: returnAll ? 'var(--md-primary-container)' : 'var(--md-surface-container-low)', 
                  border: `2px solid ${returnAll ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
                  transition: 'all var(--transition-base)',
                  marginBottom: 'var(--spacing-sm)',
                }}
                onMouseEnter={(e) => {
                  if (!returnAll) {
                    e.currentTarget.style.backgroundColor = 'var(--md-surface-container)';
                    e.currentTarget.style.borderColor = 'var(--md-outline)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!returnAll) {
                    e.currentTarget.style.backgroundColor = 'var(--md-surface-container-low)';
                    e.currentTarget.style.borderColor = 'var(--md-outline-variant)';
                  }
                }}
                >
                  <input
                    type="radio"
                    name="return-option"
                    checked={returnAll}
                    onChange={() => {
                      setReturnAll(true);
                      setSelectedUnitIds([]);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      width: '20px',
                      height: '20px',
                      accentColor: 'var(--md-primary)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontWeight: returnAll ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-15)',
                      color: returnAll ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                      display: 'block',
                    }}>
                      Return All Reserved Units
                    </span>
                    <span style={{ 
                      fontSize: 'var(--font-size-13)',
                      color: returnAll ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                      display: 'block',
                      marginTop: 'var(--spacing-xs)',
                    }}>
                      {reservedUnits.length} unit{reservedUnits.length !== 1 ? 's' : ''} will be returned
                    </span>
                  </div>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-md)', 
                  cursor: 'pointer', 
                  padding: 'var(--spacing-md)', 
                  borderRadius: 'var(--radius-lg)', 
                  backgroundColor: !returnAll ? 'var(--md-primary-container)' : 'var(--md-surface-container-low)', 
                  border: `2px solid ${!returnAll ? 'var(--md-primary)' : 'var(--md-outline-variant)'}`,
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  if (returnAll) {
                    e.currentTarget.style.backgroundColor = 'var(--md-surface-container)';
                    e.currentTarget.style.borderColor = 'var(--md-outline)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (returnAll) {
                    e.currentTarget.style.backgroundColor = 'var(--md-surface-container-low)';
                    e.currentTarget.style.borderColor = 'var(--md-outline-variant)';
                  }
                }}
                >
                  <input
                    type="radio"
                    name="return-option"
                    checked={!returnAll}
                    onChange={() => setReturnAll(false)}
                    style={{ 
                      cursor: 'pointer',
                      width: '20px',
                      height: '20px',
                      accentColor: 'var(--md-primary)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontWeight: !returnAll ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-15)',
                      color: !returnAll ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                      display: 'block',
                    }}>
                      Select Specific Units
                    </span>
                    <span style={{ 
                      fontSize: 'var(--font-size-13)',
                      color: !returnAll ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                      display: 'block',
                      marginTop: 'var(--spacing-xs)',
                    }}>
                      Choose which units to return individually
                    </span>
                  </div>
                </label>
              </div>

              {!returnAll && (
                <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-md)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-15)',
                  }}>
                    Select Units to Return
                  </label>
                  <div style={{ 
                    maxHeight: '350px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--md-outline-variant)', 
                    padding: 'var(--spacing-sm)', 
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--md-surface-container-low)',
                  }}>
                    {reservedUnits.length === 0 ? (
                      <p style={{ 
                        color: 'var(--md-on-surface-variant)', 
                        textAlign: 'center', 
                        padding: 'var(--spacing-xl)',
                        fontSize: 'var(--font-size-14)',
                      }}>
                        No reserved units found
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                        {reservedUnits.map((unit: any) => {
                          const isSelected = selectedUnitIds.includes(unit.id);
                          return (
                            <label 
                              key={unit.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--spacing-md)', 
                                padding: 'var(--spacing-md)', 
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isSelected ? 'var(--md-primary-container)' : 'transparent',
                                border: `1px solid ${isSelected ? 'var(--md-primary)' : 'transparent'}`,
                                transition: 'all var(--transition-base)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = 'var(--md-surface-container)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleUnit(unit.id)}
                                style={{ 
                                  cursor: 'pointer',
                                  width: '20px',
                                  height: '20px',
                                  accentColor: 'var(--md-primary)',
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{ 
                                  color: isSelected ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                                  fontSize: 'var(--font-size-14)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  display: 'block',
                                }}>
                                  {unit.product_template_name || 'Unknown Product'}
                                </span>
                                <span style={{ 
                                  color: isSelected ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                                  fontSize: 'var(--font-size-12)',
                                  display: 'block',
                                  marginTop: 'var(--spacing-xs)',
                                }}>
                                  Serial: {unit.serial_number || `Unit #${unit.id}`}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {!returnAll && selectedUnitIds.length > 0 && (
                    <div style={{ 
                      marginTop: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--md-primary-container)',
                      borderRadius: 'var(--radius-md)',
                      display: 'inline-block',
                    }}>
                      <small style={{ 
                        color: 'var(--md-on-primary-container)', 
                        fontSize: 'var(--font-size-13)', 
                        fontWeight: 'var(--font-weight-semibold)',
                      }}>
                        {selectedUnitIds.length} unit{selectedUnitIds.length !== 1 ? 's' : ''} selected
                      </small>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  placeholder="Add any additional notes about this return request..."
                  style={{ 
                    width: '100%', 
                    padding: 'var(--spacing-md)', 
                    border: '1px solid var(--md-outline-variant)', 
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--font-size-14)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    backgroundColor: 'var(--md-surface)',
                    color: 'var(--md-on-surface)',
                  }}
                />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading || isLoadingUnits}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading || isLoadingUnits || (!returnAll && selectedUnitIds.length === 0) || reservedUnits.length === 0}
            >
              {isLoading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

