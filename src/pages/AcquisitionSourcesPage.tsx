import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SourcesService,
  SourceTypeEnum,
  AcquisitionSource,
} from '../api/index';

export const AcquisitionSourcesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingSource, setEditingSource] = useState<AcquisitionSource | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['sources', page, pageSize],
    queryFn: () => SourcesService.sourcesList(page),
  });

  // Client-side filtering
  const filteredSources = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // Source type filter
    if (sourceTypeFilter !== 'all') {
      filtered = filtered.filter((source) => source.source_type === sourceTypeFilter);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((source) => {
        const nameMatch = source.name?.toLowerCase().includes(searchLower);
        const phoneMatch = source.phone_number?.toLowerCase().includes(searchLower);
        const typeMatch = source.source_type?.toLowerCase().includes(searchLower);
        return nameMatch || phoneMatch || typeMatch;
      });
    }
    
    return filtered;
  }, [data, sourceTypeFilter, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) {
      return { total: 0, supplier: 0, importPartner: 0 };
    }
    const results = data.results;
    return {
      total: results.length,
      supplier: results.filter((source) => source.source_type === 'SU').length,
      importPartner: results.filter((source) => source.source_type === 'IM').length,
    };
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => SourcesService.sourcesDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      alert('Acquisition source deleted successfully');
    },
    onError: (err: any) => {
      alert(`Failed to delete source: ${err.message || 'Unknown error'}`);
    },
  });

  const handleDelete = (source: AcquisitionSource) => {
    if (!source.id) return;
    if (window.confirm(`Are you sure you want to delete "${source.name}"?`)) {
      deleteMutation.mutate(source.id);
    }
  };

  const handleEdit = (source: AcquisitionSource) => {
    setEditingSource(source);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingSource(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingSource(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['sources'] });
  };

  const clearFilters = () => {
    setSourceTypeFilter('all');
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (sourceTypeFilter !== 'all') count++;
    return count;
  }, [search, sourceTypeFilter]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  };

  if (isLoading) {
    return <div className="loading">Loading acquisition sources...</div>;
  }

  if (error) {
    return <div className="error">Error loading sources: {(error as Error).message}</div>;
  }

  return (
    <div className="acquisition-sources-page">
      <div className="page-header">
        <h1>Unit Acquisition Sources</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Create Source
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {data && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${sourceTypeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setSourceTypeFilter('all')}
            title={`Total Sources: ${stats.total}`}
            aria-pressed={sourceTypeFilter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--supplier ${sourceTypeFilter === 'SU' ? 'is-active' : ''}`}
            onClick={() => setSourceTypeFilter('SU')}
            title={`Suppliers: ${stats.supplier}`}
            aria-pressed={sourceTypeFilter === 'SU'}
          >
            <span className="summary-stat-label">Supplier</span>
            <span className="summary-stat-value">{(stats.supplier ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--import ${sourceTypeFilter === 'IM' ? 'is-active' : ''}`}
            onClick={() => setSourceTypeFilter('IM')}
            title={`Import Partners: ${stats.importPartner}`}
            aria-pressed={sourceTypeFilter === 'IM'}
          >
            <span className="summary-stat-label">Import Partner</span>
            <span className="summary-stat-value">{(stats.importPartner ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search sources by name, phone, or type..."
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
              <label>Filter by Source Type:</label>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${sourceTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSourceTypeFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${sourceTypeFilter === 'SU' ? 'active' : ''}`}
                  onClick={() => setSourceTypeFilter('SU')}
                >
                  Supplier ({stats.supplier})
                </button>
                <button
                  className={`filter-chip ${sourceTypeFilter === 'IM' ? 'active' : ''}`}
                  onClick={() => setSourceTypeFilter('IM')}
                >
                  Import Partner ({stats.importPartner})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sources Cards Grid */}
      {filteredSources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search || sourceTypeFilter !== 'all' 
              ? 'No matching sources found' 
              : 'No acquisition sources'}
          </h3>
          <p>
            {search || sourceTypeFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more sources.'
              : 'There are no acquisition sources in the system. Create one to get started.'}
          </p>
          {(search || sourceTypeFilter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="sources-grid">
          {filteredSources.map((source) => (
            <AcquisitionSourceCard
              key={source.id}
              source={source}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
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
        <AcquisitionSourceFormModal
          source={editingSource}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

// Acquisition Source Card Component
interface AcquisitionSourceCardProps {
  source: AcquisitionSource;
  onEdit: (source: AcquisitionSource) => void;
  onDelete: (source: AcquisitionSource) => void;
  isDeleting: boolean;
}

const AcquisitionSourceCard: React.FC<AcquisitionSourceCardProps> = ({
  source,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const sourceTypeLabel = source.source_type === 'SU' ? 'Supplier' : source.source_type === 'IM' ? 'Import Partner' : source.source_type || '-';
  const sourceTypeClass = source.source_type === 'SU' ? 'source-type-supplier' : source.source_type === 'IM' ? 'source-type-import' : '';

  return (
    <div className={`acquisition-source-card source-card ${sourceTypeClass}`}>
      <div className="acquisition-source-card-header source-card-header">
        <div className="source-id">#{source.id}</div>
        <span className={`source-type-badge ${sourceTypeClass}`}>
          {sourceTypeLabel}
        </span>
      </div>

      <div className="acquisition-source-card-body source-card-body">
        <div className="source-info-item">
          <span className="info-label">Name:</span>
          <span className="info-value">{source.name || '-'}</span>
        </div>

        {source.phone_number && (
          <div className="source-info-item source-info-item-phone">
            <span className="info-label">Phone:</span>
            <span className="info-value" data-phone="true">{source.phone_number}</span>
          </div>
        )}
      </div>

      <div className="acquisition-source-card-footer source-card-footer">
        <button
          className="btn-action btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(source);
          }}
        >
          Edit
        </button>
        <button
          className="btn-action btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(source);
          }}
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Acquisition Source Form Modal Component
interface AcquisitionSourceFormModalProps {
  source: AcquisitionSource | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AcquisitionSourceFormModal: React.FC<AcquisitionSourceFormModalProps> = ({
  source,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    source_type: source?.source_type || 'SU',
    name: source?.name || '',
    phone_number: source?.phone_number || '',
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: AcquisitionSource) => SourcesService.sourcesCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      onSuccess();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create source: ';
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
      console.error('Create source error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AcquisitionSource) => {
      if (!source?.id) throw new Error('Source ID is required');
      return SourcesService.sourcesUpdate(source.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      onSuccess();
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to update source: ';
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
      console.error('Update source error:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please fill in the name');
      return;
    }

    const submitData: AcquisitionSource = {
      source_type: formData.source_type as SourceTypeEnum,
      name: formData.name.trim(),
      phone_number: formData.phone_number.trim() || undefined,
    };

    if (source?.id) {
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
          <h2>{source ? 'Edit Acquisition Source' : 'Create Acquisition Source'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="source_type">
              Source Type <span className="required">*</span>
            </label>
            <select
              id="source_type"
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
              required
              disabled={isLoading}
            >
              <option value="SU">Supplier (SU)</option>
              <option value="IM">Import Partner (IM)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              placeholder="Company or contact person name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              disabled={isLoading}
              placeholder="Optional phone number"
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
              {isLoading ? 'Saving...' : source ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
