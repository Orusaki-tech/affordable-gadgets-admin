import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AccessoriesLinkService,
  ProductsService,
  ProductAccessoryLink,
} from '../api/index';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

export const ProductAccessoriesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingLink, setEditingLink] = useState<ProductAccessoryLink | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmLink, setDeleteConfirmLink] = useState<ProductAccessoryLink | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product-accessories', page, pageSize],
    queryFn: () => AccessoriesLinkService.accessoriesLinkList(page),
  });

  // Fetch all products for the form dropdowns
  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => ProductsService.productsList(1),
  });

  // Client-side filtering
  const filteredLinks = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((link) => {
        const mainProductMatch = link.main_product_name?.toLowerCase().includes(searchLower);
        const accessoryMatch = link.accessory_name?.toLowerCase().includes(searchLower);
        return mainProductMatch || accessoryMatch;
      });
    }
    
    return filtered;
  }, [data, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) {
      return { total: 0 };
    }
    return {
      total: filteredLinks.length,
    };
  }, [data, filteredLinks]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AccessoriesLinkService.accessoriesLinkDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-accessories'] });
      setDeleteConfirmLink(null);
    },
    onError: (err: any) => {
      console.error('Delete error:', err);
    },
  });

  const handleDelete = (link: ProductAccessoryLink) => {
    if (!link.id) return;
    setDeleteConfirmLink(link);
  };

  const confirmDelete = () => {
    if (deleteConfirmLink?.id) {
      deleteMutation.mutate(deleteConfirmLink.id);
    }
  };

  const handleEdit = (link: ProductAccessoryLink) => {
    setEditingLink(link);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingLink(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingLink(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['product-accessories'] });
  };

  const clearFilters = () => {
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    return count;
  }, [search]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  };

  // Get main products (phones, laptops, tablets) and accessories separately
  const mainProducts = productsData?.results?.filter(p => p.product_type && ['PH', 'LT', 'TB'].includes(p.product_type)) || [];
  const accessories = productsData?.results?.filter(p => p.product_type === 'AC') || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading product accessories: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Product Accessories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ borderRadius: 2 }}
        >
          Create Link
        </Button>
      </Box>

      {/* Summary Statistics */}
      {data && (
        <Box mb={3}>
          <Chip
            icon={<LinkIcon />}
            label={`Total: ${stats.total}`}
            color="primary"
            sx={{
              fontSize: '1rem',
              height: '40px',
              px: 2,
              fontWeight: 'bold',
            }}
          />
        </Box>
      )}

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by main product or accessory name..."
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
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Tooltip title="Filters">
            <IconButton
            onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              {activeFilterCount > 0 ? (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', top: -8, right: -8 }}
                />
              ) : null}
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Links Table */}
      {filteredLinks.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="text.secondary">
            {search ? 'No matching links found' : 'No product accessory links'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {search
              ? 'Try adjusting your search terms to see more links.'
              : 'There are no product accessory links in the system. Create one to get started.'}
          </Typography>
          {search && (
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Main Product</strong></TableCell>
                <TableCell><strong>Accessory</strong></TableCell>
                <TableCell align="center"><strong>Required Quantity</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
          {filteredLinks.map((link) => (
                <TableRow
              key={link.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Chip label={`#${link.id}`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {link.main_product_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {link.accessory_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={link.required_quantity || 1}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(link)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(link)}
                          disabled={deleteMutation.isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {data && data.count && data.count > 0 && (
        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data?.previous || page === 1}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {Math.ceil((data.count || 0) / pageSize)} ({data.count || 0} total)
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.next}
            >
              Next
            </Button>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={pageSize}
              label="Items per page"
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {showCreateModal && (
        <ProductAccessoryFormModal
          link={editingLink}
          mainProducts={mainProducts}
          accessories={accessories}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmLink}
        onClose={() => setDeleteConfirmLink(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the link between{' '}
            <strong>{deleteConfirmLink?.main_product_name}</strong> and{' '}
            <strong>{deleteConfirmLink?.accessory_name}</strong>?
          </Typography>
          {deleteMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to delete link: {(deleteMutation.error as any)?.message || 'Unknown error'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmLink(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Product Accessory Link Card Component (kept for potential future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ProductAccessoryLinkCardProps {
  link: ProductAccessoryLink;
  onEdit: (link: ProductAccessoryLink) => void;
  onDelete: (link: ProductAccessoryLink) => void;
  isDeleting: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductAccessoryLinkCard: React.FC<ProductAccessoryLinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip label={`#${link.id}`} size="small" variant="outlined" />
        </Box>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Main Product
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {link.main_product_name || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Accessory
            </Typography>
            <Typography variant="body2">
              {link.accessory_name || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Required Quantity
            </Typography>
            <Chip
              label={link.required_quantity || 1}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Stack>
      </CardContent>
      <Box p={2} pt={0} display="flex" gap={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(link)}
          fullWidth
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(link)}
          disabled={isDeleting}
          fullWidth
        >
          Delete
        </Button>
      </Box>
    </Card>
  );
};

// Product Accessory Form Modal Component
interface ProductAccessoryFormModalProps {
  link: ProductAccessoryLink | null;
  mainProducts: any[];
  accessories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const ProductAccessoryFormModal: React.FC<ProductAccessoryFormModalProps> = ({
  link,
  mainProducts,
  accessories,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    main_product: link?.main_product || undefined,
    accessory: link?.accessory || undefined,
    required_quantity: link?.required_quantity || 1,
  });

  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: ProductAccessoryLink) => AccessoriesLinkService.accessoriesLinkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-accessories'] });
      setErrorMessage(null);
      onSuccess();
    },
    onError: (err: any) => {
      let errorMsg = 'Failed to create link: ';
      if (err.body && typeof err.body === 'object') {
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMsg += '\n' + errorList;
      } else if (err.message) {
        errorMsg += err.message;
      } else {
        errorMsg += 'Unknown error';
      }
      setErrorMessage(errorMsg);
      console.error('Create link error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductAccessoryLink) => {
      if (!link?.id) throw new Error('Link ID is required');
      return AccessoriesLinkService.accessoriesLinkUpdate(link.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-accessories'] });
      setErrorMessage(null);
      onSuccess();
    },
    onError: (err: any) => {
      let errorMsg = 'Failed to update link: ';
      if (err.body && typeof err.body === 'object') {
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMsg += '\n' + errorList;
      } else if (err.message) {
        errorMsg += err.message;
      } else {
        errorMsg += 'Unknown error';
      }
      setErrorMessage(errorMsg);
      console.error('Update link error:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!formData.main_product || !formData.accessory) {
      setErrorMessage('Please select both main product and accessory');
      return;
    }

    const submitData: ProductAccessoryLink = {
      main_product: formData.main_product,
      accessory: formData.accessory,
      required_quantity: formData.required_quantity || 1,
    };

    if (link?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {link ? 'Edit Product Accessory Link' : 'Create Product Accessory Link'}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <ClearIcon />
          </IconButton>
        </Box>
        </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Main Product</InputLabel>
              <Select
                value={formData.main_product ? String(formData.main_product) : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  main_product: e.target.value ? parseInt(e.target.value as string) : undefined,
                })}
                label="Main Product"
                disabled={isLoading}
              >
              {mainProducts.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                  {product.product_name} - {product.brand} ({product.product_type})
                  </MenuItem>
              ))}
              </Select>
              <Typography variant="caption" color="text.secondary" mt={0.5}>
              Select a Phone, Laptop, or Tablet product
              </Typography>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Accessory</InputLabel>
              <Select
                value={formData.accessory ? String(formData.accessory) : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  accessory: e.target.value ? parseInt(e.target.value as string) : undefined,
                })}
                label="Accessory"
                disabled={isLoading}
              >
              {accessories.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                  {product.product_name} - {product.brand}
                  </MenuItem>
              ))}
              </Select>
              <Typography variant="caption" color="text.secondary" mt={0.5}>
              Select an Accessory product
              </Typography>
            </FormControl>

            <TextField
              fullWidth
              label="Required Quantity"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.required_quantity}
              onChange={(e) => setFormData({
                ...formData,
                required_quantity: parseInt(e.target.value) || 1,
              })}
              required
              disabled={isLoading}
              helperText="Number of this accessory required per main product"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
              Cancel
          </Button>
          <Button
              type="submit"
            variant="contained"
              disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {isLoading ? 'Saving...' : link ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
        </form>
    </Dialog>
  );
};
