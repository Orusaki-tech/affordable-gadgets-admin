import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Promotion,
  Brand,
  PromotionsService,
  ProfilesService,
} from '../api/index';
import { useAuth } from '../contexts/AuthContext';
import { PromotionForm } from '../components/PromotionForm';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  GridLegacy as Grid,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

export const PromotionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    is_active: '',
    brand: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPromotionTypesModal, setShowPromotionTypesModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch admin profile to check roles and brands
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: true,
  });

  const hasRole = (roleName: string) => {
    if (!adminProfile?.roles || adminProfile.roles.length === 0) return false;
    return adminProfile.roles.some((role: any) => {
      // Check both name and role_code fields (name is the role code like 'MM', 'SP', etc.)
      const roleCode = role.name || role.role_code;
      const roleNameCheck = role.display_name || role.role_name;
      // Check exact match for role code (e.g., 'MM') or case-insensitive match for display name
      return roleCode === roleName || 
             roleNameCheck?.toLowerCase() === roleName.toLowerCase() ||
             roleNameCheck?.toLowerCase().includes(roleName.toLowerCase());
    });
  };

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const isGlobalAdmin = (adminProfile as any)?.is_global_admin === true;
  const isMarketingManager = hasRole('MM') && !isSuperuser;
  const canCreatePromotions = isSuperuser || isGlobalAdmin || isMarketingManager;

  // Get admin's brands
  const adminBrands = useMemo(() => {
    const brands = (adminProfile as any)?.brands || [];
    return brands.filter((b: Brand) => b.id !== undefined);
  }, [adminProfile]);

  // Reset page to 1 when is_active filter changes
  useEffect(() => {
    setPage(1);
  }, [filters.is_active]);

  // Fetch promotion types
  const { data: promotionTypesData } = useQuery({
    queryKey: ['promotion-types'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
      
      const response = await fetch(`${baseUrl}/promotion-types/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch promotion types');
      }
      
      return await response.json();
    },
  });

  // Fetch promotions - is_active filtering is done client-side (API has no filter param)
  const { data, isLoading, error } = useQuery({
    queryKey: ['promotions', page, filters.is_active],
    queryFn: () => PromotionsService.promotionsList(page),
  });

  // Fetch all promotions for stats (without is_active filter)
  const { data: allPromotionsDataForStats } = useQuery({
    queryKey: ['promotions', 'all', 'stats'],
    queryFn: () => PromotionsService.promotionsList(1),
  });

  // Client-side filtering by search, brand, and is_active (not supported by API)
  const filteredPromotions = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // #region agent log
    if (data.results && data.results.length > 0) {
      data.results.forEach((promo: any, idx: number) => {
        fetch('http://127.0.0.1:7247/ingest/9b5e4ea3-0114-40d6-8942-833733fd214b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PromotionsPage.tsx:140',message:'Promotion image data from API',data:{promotionId:promo.id,title:promo.title,banner_image:promo.banner_image,banner_image_url:promo.banner_image_url,bannerImageType:typeof promo.banner_image,bannerImageUrlType:typeof promo.banner_image_url,hasBannerImage:!!promo.banner_image,hasBannerImageUrl:!!promo.banner_image_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      });
    }
    // #endregion
    
    // Filter by active status
    if (filters.is_active !== '') {
      const isActive = filters.is_active === 'true';
      filtered = filtered.filter((promo) => Boolean(promo.is_currently_active) === isActive);
    }

    // Filter by brand
    if (filters.brand) {
      const brandId = parseInt(filters.brand);
      filtered = filtered.filter((promo) => promo.brand === brandId);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((promo) => {
        const titleMatch = promo.title?.toLowerCase().includes(searchLower);
        const descMatch = promo.description?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      });
    }
    
    return filtered;
  }, [data, search, filters.brand, filters.is_active]);

  // Calculate statistics from all promotions (not filtered by is_active)
  const stats = useMemo(() => {
    const allPromotions = allPromotionsDataForStats?.results || [];
    const active = allPromotions.filter((p) => p.is_currently_active).length;
    const inactive = allPromotions.length - active;
    return {
      total: allPromotionsDataForStats?.count || allPromotions.length,
      active,
      inactive,
    };
  }, [allPromotionsDataForStats]);

  const [deleteConfirmPromotion, setDeleteConfirmPromotion] = useState<Promotion | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => PromotionsService.promotionsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setSnackbar({ open: true, message: 'Promotion deleted successfully', severity: 'success' });
      setDeleteConfirmPromotion(null);
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Unknown error';
      setSnackbar({ open: true, message: `Failed to delete promotion: ${errorMessage}`, severity: 'error' });
      setDeleteConfirmPromotion(null);
    },
  });

  const handleDelete = (promotion: Promotion) => {
    if (!promotion.id) return;
    
    // Marketing Managers now have full access - no restriction needed
    setDeleteConfirmPromotion(promotion);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmPromotion?.id) {
      deleteMutation.mutate(deleteConfirmPromotion.id);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    // Marketing Managers now have full access - no restriction needed
    setEditingPromotion(promotion);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingPromotion(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['promotions'] });
    queryClient.refetchQueries({ queryKey: ['promotions'] });
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ is_active: '', brand: '' });
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (filters.is_active) count++;
    if (filters.brand) count++;
    return count;
  }, [search, filters]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_percentage) {
      return `${promo.discount_percentage}% OFF`;
    }
    if (promo.discount_amount) {
      return `KES ${promo.discount_amount} OFF`;
    }
    return 'No discount';
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
        <Alert severity="error">Error loading promotions: {(error as Error).message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        sx={{
          marginLeft: { xs: '80px', sm: 0 },
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Promotions
        </Typography>
          {canCreatePromotions && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setShowPromotionTypesModal(true)}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                px: 2,
                py: 0.75,
              }}
            >
              Manage Types
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                px: 2,
                py: 0.75,
              }}
            >
              Create Promotion
            </Button>
          </Stack>
        )}
      </Box>

      {/* Summary Statistics Cards */}
      {data && (
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <Button
            variant={filters.is_active === '' ? 'contained' : 'outlined'}
            onClick={() => setFilters({ ...filters, is_active: '' })}
            sx={{
              minWidth: '120px',
              flexDirection: 'column',
              py: 2,
              px: 3,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
              {(stats.total ?? 0).toLocaleString()}
            </Typography>
          </Button>
          <Button
            variant={filters.is_active === 'true' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setFilters({ ...filters, is_active: 'true' })}
            sx={{
              minWidth: '120px',
              flexDirection: 'column',
              py: 2,
              px: 3,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Active
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
              {(stats.active ?? 0).toLocaleString()}
            </Typography>
          </Button>
          <Button
            variant={filters.is_active === 'false' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => setFilters({ ...filters, is_active: 'false' })}
            sx={{
              minWidth: '120px',
              flexDirection: 'column',
              py: 2,
              px: 3,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Inactive
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
              {(stats.inactive ?? 0).toLocaleString()}
            </Typography>
          </Button>
        </Stack>
      )}

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search promotions by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearch('')} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            endIcon={activeFilterCount > 0 ? <Chip label={activeFilterCount} size="small" color="primary" /> : null}
            sx={{ 
              flexShrink: 0,
              borderRadius: 1,
              textTransform: 'none',
              px: 2,
              py: 0.75,
            }}
          >
            Filters
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="text"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ 
                flexShrink: 0,
                borderRadius: 1,
                textTransform: 'none',
                px: 1.5,
                py: 0.75,
              }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {showFilters && (
          <Box mt={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Brand</InputLabel>
                <Select
                value={filters.brand}
                  label="Brand"
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              >
                  <MenuItem value="">All Brands</MenuItem>
                {adminBrands.map((brand: Brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                    {brand.name || brand.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Promotions Cards Grid */}
        {filteredPromotions.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {search || activeFilterCount > 0
              ? 'No promotions match your filters'
              : 'No promotions found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search || activeFilterCount > 0
              ? 'Try adjusting your search terms or filters to see more promotions.'
              : canCreatePromotions
                ? 'Create your first promotion to get started!'
                : 'There are no promotions in the system yet.'}
          </Typography>
          {canCreatePromotions && !search && activeFilterCount === 0 && (
            <Button 
              variant="contained" 
              size="small"
              startIcon={<AddIcon />} 
              onClick={handleCreate}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                px: 2,
                py: 0.75,
              }}
            >
              Create Promotion
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredPromotions.map((promotion) => {
            // Superusers, Global Admins, and Marketing Managers can edit/delete all promotions (full access)
            const canEdit = isSuperuser || isGlobalAdmin || isMarketingManager;
            return (
              <Grid item xs={12} sm={6} md={4} key={promotion.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                onClick={() => {
                  setSelectedPromotion(promotion);
                  setShowDetailsModal(true);
                }}
              >
                {/* Banner Image or Placeholder */}
                  <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  {promotion.banner_image ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={promotion.banner_image}
                        alt={promotion.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                      </Box>
                  )}
                  {/* Status Badge Overlay */}
                    <Chip
                      label={promotion.is_currently_active ? 'Active' : promotion.is_active ? 'Scheduled' : 'Inactive'}
                      color={promotion.is_currently_active ? 'success' : promotion.is_active ? 'warning' : 'default'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem' }}>
                      {promotion.title}
                    </Typography>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Type:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {(promotion as any).promotion_type_name || 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Discount:
                        </Typography>
                        <Chip
                          label={formatDiscount(promotion)}
                          size="small"
                          color="primary"
                          icon={<LocalOfferIcon />}
                          sx={{ fontSize: '0.75rem', height: '24px' }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Brand:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {promotion.brand_name || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  
                  {/* Display Locations */}
                  {((promotion as any).display_locations || []).length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                      {((promotion as any).display_locations || []).map((loc: string) => (
                          <Chip
                            key={loc}
                            label={loc.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.6875rem', height: '20px', mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                  
                  {/* Actions */}
                    {canEdit && (
                    <CardActions sx={{ p: 1.5, pt: 0, justifyContent: 'flex-end', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(promotion);
                        }}
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          px: 1.5,
                          py: 0.5,
                          minWidth: 'auto',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(promotion);
                        }}
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          px: 1.5,
                          py: 0.5,
                          minWidth: 'auto',
                        }}
                      >
                        Delete
                      </Button>
                    </CardActions>
                    )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
        )}

      {/* Pagination */}
      {data && (data.next || data.previous) && (
        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.previous || page === 1}
          >
            Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {Math.ceil((data.count || 0) / pageSize)} ({(data.count || 0).toLocaleString()} total)
            </Typography>
            <Button
              variant="outlined"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next}
          >
            Next
            </Button>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
            value={pageSize}
              label="Items per page"
              onChange={(e) => handlePageSizeChange(e.target.value as number)}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <PromotionForm
          promotion={editingPromotion}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          adminBrands={adminBrands}
        />
      )}

      {/* Promotion Types Management Modal */}
      {showPromotionTypesModal && (
        <PromotionTypesModal
          promotionTypes={promotionTypesData?.results || []}
          onClose={() => {
            setShowPromotionTypesModal(false);
            queryClient.invalidateQueries({ queryKey: ['promotion-types'] });
          }}
        />
      )}

      {/* Promotion Details Modal */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPromotion && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Promotion Details</Typography>
                <IconButton onClick={() => setShowDetailsModal(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
              {/* Banner Image */}
              {selectedPromotion.banner_image && (
                  <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={selectedPromotion.banner_image}
                      alt={selectedPromotion.title}
                      sx={{ objectFit: 'cover' }}
                      // #region agent log
                      onError={(e: any) => {
                        fetch('http://127.0.0.1:7247/ingest/9b5e4ea3-0114-40d6-8942-833733fd214b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PromotionsPage.tsx:764',message:'Detail modal image load error',data:{promotionId:selectedPromotion.id,title:selectedPromotion.title,banner_image:selectedPromotion.banner_image,banner_image_url:selectedPromotion.banner_image_url,imageSrc:selectedPromotion.banner_image},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                      }}
                      onLoad={() => {
                        fetch('http://127.0.0.1:7247/ingest/9b5e4ea3-0114-40d6-8942-833733fd214b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PromotionsPage.tsx:764',message:'Detail modal image loaded successfully',data:{promotionId:selectedPromotion.id,banner_image:selectedPromotion.banner_image},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      }}
                      // #endregion
                    />
                  </Box>
                )}

                {/* Title and Status */}
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    {selectedPromotion.title}
                  </Typography>
                  <Chip
                    label={selectedPromotion.is_currently_active ? 'Active' : selectedPromotion.is_active ? 'Scheduled' : 'Inactive'}
                    color={selectedPromotion.is_currently_active ? 'success' : selectedPromotion.is_active ? 'warning' : 'default'}
                    size="medium"
                  />
                </Box>
              
              {/* Description */}
              {selectedPromotion.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {selectedPromotion.description}
                    </Typography>
                  </Box>
              )}
              
              {/* Details Grid */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Promotion Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                      {(selectedPromotion as any).promotion_type_name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Brand
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                      {selectedPromotion.brand_name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Promotion Code
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5, fontFamily: 'monospace' }}>
                      {(selectedPromotion as any).promotion_code || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Discount
                    </Typography>
                    <Chip
                      label={formatDiscount(selectedPromotion)}
                      size="small"
                      color="primary"
                      icon={<LocalOfferIcon />}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Start Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                      {formatDate(selectedPromotion.start_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      End Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                      {formatDate(selectedPromotion.end_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Display Locations
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {((selectedPromotion as any).display_locations || []).length > 0 ? (
                        ((selectedPromotion as any).display_locations || []).map((loc: string) => (
                          <Chip
                            key={loc}
                            label={loc.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">None</Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Products
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                    {selectedPromotion.product_count || 0} product(s)
                    {selectedPromotion.product_types && ` (Type: ${selectedPromotion.product_types})`}
                    {selectedPromotion.products && Array.isArray(selectedPromotion.products) && selectedPromotion.products.length > 0 && (
                        <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
                        Specific products: {selectedPromotion.products.length}
                        </Box>
                    )}
                    </Typography>
                  </Grid>
                {/* Warning if promotion might not appear on site */}
                {selectedPromotion.is_active && !selectedPromotion.is_currently_active && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Promotion Not Currently Live
                        </Typography>
                        <Typography variant="body2">
                      This promotion is active but won't appear on the public site until the current date is between the start and end dates.
                      {selectedPromotion.start_date && new Date(selectedPromotion.start_date) > new Date() && (
                            <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          Starts: {formatDate(selectedPromotion.start_date)}
                            </Box>
                      )}
                      {selectedPromotion.end_date && new Date(selectedPromotion.end_date) < new Date() && (
                            <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          Ended: {formatDate(selectedPromotion.end_date)}
                            </Box>
                          )}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ gap: 1, px: 2, pb: 2 }}>
              <Button 
                onClick={() => setShowDetailsModal(false)}
                size="small"
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                }}
              >
                Close
              </Button>
              {/* Superusers, Global Admins, and Marketing Managers can edit/delete all promotions (full access) */}
              {(isSuperuser || isGlobalAdmin || isMarketingManager) && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(selectedPromotion);
                    }}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleDelete(selectedPromotion);
                    }}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmPromotion}
        onClose={() => setDeleteConfirmPromotion(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete the promotion "{deleteConfirmPromotion?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 2, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirmPromotion(null)} 
            color="primary"
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: 2,
              py: 0.75,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={deleteMutation.isPending}
            size="small"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: 2,
              py: 0.75,
            }}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Promotion Types Management Modal Component
interface PromotionTypesModalProps {
  promotionTypes: any[];
  onClose: () => void;
}

const PromotionTypesModal: React.FC<PromotionTypesModalProps> = ({ promotionTypes, onClose }) => {
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', is_active: true, display_order: 0 });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
      
      const response = await fetch(`${baseUrl}/promotion-types/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create promotion type');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-types'] });
      setFormData({ name: '', code: '', description: '', is_active: true, display_order: 0 });
      setEditingType(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const token = localStorage.getItem('auth_token');
      let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
      
      const response = await fetch(`${baseUrl}/promotion-types/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update promotion type');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-types'] });
      setEditingType(null);
      setFormData({ name: '', code: '', description: '', is_active: true, display_order: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('auth_token');
      let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
      
      const response = await fetch(`${baseUrl}/promotion-types/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete promotion type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-types'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name || '',
      code: type.code || '',
      description: type.description || '',
      is_active: type.is_active !== false,
      display_order: type.display_order || 0,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this promotion type?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Promotion Types</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-section">
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', border: '1px solid var(--md-outline-variant)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <h3 style={{ margin: '0 0 var(--spacing-md) 0' }}>{editingType ? 'Edit' : 'Create'} Promotion Type</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: 'var(--spacing-md)', padding: '0', borderTop: 'none' }}>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingType ? 'Update' : 'Create'}
              </button>
              {editingType && (
                <button type="button" className="btn-secondary" onClick={() => {
                  setEditingType(null);
                  setFormData({ name: '', code: '', description: '', is_active: true, display_order: 0 });
                }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3 style={{ margin: '0 0 var(--spacing-md) 0' }}>Existing Types</h3>
            <div className="responsive-table">
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotionTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td><code>{type.code}</code></td>
                    <td>{type.description || '-'}</td>
                    <td>{type.display_order}</td>
                    <td>
                      <span className={`status-badge ${type.is_active ? 'active' : 'inactive'}`}>
                        {type.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small btn-edit" onClick={() => handleEdit(type)}>Edit</button>
                      <button className="btn-small btn-delete" onClick={() => handleDelete(type.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

