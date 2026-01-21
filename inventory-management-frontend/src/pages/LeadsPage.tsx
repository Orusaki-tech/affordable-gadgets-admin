import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LeadsService, ProfilesService, type LeadAdmin } from '../api/index';
import { LeadDetailsModal } from '../components/LeadDetailsModal';

export const LeadsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all'); // 'all', 'my', 'unclaimed'
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadAdmin | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [leadIdToOpen, setLeadIdToOpen] = useState<number | null>(null);
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
  const isSalesperson = hasRole('SP');
  const currentAdminId = adminProfile?.id;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const leadIdParam = searchParams.get('leadId');
    if (leadIdParam) {
      const leadId = Number(leadIdParam);
      if (!Number.isNaN(leadId)) {
        setLeadIdToOpen(leadId);
        setSearch(leadIdParam);
        setPage(1);
      }
      searchParams.delete('leadId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch leads - event-driven only (no polling)
  // Status filtering is done client-side (API does not accept a status param)
  const { data: leadsData, isLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['leads', page, statusFilter],
    queryFn: async () => {
      const response = await LeadsService.leadsList(page);
      return response;
    },
    // Event-driven only - no automatic polling
    refetchOnWindowFocus: true,  // Refetch when user returns to tab
    refetchOnReconnect: true,    // Refetch when internet reconnects
    refetchOnMount: true,        // Refetch when component mounts
    staleTime: 0,                // Always consider data stale (refetch on focus)
    // NO refetchInterval - no automatic polling
  });

  useEffect(() => {
    if (!leadIdToOpen || !leadsData?.results) return;
    const matchedLead = leadsData.results.find((lead) => lead.id === leadIdToOpen);
    if (matchedLead) {
      setSelectedLead(matchedLead);
      setShowDetailsModal(true);
      setLeadIdToOpen(null);
    }
  }, [leadIdToOpen, leadsData]);

  // Fetch all leads for accurate stats calculation (without status filter)
  const { data: allLeadsDataForStats } = useQuery({
    queryKey: ['leads', 'all', 'stats'],
    queryFn: async () => {
      const response = await LeadsService.leadsList(1);
      return response;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Filter by assigned status and search client-side (not supported by API)
  const filteredLeads = useMemo(() => {
    if (!leadsData?.results) return [];
    let filtered = leadsData.results;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }
    
    // Filter by assigned status
    if (assignedFilter === 'my' && currentAdminId) {
      filtered = filtered.filter((lead) => lead.assigned_salesperson === currentAdminId);
    } else if (assignedFilter === 'unclaimed') {
      filtered = filtered.filter((lead) => !lead.assigned_salesperson);
    }
    
    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((lead) => {
        const customerName = (lead.customer_name || '').toLowerCase();
        const customerPhone = (lead.customer_phone || '').toLowerCase();
        const leadRef = (lead.lead_reference || '').toLowerCase();
        return customerName.includes(searchLower) || 
               customerPhone.includes(searchLower) || 
               leadRef.includes(searchLower);
      });
    }
    
    return filtered;
  }, [leadsData, assignedFilter, search, currentAdminId, statusFilter]);

  // Assign lead mutation
  const assignMutation = useMutation({
    mutationFn: async (leadId: number) => {
      // Request body is optional per OpenAPI but type requires it - provide minimal valid request
      return LeadsService.leadsAssignCreate(leadId, {
        customer_name: '',
        customer_phone: '',
        brand: 0,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showToast('Lead claimed successfully', 'success');
    },
    onError: (err: any) => {
      showToast(`Failed to claim lead: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  // Mark contacted mutation
  const markContactedMutation = useMutation({
    mutationFn: async ({ lead, notes }: { lead: LeadAdmin; notes?: string }) => {
      if (!lead.id) {
        throw new Error('Lead id is missing');
      }
      return LeadsService.leadsContactCreate(lead.id, {
        customer_name: lead.customer_name,
        customer_phone: lead.customer_phone,
        brand: lead.brand,
        ...(notes ? { salesperson_notes: notes } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      showToast('Lead marked as contacted', 'success');
      setShowDetailsModal(false);
    },
    onError: (err: any) => {
      showToast(`Failed to mark as contacted: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  // Convert to order mutation
  const convertMutation = useMutation({
    mutationFn: async (lead: LeadAdmin) => {
      if (!lead.id) {
        throw new Error('Lead id is missing');
      }
      return LeadsService.leadsConvertCreate(lead.id, {
        customer_name: lead.customer_name,
        customer_phone: lead.customer_phone,
        brand: lead.brand,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast(`Lead converted to order: ${data.order_id}`, 'success');
      setShowDetailsModal(false);
    },
    onError: (err: any) => {
      showToast(`Failed to convert lead: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  // Reject lead mutation (releases items back to stock)
  const rejectMutation = useMutation({
    mutationFn: async (lead: LeadAdmin) => {
      if (!lead.id) {
        throw new Error('Lead id is missing');
      }
      return LeadsService.leadsCloseCreate(lead.id, {
        customer_name: lead.customer_name,
        customer_phone: lead.customer_phone,
        brand: lead.brand,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      const message = data?.message || 'Lead closed. Items released back to stock.';
      showToast(message, 'success');
      setShowDetailsModal(false);
    },
    onError: (err: any) => {
      showToast(`Failed to release items: ${err.message || 'Unknown error'}`, 'error');
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

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
      return 'KES 0.00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return 'KES 0.00';
    }
    return `KES ${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'NEW': return 'status-new';
      case 'CONTACTED': return 'status-contacted';
      case 'CONVERTED': return 'status-converted';
      case 'CLOSED': return 'status-closed';
      case 'EXPIRED': return 'status-expired';
      default: return 'status-unknown';
    }
  };

  const getUrgencyClass = (expiresAt?: string | null) => {
    if (!expiresAt) return 'urgency-none';
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 0) return 'urgency-expired';
    if (hoursUntilExpiry <= 24) return 'urgency-high';
    if (hoursUntilExpiry <= 48) return 'urgency-medium';
    if (hoursUntilExpiry <= 72) return 'urgency-low';
    return 'urgency-none';
  };

  const getUrgencyLabel = (expiresAt?: string | null) => {
    if (!expiresAt) return '';
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 0) return 'Expired';
    if (hoursUntilExpiry <= 24) return 'Expires soon';
    if (hoursUntilExpiry <= 48) return 'Expires in 2 days';
    if (hoursUntilExpiry <= 72) return 'Expires in 3 days';
    return '';
  };

  const handleViewDetails = (lead: LeadAdmin) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleClaimLead = (leadId: number) => {
    if (window.confirm('Claim this lead?')) {
      assignMutation.mutate(leadId);
    }
  };

  // Calculate statistics from all leads (not filtered by status)
  const stats = useMemo(() => {
    const allLeads = allLeadsDataForStats?.results || [];
    return {
      total: allLeadsDataForStats?.count || allLeads.length,
      new: allLeads.filter(l => l.status === 'NEW').length,
      contacted: allLeads.filter(l => l.status === 'CONTACTED').length,
      converted: allLeads.filter(l => l.status === 'CONVERTED').length,
      closed: allLeads.filter(l => l.status === 'CLOSED').length,
      expired: allLeads.filter(l => l.status === 'EXPIRED').length,
      unclaimed: allLeads.filter(l => !l.assigned_salesperson).length,
    };
  }, [allLeadsDataForStats]);

  const myLeadsCount = useMemo(() => {
    if (!isSalesperson || !allLeadsDataForStats?.results) {
      return 0;
    }
    return allLeadsDataForStats.results.filter(l => l.assigned_salesperson === currentAdminId).length;
  }, [isSalesperson, allLeadsDataForStats, currentAdminId]);

  // Check if user has access (salesperson only, superusers can access everything)
  const hasAccess = isSalesperson || isSuperuser;
  
  if (!user?.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <div className="loading">Loading leads...</div>;
  }

  // Redirect if user doesn't have required role
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const clearFilters = () => {
    setStatusFilter('all');
    setAssignedFilter('all');
    setSearch('');
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="leads-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Leads</h1>
          {stats.unclaimed > 0 && (
            <p className="unclaimed-count">
              {stats.unclaimed} unclaimed lead{stats.unclaimed !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            refetchLeads();
            showToast('Refreshing leads...', 'success');
          }}
          disabled={isLoading}
          title="Check for new leads"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Statistics Cards */}
      {leadsData && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${statusFilter === 'all' && assignedFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => { setStatusFilter('all'); setAssignedFilter('all'); }}
            title={`Total Leads: ${stats.total}`}
            aria-pressed={statusFilter === 'all' && assignedFilter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--new ${statusFilter === 'NEW' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('NEW')}
            title={`New Leads: ${stats.new}`}
            aria-pressed={statusFilter === 'NEW'}
          >
            <span className="summary-stat-label">New</span>
            <span className="summary-stat-value">{(stats.new ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--contacted ${statusFilter === 'CONTACTED' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('CONTACTED')}
            title={`Contacted Leads: ${stats.contacted}`}
            aria-pressed={statusFilter === 'CONTACTED'}
          >
            <span className="summary-stat-label">Contacted</span>
            <span className="summary-stat-value">{(stats.contacted ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--converted ${statusFilter === 'CONVERTED' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('CONVERTED')}
            title={`Converted Leads: ${stats.converted}`}
            aria-pressed={statusFilter === 'CONVERTED'}
          >
            <span className="summary-stat-label">Converted</span>
            <span className="summary-stat-value">{(stats.converted ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--closed ${statusFilter === 'CLOSED' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('CLOSED')}
            title={`Closed Leads: ${stats.closed} (Items returned to stock)`}
            aria-pressed={statusFilter === 'CLOSED'}
          >
            <span className="summary-stat-label">Closed</span>
            <span className="summary-stat-value">{(stats.closed ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--expired ${statusFilter === 'EXPIRED' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('EXPIRED')}
            title={`Expired Leads: ${stats.expired}`}
            aria-pressed={statusFilter === 'EXPIRED'}
          >
            <span className="summary-stat-label">Expired</span>
            <span className="summary-stat-value">{(stats.expired ?? 0).toLocaleString()}</span>
          </button>
          {isSalesperson && (
            <button
              type="button"
              className={`summary-stat-button summary-stat-button--unclaimed ${assignedFilter === 'unclaimed' ? 'is-active' : ''}`}
              onClick={() => { setAssignedFilter('unclaimed'); setStatusFilter('all'); }}
              title={`Unclaimed Leads: ${stats.unclaimed}`}
              aria-pressed={assignedFilter === 'unclaimed'}
            >
              <span className="summary-stat-label">Unclaimed</span>
              <span className="summary-stat-value">{(stats.unclaimed ?? 0).toLocaleString()}</span>
            </button>
          )}
          {isSalesperson && (
            <button
              type="button"
              className={`summary-stat-button summary-stat-button--my ${assignedFilter === 'my' ? 'is-active' : ''}`}
              onClick={() => { setAssignedFilter('my'); setStatusFilter('all'); }}
              title="My Leads"
              aria-pressed={assignedFilter === 'my'}
            >
              <span className="summary-stat-label">My Leads</span>
              <span className="summary-stat-value">{myLeadsCount.toLocaleString()}</span>
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by customer name, phone, or lead reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {(statusFilter !== 'all' || assignedFilter !== 'all' || search) && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Leads List */}
      <div className="leads-list">
        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <p>No leads found</p>
            {(statusFilter !== 'all' || assignedFilter !== 'all' || search) && (
              <button className="btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isUnclaimed = !lead.assigned_salesperson;
            const isMyLead = lead.assigned_salesperson === currentAdminId;
            // Salespersons can claim unclaimed leads or reclaim leads assigned to others
            const canClaim = isSalesperson && (isUnclaimed || !isMyLead);
            
            return (
              <div 
                key={lead.id} 
                className="lead-card"
                onClick={() => handleViewDetails(lead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleViewDetails(lead);
                  }
                }}
                aria-label={`View details for ${lead.lead_reference}`}
              >
                <div className="lead-card-header">
                  <div className="lead-reference">
                    <span className="lead-ref-label">{lead.lead_reference}</span>
                  </div>
                  <div className="lead-status-badges">
                    <span className={`status-badge ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status_display || lead.status}
                    </span>
                    {/* Show conversion indicator */}
                    {lead.status === 'CONVERTED' && lead.converted_at && (
                      <span 
                        className="conversion-badge" 
                        title={`Converted to Order ${lead.order_id || ''} on ${formatDate(lead.converted_at)}`}
                      >
                        ✓ Converted {lead.order_id ? `(${lead.order_id.slice(0, 8)}...)` : ''}
                      </span>
                    )}
                    
                    {/* Show closed indicator */}
                    {lead.status === 'CLOSED' && (
                      <span 
                        className="closed-badge"
                        title="Items returned to stock"
                      >
                        ✗ Closed
                      </span>
                    )}
                    
                    {lead.expires_at && (
                      <span className={`urgency-badge ${getUrgencyClass(lead.expires_at)}`}>
                        {getUrgencyLabel(lead.expires_at)}
                      </span>
                    )}
                    
                    {isMyLead && !isUnclaimed && (
                      <span className="claimed-badge">
                        ✓ Claimed
                      </span>
                    )}
                  </div>
                  {canClaim && (
                    <button
                      className="btn-primary btn-sm lead-claim-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimLead(lead.id!);
                      }}
                      disabled={assignMutation.isPending}
                    >
                      {isUnclaimed ? 'Claim Lead' : 'Reclaim Lead'}
                    </button>
                  )}
                </div>
                
                <div className="lead-card-body">
                  <div className="lead-card-main-info">
                    <div className="lead-customer-name">
                      {lead.customer_name_display || lead.customer_name}
                    </div>
                    <div className="lead-customer-phone">
                      {lead.customer_phone}
                    </div>
                  </div>
                  
                  {lead.items && lead.items.length > 0 && (
                    <div className="lead-items-section">
                      <div className="lead-items-label">Items ({lead.items.length}):</div>
                      <div className="lead-items-list">
                        {lead.items.map((item, idx) => (
                          <div key={idx} className="lead-item-row">
                            <div className="lead-item-info">
                              {item.product_name && (
                                <span className="lead-item-product-name">{item.product_name}</span>
                              )}
                              <span className="lead-item-name">
                                {item.product_name || `Unit ${item.inventory_unit}`}
                              </span>
                            </div>
                            <span className="lead-item-quantity">× {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="lead-total-section">
                    <div className="lead-total-value">{formatCurrency(lead.total_value)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {leadsData && leadsData.count && leadsData.count > pageSize && (
        <div className="pagination">
          <button
            className="btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || !leadsData.previous}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {Math.ceil(leadsData.count / pageSize)}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setPage(p => p + 1)}
            disabled={!leadsData.next}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      )}

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLead(null);
          }}
          onMarkContacted={(notes) => markContactedMutation.mutate({ lead: selectedLead, notes })}
          onConvertToOrder={() => convertMutation.mutate(selectedLead)}
          onReject={() => {
            if (window.confirm('Close this lead? This action cannot be undone.')) {
              rejectMutation.mutate(selectedLead);
            }
          }}
          isSalesperson={isSalesperson}
          isMyLead={selectedLead.assigned_salesperson === currentAdminId}
        />
      )}
    </div>
  );
};

