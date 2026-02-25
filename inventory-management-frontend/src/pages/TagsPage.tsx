import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TagsService, Tag } from '../api/index';

/** Slugify name for API (backend also auto-generates if slug empty). */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'tag';
}

export const TagsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['tags-all'],
    queryFn: () => TagsService.tagsList(),
  });

  const filteredTags = useMemo(() => {
    if (!tags || !Array.isArray(tags)) return [];
    if (!search.trim()) return tags;
    const s = search.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name?.toLowerCase().includes(s) || tag.slug?.toLowerCase().includes(s)
    );
  }, [tags, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => TagsService.tagsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
      alert('Tag deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : 'Unknown error';
      alert(`Failed to delete tag: ${message}`);
    },
  });

  const handleDelete = (tag: Tag) => {
    if (tag.id == null) return;
    if (window.confirm(`Are you sure you want to delete "${tag.name}"? Products using this tag will no longer have it.`)) {
      deleteMutation.mutate(tag.id);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingTag(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['tags-all'] });
  };

  if (isLoading) {
    return <div className="loading">Loading tags...</div>;
  }

  if (error) {
    return <div className="error">Error loading tags: {(error as Error).message}</div>;
  }

  return (
    <div className="tags-page">
      <div className="page-header">
        <h1>Tags</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Create Tag
          </button>
        </div>
      </div>

      <p className="page-description">
        Tags organize products (e.g. Featured, Best Seller). Assign tags to products on the product edit form. The <strong>Featured</strong> tag controls which products appear in the homepage Featured section.
      </p>

      <div className="summary-stats">
        <button type="button" className="summary-stat-button summary-stat-button--total is-active">
          <span className="summary-stat-label">Total</span>
          <span className="summary-stat-value">{(tags?.length ?? 0).toLocaleString()}</span>
        </button>
      </div>

      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredTags.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <h3>{search ? 'No matching tags found' : 'No tags'}</h3>
          <p>
            {search
              ? 'Try adjusting your search.'
              : 'Create tags to use on products (e.g. Featured, Best Seller, On Sale).'}
          </p>
          {!search && (
            <button className="btn-primary" onClick={handleCreate}>
              Create Tag
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
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((tag) => (
                <tr key={tag.id}>
                  <td className="color-id-cell">#{tag.id}</td>
                  <td className="color-name-cell">{tag.name ?? '-'}</td>
                  <td><code className="hex-code">{tag.slug ?? '-'}</code></td>
                  <td className="color-actions-cell">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(tag)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(tag)}
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

      {showCreateModal && (
        <TagFormModal
          tag={editingTag}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

interface TagFormModalProps {
  tag: Tag | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TagFormModal: React.FC<TagFormModalProps> = ({ tag, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: tag?.name ?? '',
    slug: tag?.slug ?? '',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (body: { name: string; slug: string }) =>
      TagsService.tagsCreate({ name: body.name.trim(), slug: body.slug.trim() || slugify(body.name) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'body' in err
        ? JSON.stringify((err as { body: unknown }).body)
        : (err as Error)?.message ?? 'Unknown error';
      alert(`Failed to create tag: ${msg}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; slug: string }) => {
      if (tag?.id == null) throw new Error('Tag ID required');
      return TagsService.tagsUpdate(tag.id, {
        name: body.name.trim(),
        slug: body.slug.trim() || slugify(body.name),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags-all'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'body' in err
        ? JSON.stringify((err as { body: unknown }).body)
        : (err as Error)?.message ?? 'Unknown error';
      alert(`Failed to update tag: ${msg}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    if (!name) {
      alert('Name is required');
      return;
    }
    const slug = formData.slug.trim() || slugify(name);
    if (tag?.id != null) {
      updateMutation.mutate({ name, slug });
    } else {
      createMutation.mutate({ name, slug });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tag ? 'Edit Tag' : 'Create Tag'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="tag-name">Name <span className="required">*</span></label>
            <input
              id="tag-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: tag ? prev.slug : slugify(e.target.value),
                }))
              }
              required
              disabled={isLoading}
              placeholder="e.g. Featured, Best Seller"
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tag-slug">Slug</label>
            <input
              id="tag-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              disabled={isLoading}
              placeholder="e.g. featured, best-seller"
              maxLength={50}
            />
            <small className="form-help">URL-friendly; leave blank to auto-generate from name.</small>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : tag ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
