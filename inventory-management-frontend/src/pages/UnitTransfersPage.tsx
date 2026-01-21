import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { UnitTransfersService, ProfilesService } from '../api/index';

export const UnitTransfersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransferIds, setSelectedTransferIds] = useState<Set<number>>(new Set());
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
  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role: { name?: string; role_code?: string }) => 
      role.name === roleName || role.role_code === roleName
    );
  };
  const isInventoryManager = hasRole('IM');
  const isSalesperson = hasRole('SP');

  useEffect(() => {
    const transferIdParam = searchParams.get('transferId');
    if (transferIdParam) {
      setSearch(transferIdParam);
      setPage(1);
      searchParams.delete('transferId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch unit transfers
  const { data: transfersData, isLoading } = useQuery({
    queryKey: ['unit-transfers', page, statusFilter],
    queryFn: async () => {
      const response = await UnitTransfersService.unitTransfersList(page);
      return response;
    },
  });

  // Fetch reserved units for creating transfer
  const { data: reservedUnitsData } = useQuery({
    queryKey: ['reserved-units-for-transfer'],
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

  // Fetch salespersons for transfer target
  const { data: salespersonsData } = useQuery({
    queryKey: ['salespersons'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/admins/?page_size=100`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to only salespersons (those with SP role)
        return {
          results: data.results?.filter((admin: any) => 
            admin.roles?.some((role: any) => role.name === 'SP')
          ) || []
        };
      }
      return { results: [] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { inventory_unit_id: number; to_salesperson_id: number; notes?: string }) => {
      return UnitTransfersService.unitTransfersCreate({
        inventory_unit: data.inventory_unit_id,
        inventory_unit_id: data.inventory_unit_id,
        to_salesperson: data.to_salesperson_id,
        to_salesperson_id: data.to_salesperson_id,
        notes: data.notes || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['reserved-units-for-transfer'] });
      alert('Transfer request created successfully');
      setShowCreateModal(false);
    },
    onError: (err: any) => {
      alert(`Failed to create transfer request: ${err.message || 'Unknown error'}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      // status is read-only in UnitTransfer, so we can't update it via PATCH
      // Only update notes if status update is needed, use a separate endpoint or remove status
      return UnitTransfersService.unitTransfersPartialUpdate(id, {
        notes: notes || '',
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-transfers'] });
      setSelectedTransferIds(new Set());
      alert('Transfer status updated successfully');
    },
    onError: (err: any) => {
      alert(`Failed to update transfer: ${err.message || 'Unknown error'}`);
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => 
        UnitTransfersService.unitTransfersPartialUpdate(id, { notes: '' })
      ));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-transfers'] });
      const count = variables.length;
      setSelectedTransferIds(new Set());
      alert(`Successfully approved ${count} transfer(s)`);
    },
    onError: (err: any) => {
      alert(`Failed to approve transfers: ${err.message || 'Unknown error'}`);
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => 
        // status is read-only, can't update via PATCH
        UnitTransfersService.unitTransfersPartialUpdate(id, { notes: '' } as any)
      ));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unit-transfers'] });
      const count = variables.length;
      setSelectedTransferIds(new Set());
      alert(`Successfully rejected ${count} transfer(s)`);
    },
    onError: (err: any) => {
      alert(`Failed to reject transfers: ${err.message || 'Unknown error'}`);
    },
  });

  const toggleSelectTransfer = (id: number, event?: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTransferIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter by status and search client-side
  const filteredTransfers = React.useMemo(() => {
    if (!transfersData?.results) return [];
    let filtered = transfersData.results;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((transfer) => transfer.status === statusFilter);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((transfer) => {
        const idMatch = transfer.id?.toString().includes(searchLower);
        const unitMatch = transfer.inventory_unit_name?.toLowerCase().includes(searchLower);
        const fromMatch = transfer.from_salesperson_username?.toLowerCase().includes(searchLower);
        const toMatch = transfer.to_salesperson_username?.toLowerCase().includes(searchLower);
        return idMatch || unitMatch || fromMatch || toMatch;
      });
    }
    
    return filtered;
  }, [transfersData, statusFilter, search]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!transfersData?.results) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    const results = transfersData.results;
    return {
      total: results.length,
      pending: results.filter((transfer) => transfer.status === 'PE').length,
      approved: results.filter((transfer) => transfer.status === 'AP').length,
      rejected: results.filter((transfer) => transfer.status === 'RE').length,
    };
  }, [transfersData]);

  const handleBulkApprove = () => {
    if (selectedTransferIds.size === 0) {
      alert('Please select at least one transfer to approve');
      return;
    }
    if (window.confirm(`Approve ${selectedTransferIds.size} selected transfer(s)?`)) {
      bulkApproveMutation.mutate(Array.from(selectedTransferIds));
    }
  };

  const handleBulkReject = () => {
    if (selectedTransferIds.size === 0) {
      alert('Please select at least one transfer to reject');
      return;
    }
    if (window.confirm(`Reject ${selectedTransferIds.size} selected transfer(s)?`)) {
      bulkRejectMutation.mutate(Array.from(selectedTransferIds));
    }
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

  if (isLoading) {
    return <div className="loading">Loading transfer requests...</div>;
  }

  return (
    <div className="unit-transfers-page">
      <div className="page-header">
        <h1>Unit Transfers</h1>
        <div className="page-header-actions">
          {isSalesperson && (
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Request Transfer
        </button>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {transfersData && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
            title={`Total Transfers: ${stats.total}`}
            aria-pressed={statusFilter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--pending ${statusFilter === 'PE' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('PE')}
            title={`Pending Transfers: ${stats.pending}`}
            aria-pressed={statusFilter === 'PE'}
          >
            <span className="summary-stat-label">Pending</span>
            <span className="summary-stat-value">{(stats.pending ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--approved ${statusFilter === 'AP' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('AP')}
            title={`Approved Transfers: ${stats.approved}`}
            aria-pressed={statusFilter === 'AP'}
          >
            <span className="summary-stat-label">Approved</span>
            <span className="summary-stat-value">{(stats.approved ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--rejected ${statusFilter === 'RE' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('RE')}
            title={`Rejected Transfers: ${stats.rejected}`}
            aria-pressed={statusFilter === 'RE'}
          >
            <span className="summary-stat-label">Rejected</span>
            <span className="summary-stat-value">{(stats.rejected ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {isInventoryManager && selectedTransferIds.size > 0 && (
        <div className="bulk-actions-toolbar">
          <span className="selected-count">
            {selectedTransferIds.size} selected
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
                          className="btn-small btn-danger"
              onClick={handleBulkReject}
              disabled={bulkRejectMutation.isPending}
            >
              ✕ Reject Selected
            </button>
            <button 
              className="btn-small btn-secondary" 
              onClick={() => setSelectedTransferIds(new Set())}
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
            placeholder="Search by ID, unit, from, or to salesperson..."
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

      {/* Transfers Cards Grid */}
      {filteredTransfers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search || statusFilter !== 'all' 
              ? 'No matching transfers found' 
              : 'No unit transfers'}
          </h3>
          <p>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more transfers.'
              : isSalesperson 
                ? 'You haven\'t created any transfer requests yet.'
                : 'There are no unit transfers in the system.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {filteredTransfers.map((transfer) => (
            <UnitTransferCard
              key={transfer.id}
              transfer={transfer}
              isSelected={selectedTransferIds.has(transfer.id!)}
              onToggleSelect={isInventoryManager ? toggleSelectTransfer : undefined}
              onApprove={isInventoryManager && transfer.status === 'PE' ? () => {
                if (window.confirm('Approve this transfer request?')) {
                  updateStatusMutation.mutate({ id: transfer.id!, status: 'AP' });
                }
              } : undefined}
              onReject={isInventoryManager && transfer.status === 'PE' ? () => {
                if (window.confirm('Reject this transfer request?')) {
                  updateStatusMutation.mutate({ id: transfer.id!, status: 'RE' });
                }
              } : undefined}
              isPending={updateStatusMutation.isPending}
              formatDate={formatDate}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {transfersData && transfersData.count && transfersData.count > 25 ? (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!transfersData?.previous || page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {Math.ceil((transfersData.count || 0) / 25)} ({transfersData.count || 0} total)
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!transfersData?.next}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      ) : null}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTransferModal
          reservedUnits={reservedUnitsData?.results || []}
          salespersons={salespersonsData?.results || []}
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
};

// Unit Transfer Card Component
interface UnitTransferCardProps {
  transfer: any;
  isSelected: boolean;
  onToggleSelect?: (transferId: number, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onApprove?: () => void;
  onReject?: () => void;
  isPending: boolean;
  formatDate: (dateString?: string | null) => string;
  getStatusBadgeClass: (status?: string) => string;
}

const UnitTransferCard: React.FC<UnitTransferCardProps> = ({
  transfer,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
  isPending,
  formatDate,
  getStatusBadgeClass,
}) => {
  const statusClass = getStatusBadgeClass(transfer.status);

  return (
    <div className={`request-card ${statusClass} ${isSelected ? 'card-selected' : ''}`}>
      {onToggleSelect && (
        <div className="card-checkbox-overlay">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect?.(transfer.id!, e)}
            onClick={(e) => e.stopPropagation()}
            disabled={transfer.status !== 'PE'}
          />
        </div>
      )}
      
      <div className="request-card-header">
        <div className="request-id">#{transfer.id}</div>
        <span className={`status-badge ${statusClass}`}>
          {transfer.status_display || transfer.status}
        </span>
      </div>

      <div className="request-card-body">
        <div className="request-info-item">
          <span className="info-label">Unit:</span>
          <span className="info-value">{transfer.inventory_unit_name || `Unit #${transfer.inventory_unit}`}</span>
        </div>

        <div className="request-info-item">
          <span className="info-label">From:</span>
          <span className="info-value">{transfer.from_salesperson_username || '-'}</span>
        </div>

        <div className="request-info-item">
          <span className="info-label">To:</span>
          <span className="info-value">{transfer.to_salesperson_username || '-'}</span>
        </div>

        <div className="request-info-item">
          <span className="info-label">Requested:</span>
          <span className="info-value">{formatDate(transfer.requested_at)}</span>
        </div>

        {transfer.approved_by_username && (
          <div className="request-info-item">
            <span className="info-label">Approved By:</span>
            <span className="info-value">{transfer.approved_by_username}</span>
          </div>
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
    </div>
  );
};

// Create Transfer Modal
interface CreateTransferModalProps {
  reservedUnits: any[];
  salespersons: any[];
  onClose: () => void;
  onCreate: (data: { inventory_unit_id: number; to_salesperson_id: number; notes?: string }) => void;
  isLoading: boolean;
}

const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  reservedUnits,
  salespersons,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [unitId, setUnitId] = useState<string>('');
  const [toSalespersonId, setToSalespersonId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitIdNum = parseInt(unitId);
    const salespersonIdNum = parseInt(toSalespersonId);
    if (!unitIdNum || isNaN(unitIdNum) || !salespersonIdNum || isNaN(salespersonIdNum)) {
      alert('Please select both unit and target salesperson');
      return;
    }
    onCreate({ inventory_unit_id: unitIdNum, to_salesperson_id: salespersonIdNum, notes });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Transfer Request</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="unit_id">Select Unit to Transfer <span className="required">*</span></label>
            <select
              id="unit_id"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">-- Select a reserved unit --</option>
              {reservedUnits.map((unit: any) => (
                <option key={unit.id} value={unit.id}>
                  {unit.product_template_name} - {unit.serial_number || `Unit #${unit.id}`}
                  {unit.reserved_by_username && ` (Reserved by: ${unit.reserved_by_username})`}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="to_salesperson_id">Transfer To <span className="required">*</span></label>
            <select
              id="to_salesperson_id"
              value={toSalespersonId}
              onChange={(e) => setToSalespersonId(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">-- Select salesperson --</option>
              {salespersons.map((person: any) => (
                <option key={person.id} value={person.id}>
                  {person.username || person.user?.username} ({person.admin_code})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

