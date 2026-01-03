import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ReviewsService,
  ProductTemplate,
  Review,
} from '../api/index';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';

export const ContentCreatorDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch all reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews-all'],
    queryFn: async () => {
      let allReviews: Review[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await ReviewsService.reviewsList(undefined, currentPage);
        if (response.results && response.results.length > 0) {
          allReviews = [...allReviews, ...response.results];
          hasMore = !!response.next;
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      return {
        results: allReviews,
        count: allReviews.length,
      };
    },
  });

  // Fetch products with pagination
  const { products: allProducts, isLoading: productsLoading } = usePaginatedProducts();
  
  // Create productsData object compatible with existing code
  const productsData = React.useMemo(() => ({
    results: allProducts,
    count: allProducts.length,
  }), [allProducts]);

  // Calculate review statistics
  const reviewStats = React.useMemo(() => {
    if (!reviewsData?.results) {
      return {
        total: 0,
        averageRating: 0,
        adminReviews: 0,
        customerReviews: 0,
        recentReviews: [],
      };
    }

    const reviews = reviewsData.results;
    const adminReviews = reviews.filter((r: any) => r.is_admin_review).length;
    const customerReviews = reviews.length - adminReviews;
    const totalRating = reviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const recentReviews = reviews
      .sort((a: Review, b: Review) => 
        new Date(b.date_posted || '').getTime() - new Date(a.date_posted || '').getTime()
      )
      .slice(0, 5);

    return {
      total: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      adminReviews,
      customerReviews,
      recentReviews,
    };
  }, [reviewsData]);

  // Calculate product content completion
  const contentStats = React.useMemo(() => {
    if (!productsData?.results) {
      return {
        total: 0,
        published: 0,
        drafts: 0,
        missingSEO: 0,
        incompleteContent: [],
      };
    }

    const products = productsData.results;
    const published = products.filter((p: ProductTemplate) => p.is_published !== false).length;
    const drafts = products.length - published;
    const missingSEO = products.filter((p: ProductTemplate) => 
      !p.meta_title || !p.meta_description || !p.slug || !p.seo_score || (p.seo_score || 0) < 50
    ).length;
    const incompleteContent = products
      .filter((p: ProductTemplate) => {
        const score = p.seo_score ? (typeof p.seo_score === 'string' ? parseFloat(p.seo_score) : Number(p.seo_score)) : 0;
        return score < 50;
      })
      .sort((a: ProductTemplate, b: ProductTemplate) => {
        const scoreA = a.seo_score ? (typeof a.seo_score === 'string' ? parseFloat(a.seo_score) : Number(a.seo_score)) : 0;
        const scoreB = b.seo_score ? (typeof b.seo_score === 'string' ? parseFloat(b.seo_score) : Number(b.seo_score)) : 0;
        return scoreA - scoreB;
      })
      .slice(0, 5);

    return {
      total: products.length,
      published,
      drafts,
      missingSEO,
      incompleteContent,
    };
  }, [productsData]);

  if (reviewsLoading || productsLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="content-creator-dashboard">
      <div className="page-header">
        <h1>Content Creator Dashboard</h1>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={() => navigate('/reviews?action=create')}>
            Create Review
          </button>
          <button className="btn-secondary" onClick={() => navigate('/products')}>
            Manage Products
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Reviews</h3>
            <p className="stat-value">{reviewStats.total}</p>
            <p className="stat-label">
              {reviewStats.adminReviews} admin, {reviewStats.customerReviews} customer
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">{reviewStats.averageRating.toFixed(1)}</p>
            <p className="stat-label">Across all reviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{contentStats.total}</p>
            <p className="stat-label">
              {contentStats.published} published, {contentStats.drafts} drafts
            </p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Missing SEO</h3>
            <p className="stat-value">{contentStats.missingSEO}</p>
            <p className="stat-label">Products need SEO optimization</p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="dashboard-sections">
        {/* Recent Reviews */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Reviews</h2>
            <button className="btn-link" onClick={() => navigate('/reviews')}>
              View All →
            </button>
          </div>
          <div className="section-content">
            {reviewStats.recentReviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <h3>No reviews yet</h3>
                <p>Get started by creating your first review!</p>
                <button className="btn-primary" onClick={() => navigate('/reviews?action=create')}>
                  Create First Review
                </button>
              </div>
            ) : (
              <div className="reviews-list">
                {reviewStats.recentReviews.map((review: Review) => (
                  <div 
                    key={review.id} 
                    className="review-card" 
                    onClick={() => navigate(`/reviews?edit=${review.id}`)}
                  >
                    <div className="review-card-header">
                      <div className="review-card-title-section">
                        <h3 className="review-product-name">{review.product_name || 'Unknown Product'}</h3>
                        <div className="review-rating-stars">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < (review.rating || 0) ? 'star-filled' : 'star-empty'}`}
                            >
                              ⭐
                            </span>
                          ))}
                          <span className="review-rating-value">{(review.rating || 0)}/5</span>
                        </div>
                      </div>
                      <span className={`review-type-badge ${(review as any).is_admin_review ? 'badge-admin' : 'badge-customer'}`}>
                        {(review as any).is_admin_review ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <p className="review-comment-text">
                      {review.comment ? (review.comment.length > 150 ? review.comment.substring(0, 150) + '...' : review.comment) : 'No comment'}
                    </p>
                    <div className="review-card-footer">
                      <span className="review-date">
                        {review.date_posted ? new Date(review.date_posted).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Unknown date'}
                      </span>
                      <span className="review-action-hint">Click to edit →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Needing Attention */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Products Needing Attention</h2>
            <button className="btn-link" onClick={() => navigate('/products?filter=incomplete')}>
              View All →
            </button>
          </div>
          <div className="section-content">
            {contentStats.incompleteContent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎉</div>
                <h3>All products look great!</h3>
                <p>All products have complete content and SEO optimization.</p>
              </div>
            ) : (
              <div className="products-list">
                {contentStats.incompleteContent.map((product: ProductTemplate) => (
                  <div 
                    key={product.id} 
                    className="product-card" 
                    onClick={() => navigate(`/products?edit=${product.id}`)}
                  >
                    <div className="product-card-header">
                      <div className="product-card-title-section">
                        <h3 className="product-card-name">{product.product_name}</h3>
                        <div className="product-card-meta">
                          <span className="product-seo-label">SEO Score</span>
                          <span className={`product-seo-score product-seo-score-${(product.seo_score || 0) < 50 ? 'low' : (product.seo_score || 0) < 75 ? 'medium' : 'high'}`}>
                            {product.seo_score || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="product-card-issues">
                      <span className="product-issues-label">Issues:</span>
                      <div className="product-missing-badges">
                        {!product.meta_title && <span className="missing-badge">Missing Meta Title</span>}
                        {!product.meta_description && <span className="missing-badge">Missing Meta Description</span>}
                        {!product.slug && <span className="missing-badge">Missing Slug</span>}
                        {(product.seo_score || 0) < 50 && <span className="missing-badge missing-badge-critical">Low SEO Score</span>}
                      </div>
                    </div>
                    <div className="product-card-footer">
                      <span className="product-action-hint">Click to fix issues →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/reviews?action=create')}>
            <div className="quick-action-icon">➕</div>
            <div className="quick-action-content">
              <span className="quick-action-label">Create Review</span>
              <span className="quick-action-description">Add a new product review</span>
            </div>
            <span className="quick-action-arrow">→</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/products')}>
            <div className="quick-action-icon">📝</div>
            <div className="quick-action-content">
              <span className="quick-action-label">Edit Products</span>
              <span className="quick-action-description">Manage product catalog</span>
            </div>
            <span className="quick-action-arrow">→</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/products?filter=missing-seo')}>
            <div className="quick-action-icon">🔍</div>
            <div className="quick-action-content">
              <span className="quick-action-label">Fix SEO Issues</span>
              <span className="quick-action-description">Optimize product SEO</span>
            </div>
            <span className="quick-action-arrow">→</span>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/reviews')}>
            <div className="quick-action-icon">📋</div>
            <div className="quick-action-content">
              <span className="quick-action-label">Manage Reviews</span>
              <span className="quick-action-description">View and edit reviews</span>
            </div>
            <span className="quick-action-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

