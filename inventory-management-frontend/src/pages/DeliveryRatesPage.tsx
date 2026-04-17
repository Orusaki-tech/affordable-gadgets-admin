import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../api/index';
import { getDefaultApiHeaders } from '../api/config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const isWardAllowedCounty = (county: string | undefined | null) => {
  const normalized = (county || '').trim().toLowerCase();
  return normalized === 'nairobi' || normalized === 'kiambu';
};

const extractApiErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `${response.status} ${response.statusText}`.trim() || 'Request failed';
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== 'object') return fallback;

  const anyBody = body as any;
  if (typeof anyBody.detail === 'string' && anyBody.detail.trim()) return anyBody.detail.trim();

  // DRF ValidationError commonly returns: { field: ["msg"] } or { non_field_errors: ["msg"] }
  const messages: string[] = [];
  for (const [key, value] of Object.entries(anyBody)) {
    if (typeof value === 'string') {
      messages.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      const joined = value.filter((v) => typeof v === 'string').join(', ');
      if (joined) messages.push(`${key}: ${joined}`);
    }
  }
  return messages.length ? messages.join(' | ') : fallback;
};

type DeliveryRate = {
  id?: number;
  county?: string;
  ward?: string | null;
  price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type DeliveryRatesResponse = {
  results?: DeliveryRate[];
  count?: number;
  next?: string | null;
  previous?: string | null;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return getDefaultApiHeaders(token, {
    'Content-Type': 'application/json',
  });
};

const fetchDeliveryRates = async (): Promise<DeliveryRate[]> => {
  const response = await fetch(`${OpenAPI.BASE}/delivery-rates/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to load delivery rates');
  }
  const data: DeliveryRate[] | DeliveryRatesResponse = await response.json();
  if (Array.isArray(data)) {
    return data;
  }
  return data.results || [];
};

export const DeliveryRatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DeliveryRate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryRate | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['delivery-rates'],
    queryFn: fetchDeliveryRates,
  });

  const filteredRates = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((rate) => {
      return (
        (rate.county || '').toLowerCase().includes(term) ||
        (rate.ward || '').toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const createMutation = useMutation({
    mutationFn: async (payload: DeliveryRate) => {
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      setShowModal(false);
      setEditing(null);
      setModalError(null);
    },
    onError: (err) => setModalError((err as Error).message || 'Failed to create rate'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: DeliveryRate) => {
      if (!payload.id) throw new Error('Missing delivery rate id');
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/${payload.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      setShowModal(false);
      setEditing(null);
      setModalError(null);
    },
    onError: (err) => setModalError((err as Error).message || 'Failed to update rate'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete rate');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      setDeleteTarget(null);
    },
  });

  const handleEdit = (rate: DeliveryRate) => {
    setEditing(rate);
    setShowModal(true);
    setModalError(null);
  };

  const handleCreate = () => {
    setEditing(null);
    setShowModal(true);
    setModalError(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading delivery rates: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Delivery Rates</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Rate
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
            <TextField
              fullWidth
              placeholder="Search by county or ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>County</TableCell>
                  <TableCell>Ward</TableCell>
                  <TableCell>Price (KES)</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No delivery rates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.county || '-'}</TableCell>
                      <TableCell>{rate.ward || '-'}</TableCell>
                      <TableCell>{Number(rate.price || 0).toFixed(2)}</TableCell>
                      <TableCell>{rate.is_active ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEdit(rate)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => setDeleteTarget(rate)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {showModal && (
        <DeliveryRateModal
          rate={editing}
          errorMessage={modalError}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
            setModalError(null);
          }}
          onSubmit={(payload) => {
            if (payload.id) {
              updateMutation.mutate(payload);
            } else {
              createMutation.mutate(payload);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deleteTarget && (
        <Dialog open onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete delivery rate?</DialogTitle>
          <DialogContent>
            This will remove the rate for {deleteTarget.county}
            {deleteTarget.ward ? ` - ${deleteTarget.ward}` : ''}.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button color="error" onClick={() => deleteTarget.id && deleteMutation.mutate(deleteTarget.id)}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

interface DeliveryRateModalProps {
  rate: DeliveryRate | null;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: DeliveryRate) => void;
  isLoading: boolean;
}

const DeliveryRateModal: React.FC<DeliveryRateModalProps> = ({
  rate,
  errorMessage,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<DeliveryRate>({
    id: rate?.id,
    county: rate?.county || '',
    ward: rate?.ward || '',
    price: rate?.price ?? 0,
    is_active: rate?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.county?.trim()) {
      alert('County is required');
      return;
    }
    onSubmit({
      ...formData,
      county: formData.county?.trim(),
      ward: isWardAllowedCounty(formData.county) ? formData.ward?.trim() || null : null,
    });
  };

  const wardAllowed = isWardAllowedCounty(formData.county);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{rate ? 'Edit Delivery Rate' : 'Create Delivery Rate'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="County"
            value={formData.county || ''}
            onChange={(e) => {
              const nextCounty = e.target.value;
              const nextWardAllowed = isWardAllowedCounty(nextCounty);
              setFormData((prev) => ({
                ...prev,
                county: nextCounty,
                // Enforce policy in UI: wards only for Nairobi/Kiambu
                ward: nextWardAllowed ? prev.ward : '',
              }));
            }}
            required
            disabled={isLoading}
          />
          <TextField
            label="Ward (optional)"
            value={formData.ward || ''}
            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            disabled={isLoading || !wardAllowed}
            helperText={
              wardAllowed ? 'Only use ward for Nairobi or Kiambu.' : 'Ward pricing only allowed for Nairobi/Kiambu.'
            }
          />
          <TextField
            label="Price (KES)"
            type="number"
            inputProps={{ step: 0.01 }}
            value={formData.price ?? 0}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            disabled={isLoading}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : rate ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
