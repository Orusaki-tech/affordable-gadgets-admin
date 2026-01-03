import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  ProductsService,
  OrdersService,
  ReservationRequestsService,
  ReturnRequestsService,
  UnitTransfersService,
  NotificationsService,
  ProfilesService,
  LeadsService,
  UnitsService,
} from '../api/index';
import { UnitDetailsModal } from '../components/UnitDetailsModal';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  GridLegacy as Grid,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  PendingActions as PendingActionsIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

export const DashboardPage: React.FC = () => {
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  // Check superuser status from adminProfile.user if available
  const isSuperuser = adminProfile?.user?.is_superuser === true;

  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isSalesperson = hasRole('SP') && !isSuperuser;
  const isInventoryManager = hasRole('IM');
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isOrderManager = hasRole('OM') && !isSuperuser;

  // Fetch pending requests for salesperson
  const { data: myReservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => ReservationRequestsService.reservationRequestsList(1),
    enabled: isSalesperson,
  });

  // Fetch unclaimed leads for salesperson
  const { data: unclaimedLeads } = useQuery({
    queryKey: ['unclaimed-leads'],
    queryFn: async () => {
      const response = await LeadsService.leadsList(1);
      return {
        unclaimed: response.results?.filter((l) => !l.assigned_salesperson) || [],
        myLeads: response.results?.filter((l) => l.assigned_salesperson === adminProfile?.id) || [],
      };
    },
    enabled: isSalesperson,
  });

  // Fetch pending requests for inventory manager
  const { data: pendingRequests, isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const [reservations, returns, transfers] = await Promise.all([
        ReservationRequestsService.reservationRequestsList(1),
        ReturnRequestsService.returnRequestsList(1),
        UnitTransfersService.unitTransfersList(1),
      ]);
      return {
        reservations: reservations.results?.filter((r: any) => r.status === 'PE') || [],
        returns: returns.results?.filter((r: any) => r.status === 'PE') || [],
        transfers: transfers.results?.filter((t: any) => t.status === 'PE') || [],
        totalPending: 
          (reservations.results?.filter((r: any) => r.status === 'PE')?.length || 0) +
          (returns.results?.filter((r: any) => r.status === 'PE')?.length || 0) +
          (transfers.results?.filter((t: any) => t.status === 'PE')?.length || 0),
      };
    },
    enabled: isInventoryManager || isSuperuser,
  });

  // Fetch unread notifications for superuser
  const { data: unreadNotifications } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => NotificationsService.notificationsUnreadCountRetrieve(),
    enabled: isSuperuser,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductsService.productsList(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrdersService.ordersList(),
  });

  // Fetch all units - fetch multiple pages if needed to get all units
  // Only fetch for Inventory Managers and Superusers (Content Creators don't have access)
  const { 
    data: allUnitsData, 
    isLoading: allUnitsLoading,
    error: allUnitsError 
  } = useQuery({
    queryKey: ['units', 'all'],
    queryFn: async () => {
      // Fetch first page
      const firstPage = await UnitsService.unitsList(undefined, undefined, 1);
      console.log('📦 First page response:', firstPage);
      
      // If there are more pages, fetch them all
      if (firstPage.next) {
        const allResults = [...(firstPage.results || [])];
        let currentPage = 2;
        let hasMore: boolean = !!firstPage.next;
        
        // Fetch remaining pages (DRF typically has max 100 per page, so fetch up to 10 pages)
        while (hasMore && currentPage <= 10) {
          try {
            const nextPage = await UnitsService.unitsList(undefined, undefined, currentPage);
            if (nextPage.results && nextPage.results.length > 0) {
              allResults.push(...nextPage.results);
            }
            hasMore = !!nextPage.next; // Convert to boolean
            currentPage++;
          } catch (err) {
            console.error('Error fetching page', currentPage, err);
            break;
          }
        }
        
        return {
          count: allResults.length,
          results: allResults,
          next: null,
          previous: null,
        };
      }
      
      return firstPage;
    },
    enabled: !isContentCreator && !isOrderManager && (isInventoryManager || isSuperuser || !isLoadingProfile), // Only fetch for authorized users (Inventory Managers and Superusers, not Order Managers or Content Creators)
    retry: 1,
  });

  // Filter to available units client-side, but also show all units count
  const availableUnits = React.useMemo(() => {
    if (!allUnitsData?.results) return null;
    
    const available = allUnitsData.results.filter((unit: any) => unit.sale_status === 'AV');
    console.log('✅ Available units filtered:', available.length, 'of', allUnitsData.results.length);
    console.log('📊 Units by status:', {
      AV: allUnitsData.results.filter((u: any) => u.sale_status === 'AV').length,
      SD: allUnitsData.results.filter((u: any) => u.sale_status === 'SD').length,
      RT: allUnitsData.results.filter((u: any) => u.sale_status === 'RT').length,
      RS: allUnitsData.results.filter((u: any) => u.sale_status === 'RS').length,
      total: allUnitsData.results.length,
    });
    
    return {
      count: available.length,
      results: available,
      totalCount: allUnitsData.results.length, // Include total count
    };
  }, [allUnitsData]);

  const availableUnitsLoading = allUnitsLoading;
  const availableUnitsError = allUnitsError;

  // Redirect salespersons to products page (they don't have access to dashboard)
  if (!isLoadingProfile && isSalesperson) {
    return <Navigate to="/products" replace />;
  }

  // Redirect Content Creators to their dashboard
  if (!isLoadingProfile && isContentCreator) {
    return <Navigate to="/content-creator/dashboard" replace />;
  }

  // Stat Card Component
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    error?: boolean;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  }> = ({ title, value, icon, subtitle, error, color = 'primary' }) => (
    <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              Error loading data
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={productsLoading ? '...' : products?.count || 0}
            icon={<InventoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={ordersLoading ? '...' : orders?.count || 0}
            icon={<ShoppingCartIcon />}
            color="secondary"
          />
        </Grid>
        {!isContentCreator && !isOrderManager && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Available Units"
              value={availableUnitsLoading ? '...' : availableUnits?.count || 0}
              icon={<CheckCircleIcon />}
              subtitle={availableUnits?.totalCount !== undefined ? `Total Units: ${availableUnits.totalCount}` : undefined}
              error={!!availableUnitsError}
              color="success"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: '100%', 
              transition: 'transform 0.2s', 
              '&:hover': { transform: 'translateY(-4px)' },
              opacity: 0.6,
              position: 'relative'
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="text.secondary">
                    —
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                    Coming soon
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'info.light',
                    color: 'info.main',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5,
                  }}
                >
                  <TrendingUpIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Role-based Stats */}
        {isSalesperson && myReservations && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="My Reservations"
              value={myReservations.results?.filter((r: any) => r.status === 'PE').length || 0}
              icon={<PendingActionsIcon />}
              subtitle="Pending"
              color="warning"
            />
          </Grid>
        )}
        {(isInventoryManager || isSuperuser) && pendingRequests && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Approvals"
              value={pendingRequests.totalPending || 0}
              icon={<AssignmentIcon />}
              subtitle={`${pendingRequests.reservations?.length || 0} reservations, ${pendingRequests.returns?.length || 0} returns, ${pendingRequests.transfers?.length || 0} transfers`}
              color="warning"
            />
          </Grid>
        )}
        {isSuperuser && unreadNotifications && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unread Notifications"
              value={(unreadNotifications as any)?.unread_count || 0}
              icon={<NotificationsIcon />}
              subtitle="Requires attention"
              color="error"
            />
          </Grid>
        )}
      </Grid>

      {/* Pending Approvals Section for Inventory Managers */}
      {(isInventoryManager || isSuperuser) && pendingRequests && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Pending Approvals
          </Typography>
            {pendingRequestsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
            ) : pendingRequests.totalPending === 0 ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              All requests have been processed. No pending approvals.
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
                {pendingRequests.reservations && pendingRequests.reservations.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Reservation Requests
                        </Typography>
                        <Chip label={pendingRequests.reservations.length} color="primary" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Pending reservation requests awaiting approval
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => navigate('/reservation-requests?status=PE')}
                        sx={{ mb: 2 }}
                      >
                        View & Approve
                      </Button>
                      <Stack spacing={1}>
                    {pendingRequests.reservations.slice(0, 3).map((req: any) => (
                          <Box key={req.id} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {req.inventory_unit_name || `Unit #${req.inventory_unit}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {req.requesting_salesperson_username}
                            </Typography>
                          </Box>
                    ))}
                    {pendingRequests.reservations.length > 3 && (
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                        +{pendingRequests.reservations.length - 3} more
                          </Typography>
                    )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                )}

                {pendingRequests.returns && pendingRequests.returns.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Return Requests
                        </Typography>
                        <Chip label={pendingRequests.returns.length} color="primary" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Pending return requests awaiting approval
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => navigate('/return-requests?status=PE')}
                        sx={{ mb: 2 }}
                      >
                        View & Approve
                      </Button>
                      <Stack spacing={1}>
                    {pendingRequests.returns.slice(0, 3).map((req: any) => (
                          <Box key={req.id} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {req.inventory_units_count || 0} unit(s)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {req.requesting_salesperson_username}
                            </Typography>
                          </Box>
                    ))}
                    {pendingRequests.returns.length > 3 && (
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                        +{pendingRequests.returns.length - 3} more
                          </Typography>
                    )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                )}

                {pendingRequests.transfers && pendingRequests.transfers.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Unit Transfers
                        </Typography>
                        <Chip label={pendingRequests.transfers.length} color="primary" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Pending unit transfer requests awaiting approval
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => navigate('/unit-transfers?status=PE')}
                        sx={{ mb: 2 }}
                      >
                        View & Approve
                      </Button>
                      <Stack spacing={1}>
                    {pendingRequests.transfers.slice(0, 3).map((transfer: any) => (
                          <Box key={transfer.id} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {transfer.inventory_unit_name || `Unit #${transfer.inventory_unit}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transfer.from_salesperson_username} → {transfer.to_salesperson_username}
                            </Typography>
                          </Box>
                    ))}
                    {pendingRequests.transfers.length > 3 && (
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                        +{pendingRequests.transfers.length - 3} more
                          </Typography>
                    )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                )}
            </Grid>
            )}
        </Paper>
      )}
      
      {/* Available Inventory Section - Only show for Inventory Managers and Superusers */}
      {!isContentCreator && !isOrderManager && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Available Inventory
          </Typography>
            {availableUnitsError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Error loading available units
              </Typography>
              <Typography variant="body2">
                {(availableUnitsError as any)?.message || 'Unknown error'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Status: {(availableUnitsError as any)?.status || 'N/A'}
              </Typography>
            </Alert>
            ) : availableUnitsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
            ) : allUnitsData?.results && allUnitsData.results.length > 0 ? (
            <>
              <TableContainer component={Paper} elevation={0} sx={{ mt: 2, maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell><strong>Serial</strong></TableCell>
                      <TableCell><strong>Brand</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Condition</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Price</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allUnitsData.results.slice(0, 20).map((unit: any) => {
                      const isAvailable = unit.sale_status === 'AV';
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'AV': return { bg: 'success.light', color: 'success.dark' };
                          case 'SD': return { bg: 'warning.light', color: 'warning.dark' };
                          case 'RT': return { bg: 'error.light', color: 'error.dark' };
                          case 'PP': return { bg: 'info.light', color: 'info.dark' };
                          case 'RS': return { bg: 'warning.light', color: 'warning.dark' };
                          default: return { bg: 'grey.300', color: 'grey.700' };
                        }
                      };
                      const statusColors = getStatusColor(unit.sale_status);
                      const statusLabels: Record<string, string> = {
                        'AV': 'Available',
                        'SD': 'Sold',
                        'RT': 'Returned',
                        'PP': 'Pending Payment',
                        'RS': 'Reserved',
                      };
                      return (
                        <TableRow
                          key={unit.id} 
                          onClick={() => unit.id && setSelectedUnitId(unit.id)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: isAvailable ? 'success.light' : 'transparent',
                            '&:hover': {
                              backgroundColor: isAvailable ? 'success.main' : 'action.hover',
                            },
                          }}
                        >
                          <TableCell>{unit.product_template_name || '-'}</TableCell>
                          <TableCell>{unit.serial_number || '-'}</TableCell>
                          <TableCell>{unit.product_brand || '-'}</TableCell>
                          <TableCell>{unit.product_type || '-'}</TableCell>
                          <TableCell>{unit.condition || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusLabels[unit.sale_status] || unit.sale_status || '-'}
                              size="small"
                              sx={{
                                backgroundColor: statusColors.bg,
                                color: statusColors.color,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {unit.selling_price
                              ? `KES ${Number(unit.selling_price).toFixed(2)}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
                
                {/* Status Legend */}
              <Box mt={2} display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <Typography variant="caption" fontWeight="bold">Status Legend:</Typography>
                {[
                  { code: 'AV', label: 'Available', color: 'success' },
                  { code: 'SD', label: 'Sold', color: 'warning' },
                  { code: 'RT', label: 'Returned', color: 'error' },
                  { code: 'RS', label: 'Reserved', color: 'warning' },
                ].map(({ code, label, color }) => (
                  <Chip
                    key={code}
                    label={`${code} - ${label}`}
                    size="small"
                    color={color as any}
                    variant="outlined"
                  />
                ))}
              </Box>

                {allUnitsData.results.length > 20 && (
                <Typography variant="body2" color="text.secondary" mt={2}>
                    Showing 20 of {allUnitsData.results.length} total units
                </Typography>
                )}
                {availableUnits?.count !== undefined && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                    Available (AV): {availableUnits.count} | Total: {availableUnits.totalCount || allUnitsData.results.length}
                </Typography>
                )}
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>No units found.</Alert>
          )}
        </Paper>
      )}

      {/* Role-based Sections */}
      {isSalesperson && unclaimedLeads && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              Unclaimed Leads
            </Typography>
            <Button variant="text" onClick={() => navigate('/leads')}>
              View All →
            </Button>
          </Stack>
          {unclaimedLeads.unclaimed && unclaimedLeads.unclaimed.length > 0 ? (
            <Grid container spacing={2}>
              {unclaimedLeads.unclaimed.slice(0, 5).map((lead: any) => (
                <Grid item xs={12} sm={6} md={4} key={lead.id}>
                  <Card
                    elevation={2}
                    sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
                    onClick={() => navigate('/leads')}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {lead.customer_name || 'Customer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Value: KES {lead.total_value?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead.lead_reference}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No unclaimed leads available</Alert>
          )}
        </Paper>
      )}

      {isSalesperson && myReservations && myReservations.results && myReservations.results.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            My Reservation Requests
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Unit</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Requested</strong></TableCell>
                  <TableCell><strong>Expires</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {myReservations.results.slice(0, 5).map((req: any) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.inventory_unit_name || `Unit #${req.inventory_unit}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.status_display || req.status}
                        size="small"
                        color={req.status === 'PE' ? 'warning' : req.status === 'AP' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(req.requested_at || '').toLocaleDateString()}</TableCell>
                    <TableCell>{req.expires_at ? new Date(req.expires_at).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Recent Activity
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 4,
            borderRadius: 2,
            backgroundColor: 'action.hover',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              mb: 2,
              color: 'text.secondary',
              fontSize: '3rem',
            }}
          >
            📊
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Activity feed coming soon
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Track recent orders, inventory changes, and system events
          </Typography>
        </Box>
      </Paper>

      {/* Unit Details Modal */}
      {selectedUnitId && (
        <UnitDetailsModal
          unitId={selectedUnitId}
          onClose={() => setSelectedUnitId(null)}
        />
      )}
    </Box>
  );
};

