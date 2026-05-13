import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';
import { useDebounce } from '../hooks/useDebounce';
import type { ProductTemplate } from '../api/index';
import { PageLoader } from '../components/PageLoader';

const ProductForm = lazy(() => import('../components/ProductForm').then((m) => ({ default: m.ProductForm })));

function articleStatus(product: ProductTemplate): string {
  const a = (product as { article?: { is_published?: boolean; headline?: string; body?: string } | null })
    .article;
  if (!a) return 'None';
  if (a.is_published) return 'Published';
  if ((a.headline || '').trim() || (a.body || '').trim()) return 'Draft';
  return 'None';
}

export default function ProductGuidesPage() {
  const navigate = useNavigate();
  const { data: adminProfile, isLoading: profileLoading } = useAdminProfile();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [editingProduct, setEditingProduct] = useState<ProductTemplate | null>(null);

  const hasRole = useCallback(
    (code: string) => {
      if (!adminProfile?.roles) return false;
      return adminProfile.roles.some((r) => r.name === code || r.role_code === code);
    },
    [adminProfile?.roles]
  );

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isInventoryManager = hasRole('IM') && !isSuperuser;
  const canAccess = isSuperuser || isContentCreator || isInventoryManager;

  const { products, isLoading, error, hasMore, totalCount, loadMore } = usePaginatedProducts({
    search: debouncedSearch.trim(),
  });

  const rows = useMemo(() => products ?? [], [products]);

  if (profileLoading) {
    return <PageLoader />;
  }

  if (!canAccess) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Access denied</h2>
        <p>Buying guides can be edited by Content Creators and Inventory Managers.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Buying guides (SEO)</h1>
          <p style={{ color: '#666', marginTop: '0.35rem' }}>
            Manage per-product articles shown at <code>/products/&lt;slug&gt;/blog</code> on the storefront.
          </p>
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: 420 }}>
        <label htmlFor="guides-search">Search products</label>
        <input
          id="guides-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Product name, brand, model…"
        />
      </div>

      {error && (
        <p style={{ color: '#c00' }}>{error.message}</p>
      )}

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem' }}>Product</th>
              <th style={{ padding: '0.5rem' }}>Slug</th>
              <th style={{ padding: '0.5rem' }}>Guide status</th>
              <th style={{ padding: '0.5rem' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{p.product_name}</td>
                <td style={{ padding: '0.5rem' }}>{(p as { slug?: string }).slug || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{articleStatus(p)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setEditingProduct(p)}
                  >
                    Edit guide
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1rem', color: '#666' }}>
        Showing {rows.length} of {totalCount}
        {hasMore && (
          <button type="button" className="btn-secondary" style={{ marginLeft: '0.75rem' }} onClick={() => loadMore()} disabled={isLoading}>
            Load more
          </button>
        )}
      </p>

      {editingProduct && (
        <Suspense fallback={<PageLoader />}>
          <ProductForm
            product={editingProduct}
            variant="buyingGuide"
            onClose={() => setEditingProduct(null)}
            onSuccess={() => setEditingProduct(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
