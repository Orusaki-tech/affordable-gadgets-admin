import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReviewsService,
  ProductsService,
  ProfilesService,
  Review,
  ProductTemplate,
} from '../api/index';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Checkbox,
  Stack,
  InputAdornment,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  GridLegacy as Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export const ReviewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVideoReview, setSelectedVideoReview] = useState<Review | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set());
  const [reviewTypeFilter, setReviewTypeFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<Review | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is Content Creator
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    enabled: !!user?.is_staff,
  });

  const hasRole = (roleName: string) => {
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isContentCreator = hasRole('CC') && !adminProfile?.user?.is_superuser;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', page],
    queryFn: () => ReviewsService.reviewsList(undefined, page),
  });

  // Fetch all products for the product dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => ProductsService.productsList(1),
  });

  const createMutation = useMutation({
    mutationFn: async (reviewData: FormData | Review) => {
      // Check if it's FormData (for file upload) or regular object
      if (reviewData instanceof FormData) {
        // Use fetch directly for multipart/form-data
        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        const response = await fetch(`${baseUrl}/reviews/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: reviewData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }
        return response.json();
      } else {
        return ReviewsService.reviewsCreate(reviewData as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSnackbar({ open: true, message: 'Review created successfully', severity: 'success' });
      handleFormClose();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create review: ';
      if (err.body && typeof err.body === 'object') {
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n' + errorList;
      } else if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === 'object') {
            errorMessage += JSON.stringify(parsed, null, 2);
          } else {
            errorMessage += err.message;
          }
        } catch {
          errorMessage += err.message;
        }
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (reviewData: FormData | Review) => {
      if (!editingReview?.id) throw new Error('Review ID is required for update');
      
      // Check if it's FormData (for file upload) or regular object
      if (reviewData instanceof FormData) {
        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        const response = await fetch(`${baseUrl}/reviews/${editingReview.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: reviewData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }
        return response.json();
      } else {
        return ReviewsService.reviewsPartialUpdate(editingReview.id, reviewData as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSnackbar({ open: true, message: 'Review updated successfully', severity: 'success' });
      handleFormClose();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to update review: ';
      if (err.body && typeof err.body === 'object') {
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n' + errorList;
      } else if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === 'object') {
            errorMessage += JSON.stringify(parsed, null, 2);
          } else {
            errorMessage += err.message;
          }
        } catch {
          errorMessage += err.message;
        }
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ReviewsService.reviewsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSelectedReviews(new Set());
      setSnackbar({ open: true, message: 'Review deleted successfully', severity: 'success' });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: `Failed to delete review: ${err.message || 'Unknown error'}`, severity: 'error' });
    },
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, reviewIds }: { action: 'delete' | 'hide'; reviewIds: number[] }) => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/reviews/bulk_action/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, review_ids: reviewIds }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSelectedReviews(new Set());
      setSnackbar({ open: true, message: 'Bulk action completed successfully', severity: 'success' });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: `Failed to perform bulk action: ${err.message || 'Unknown error'}`, severity: 'error' });
    },
  });

  const handleDelete = (review: Review) => {
    if (!review.id) return;
    setDeleteConfirmReview(review);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmReview?.id) {
      deleteMutation.mutate(deleteConfirmReview.id);
      setDeleteConfirmReview(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedReviews.size === 0) {
      return;
    }
    setBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    bulkActionMutation.mutate({ action: 'delete', reviewIds: Array.from(selectedReviews) });
    setBulkDeleteConfirm(false);
  };

  const handleSelectAll = () => {
    if (selectedReviews.size === filteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredReviews.map((r: Review) => r.id).filter((id): id is number => id !== undefined)));
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingReview(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingReview(null);
  };

  // Handle URL params for create/edit actions
  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');
    if (action === 'create') {
      handleCreate();
      navigate('/reviews', { replace: true });
    } else if (editId) {
      const review = data?.results?.find((r: Review) => r.id === parseInt(editId));
      if (review) {
        handleEdit(review);
        navigate('/reviews', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data, navigate]);

  const filteredReviews = useMemo(() => {
    let reviews = data?.results || [];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter((review) =>
        review.product_name?.toLowerCase().includes(searchLower) ||
        review.customer_username?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply review type filter
    if (reviewTypeFilter === 'admin') {
      reviews = reviews.filter((review: any) => review.is_admin_review);
    } else if (reviewTypeFilter === 'customer') {
      reviews = reviews.filter((review: any) => !review.is_admin_review);
    }
    
    return reviews;
  }, [data?.results, search, reviewTypeFilter]);

  const getNextPage = () => {
    if (data?.next) {
      setPage(page + 1);
    }
  };

  const getPrevPage = () => {
    if (data?.previous) {
      setPage(page - 1);
    }
  };

  // Helper to convert Google Drive sharing link to preview link
  const convertDriveLink = (url: string): string => {
    if (!url.includes('drive.google.com')) return url;
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return url.replace('/view?usp=sharing', '/preview');
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
        <Alert severity="error">Error loading reviews: {(error as Error).message}</Alert>
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
          Reviews
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ 
            backgroundColor: 'primary.main',
            borderRadius: 1,
            textTransform: 'none',
            px: 2,
            py: 0.75,
            margin: 1,
          }}
        >
          Create Review
        </Button>
      </Box>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by product name, customer, or comment..."
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
          {isContentCreator && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Chip
                label={`All (${data?.count || 0})`}
                onClick={() => setReviewTypeFilter('all')}
                color={reviewTypeFilter === 'all' ? 'primary' : 'default'}
                variant={reviewTypeFilter === 'all' ? 'filled' : 'outlined'}
              />
              <Chip
                label={`Admin (${(data?.results || []).filter((r: any) => r.is_admin_review).length})`}
                onClick={() => setReviewTypeFilter('admin')}
                color={reviewTypeFilter === 'admin' ? 'primary' : 'default'}
                variant={reviewTypeFilter === 'admin' ? 'filled' : 'outlined'}
              />
              <Chip
                label={`Customer (${(data?.results || []).filter((r: any) => !r.is_admin_review).length})`}
                onClick={() => setReviewTypeFilter('customer')}
                color={reviewTypeFilter === 'customer' ? 'primary' : 'default'}
                variant={reviewTypeFilter === 'customer' ? 'filled' : 'outlined'}
              />
            </Stack>
          )}
        </Stack>
      </Paper>

      {isContentCreator && selectedReviews.size > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: 'action.selected' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="medium">
              {selectedReviews.size} selected
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              disabled={bulkActionMutation.isPending || selectedReviews.size === 0}
            >
              Delete Selected
            </Button>
          </Stack>
        </Paper>
      )}

      {filteredReviews.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>⭐</Typography>
          <Typography variant="h6" gutterBottom>
            {search || reviewTypeFilter !== 'all'
              ? 'No matching reviews found' 
              : 'No reviews found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search || reviewTypeFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more reviews.'
              : 'There are no reviews in the system yet.'}
          </Typography>
          {(search || reviewTypeFilter !== 'all') && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setReviewTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          {isContentCreator && (
            <Box mb={2} display="flex" alignItems="center" gap={1}>
              <Checkbox
                checked={selectedReviews.size === filteredReviews.length && filteredReviews.length > 0}
                indeterminate={selectedReviews.size > 0 && selectedReviews.size < filteredReviews.length}
                onChange={handleSelectAll}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Select all ({filteredReviews.length} reviews)
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            {filteredReviews.map((review) => (
              <Grid item xs={12} sm={6} md={4} key={review.id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Stack spacing={1.5}>
                      {/* Header with ID, Type, and Checkbox */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isContentCreator && (
                            <Checkbox
                              checked={selectedReviews.has(review.id || 0)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedReviews);
                                if (e.target.checked) {
                                  newSelected.add(review.id || 0);
                                } else {
                                  newSelected.delete(review.id || 0);
                                }
                                setSelectedReviews(newSelected);
                              }}
                              size="small"
                              sx={{ p: 0 }}
                            />
                          )}
                          <Chip 
                            label={`#${review.id}`} 
                            size="small" 
                            variant="outlined" 
                            sx={{ fontSize: '0.75rem', height: '24px' }} 
                          />
                          <Chip
                            label={review.is_admin_review ? 'ADMIN' : 'CUSTOMER'}
                            color={review.is_admin_review ? 'secondary' : 'success'}
                            size="small"
                            sx={{ fontSize: '0.75rem', height: '24px' }}
                          />
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Product Name */}
                      {/* Review Photo */}
                      {review.review_image_url && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            Photo
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.5,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <img
                              src={review.review_image_url}
                              alt={review.product_name || 'Review photo'}
                              style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                            />
                          </Box>
                        </Box>
                      )}

                      {/* Product Name */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Product
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, wordBreak: 'break-word' }}>
                          {review.product_name || '-'}
                        </Typography>
                      </Box>

                      {/* Product Condition */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Condition
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {review.product_condition || '-'}
                        </Typography>
                      </Box>

                      {/* Reviewer */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Reviewer
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                          {review.customer_username || 'Admin'}
                        </Typography>
                      </Box>

                      {/* Rating */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Rating
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {review.rating ? (
                            <>
                              <Typography component="span" sx={{ fontSize: '0.875rem', lineHeight: 1 }}>
                                {'⭐'.repeat(review.rating)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                ({review.rating}/5)
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Comment */}
                      {review.comment && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            Comment
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.875rem',
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </Box>
                      )}

                      {/* Date Posted */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Date Posted
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {review.date_posted 
                            ? new Date(review.date_posted).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })
                            : '-'}
                        </Typography>
                      </Box>

                      {/* Purchase Date */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Purchase Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {review.purchase_date
                            ? new Date(review.purchase_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 1.5, justifyContent: 'space-between', bgcolor: 'action.hover' }}>
                    <Stack direction="row" spacing={1}>
                      {review.video_file_url || review.video_url ? (
                        <Tooltip title="View Video">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setSelectedVideoReview(review)}
                            sx={{ padding: '6px' }}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(review)}
                          sx={{ padding: '6px' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(review)}
                          disabled={deleteMutation.isPending}
                          sx={{ padding: '6px' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {data && data.count && data.count > 0 && (
        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              onClick={getPrevPage}
              disabled={!data?.previous || page === 1}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {Math.ceil((data.count || 0) / 25)} ({data.count || 0} total)
            </Typography>
            <Button
              variant="outlined"
              onClick={getNextPage}
              disabled={!data?.next}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}

      {showCreateModal && (
        <ReviewForm
          review={editingReview}
          products={productsData?.results || []}
          onClose={handleFormClose}
          onSuccess={(data) => {
            if (editingReview) {
              updateMutation.mutate(data);
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Video Viewer Modal */}
      <Dialog
        open={!!selectedVideoReview}
        onClose={() => setSelectedVideoReview(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Review Video</Typography>
            <IconButton onClick={() => setSelectedVideoReview(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedVideoReview?.video_file_url ? (
            <video
              src={selectedVideoReview.video_file_url}
              controls
              style={{ width: '100%', maxHeight: '70vh', borderRadius: '4px' }}
            />
          ) : selectedVideoReview?.video_url ? (
            <Box>
              {selectedVideoReview.video_url.includes('drive.google.com') ? (
                <iframe
                  src={convertDriveLink(selectedVideoReview.video_url)}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  allow="autoplay"
                  style={{ borderRadius: '4px' }}
                  title="Google Drive Video"
                />
              ) : selectedVideoReview.video_url.includes('youtube.com') || selectedVideoReview.video_url.includes('youtu.be') ? (
                <iframe
                  src={selectedVideoReview.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  title="YouTube Video"
                  style={{ borderRadius: '4px' }}
                />
              ) : (
                <Button
                  variant="contained"
                  href={selectedVideoReview.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Video Link
                </Button>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVideoReview(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmReview}
        onClose={() => setDeleteConfirmReview(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this review for "{deleteConfirmReview?.product_name || 'Unknown Product'}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmReview(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography id="bulk-delete-dialog-description">
            Are you sure you want to delete {selectedReviews.size} review(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBulkDelete} color="error" disabled={bulkActionMutation.isPending}>
            {bulkActionMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
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

// Inline ReviewForm component
interface ReviewFormProps {
  review: Review | null;
  products: ProductTemplate[];
  onClose: () => void;
  onSuccess: (reviewData: FormData | Review) => void;
  isLoading: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, products, onClose, onSuccess, isLoading }) => {
  const [formData, setFormData] = useState<Partial<Review>>({
    product: undefined,
    rating: 5,
    comment: '',
    video_url: '',
    product_condition: '',
    purchase_date: '',
  });
  const [videoInputType, setVideoInputType] = useState<'file' | 'url'>('url');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePreviewIsObjectUrl, setImagePreviewIsObjectUrl] = useState(false);
  
  // Product search state
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    if (!productSearchTerm.trim()) {
      return products.slice(0, 20); // Show first 20 when no search
    }
    
    const searchLower = productSearchTerm.toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
    
    return products
      .map((product) => {
        const name = (product.product_name || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const model = (product.model_series || '').toLowerCase();
        const type = (product.product_type_display || '').toLowerCase();
        
        // Calculate match score
        let score = 0;
        searchTerms.forEach(term => {
          if (name.includes(term)) score += 10;
          if (name.startsWith(term)) score += 5; // Bonus for prefix match
          if (brand.includes(term)) score += 8;
          if (model.includes(term)) score += 8;
          if (type.includes(term)) score += 3;
        });
        
        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 20) // Limit results
      .map(item => item.product);
  }, [products, productSearchTerm]);

  // Update display text when product is selected
  useEffect(() => {
    if (formData.product && products) {
      const selected = products.find((p) => p.id === formData.product);
      if (selected) {
        const display = `${selected.product_name}${selected.brand ? ` - ${selected.brand}` : ''}${selected.model_series ? ` (${selected.model_series})` : ''}`;
        setSelectedProductDisplay(display);
      } else {
        setSelectedProductDisplay('');
      }
    } else {
      setSelectedProductDisplay('');
    }
  }, [formData.product, products]);

  useEffect(() => {
    if (review) {
      setFormData({
        product: review.product,
        rating: review.rating || 5,
        comment: review.comment || '',
        video_url: review.video_url || '',
        product_condition: review.product_condition || '',
        purchase_date: review.purchase_date || '',
      });
      setVideoInputType(review.video_file_url ? 'file' : 'url');
      setSelectedImageFile(null);
      setImagePreviewUrl(review.review_image_url || null);
      setImagePreviewIsObjectUrl(false);
    } else {
      setFormData({
        product: undefined,
        rating: 5,
        comment: '',
        video_url: '',
        product_condition: '',
        purchase_date: '',
      });
      setVideoInputType('url');
      setProductSearchTerm('');
      setSelectedProductDisplay('');
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setImagePreviewIsObjectUrl(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review]);

  // Separate effect for cleanup of video preview URL
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewIsObjectUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl, imagePreviewIsObjectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product || !formData.rating) {
      alert('Please select a product and provide a rating.');
      return;
    }
    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      alert('Rating must be between 1 and 5.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('product', formData.product!.toString());
    formDataToSend.append('rating', formData.rating!.toString());

    if (formData.comment) {
      formDataToSend.append('comment', formData.comment);
    }

    if (selectedVideoFile) {
      formDataToSend.append('video_file', selectedVideoFile);
    } else if (formData.video_url) {
      formDataToSend.append('video_url', formData.video_url);
    }

    if (selectedImageFile) {
      formDataToSend.append('review_image', selectedImageFile);
    }

    if (formData.product_condition) {
      formDataToSend.append('product_condition', formData.product_condition);
    }

    if (formData.purchase_date) {
      formDataToSend.append('purchase_date', formData.purchase_date);
    }

    onSuccess(formDataToSend);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size must be less than 100MB');
        e.target.value = '';
        return;
      }
      setSelectedVideoFile(file);
      setFormData({ ...formData, video_url: '' }); // Clear URL if file selected
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size must be less than 10MB');
        e.target.value = '';
        return;
      }
      if (imagePreviewUrl && imagePreviewIsObjectUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setImagePreviewIsObjectUrl(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>{review ? 'Edit Review' : 'Create Review'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="product">Product <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                ref={searchInputRef}
                type="text"
                id="product"
                value={selectedProductDisplay || productSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductSearchTerm(value);
                  setShowProductSuggestions(true);
                  setHighlightedIndex(-1);
                  // Clear selection if user is typing
                  if (formData.product) {
                    setFormData({ ...formData, product: undefined });
                    setSelectedProductDisplay('');
                  }
                }}
                onFocus={() => {
                  if (filteredProducts.length > 0) {
                    setShowProductSuggestions(true);
                  }
                }}
                onBlur={(e) => {
                  // Delay to allow click events on suggestions
                  setTimeout(() => {
                    const activeElement = document.activeElement;
                    const input = searchInputRef.current;
                    const dropdown = dropdownRef.current;
                    
                    // Check if focus moved to dropdown or is still on input
                    if (activeElement) {
                      const isInDropdown = dropdown && dropdown.contains(activeElement);
                      const isInInput = input && (input === activeElement || input.contains(activeElement));
                      
                      if (!isInDropdown && !isInInput) {
                        setShowProductSuggestions(false);
                        setHighlightedIndex(-1);
                      }
                    } else {
                      // No active element, close dropdown
                      setShowProductSuggestions(false);
                      setHighlightedIndex(-1);
                    }
                  }, 200);
                }}
                onClick={() => {
                  if (filteredProducts.length > 0) {
                    setShowProductSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (!showProductSuggestions && filteredProducts.length > 0) {
                    if (e.key === 'ArrowDown' || e.key === 'Enter') {
                      setShowProductSuggestions(true);
                      e.preventDefault();
                    }
                  } else if (showProductSuggestions && filteredProducts.length > 0) {
                    switch (e.key) {
                      case 'ArrowDown':
                        e.preventDefault();
                        setHighlightedIndex(prev => 
                          prev < filteredProducts.length - 1 ? prev + 1 : prev
                        );
                        break;
                      case 'ArrowUp':
                        e.preventDefault();
                        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                        break;
                      case 'Enter':
                        e.preventDefault();
                        if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
                          const selected = filteredProducts[highlightedIndex];
                          if (selected.id) {
                            const displayText = `${selected.product_name}${selected.brand ? ` - ${selected.brand}` : ''}${selected.model_series ? ` (${selected.model_series})` : ''}`;
                            setFormData({ ...formData, product: selected.id });
                            setProductSearchTerm('');
                            setSelectedProductDisplay(displayText);
                            setShowProductSuggestions(false);
                            setHighlightedIndex(-1);
                          }
                        }
                        break;
                      case 'Escape':
                        setShowProductSuggestions(false);
                        setHighlightedIndex(-1);
                        break;
                    }
                  }
                }}
                placeholder="Type to search products (name, brand, model)..."
                required
                disabled={isLoading || !!review}
                style={{ 
                  width: '100%', 
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                }}
                autoComplete="off"
              />
              
              {/* Clear Button */}
              {(productSearchTerm || selectedProductDisplay) && !review && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSearchTerm('');
                    setSelectedProductDisplay('');
                    setFormData({ ...formData, product: undefined });
                    setShowProductSuggestions(false);
                    setHighlightedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: 'var(--md-on-surface-variant)',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 1,
                  }}
                  title="Clear selection"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showProductSuggestions && filteredProducts.length > 0 && !review && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  backgroundColor: 'var(--md-surface)',
                  border: '2px solid var(--md-primary)',
                  borderTop: 'none',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-lg)',
                  marginTop: '2px',
                }}
              >
                {filteredProducts.map((product, index) => {
                  const displayText = `${product.product_name}${product.brand ? ` - ${product.brand}` : ''}${product.model_series ? ` (${product.model_series})` : ''}`;
                  const isHighlighted = index === highlightedIndex;
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (product.id) {
                          setFormData({ ...formData, product: product.id });
                          setProductSearchTerm('');
                          setSelectedProductDisplay(displayText);
                          setShowProductSuggestions(false);
                          setHighlightedIndex(-1);
                        }
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        cursor: 'pointer',
                        backgroundColor: isHighlighted ? 'var(--md-primary-container)' : 'transparent',
                        color: isHighlighted ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                        borderBottom: index < filteredProducts.length - 1 ? '1px solid var(--md-outline-variant)' : 'none',
                        transition: 'background-color var(--transition-base)',
                      }}
                    >
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-14)' }}>
                        {product.product_name}
                      </div>
                      {(product.brand || product.model_series) && (
                        <div style={{ 
                          fontSize: 'var(--font-size-12)', 
                          color: isHighlighted ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                          marginTop: 'var(--spacing-xs)',
                        }}>
                          {product.brand && <span>{product.brand}</span>}
                          {product.brand && product.model_series && <span> • </span>}
                          {product.model_series && <span>{product.model_series}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {review && (
              <small className="form-help">
                Product cannot be changed when editing.
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating <span className="required">*</span></label>
            <select
              id="rating"
              value={formData.rating || 5}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              required
              disabled={isLoading}
            >
              <option value={1}>1 ⭐</option>
              <option value={2}>2 ⭐⭐</option>
              <option value={3}>3 ⭐⭐⭐</option>
              <option value={4}>4 ⭐⭐⭐⭐</option>
              <option value={5}>5 ⭐⭐⭐⭐⭐</option>
            </select>
          </div>
          <div className="form-group">
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Review Card Details</h3>
            <small className="form-help">
              These fields control the photo and metadata shown on the review card.
            </small>
          </div>

          <div className="form-group">
            <label>Review Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isLoading}
            />
            {imagePreviewUrl && (
              <div className="file-selection-display">
                <img
                  src={imagePreviewUrl}
                  alt="Review preview"
                  style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }}
                />
                {selectedImageFile && (
                  <p>Selected: {selectedImageFile.name}</p>
                )}
              </div>
            )}
            <small className="form-help">
              Optional photo for the review card (max 10MB).
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="product_condition">Product Condition</label>
            <input
              id="product_condition"
              type="text"
              value={formData.product_condition || ''}
              onChange={(e) => setFormData({ ...formData, product_condition: e.target.value })}
              disabled={isLoading}
              placeholder="e.g. New, Refurbished, Pre-owned"
            />
          </div>

          <div className="form-group">
            <label htmlFor="purchase_date">Purchase Date</label>
            <input
              id="purchase_date"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              value={formData.comment || ''}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              disabled={isLoading}
              placeholder="Write your review comment..."
            />
          </div>
          
          {/* Video Input Section */}
          <div className="form-group">
            <label>Review Video</label>
            
            {/* Toggle between file upload and URL */}
            <div className="video-input-toggle">
              <button
                type="button"
                className={videoInputType === 'file' ? 'active' : ''}
                onClick={() => {
                  setVideoInputType('file');
                  setFormData({ ...formData, video_url: '' });
                  setSelectedVideoFile(null);
                  if (videoPreviewUrl) {
                    URL.revokeObjectURL(videoPreviewUrl);
                    setVideoPreviewUrl(null);
                  }
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className={videoInputType === 'url' ? 'active' : ''}
                onClick={() => {
                  setVideoInputType('url');
                  setSelectedVideoFile(null);
                  if (videoPreviewUrl) {
                    URL.revokeObjectURL(videoPreviewUrl);
                    setVideoPreviewUrl(null);
                  }
                }}
              >
                Link (Google Drive/YouTube)
              </button>
            </div>

            {/* File Upload */}
            {videoInputType === 'file' && (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                {selectedVideoFile && (
                  <div className="file-selection-display">
                    <p>
                      Selected: {selectedVideoFile.name} ({(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {videoPreviewUrl && (
                      <video
                        src={videoPreviewUrl}
                        controls
                      />
                    )}
                  </div>
                )}
                <small className="form-help">
                  Maximum file size: 100MB. Supported formats: MP4, MOV, AVI, etc.
                </small>
              </div>
            )}

            {/* URL Input */}
            {videoInputType === 'url' && (
              <div>
                <input
                  id="video_url"
                  type="url"
                  value={formData.video_url || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, video_url: e.target.value });
                    setSelectedVideoFile(null);
                    if (videoPreviewUrl) {
                      URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                    }
                  }}
                  disabled={isLoading}
                  placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                />
                {formData.video_url && formData.video_url.length > 60 && (
                  <div style={{
                    marginTop: 'var(--spacing-xs)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    backgroundColor: 'var(--md-surface-container-high)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-12)',
                    color: 'var(--md-on-surface-variant)',
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}>
                    Full URL: {formData.video_url}
                  </div>
                )}
                <small className="form-help">
                  Paste a Google Drive sharing link or YouTube URL. Make sure the link is publicly accessible.
                </small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : review ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
