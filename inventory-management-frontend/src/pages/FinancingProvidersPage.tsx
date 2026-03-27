import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FinancingApi, type FinancingProvider } from '../api/financing';

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'provider'
  );
}

export const FinancingProvidersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FinancingProvider | null>(null);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: providers = [], isLoading, error } = useQuery({
    queryKey: ['financing-providers'],
    queryFn: () => FinancingApi.listProviders(),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return providers;
    const s = search.toLowerCase();
    return providers.filter(
      (p) => p.name?.toLowerCase().includes(s) || (p.slug ?? '').toLowerCase().includes(s)
    );
  }, [providers, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => FinancingApi.deleteProvider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financing-providers'] });
      alert('Provider deleted');
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? JSON.stringify((err as any).body)
          : (err as Error)?.message ?? 'Unknown error';
      alert(`Failed to delete: ${msg}`);
    },
  });

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (p: FinancingProvider) => {
    setEditing(p);
    setOpen(true);
  };

  if (isLoading) return <div className="loading">Loading financing providers...</div>;
  if (error) return <div className="error">Error: {(error as Error).message}</div>;

  return (
    <div className="tags-page">
      <div className="page-header">
        <h1>Financing brands</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={onCreate}>
            + Create brand
          </button>
        </div>
      </div>

      <p className="page-description">
        Create and manage BNPL financing brands/providers (e.g. Lipa Later). Offers are created per product under a provider.
      </p>

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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h3>{search ? 'No matching providers' : 'No providers yet'}</h3>
          <p>{search ? 'Try adjusting your search.' : 'Create a financing brand to start adding BNPL offers.'}</p>
          {!search && (
            <button className="btn-primary" onClick={onCreate}>
              Create provider
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="color-id-cell">#{p.id}</td>
                  <td className="color-name-cell">{p.name}</td>
                  <td>
                    <code className="hex-code">{p.slug ?? '-'}</code>
                  </td>
                  <td>{p.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="color-actions-cell">
                    <button className="btn-action btn-edit" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => {
                        if (window.confirm(`Delete provider "${p.name}"? This will also affect offers.`)) {
                          deleteMutation.mutate(p.id);
                        }
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

      {open && (
        <ProviderModal
          provider={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setOpen(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['financing-providers'] });
          }}
        />
      )}
    </div>
  );
};

function ProviderModal({
  provider,
  onClose,
  onSuccess,
}: {
  provider: FinancingProvider | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(provider?.name ?? '');
  const [slug, setSlug] = useState(provider?.slug ?? '');
  const [isActive, setIsActive] = useState(provider?.is_active ?? true);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { name: name.trim(), slug: slug.trim() || slugify(name), is_active: isActive };
      if (!payload.name) throw new Error('Name is required');
      if (provider?.id) return FinancingApi.updateProvider(provider.id, payload);
      return FinancingApi.createProvider(payload);
    },
    onSuccess,
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? JSON.stringify((err as any).body)
          : (err as Error)?.message ?? 'Unknown error';
      alert(`Failed to save: ${msg}`);
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{provider ? 'Edit financing brand' : 'Create financing brand'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form
          className="form-section"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="form-group">
            <label>
              Name <span className="required">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!provider) setSlug(slugify(e.target.value));
              }}
              disabled={mutation.isPending}
              placeholder="e.g. Lipa Later"
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={mutation.isPending}
              placeholder="e.g. lipa-later"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={isActive ? '1' : '0'}
              onChange={(e) => setIsActive(e.target.value === '1')}
              disabled={mutation.isPending}
            >
              <option value="1">Active</option>
              <option value="0">Disabled</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={mutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : provider ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

