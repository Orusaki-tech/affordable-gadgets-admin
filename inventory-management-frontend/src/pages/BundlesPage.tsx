import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService, Brand, BundlesService } from '../api/index';
import { BundleForm } from '../components/BundleForm';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  GridLegacy as Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export const BundlesPage: React.FC = () => {
  const [page] = useState(1);
  const [editingBundle, setEditingBundle] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteBundle, setDeleteBundle] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: true,
  });

  const hasRole = (roleName: string) => {
    if (!adminProfile?.roles || adminProfile.roles.length === 0) return false;
    return adminProfile.roles.some((role: any) => {
      const roleCode = role.name || role.role_code;
      const roleNameCheck = role.display_name || role.role_name;
      return roleCode === roleName ||
        roleNameCheck?.toLowerCase() === roleName.toLowerCase() ||
        roleNameCheck?.toLowerCase().includes(roleName.toLowerCase());
    });
  };

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const isGlobalAdmin = (adminProfile as any)?.is_global_admin === true;
  const isMarketingManager = hasRole('MM') && !isSuperuser;
  const canManageBundles = isSuperuser || isGlobalAdmin || isMarketingManager;

  const adminBrands = useMemo(() => {
    const brands = (adminProfile as any)?.brands || [];
    return brands.filter((b: Brand) => b.id !== undefined);
  }, [adminProfile]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bundles', page],
    queryFn: () => BundlesService.bundlesList(page),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => BundlesService.bundlesDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      setDeleteBundle(null);
    },
  });

  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setEditingBundle(null);
    queryClient.invalidateQueries({ queryKey: ['bundles'] });
  };

  const formatPricing = (bundle: any) => {
    if (bundle.pricing_mode === 'FX') {
      return `KES ${bundle.bundle_price}`;
    }
    if (bundle.pricing_mode === 'PC') {
      return `${bundle.discount_percentage}% off items`;
    }
    if (bundle.pricing_mode === 'AM') {
      return `KES ${bundle.discount_amount} off items`;
    }
    return 'Custom pricing';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading bundles: {(error as Error).message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Bundles
        </Typography>
        {canManageBundles && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingBundle(null);
              setShowCreateModal(true);
            }}
          >
            Create Bundle
          </Button>
        )}
      </Box>

      <Paper elevation={1} sx={{ p: 2 }}>
        {data?.results?.length ? (
          <Grid container spacing={2}>
            {data.results.map((bundle: any) => (
              <Grid item xs={12} sm={6} md={4} key={bundle.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {bundle.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Main product: {bundle.main_product_name || bundle.main_product}
                      </Typography>
                      <Chip
                        size="small"
                        label={bundle.is_currently_active ? 'Active' : bundle.is_active ? 'Scheduled' : 'Inactive'}
                        color={bundle.is_currently_active ? 'success' : bundle.is_active ? 'warning' : 'default'}
                      />
                      <Typography variant="body2">Pricing: {formatPricing(bundle)}</Typography>
                      <Typography variant="body2">Items: {bundle.items?.length || 0}</Typography>
                    </Stack>
                  </CardContent>
                  {canManageBundles && (
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditingBundle(bundle);
                          setShowCreateModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteBundle(bundle)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No bundles found.
          </Typography>
        )}
      </Paper>

      {showCreateModal && (
        <BundleForm
          bundle={editingBundle}
          onClose={() => {
            setShowCreateModal(false);
            setEditingBundle(null);
          }}
          onSuccess={handleFormSuccess}
          adminBrands={adminBrands}
        />
      )}

      <Dialog open={!!deleteBundle} onClose={() => setDeleteBundle(null)}>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Confirm Delete</Typography>
            <Button onClick={() => setDeleteBundle(null)}>
              <CloseIcon />
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>Delete bundle "{deleteBundle?.title}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBundle(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => deleteBundle?.id && deleteMutation.mutate(deleteBundle.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
