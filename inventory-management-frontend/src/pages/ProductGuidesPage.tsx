import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { useDebounce } from '../hooks/useDebounce';
import { ArticlesService, ProductsService, type ProductTemplate } from '../api/index';
import { PageLoader } from '../components/PageLoader';

const ProductForm = lazy(() => import('../components/ProductForm').then((m) => ({ default: m.ProductForm })));

type ArticleRow = {
  id?: number;
  slug?: string;
  headline?: string;
  body?: string;
  is_published?: boolean;
  is_primary?: boolean;
  category?: string;
  product?: number | null;
  product_name?: string | null;
  product_slug?: string | null;
  updated_at?: string;
};

function articleStatus(article: ArticleRow): string {
  if (article.is_published) return 'Published';
  if ((article.headline || '').trim() || (article.body || '').trim()) return 'Draft';
  return 'None';
}

function livePath(article: ArticleRow): string {
  if (article.product_slug && article.slug) {
    return `/products/${article.product_slug}/blog/${article.slug}`;
  }
  if (article.slug) return `/blog/${article.slug}`;
  return '—';
}

export default function ProductGuidesPage() {
  const navigate = useNavigate();
  const { data: adminProfile, isLoading: profileLoading } = useAdminProfile();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
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

  const loadArticles = useCallback(
    async (pageNum: number, append: boolean) => {
      setListLoading(true);
      setListError(null);
      try {
        const data = await ArticlesService.articlesList(
          undefined,
          undefined,
          '-updated_at',
          pageNum,
          undefined,
          debouncedSearch.trim() || undefined
        );
        const results = (data.results || []) as ArticleRow[];
        setRows((prev) => (append ? [...prev, ...results] : results));
        setTotalCount(data.count ?? results.length);
        setHasMore(Boolean(data.next));
        setPage(pageNum);
      } catch (err) {
        setListError((err as Error).message || 'Failed to load blogs');
      } finally {
        setListLoading(false);
      }
    },
    [debouncedSearch]
  );

  useEffect(() => {
    if (!canAccess) return;
    loadArticles(1, false);
  }, [canAccess, loadArticles]);

  const openCreate = () => {
    setEditingArticleId(null);
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const openEdit = async (article: ArticleRow) => {
    setEditingArticleId(article.id ?? null);
    if (article.product) {
      try {
        const product = await ProductsService.productsRetrieve(article.product);
        setEditingProduct(product);
      } catch {
        setEditingProduct({
          id: article.product,
          product_name: article.product_name || `Product #${article.product}`,
          slug: article.product_slug || undefined,
        } as ProductTemplate);
      }
    } else {
      setEditingProduct(null);
    }
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingArticleId(null);
    setEditingProduct(null);
    loadArticles(1, false);
  };

  if (profileLoading) {
    return <PageLoader />;
  }

  if (!canAccess) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Access denied</h2>
        <p>Blogs can be edited by Content Creators and Inventory Managers.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Blogs</h1>
          <p style={{ color: '#666', marginTop: '0.35rem' }}>
            Create general posts or product guides. Product-linked posts live at{' '}
            <code>/products/&lt;slug&gt;/blog/&lt;article-slug&gt;</code>; standalone posts at{' '}
            <code>/blog/&lt;article-slug&gt;</code>.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Create blog
        </button>
      </div>

      <div className="form-group" style={{ maxWidth: 420 }}>
        <label htmlFor="blogs-search">Search blogs</label>
        <input
          id="blogs-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Headline, slug, product…"
        />
      </div>

      {listError && <p style={{ color: '#c00' }}>{listError}</p>}

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem' }}>Title</th>
              <th style={{ padding: '0.5rem' }}>Product</th>
              <th style={{ padding: '0.5rem' }}>Slug / URL</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((article) => (
              <tr key={article.id ?? article.slug} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>
                  {article.headline?.trim() || 'Untitled'}
                  {article.is_primary ? ' (primary)' : ''}
                </td>
                <td style={{ padding: '0.5rem' }}>{article.product_name?.trim() || '— General'}</td>
                <td style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                  <code>{livePath(article)}</code>
                </td>
                <td style={{ padding: '0.5rem' }}>{articleStatus(article)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => openEdit(article)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!listLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '1.5rem', color: '#666' }}>
                  No blogs yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1rem', color: '#666' }}>
        Showing {rows.length} of {totalCount} blogs
        {hasMore && (
          <button
            type="button"
            className="btn-secondary"
            style={{ marginLeft: '0.75rem' }}
            onClick={() => loadArticles(page + 1, true)}
            disabled={listLoading}
          >
            Load more
          </button>
        )}
      </p>

      {editorOpen && (
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
