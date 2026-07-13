import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { useDebounce } from '../hooks/useDebounce';
import { ArticlesService, ProductsService, type ProductTemplate } from '../api/index';
import { PageLoader } from '../components/PageLoader';
import '../styles/components/BlogsAdmin.css';

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
  products?: Array<{ id: number; product_name?: string; slug?: string }>;
  updated_at?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  buying_guide: 'Buying Guide',
  history_guide: 'History Guide',
  informational_guide: 'Informational Guide',
  tech_tip: 'Tech Tip',
  news: 'News',
  general: 'General',
};

function articleStatus(article: ArticleRow): 'Published' | 'Draft' | 'Empty' {
  if (article.is_published) return 'Published';
  if ((article.headline || '').trim() || (article.body || '').trim()) return 'Draft';
  return 'Empty';
}

function livePath(article: ArticleRow): string {
  if (article.product_slug && article.slug) {
    return `/products/${article.product_slug}/blog/${article.slug}`;
  }
  if (article.slug) return `/blog/${article.slug}`;
  return '—';
}

function linkedProducts(
  article: ArticleRow,
  nameById: Record<number, { product_name: string; slug?: string }>
) {
  if (Array.isArray(article.products) && article.products.length > 0) {
    return article.products.map((product) => {
      const resolved = nameById[product.id];
      return {
        ...product,
        product_name:
          product.product_name?.trim() ||
          resolved?.product_name ||
          article.product_name ||
          `Product #${product.id}`,
        slug: product.slug || resolved?.slug || article.product_slug || undefined,
      };
    });
  }
  if (article.product_name || article.product) {
    const id = article.product || 0;
    const resolved = id ? nameById[id] : undefined;
    return [
      {
        id,
        product_name:
          article.product_name?.trim() ||
          resolved?.product_name ||
          (id ? `Product #${id}` : 'Unknown product'),
        slug: article.product_slug || resolved?.slug || undefined,
      },
    ];
  }
  return [];
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
  const [editingLinkedProducts, setEditingLinkedProducts] = useState<
    Array<{ id: number; product_name: string; slug?: string }>
  >([]);
  const [productNameById, setProductNameById] = useState<
    Record<number, { product_name: string; slug?: string }>
  >({});

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

  useEffect(() => {
    const missingIds = new Set<number>();
    for (const article of rows) {
      if (article.product && !article.product_name?.trim()) {
        missingIds.add(article.product);
      }
      for (const product of article.products || []) {
        if (product.id && !product.product_name?.trim()) {
          missingIds.add(product.id);
        }
      }
    }
    if (missingIds.size === 0) return;

    let cancelled = false;
    (async () => {
      const entries: Record<number, { product_name: string; slug?: string }> = {};
      await Promise.all(
        Array.from(missingIds).map(async (id) => {
          try {
            const product = await ProductsService.productsRetrieve(id);
            entries[id] = {
              product_name: product.product_name || `Product #${id}`,
              slug: (product as { slug?: string }).slug,
            };
          } catch {
            entries[id] = { product_name: `Product #${id}` };
          }
        })
      );
      if (!cancelled) {
        setProductNameById((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const [id, value] of Object.entries(entries)) {
            const numId = Number(id);
            if (!prev[numId]) {
              next[numId] = value;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  const openCreate = () => {
    setEditingArticleId(null);
    setEditingProduct(null);
    setEditingLinkedProducts([]);
    setEditorOpen(true);
  };

  const openEdit = async (article: ArticleRow) => {
    setEditingArticleId(article.id ?? null);
    const linked = linkedProducts(article, productNameById).map((product) => ({
      id: product.id,
      product_name: product.product_name || `Product #${product.id}`,
      slug: product.slug,
    }));
    setEditingLinkedProducts(linked);
    if (article.product) {
      try {
        const product = await ProductsService.productsRetrieve(article.product);
        setEditingProduct(product);
      } catch {
        setEditingProduct({
          id: article.product,
          product_name: article.product_name || linked[0]?.product_name || `Product #${article.product}`,
          slug: article.product_slug || linked[0]?.slug || undefined,
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
    setEditingLinkedProducts([]);
    loadArticles(1, false);
  };

  if (profileLoading) {
    return <PageLoader />;
  }

  if (!canAccess) {
    return (
      <div className="blogs-page">
        <h2>Access denied</h2>
        <p>Blogs can be edited by Content Creators and Inventory Managers.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="blogs-page-header">
        <div>
          <h1>Blogs</h1>
          <p>
            Write general posts or attach them to one or more products. Product-linked posts appear on
            product pages; general posts live at <code>/blog/&lt;slug&gt;</code>.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Create blog
        </button>
      </div>

      <div className="blogs-toolbar">
        <div className="blogs-search form-group" style={{ margin: 0 }}>
          <label htmlFor="blogs-search" className="sr-only">
            Search blogs
          </label>
          <input
            id="blogs-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by headline, slug, or product…"
          />
        </div>
        <span className="blogs-count">
          {listLoading && rows.length === 0 ? 'Loading…' : `${rows.length} of ${totalCount}`}
        </span>
      </div>

      {listError && <p style={{ color: '#f87171' }}>{listError}</p>}

      <div className="blogs-grid">
        {rows.map((article) => {
          const status = articleStatus(article);
          const products = linkedProducts(article, productNameById);
          const primarySlug = products[0]?.slug || article.product_slug;
          const path =
            primarySlug && article.slug
              ? `/products/${primarySlug}/blog/${article.slug}`
              : livePath(article);

          return (
            <article key={article.id ?? article.slug} className="blog-card">
              <div className="blog-card-top">
                <span className="blog-card-category">
                  {CATEGORY_LABELS[article.category || ''] || article.category || 'General'}
                </span>
                <span
                  className={`blog-card-status ${
                    status === 'Published' ? 'is-published' : 'is-draft'
                  }`}
                >
                  {status}
                </span>
              </div>

              <h2 className="blog-card-title">{article.headline?.trim() || 'Untitled draft'}</h2>

              <div className="blog-card-meta">
                <div className="blog-card-products">
                  {products.length === 0 ? (
                    <span className="blog-chip is-general">General blog</span>
                  ) : (
                    products.map((product, index) => (
                      <span
                        key={`${article.id}-${product.id}`}
                        className={`blog-chip ${index === 0 ? 'is-primary' : ''}`}
                        title={product.slug || undefined}
                      >
                        {product.product_name}
                        {index === 0 ? ' · primary' : ''}
                      </span>
                    ))
                  )}
                </div>
                <div className="blog-card-url">{path}</div>
              </div>

              <div className="blog-card-actions">
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                  onClick={() => openEdit(article)}
                >
                  Edit
                </button>
              </div>
            </article>
          );
        })}

        {!listLoading && rows.length === 0 && (
          <div className="blogs-empty">
            <p style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>No blogs yet</p>
            <button type="button" className="btn-primary" onClick={openCreate}>
              Create your first blog
            </button>
          </div>
        )}
      </div>

      <div className="blogs-footer">
        <span>
          Showing {rows.length} of {totalCount}
        </span>
        {hasMore && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => loadArticles(page + 1, true)}
            disabled={listLoading}
          >
            Load more
          </button>
        )}
      </div>

      {editorOpen && (
        <Suspense fallback={<PageLoader />}>
          <ProductForm
            product={editingProduct}
            variant="buyingGuide"
            editingArticleId={editingArticleId}
            initialLinkedProducts={editingLinkedProducts}
            onClose={closeEditor}
            onSuccess={closeEditor}
          />
        </Suspense>
      )}
    </div>
  );
}
