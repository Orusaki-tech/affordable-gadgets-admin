import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductsService, type Product } from '../api/index';
import { FinancingApi, type FinancingOffer, type FinancingProvider } from '../api/financing';

type OfferFormState = {
  provider: number | '';
  product: number | '';
  product_name?: string;
  deposit_amount: string;
  retail_amount: string;
  daily_payment: string;
  weekly_payment: string;
  monthly_payment: string;
  ram_gb: string;
  rom_gb: string;
  is_active: boolean;
};

const emptyOffer = (): OfferFormState => ({
  provider: '',
  product: '',
  deposit_amount: '',
  retail_amount: '',
  daily_payment: '',
  weekly_payment: '',
  monthly_payment: '',
  ram_gb: '',
  rom_gb: '',
  is_active: true,
});

export const FinancingOffersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<number | ''>('');
  const [editing, setEditing] = useState<FinancingOffer | null>(null);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: providers = [] } = useQuery({
    queryKey: ['financing-providers'],
    queryFn: () => FinancingApi.listProviders(),
  });

  const { data: offersRaw, isLoading, error } = useQuery({
    queryKey: ['financing-offers', { search, providerFilter }],
    queryFn: () =>
      FinancingApi.listOffers({
        search: search.trim() || undefined,
        provider: typeof providerFilter === 'number' ? providerFilter : undefined,
        ordering: '-updated_at',
      }),
  });

  const offers: FinancingOffer[] = useMemo(() => {
    if (!offersRaw) return [];
    if (Array.isArray(offersRaw)) return offersRaw;
    return (offersRaw.results ?? []) as FinancingOffer[];
  }, [offersRaw]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => FinancingApi.deleteOffer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financing-offers'] });
      alert('Offer deleted');
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
  const onEdit = (o: FinancingOffer) => {
    setEditing(o);
    setOpen(true);
  };

  if (isLoading) return <div className="loading">Loading financing offers...</div>;
  if (error) return <div className="error">Error: {(error as Error).message}</div>;

  return (
    <div className="tags-page">
      <div className="page-header">
        <h1>Financing offers</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={onCreate}>
            + Create offer
          </button>
        </div>
      </div>

      <p className="page-description">
        Attach BNPL terms to a product under a financing brand. These offers will appear on the storefront as &quot;Financing available&quot;.
      </p>

      <div className="search-filters-section">
        <div className="search-row" style={{ gap: 12, display: 'flex' }}>
          <input
            type="text"
            placeholder="Search by product or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            className="search-input"
            value={providerFilter === '' ? '' : String(providerFilter)}
            onChange={(e) => setProviderFilter(e.target.value ? Number(e.target.value) : '')}
            style={{ maxWidth: 280 }}
          >
            <option value="">All providers</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <h3>{search || providerFilter ? 'No matching offers' : 'No offers yet'}</h3>
          <p>{search || providerFilter ? 'Try adjusting filters.' : 'Create an offer to attach BNPL terms to a product.'}</p>
          {!search && !providerFilter && (
            <button className="btn-primary" onClick={onCreate}>
              Create offer
            </button>
          )}
        </div>
      ) : (
        <div className="colors-table-container">
          <table className="colors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Product</th>
                <th>Deposit</th>
                <th>Retail</th>
                <th>Daily</th>
                <th>Weekly</th>
                <th>Monthly</th>
                <th>RAM</th>
                <th>ROM</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td className="color-id-cell">#{o.id}</td>
                  <td>{o.provider_name ?? o.provider}</td>
                  <td>{o.product_name ?? o.product}</td>
                  <td>{o.deposit_amount}</td>
                  <td>{o.retail_amount}</td>
                  <td>{o.daily_payment}</td>
                  <td>{o.weekly_payment}</td>
                  <td>{o.monthly_payment}</td>
                  <td>{o.ram_gb ?? '-'}</td>
                  <td>{o.rom_gb ?? '-'}</td>
                  <td>{o.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="color-actions-cell">
                    <button className="btn-action btn-edit" onClick={() => onEdit(o)}>
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => {
                        if (window.confirm('Delete this offer?')) deleteMutation.mutate(o.id);
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
        <OfferModal
          offer={editing}
          providers={providers}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setOpen(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['financing-offers'] });
          }}
        />
      )}
    </div>
  );
};

function OfferModal({
  offer,
  providers,
  onClose,
  onSuccess,
}: {
  offer: FinancingOffer | null;
  providers: FinancingProvider[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<OfferFormState>(() => {
    if (!offer) return emptyOffer();
    return {
      provider: offer.provider,
      product: offer.product,
      product_name: offer.product_name,
      deposit_amount: offer.deposit_amount ?? '',
      retail_amount: offer.retail_amount ?? '',
      daily_payment: offer.daily_payment ?? '',
      weekly_payment: offer.weekly_payment ?? '',
      monthly_payment: offer.monthly_payment ?? '',
      ram_gb: offer.ram_gb == null ? '' : String(offer.ram_gb),
      rom_gb: offer.rom_gb == null ? '' : String(offer.rom_gb),
      is_active: offer.is_active ?? true,
    };
  });

  const [productSearch, setProductSearch] = useState('');
  const { data: productResults = [], isLoading: productLoading } = useQuery({
    queryKey: ['financing-product-search', productSearch],
    queryFn: async () => {
      if (!productSearch.trim()) return [] as Product[];
      const res = await ProductsService.productsList({ page: 1, search: productSearch.trim() });
      return (res?.results ?? []) as Product[];
    },
    enabled: productSearch.trim().length >= 2,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.provider === '' || form.product === '') {
        throw new Error('Provider and product are required');
      }
      const payload = {
        provider: form.provider,
        product: form.product,
        deposit_amount: form.deposit_amount,
        retail_amount: form.retail_amount,
        daily_payment: form.daily_payment,
        weekly_payment: form.weekly_payment,
        monthly_payment: form.monthly_payment,
        ram_gb: form.ram_gb ? Number(form.ram_gb) : null,
        rom_gb: form.rom_gb ? Number(form.rom_gb) : null,
        is_active: form.is_active,
      } as const;

      if (offer?.id) return FinancingApi.updateOffer(offer.id, payload as any);
      return FinancingApi.createOffer(payload as any);
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
          <h2>{offer ? 'Edit offer' : 'Create offer'}</h2>
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
              Provider <span className="required">*</span>
            </label>
            <select
              value={form.provider === '' ? '' : String(form.provider)}
              onChange={(e) =>
                setForm((p) => ({ ...p, provider: e.target.value ? Number(e.target.value) : '' }))
              }
              disabled={mutation.isPending}
            >
              <option value="">Select provider</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Product <span className="required">*</span>
            </label>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              disabled={mutation.isPending}
              placeholder="Search product name (min 2 chars)..."
            />
            <small className="form-help">Start typing to search products, then select one.</small>
            {productSearch.trim().length >= 2 && (
              <div style={{ marginTop: 8, border: '1px solid var(--border-color, #e6e6e6)', borderRadius: 8, overflow: 'hidden' }}>
                {productLoading ? (
                  <div style={{ padding: 10 }}>Searching...</div>
                ) : productResults.length === 0 ? (
                  <div style={{ padding: 10 }}>No products found.</div>
                ) : (
                  <div style={{ maxHeight: 180, overflow: 'auto' }}>
                    {productResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: 10,
                          border: 'none',
                          background: Number(form.product) === p.id ? '#f4eddf' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, product: p.id!, product_name: p.product_name }));
                          setProductSearch(p.product_name || '');
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{p.product_name}</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          {p.brand} • {p.model_series}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {form.product !== '' && (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                Selected: <strong>{form.product_name ?? `#${form.product}`}</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Deposit amount</label>
            <input value={form.deposit_amount} onChange={(e) => setForm((p) => ({ ...p, deposit_amount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Retail amount</label>
            <input value={form.retail_amount} onChange={(e) => setForm((p) => ({ ...p, retail_amount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Daily payment</label>
            <input value={form.daily_payment} onChange={(e) => setForm((p) => ({ ...p, daily_payment: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Weekly payment</label>
            <input value={form.weekly_payment} onChange={(e) => setForm((p) => ({ ...p, weekly_payment: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Monthly payment</label>
            <input value={form.monthly_payment} onChange={(e) => setForm((p) => ({ ...p, monthly_payment: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>RAM (GB)</label>
            <input value={form.ram_gb} onChange={(e) => setForm((p) => ({ ...p, ram_gb: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>ROM (GB)</label>
            <input value={form.rom_gb} onChange={(e) => setForm((p) => ({ ...p, rom_gb: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.is_active ? '1' : '0'}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === '1' }))}
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
              {mutation.isPending ? 'Saving...' : offer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

