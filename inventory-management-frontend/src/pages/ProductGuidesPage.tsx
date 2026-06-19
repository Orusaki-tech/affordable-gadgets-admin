import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';
import { useDebounce } from '../hooks/useDebounce';
import type { ProductTemplate } from '../api/index';
import { PageLoader } from '../components/PageLoader';

const ProductForm = lazy(() => import('../components/ProductForm').then((m) => ({ default: m.ProductForm })));

type ArticleSummary = {
  id?: number;
  slug?: string;
  headline?: string;
  body?: string;
  is_published?: boolean;
  is_primary?: boolean;
  category?: string;
};

type GuideRow = {
  product: ProductTemplate;
  article: ArticleSummary | null;
};

function articleStatus(article: ArticleSummary | null): string {
  if (!article) return 'None';
  if (article.is_published) return 'Published';
  if ((article.headline || '').trim() || (article.body || '').trim()) return 'Draft';
  return 'None';
}

function collectGuideRows(product: ProductTemplate): GuideRow[] {
  const articles = (product as { articles?: ArticleSummary[] }).articles;
  if (Array.isArray(articles) && articles.length > 0) {
    return articles.map((article) => ({ product, article }));
  }
  const legacy = (product as { article?: ArticleSummary | null }).article;
  return [{ product, article: legacy ?? null }];
}

export default function ProductGuidesPage() {
  const navigate = useNavigate();
  const { data: adminProfile, isLoading: profileLoading } = useAdminProfile();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [editingProduct, setEditingProduct] = useState<ProductTemplate | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

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

  const rows = useMemo(
    () => (products ?? []).flatMap((product) => collectGuideRows(product)),
    [products]
  );

  const openEditor = (product: ProductTemplate, articleId: number | null) => {
    setEditingProduct(product);
    setEditingArticleId(articleId);
  };

  const closeEditor = () => {
    setEditingProduct(null);
    setEditingArticleId(null);
  };

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
            Manage articles shown at <code>/products/&lt;slug&gt;/blog/&lt;article-slug&gt;</code> on the storefront.
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

      {error && <p style={{ color: '#c00' }}>{error.message}</p>}

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem' }}>Product</th>
              <th style={{ padding: '0.5rem' }}>Article</th>
              <th style={{ padding: '0.5rem' }}>Slug</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, article }) => (
              <tr key={`${product.id}-${article?.id ?? 'none'}`} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{product.product_name}</td>
                <td style={{ padding: '0.5rem' }}>
                  {article?.headline?.trim() || '—'}
                  {article?.is_primary ? ' (primary)' : ''}
                </td>
                <td style={{ padding: '0.5rem' }}>{article?.slug || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{articleStatus(article)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', marginRight: '0.35rem' }}
                    onClick={() => openEditor(product, article?.id ?? null)}
                  >
                    {article ? 'Edit' : 'Add article'}
                  </button>
                  {article && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => openEditor(product, null)}
                    >
                      Add another
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1rem', color: '#666' }}>
        Showing {rows.length} article rows from {products?.length ?? 0} products ({totalCount} total products)
        {hasMore && (
          <button
            type="button"
            className="btn-secondary"
            style={{ marginLeft: '0.75rem' }}
            onClick={() => loadMore()}
            disabled={isLoading}
          >
            Load more
          </button>
        )}
      </p>

      {editingProduct && (
        <Suspense fallback={<PageLoader />}>
          <ProductForm
            product={editingProduct}
            variant="buyingGuide"
            editingArticleId={editingArticleId}
            onClose={closeEditor}
            onSuccess={closeEditor}
          />
        </Suspense>
      )}
    </div>
  );
}
