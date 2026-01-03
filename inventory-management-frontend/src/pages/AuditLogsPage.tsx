import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface AuditLog {
  id: number;
  user: number | null;
  user_username: string | null;
  user_email: string | null;
  action: string;
  action_display: string;
  model_name: string;
  object_id: number;
  object_repr: string;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  user_agent: string;
  timestamp: string;
}

interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    model_name: '',
    date_from: '',
    date_to: '',
  });
  const [viewDataDialog, setViewDataDialog] = useState<{ open: boolean; data: any; title: string }>({
    open: false,
    data: null,
    title: '',
  });

  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.action) params.append('action', filters.action);
    if (filters.model_name) params.append('model_name', filters.model_name);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    params.append('page', page.toString());
    return params.toString();
  };

  const { data, isLoading, error } = useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', page, filters],
    queryFn: async () => {
      const queryString = buildQueryString();
      const response = await fetch(`/api/inventory/audit-logs/?${queryString}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  });

  // Role checks and redirect (after all hooks are declared)
  const isSuperuser = adminProfile?.user?.is_superuser === true;

  // Only Superusers can access audit logs
  if (!isLoadingProfile && !isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      model_name: '',
      date_from: '',
      date_to: '',
    });
    setPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderValue = (value: any, label: string) => {
    if (!value) return '-';
    if (typeof value === 'object') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setViewDataDialog({ open: true, data: value, title: label })}
          sx={{ fontSize: '0.75rem', textTransform: 'none' }}
        >
          View Data
        </Button>
      );
    }
    return (
      <Typography variant="body2" sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
        {String(value)}
      </Typography>
    );
  };

  const getActionColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
      'CR': 'success',
      'UP': 'info',
      'DL': 'error',
      'AP': 'success',
      'RJ': 'error',
      'RS': 'warning',
      'RL': 'info',
      'TR': 'info',
      'AR': 'default',
      'BU': 'warning',
      'PC': 'warning',
      'SC': 'info',
    };
    return colorMap[action] || 'default';
  };

  const hasActiveFilters = filters.action || filters.model_name || filters.date_from || filters.date_to;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete system activity trail and compliance records
          </Typography>
        </Box>
      </Box>

      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filters.action}
              label="Action Type"
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="CR">Create</MenuItem>
              <MenuItem value="UP">Update</MenuItem>
              <MenuItem value="DL">Delete</MenuItem>
              <MenuItem value="AP">Approve</MenuItem>
              <MenuItem value="RJ">Reject</MenuItem>
              <MenuItem value="RS">Reserve</MenuItem>
              <MenuItem value="RL">Release</MenuItem>
              <MenuItem value="TR">Transfer</MenuItem>
              <MenuItem value="AR">Archive</MenuItem>
              <MenuItem value="BU">Bulk Update</MenuItem>
              <MenuItem value="PC">Price Change</MenuItem>
              <MenuItem value="SC">Status Change</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Model Type</InputLabel>
            <Select
              value={filters.model_name}
              label="Model Type"
              onChange={(e) => handleFilterChange('model_name', e.target.value)}
            >
              <MenuItem value="">All Models</MenuItem>
              <MenuItem value="InventoryUnit">Inventory Unit</MenuItem>
              <MenuItem value="ReservationRequest">Reservation Request</MenuItem>
              <MenuItem value="ReturnRequest">Return Request</MenuItem>
              <MenuItem value="UnitTransfer">Unit Transfer</MenuItem>
              <MenuItem value="Product">Product</MenuItem>
              <MenuItem value="Order">Order</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Date From"
            type="date"
            size="small"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            label="Date To"
            type="date"
            size="small"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Results */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading logs: {(error as Error).message}
        </Alert>
      ) : (
        <>
          {data && (
            <Box mb={2}>
              <Chip
                label={`${data.count} total record${data.count !== 1 ? 's' : ''}`}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {data?.results.length === 0 ? (
            <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No audit logs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no audit logs in the system yet.'}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Object</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Changes</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.results.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {log.user_username ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                              {log.user_username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {log.user_email}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="System" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action_display}
                          color={getActionColor(log.action)}
                          size="small"
                          sx={{ fontSize: '0.75rem', height: '24px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                        {log.model_name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            #{log.object_id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
                            {log.object_repr}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', maxWidth: '300px' }}>
                        <Stack spacing={0.5}>
                          {log.old_value && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                Old:
                              </Typography>
                              <Box mt={0.5}>
                                {renderValue(log.old_value, 'Old Value')}
                              </Box>
                            </Box>
                          )}
                          {log.new_value && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                New:
                              </Typography>
                              <Box mt={0.5}>
                                {renderValue(log.new_value, 'New Value')}
                              </Box>
                            </Box>
                          )}
                          {!log.old_value && !log.new_value && (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {data && data.count > 25 && (
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.previous || page === 1}
                >
                  Previous
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {Math.ceil(data.count / 25)} ({data.count} total)
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.next}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          )}
        </>
      )}

      {/* View Data Dialog */}
      <Dialog
        open={viewDataDialog.open}
        onClose={() => setViewDataDialog({ open: false, data: null, title: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{viewDataDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Box
              component="pre"
              sx={{
                backgroundColor: 'action.hover',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(viewDataDialog.data, null, 2)}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDataDialog({ open: false, data: null, title: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

