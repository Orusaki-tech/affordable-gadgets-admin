import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColorsService,
  Color,
} from '../api/index';

export const ColorsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['colors', page, pageSize],
    queryFn: () => ColorsService.colorsList(page),
  });

  // Client-side filtering
  const filteredColors = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((color) => {
        const nameMatch = color.name?.toLowerCase().includes(searchLower);
        const hexMatch = color.hex_code?.toLowerCase().includes(searchLower);
        return nameMatch || hexMatch;
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
      total: data.results.length,
    };
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ColorsService.colorsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      alert('Color deleted successfully');
    },
    onError: (err: any) => {
      alert(`Failed to delete color: ${err.message || 'Unknown error'}`);
    },
  });

  const handleDelete = (color: Color) => {
    if (!color.id) return;
    if (window.confirm(`Are you sure you want to delete "${color.name}"?`)) {
      deleteMutation.mutate(color.id);
    }
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingColor(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingColor(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['colors'] });
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

  if (isLoading) {
    return <div className="loading">Loading colors...</div>;
  }

  if (error) {
    return <div className="error">Error loading colors: {(error as Error).message}</div>;
  }

  return (
    <div className="colors-page">
      <div className="page-header">
        <h1>Colors</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Create Color
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {data && (
        <div className="summary-stats">
          <button
            type="button"
            className="summary-stat-button summary-stat-button--total is-active"
            title={`Total Colors: ${stats.total}`}
            aria-pressed={true}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search colors by name or hex code..."
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
              <label>Search filters are applied above. Use the search bar to find specific colors.</label>
            </div>
          </div>
        )}
      </div>

      {/* Colors Table */}
      {filteredColors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search
              ? 'No matching colors found' 
              : 'No colors'}
          </h3>
          <p>
            {search
              ? 'Try adjusting your search terms to see more colors.'
              : 'There are no colors in the system. Create one to get started.'}
          </p>
          {search && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="colors-table-container">
          <table className="colors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Hex Code</th>
                <th>Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredColors.map((color) => (
                <tr key={color.id}>
                  <td className="color-id-cell">#{color.id}</td>
                  <td className="color-name-cell">{color.name || '-'}</td>
                  <td className="color-hex-cell">
                    <code className="hex-code">{color.hex_code || '-'}</code>
                  </td>
                  <td className="color-preview-cell">
                    {color.hex_code && (
                      <div
                        className="color-preview-swatch"
                        style={{ backgroundColor: color.hex_code }}
                        title={color.hex_code}
                      />
                    )}
                  </td>
                  <td className="color-actions-cell">
                    <button
                      className="btn-action btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(color);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(color);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.count && data.count > 0 ? (
        <div className="pagination">
          <div className="pagination-controls">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data?.previous || page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {Math.ceil((data.count || 0) / pageSize)} ({data.count || 0} total)
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.next}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
          <div className="page-size-selector">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      ) : null}

      {showCreateModal && (
        <ColorFormModal
          color={editingColor}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};


// Color Form Modal Component
interface ColorFormModalProps {
  color: Color | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ColorFormModal: React.FC<ColorFormModalProps> = ({
  color,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: color?.name || '',
    hex_code: color?.hex_code || '#000000',
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Color) => ColorsService.colorsCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      onSuccess();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create color: ';
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
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      alert(errorMessage);
      console.error('Create color error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Color) => {
      if (!color?.id) throw new Error('Color ID is required');
      return ColorsService.colorsUpdate(color.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      onSuccess();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to update color: ';
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
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      alert(errorMessage);
      console.error('Update color error:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.hex_code) {
      alert('Please fill in both name and hex code');
      return;
    }

    const submitData: Color = {
      name: formData.name.trim(),
      hex_code: formData.hex_code.toUpperCase(),
    };

    if (color?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{color ? 'Edit Color' : 'Create Color'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="name">
              Color Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              placeholder="e.g., Black, Silver, Gold"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hex_code">
              Hex Code <span className="required">*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                id="hex_code"
                type="color"
                value={formData.hex_code}
                onChange={(e) => setFormData({ ...formData, hex_code: e.target.value.toUpperCase() })}
                style={{
                  width: '60px',
                  height: '36px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                disabled={isLoading}
              />
              <input
                type="text"
                value={formData.hex_code}
                onChange={(e) => {
                  // Allow free editing - don't interfere with deletion/typing
                  let value = e.target.value;
                  // Only filter invalid characters, keep everything else as-is for editing
                  value = value.replace(/[^0-9A-Fa-f#]/g, '').toUpperCase();
                  // Limit to 7 characters max
                  if (value.length > 7) {
                    value = value.slice(0, 7);
                  }
                  setFormData({ ...formData, hex_code: value });
                }}
                onBlur={(e) => {
                  // Validate and format only on blur (when user leaves field)
                  let value = e.target.value.trim().toUpperCase();
                  
                  // If empty, set default
                  if (!value || value === '#') {
                    value = '#000000';
                  } else {
                    // Ensure it starts with #
                    if (!value.startsWith('#')) {
                      value = '#' + value.replace(/#/g, '');
                    }
                    // Remove extra # symbols
                    value = '#' + value.slice(1).replace(/#/g, '');
                    // If incomplete hex, pad with zeros
                    const hexPart = value.slice(1).replace(/[^0-9A-F]/g, '');
                    if (hexPart.length === 0) {
                      value = '#000000';
                    } else if (hexPart.length < 6) {
                      value = '#' + hexPart.padEnd(6, '0');
                    } else {
                      value = '#' + hexPart.slice(0, 6);
                    }
                  }
                  setFormData({ ...formData, hex_code: value });
                }}
                placeholder="#000000"
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                }}
                disabled={isLoading}
              />
            </div>
            <small className="form-help">
              Select a color or enter a hex code (e.g., #FF5733)
            </small>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Preview:</label>
            <div
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: formData.hex_code,
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : color ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
