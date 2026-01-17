import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { ReservationRequestsService, ReturnRequestsService, ProfilesService, ReservationRequestStatusEnum, type InventoryUnitRW } from '../api/index';
import { ReservationRequestDetailsModal } from '../components/ReservationRequestDetailsModal';

export const ReservationRequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Read status filter from URL query params (e.g., when navigating from notification)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ['PE', 'AP', 'RE', 'EX', 'RT'].includes(statusParam)) {
      setStatusFilter(statusParam);
      // Remove the query param after reading it
      searchParams.delete('status');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

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
  const shouldPoll = isInventoryManager || isSalesperson;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch reservation requests (paginated for display)
  // Status filtering is now done server-side via API parameter
  const { data: requestsData, isLoading, error: queryError, refetch: refetchRequests } = useQuery({
    queryKey: ['reservation-requests', page, pageSize, statusFilter, isSalesperson, isInventoryManager],
    queryFn: async () => {
      const response = await ReservationRequestsService.reservationRequestsList(
        page,
        statusFilter !== 'all' ? (statusFilter as any) : undefined
      );
      return response;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchInterval: shouldPoll ? 15000 : false,
    staleTime: shouldPoll ? 1000 : 0,
    enabled: !!user?.is_staff, // Only fetch if user is staff
  });

  // Fetch ALL requests for accurate stats calculation (inventory managers only)
  // This ensures stats reflect all requests, not just the current page
  const { data: allRequestsDataForStats, refetch: refetchAllRequestsForStats } = useQuery({
    queryKey: ['reservation-requests', 'all', 'stats', isInventoryManager],
    queryFn: async () => {
      const response = await ReservationRequestsService.reservationRequestsList(1);
      return response;
    },
    enabled: !!user?.is_staff && isInventoryManager,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchInterval: shouldPoll ? 15000 : false,
    staleTime: shouldPoll ? 1000 : 0,
  });

  // Refetch when navigating to this page (especially for inventory managers)
  useEffect(() => {
    if (isInventoryManager && user?.is_staff) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        refetchRequests();
        refetchAllRequestsForStats(); // Also refetch stats query
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInventoryManager, user?.is_staff, refetchRequests, refetchAllRequestsForStats]);

  // Refetch when page becomes visible (user switches back to this tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInventoryManager && user?.is_staff) {
        refetchRequests();
        refetchAllRequestsForStats(); // Also refetch stats query
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInventoryManager, user?.is_staff, refetchRequests, refetchAllRequestsForStats]);

  const { data: returnRequestsData } = useQuery({
    queryKey: ['return-requests-for-reservations'],
    queryFn: async () => ReturnRequestsService.returnRequestsList(1),
    enabled: !!user?.is_staff,
    staleTime: 30000,
  });

  // Map unit IDs to return request information (all statuses)
  // This helps determine if a reservation should show as "Returned" or if return is "Pending"
  const unitReturnStatusMap = React.useMemo(() => {
    const map: Record<number, { status: string; returnRequest: any }> = {};
    if (!returnRequestsData?.results) {
      return map;
    }
    returnRequestsData.results.forEach((ret: any) => {
      const unitIds: number[] = [];
      if (Array.isArray(ret.inventory_units)) {
        ret.inventory_units.forEach((unit: any) => {
          if (typeof unit === 'number') {
            unitIds.push(unit);
          } else if (unit?.id) {
            unitIds.push(unit.id);
          }
        });
      }
      if (Array.isArray(ret.inventory_units_detail)) {
        ret.inventory_units_detail.forEach((unit: any) => {
          if (unit?.id) {
            unitIds.push(unit.id);
          }
        });
      }
      unitIds.forEach((unitId) => {
        // Store both status and return request for temporal checks
        // If multiple return requests exist for same unit, keep the most recent one
        if (!map[unitId] || new Date(ret.requested_at || 0) > new Date(map[unitId].returnRequest?.requested_at || 0)) {
          map[unitId] = { status: ret.status, returnRequest: ret };
        }
      });
    });
    return map;
  }, [returnRequestsData]);

  // Map requests with return request info for button state (but don't change reservation status)
  // Reservation requests should show their actual status - return requests are managed separately
  const requestsWithDerivedStatus = React.useMemo(() => {
    if (!requestsData?.results) {
      return [];
    }
    return requestsData.results.map((req: any) => {
      // Keep the original status - don't derive as 'RT'
      // Return requests are shown on the return requests page, not here
      return { ...req, derived_status: req.status };
    });
  }, [requestsData]);

  // Calculate status for all requests (for stats calculation)
  // Use actual status from database - don't derive as 'RT' since return requests are separate
  const allRequestsWithDerivedStatus = React.useMemo(() => {
    if (!allRequestsDataForStats?.results) {
      return [];
    }
    return allRequestsDataForStats.results.map((req: any) => {
      // Keep the original status - return requests are shown on return requests page
      return { ...req, derived_status: req.status };
    });
  }, [allRequestsDataForStats]);

  // Filter by search client-side (status filtering is now done server-side)
  // Note: Backend already filters by salesperson role, so no need to filter again here
  const filteredRequests = React.useMemo(() => {
    if (!requestsWithDerivedStatus.length) {
      return [];
    }
    let filtered = requestsWithDerivedStatus;
    
    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((req) => {
        const unitName = (req.inventory_unit_name || '').toLowerCase();
        const salesperson = (req.requesting_salesperson_username || '').toLowerCase();
        const requestId = req.id?.toString() || '';
        return unitName.includes(searchLower) || 
               salesperson.includes(searchLower) || 
               requestId.includes(searchLower);
      });
    }
    
    return filtered;
  }, [requestsWithDerivedStatus, search]);


  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      try {
        const result = await ReservationRequestsService.reservationRequestsPartialUpdate(id, {
          status: status as ReservationRequestStatusEnum,
          notes: notes || '',
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['reservation-requests'] });

      // Snapshot the previous value for all matching queries
      const previousData = queryClient.getQueriesData({ queryKey: ['reservation-requests'] });

      // Get current user for approved_by_username
      const currentUsername = user?.username || adminProfile?.user?.username || '';

      // If filtering by pending and we're approving/rejecting, switch to 'all' filter
      // This ensures the updated request remains visible after status change
      const willChangeFilter = statusFilter === 'PE' && (status === 'AP' || status === 'RE');

      // Helper function to update a request in query data
      const updateRequestInQueryData = (queryKey: any[], filterValue: string) => {
        const queryData = queryClient.getQueryData(queryKey) as any;
        if (!queryData?.results) {
          return false;
        }
        
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.results) {
            return old;
          }
          
          const updated = {
            ...old,
            results: old.results.map((req: any) => {
              if (req.id === id) {
                const updatedReq = {
                  ...req,
                  status,
                  derived_status: status, // Also update derived_status so badge updates immediately
                  status_display: status === 'AP' ? 'Approved' : status === 'RE' ? 'Rejected' : req.status_display,
                  approved_at: (status === 'AP' || status === 'RE') ? new Date().toISOString() : req.approved_at,
                  expires_at: status === 'AP' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() : req.expires_at,
                  approved_by_username: (status === 'AP' || status === 'RE') ? currentUsername : req.approved_by_username,
                };
                return updatedReq;
              }
              return req;
            }),
          };
          return updated;
        });
        return true;
      };

      // Update the CURRENT query (the one the component is subscribed to)
      // This ensures the UI updates immediately
      // Note: query key no longer includes statusFilter since API doesn't use it
      const currentQueryKey = ['reservation-requests', page, pageSize, isSalesperson, isInventoryManager];
      updateRequestInQueryData(currentQueryKey, statusFilter);
      
      // If we're changing filters, also update the query (same key since filter is client-side)
      if (willChangeFilter) {
        // Query key is the same, just update the data
        const currentData = queryClient.getQueryData(currentQueryKey) as any;
        if (currentData?.results) {
          const requestToUpdate = currentData.results.find((req: any) => req.id === id);
          if (requestToUpdate) {
            const updatedRequest = {
              ...requestToUpdate,
              status,
              derived_status: status, // Also update derived_status so badge updates immediately
              status_display: status === 'AP' ? 'Approved' : status === 'RE' ? 'Rejected' : requestToUpdate.status_display,
              approved_at: (status === 'AP' || status === 'RE') ? new Date().toISOString() : requestToUpdate.approved_at,
              expires_at: status === 'AP' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() : requestToUpdate.expires_at,
              approved_by_username: (status === 'AP' || status === 'RE') ? currentUsername : requestToUpdate.approved_by_username,
            };
            
            queryClient.setQueryData(currentQueryKey, {
              ...currentData,
              results: currentData.results.map((req: any) => req.id === id ? updatedRequest : req),
            });
          }
        }
        
        // Change the filter AFTER updating the queries
        // This keeps the approved/rejected request visible so user can see the result
        setStatusFilter('all');
      }

      // Also update all other matching queries (by prefix) for consistency
      queryClient.setQueriesData(
        { queryKey: ['reservation-requests'], exact: false },
        (old: any) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((req: any) =>
              req.id === id
                ? {
                    ...req,
                    status,
                    derived_status: status, // Also update derived_status so badge updates immediately
                    status_display: status === 'AP' ? 'Approved' : status === 'RE' ? 'Rejected' : req.status_display,
                    approved_at: (status === 'AP' || status === 'RE') ? new Date().toISOString() : req.approved_at,
                    expires_at: status === 'AP' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() : req.expires_at,
                    approved_by_username: (status === 'AP' || status === 'RE') ? currentUsername : req.approved_by_username,
                  }
                : req
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (data, variables) => {
      console.log('Reservation request update success:', { 
        requestId: variables.id, 
        newStatus: variables.status,
        serverResponse: data 
      });
      
      // Update the cache with the server response - this is the source of truth
      queryClient.setQueriesData(
        { queryKey: ['reservation-requests'], exact: false },
        (old: any) => {
          if (!old?.results) {
            return old;
          }
          const updated = {
            ...old,
            results: old.results.map((req: any) => {
              if (req.id === variables.id) {
                // Merge server response with existing data
                // Server response should have the updated status
                const serverStatus = data.status || variables.status;
                const updatedReq = {
                  ...req,
                  ...data, // Server response has the latest data
                  status: serverStatus,
                  derived_status: serverStatus, // Update derived_status from server response
                  status_display: data.status_display || (serverStatus === 'AP' ? 'Approved' : serverStatus === 'RE' ? 'Rejected' : req.status_display),
                  approved_at: data.approved_at || req.approved_at,
                  approved_by: data.approved_by || req.approved_by,
                  approved_by_username: data.approved_by_username || req.approved_by_username,
                  expires_at: data.expires_at || req.expires_at,
                };
                console.log('Updated request in cache:', { 
                  id: updatedReq.id, 
                  oldStatus: req.status, 
                  newStatus: updatedReq.status,
                  derived_status: updatedReq.derived_status 
                });
                return updatedReq;
              }
              return req;
            }),
          };
          return updated;
        }
      );
      
      // Invalidate notification queries so notification bell updates
      // Use a small delay to ensure server has processed notifications
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      }, 500);
      
      // Refetch reservation requests after a delay to ensure we have the latest data from server
      // This ensures consistency even if the server response was incomplete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
        refetchRequests(); // Explicitly refetch to ensure fresh data
      }, 1500);
      
      showToast(`Request ${variables.status === 'AP' ? 'approved' : 'rejected'} successfully`, 'success');
      setSelectedRequests(new Set());
    },
    onError: (err: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Extract detailed error message
      let errorMessage = 'Unknown error';
      if (err?.response?.data) {
        // Backend validation error
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          // Try to extract first error message
          const firstKey = Object.keys(err.response.data)[0];
          const firstError = err.response.data[firstKey];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      console.error('Reservation request update error:', {
        error: err,
        variables,
        response: err?.response?.data,
        status: err?.response?.status,
      });
      
      showToast(`Failed to ${variables.status === 'AP' ? 'approve' : 'reject'} request: ${errorMessage}`, 'error');
    },
  });

  // Mutation for creating return requests from reservations
  const createReturnMutation = useMutation({
    mutationFn: async ({ unit_ids, notes }: { unit_ids: number[]; notes?: string }) => {
      return ReturnRequestsService.returnRequestsCreate({
        unit_ids: unit_ids,
        notes: notes || '',
      });
    },
    onMutate: async ({ unit_ids }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['return-requests-for-reservations'] });
      
      // Optimistically update the return requests data to show pending status immediately
      const previousReturnData = queryClient.getQueryData(['return-requests-for-reservations']);
      
      // Optimistically add a pending return request
      queryClient.setQueryData(['return-requests-for-reservations'], (old: any) => {
        const optimisticReturn = {
          id: Date.now(), // Temporary ID
          status: 'PE',
          inventory_units: unit_ids,
          inventory_units_detail: unit_ids.map((id: number) => ({ id })),
          requested_at: new Date().toISOString(),
        };
        
        if (!old) {
          return {
            count: 1,
            results: [optimisticReturn],
            next: null,
            previous: null,
          };
        }
        
        return {
          ...old,
          count: (old.count || 0) + 1,
          results: [optimisticReturn, ...(old.results || [])],
        };
      });
      
      return { previousReturnData };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch to get the real data from server
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      queryClient.invalidateQueries({ queryKey: ['return-requests-for-reservations'] });
      queryClient.refetchQueries({ queryKey: ['return-requests-for-reservations'] });
      showToast('Return request created successfully', 'success');
    },
    onError: (err: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousReturnData) {
        queryClient.setQueryData(['return-requests-for-reservations'], context.previousReturnData);
      }
      showToast(`Failed to create return request: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  const handleReturnReservation = (request: any) => {
    // Get unit IDs from the new many-to-many relationship or fallback to legacy single unit
    let unitIds: number[] = [];
    
    // Check for new many-to-many relationship (inventory_units_details)
    if (request.inventory_units_details && request.inventory_units_details.length > 0) {
      unitIds = request.inventory_units_details
        .map((unit: InventoryUnitRW) => unit.id)
        .filter((id: number | undefined): id is number => id !== undefined);
    }
    
    // Fallback to legacy single unit field
    if (unitIds.length === 0) {
      const unitId = request.inventory_unit_id ?? request.inventory_unit;
      if (unitId) {
        unitIds = [unitId];
      }
    }
    
    if (unitIds.length === 0) {
      showToast('Invalid reservation: missing unit ID(s)', 'error');
      return;
    }
    
    const unitCount = unitIds.length;
    const unitNames = request.inventory_units_details?.map((u: InventoryUnitRW) => u.product_template_name || 'Unknown').join(', ') 
      || request.inventory_unit_name 
      || 'Unit(s)';
    
    if (window.confirm(`Return ${unitCount} reserved unit(s): ${unitNames}?`)) {
      // Update mutation to handle multiple units
      createReturnMutation.mutate({
        unit_ids: unitIds,
        notes: `Returned from reservation request #${request.id}`,
      });
    }
  };

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => 
        ReservationRequestsService.reservationRequestsPartialUpdate(id, { status: ReservationRequestStatusEnum.AP, notes: '' })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      showToast(`Successfully approved ${selectedRequests.size} request(s)`, 'success');
      setSelectedRequests(new Set());
    },
    onError: (err: any) => {
      showToast(`Failed to approve requests: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => 
        ReservationRequestsService.reservationRequestsPartialUpdate(id, { status: ReservationRequestStatusEnum.RE, notes: '' })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      showToast(`Successfully rejected ${selectedRequests.size} request(s)`, 'success');
      setSelectedRequests(new Set());
    },
    onError: (err: any) => {
      showToast(`Failed to reject requests: ${err.message || 'Unknown error'}`, 'error');
    },
  });

  // Selection handlers
  const toggleSelectRequest = (id: number) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const handleBulkApprove = () => {
    if (selectedRequests.size === 0) return;
    if (window.confirm(`Approve ${selectedRequests.size} selected request(s)?`)) {
      bulkApproveMutation.mutate(Array.from(selectedRequests));
    }
  };

  const handleBulkReject = () => {
    if (selectedRequests.size === 0) return;
    if (window.confirm(`Reject ${selectedRequests.size} selected request(s)?`)) {
      bulkRejectMutation.mutate(Array.from(selectedRequests));
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}:${seconds}` };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PE': return 'status-pending';
      case 'AP': return 'status-approved';
      case 'RE': return 'status-rejected';
      case 'EX': return 'status-expired';
      case 'RT': return 'status-returned';
      default: return 'status-unknown';
    }
  };

  const isExpiringSoon = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  // Calculate statistics (must be before any conditional returns)
  // For inventory managers, use all requests for accurate stats across all pages
  // For salespersons, use current page data (they only see their own requests anyway)
  const stats = React.useMemo(() => {
    // Use all requests data for inventory managers, current page for salespersons
    const requestsForStats = (isInventoryManager && allRequestsWithDerivedStatus.length > 0)
      ? allRequestsWithDerivedStatus
      : requestsWithDerivedStatus;
    
    if (!requestsForStats.length) {
      return { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, returned: 0 };
    }
    
    return {
      total: isInventoryManager && allRequestsDataForStats?.count 
        ? allRequestsDataForStats.count 
        : requestsForStats.length,
      pending: requestsForStats.filter(r => (r.derived_status ?? r.status) === 'PE').length,
      approved: requestsForStats.filter(r => (r.derived_status ?? r.status) === 'AP').length,
      rejected: requestsForStats.filter(r => (r.derived_status ?? r.status) === 'RE').length,
      expired: requestsForStats.filter(r => (r.derived_status ?? r.status) === 'EX').length,
      returned: requestsForStats.filter(r => (r.derived_status ?? r.status) === 'RT').length,
    };
  }, [requestsWithDerivedStatus, allRequestsWithDerivedStatus, isInventoryManager, allRequestsDataForStats]);

  if (isLoading) {
    return <div>Loading reservation requests...</div>;
  }

  if (queryError) {
    console.error('❌ Error fetching reservation requests:', queryError);
    return (
      <div>
        <h3>Error loading reservation requests</h3>
        <p>{(queryError as any)?.message || 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const pendingCount = filteredRequests.filter(r => (r.derived_status ?? r.status) === 'PE').length;
  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (search ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setSelectedRequests(new Set());
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
    setSelectedRequests(new Set());
  };

  return (
    <div className="reservation-requests-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="page-header">
        <div className="page-title">
          <h1>Reservation Requests</h1>
          {pendingCount > 0 && (
            <p className="page-subtitle">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting approval
            </p>
          )}
        </div>
        <div className="page-meta">
          <span className="stat-chip">
            {requestsData?.count ?? stats.total} total
          </span>
        </div>
      </header>

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
            className={`summary-stat-button summary-stat-button--returned ${statusFilter === 'RT' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('RT')}
            title={`Returned Requests: ${stats.returned}`}
            aria-pressed={statusFilter === 'RT'}
          >
            <span className="summary-stat-label">Returned</span>
            <span className="summary-stat-value">{(stats.returned ?? 0).toLocaleString()}</span>
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
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--expired ${statusFilter === 'EX' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('EX')}
            title={`Expired Requests: ${stats.expired}`}
            aria-pressed={statusFilter === 'EX'}
          >
            <span className="summary-stat-label">Expired</span>
            <span className="summary-stat-value">{(stats.expired ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {isInventoryManager && selectedRequests.size > 0 && (
        <div className="bulk-actions-toolbar">
          <span className="selected-count">
            {selectedRequests.size} selected
          </span>
          <div className="bulk-actions-buttons">
            <button
              className="btn-action btn-approve"
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
            >
              ✓ Approve Selected
            </button>
            <button
              className="btn-action btn-reject"
              onClick={handleBulkReject}
              disabled={bulkRejectMutation.isPending}
            >
              ✕ Reject Selected
            </button>
            <button
              className="btn-action btn-outline"
              onClick={() => setSelectedRequests(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search by unit name, salesperson, or request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="search-actions">
            <button
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <span className="filters-toggle-label">Filters</span>
              {activeFilterCount > 0 && (
                <span className="filters-badge">{activeFilterCount}</span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button className="btn-link" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <span className="filters-label">Filter by Status</span>
            <div className="filters-pill-group">
              <button
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-pill ${statusFilter === 'PE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PE')}
              >
                Pending ({stats.pending})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'AP' ? 'active' : ''}`}
                onClick={() => setStatusFilter('AP')}
              >
                Approved ({stats.approved})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'RT' ? 'active' : ''}`}
                onClick={() => setStatusFilter('RT')}
              >
                Returned ({stats.returned})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'RE' ? 'active' : ''}`}
                onClick={() => setStatusFilter('RE')}
              >
                Rejected ({stats.rejected})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'EX' ? 'active' : ''}`}
                onClick={() => setStatusFilter('EX')}
              >
                Expired ({stats.expired})
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">
            {search || statusFilter !== 'all'
              ? 'No matching requests found'
              : 'No reservation requests'}
          </h3>
          <p className="empty-description">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more requests.'
              : isSalesperson
                ? "You haven't created any reservation requests yet."
                : 'There are no reservation requests in the system.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => {
            const effectiveStatus = request.derived_status ?? request.status;
            const isPending = effectiveStatus === 'PE';
            const isApproved = effectiveStatus === 'AP';
            
            // Check if there's a return request for any unit in this reservation
            // Get all unit IDs from the reservation (new many-to-many or legacy single unit)
            const unitIds: number[] = [];
            if (request.inventory_units_details && request.inventory_units_details.length > 0) {
              request.inventory_units_details?.forEach((unit: InventoryUnitRW) => {
                if (unit.id) unitIds.push(unit.id);
              });
            } else {
              const unitId = request.inventory_unit?.id ?? request.inventory_unit ?? request.inventory_unit_id;
              if (unitId) unitIds.push(unitId);
            }
            
            // Check if any unit has a pending or approved return
            const hasPendingReturn = unitIds.some((id: number) => unitReturnStatusMap[id]?.status === 'PE');
            const hasApprovedReturn = unitIds.some((id: number) => unitReturnStatusMap[id]?.status === 'AP');
            
            // Check if any unit in the request is sold
            // Check both new many-to-many relationship and legacy single unit
            let hasSoldUnit = false;
            if (request.inventory_units_details && request.inventory_units_details.length > 0) {
              hasSoldUnit = request.inventory_units_details.some(
                (unit: InventoryUnitRW) => unit.sale_status === 'SD'
              );
            } else {
              // For legacy single unit, we'd need to check the unit's sale_status
              // Since we don't have that in the request object, assume not sold
              // The backend will validate this anyway
              hasSoldUnit = false;
            }

            return (
              <ReservationRequestCard
                key={request.id}
                request={request}
                isSelected={selectedRequests.has(request.id!)}
                onToggleSelect={isInventoryManager ? toggleSelectRequest : undefined}
                onViewDetails={(id) => setSelectedRequestId(id)}
                onApprove={isInventoryManager && isPending ? () => {
                  if (window.confirm('Approve this reservation request?')) {
                    updateStatusMutation.mutate({ id: request.id!, status: 'AP' });
                  }
                } : undefined}
                onReject={isInventoryManager && isPending ? () => {
                  if (window.confirm('Reject this reservation request?')) {
                    updateStatusMutation.mutate({ id: request.id!, status: 'RE' });
                  }
                } : undefined}
                onReturn={isSalesperson && isApproved && !hasPendingReturn && !hasApprovedReturn && !hasSoldUnit ? () => handleReturnReservation(request) : undefined}
                hasPendingReturn={hasPendingReturn}
                isPending={updateStatusMutation.isPending || createReturnMutation.isPending}
                formatDate={formatDate}
                getStatusBadgeClass={getStatusBadgeClass}
                isExpiringSoon={isExpiringSoon}
              />
            );
          })}
        </div>
      )}

      {requestsData && requestsData.count && requestsData.count > 0 ? (
        <div className="pagination-section">
          <div className="pagination">
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!requestsData?.previous || page === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {Math.ceil((requestsData.count || 0) / pageSize)} ({requestsData.count || 0} total)
            </span>
            <button
              className="btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={!requestsData?.next}
            >
              Next
            </button>
          </div>
          <div className="page-size-controls">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              className="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      ) : null}

      {/* Reservation Request Details Modal */}
      {selectedRequestId && (
        <ReservationRequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => {
            setSelectedRequestId(null);
            queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
          }}
          isSalesperson={isSalesperson}
          isMyRequest={
            filteredRequests.find(r => r.id === selectedRequestId)?.requesting_salesperson === adminProfile?.id ||
            requestsData?.results?.find((r: any) => r.id === selectedRequestId)?.requesting_salesperson === adminProfile?.id
          }
          isInventoryManager={isInventoryManager}
        />
      )}
    </div>
  );
};

// Reservation Request Card Component
interface ReservationRequestCardProps {
  request: any;
  isSelected: boolean;
  onToggleSelect?: (requestId: number, e?: React.MouseEvent) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReturn?: () => void;
  onViewDetails?: (requestId: number) => void;
  hasPendingReturn?: boolean;
  isPending: boolean;
  formatDate: (dateString?: string | null) => { date: string; time: string } | string;
  getStatusBadgeClass: (status?: string) => string;
  isExpiringSoon: (expiresAt?: string | null) => boolean;
}

const ReservationRequestCard: React.FC<ReservationRequestCardProps> = ({
  request,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
  onReturn,
  onViewDetails,
  hasPendingReturn = false,
  isPending,
  formatDate,
  getStatusBadgeClass,
  isExpiringSoon,
}) => {
  const currentStatus = request.derived_status ?? request.status;
  const statusClass = getStatusBadgeClass(currentStatus);
  const expiring = request.expires_at ? isExpiringSoon(request.expires_at) : false;
  const [justApproved, setJustApproved] = useState(false);
  const [actionTaken, setActionTaken] = useState<'approved' | 'rejected' | null>(null);
  const prevStatusRef = useRef<string | undefined>(currentStatus);

  // Track when status changes to approved/rejected for animation and button state
  useEffect(() => {
    if (currentStatus === 'AP' && prevStatusRef.current === 'PE' && request.approved_at) {
      setJustApproved(true);
      setActionTaken('approved');
      const timer = setTimeout(() => setJustApproved(false), 2000);
      return () => clearTimeout(timer);
    } else if (currentStatus === 'RE' && prevStatusRef.current === 'PE') {
      setActionTaken('rejected');
    } else if (currentStatus !== 'PE' && actionTaken) {
      // Reset action taken if status changes back to something else
      setActionTaken(null);
    }
    prevStatusRef.current = currentStatus;
  }, [currentStatus, request.approved_at, actionTaken]);

  const statusText =
    currentStatus === 'AP'
      ? '✓ Approved'
      : currentStatus === 'RT'
        ? '↩ Returned'
        : currentStatus === 'RE'
        ? '✕ Rejected'
          : currentStatus === 'EX'
          ? '⏰ Expired'
          : request.status_display || request.status;

  return (
    <div 
      className={`reservation-card ${justApproved ? 'reservation-card-highlight' : ''}`}
      onClick={() => onViewDetails && request.id && onViewDetails(request.id)}
      style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
    >
      {onToggleSelect && (
        <div className="card-checkbox-overlay">
          <input
            type="checkbox"
            className="card-checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect?.(request.id!, e as any)}
            onClick={(e) => e.stopPropagation()}
            disabled={currentStatus !== 'PE'}
          />
        </div>
      )}
      
      <div className="card-header">
        <div className="card-id">#{request.id}</div>
        <span className={`status-badge ${statusClass}`}>
          {statusText}
        </span>
      </div>

      <div className="card-body">
        <div className="card-info-item">
          <span className="info-label">Unit</span>
          <span className="info-value" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {request.inventory_units_details && request.inventory_units_details.length > 0
              ? request.inventory_units_details.map((u: InventoryUnitRW) => u.product_template_name || 'Unknown').join(', ')
              : request.inventory_unit_name || `Unit #${request.inventory_unit}`}
            {request.inventory_units_details && request.inventory_units_details.length > 1 && (
              <span className="unit-count-badge"> ({request.inventory_units_details.length})</span>
            )}
          </span>
        </div>

        <div className="card-info-item">
          <span className="info-label">Salesperson</span>
          <span className="info-value">{request.requesting_salesperson_username || '-'}</span>
        </div>

        <div className="card-info-item">
          <span className="info-label">Requested</span>
          <span className="info-value">
            {(() => {
              const formatted = formatDate(request.requested_at);
              if (typeof formatted === 'string') {
                return formatted;
              }
              return (
                <>
                  <div>{formatted.date}</div>
                  <div>{formatted.time}</div>
                </>
              );
            })()}
          </span>
        </div>

        {request.approved_at && (
          <div className="card-info-item">
            <span className="info-label">Approved</span>
            <span className="info-value">
              {(() => {
                const formatted = formatDate(request.approved_at);
                if (typeof formatted === 'string') {
                  return formatted;
                }
                return (
                  <>
                    <div>{formatted.date}</div>
                    <div>{formatted.time}</div>
                  </>
                );
              })()}
            </span>
          </div>
        )}

        {request.approved_by_username && (
          <div className="card-info-item">
            <span className="info-label">Approved By</span>
            <span className="info-value">{request.approved_by_username}</span>
          </div>
        )}

        {request.expires_at && (
          <div className={`card-info-item ${expiring ? 'info-expiring' : ''}`}>
            <span className="info-label">Expires</span>
            <span className="info-value">
              {(() => {
                const formatted = formatDate(request.expires_at);
                if (typeof formatted === 'string') {
                  return formatted;
                }
                return (
                  <>
                    <div>{formatted.date}</div>
                    <div>{formatted.time}</div>
                  </>
                );
              })()}
              {expiring && <span className="expiring-indicator">⚠️</span>}
            </span>
          </div>
        )}
      </div>

      <div className="card-footer">
        {/* Only show approve/reject buttons for inventory managers on pending requests */}
        {onApprove && onReject && currentStatus === 'PE' && (
          <div className="card-actions">
            {actionTaken === 'approved' ? (
              <button
                className="btn-action btn-approve"
                disabled={true}
                style={{ opacity: 1, cursor: 'default' }}
              >
                ✓ Approved
              </button>
            ) : actionTaken === 'rejected' ? (
              <button
                className="btn-action btn-reject"
                disabled={true}
                style={{ opacity: 1, cursor: 'default' }}
              >
                ✕ Rejected
              </button>
            ) : (
              <>
                <button
                  className="btn-action btn-approve"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionTaken('approved');
                    onApprove();
                  }}
                  disabled={isPending}
                >
                  {isPending ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="btn-action btn-reject"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionTaken('rejected');
                    onReject();
                  }}
                  disabled={isPending}
                >
                  {isPending ? 'Processing...' : 'Reject'}
                </button>
              </>
            )}
          </div>
        )}

        {onReturn && currentStatus === 'AP' && !hasPendingReturn && (
          <button
            className="btn-action btn-return"
            onClick={(e) => {
              e.stopPropagation();
              onReturn();
            }}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : '↩ Return'}
          </button>
        )}

        {hasPendingReturn && currentStatus === 'AP' && (
          <button
            className="btn-action btn-return"
            disabled={true}
            style={{ opacity: 0.7, cursor: 'default' }}
            title="Return request is pending approval"
          >
            Pending
          </button>
        )}

        {/* Status indicator removed - status is already shown in header */}
      </div>
    </div>
  );
};


