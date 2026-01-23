import React, { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';
import type { Brand, BundleRequest, BundleItemRequest, PatchedBundleRequest } from '../api/index';
import { BundlesService, BundleItemsService } from '../api/index';

interface BundleItemInput {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  override_price?: string;
  display_order: number;
}

interface BundleFormProps {
  bundle?: any | null;
  onClose: () => void;
  onSuccess: () => void;
  adminBrands: Brand[];
}

export const BundleForm: React.FC<BundleFormProps> = ({
  bundle,
  onClose,
  onSuccess,
  adminBrands,
}) => {
  const { products: allProducts, loadMore, hasMore, isLoading } = usePaginatedProducts();

  const initialItems: BundleItemInput[] = (bundle?.items || []).map((item: any, index: number) => ({
    id: item.id,
    product: item.product,
    product_name: item.product_name,
    quantity: item.quantity || 1,
    override_price: item.override_price !== null && item.override_price !== undefined ? String(item.override_price) : '',
    display_order: item.display_order ?? index,
  }));

  const [formData, setFormData] = useState({
    brand: bundle?.brand || '',
    main_product: bundle?.main_product || '',
    title: bundle?.title || '',
    description: bundle?.description || '',
    pricing_mode: bundle?.pricing_mode || 'FX',
    bundle_price: bundle?.bundle_price ? String(bundle.bundle_price) : '',
    discount_percentage: bundle?.discount_percentage ? String(bundle.discount_percentage) : '',
    discount_amount: bundle?.discount_amount ? String(bundle.discount_amount) : '',
    start_date: bundle?.start_date ? new Date(bundle.start_date).toISOString().slice(0, 16) : '',
    end_date: bundle?.end_date ? new Date(bundle.end_date).toISOString().slice(0, 16) : '',
    is_active: bundle?.is_active !== undefined ? bundle.is_active : true,
    show_in_listings: bundle?.show_in_listings !== undefined ? bundle.show_in_listings : true,
  });

  const [items, setItems] = useState<BundleItemInput[]>(initialItems);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mainProductSearch, setMainProductSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showMainProductSuggestions, setShowMainProductSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [highlightedMainIndex, setHighlightedMainIndex] = useState(-1);
  const [highlightedItemIndex, setHighlightedItemIndex] = useState(-1);
  const selectedItemIds = useMemo(
    () => new Set(items.map((item) => item.product)),
    [items]
  );
  const mainProductSearchInputRef = useRef<HTMLInputElement | null>(null);
  const itemSearchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredMainProducts = useMemo(() => {
    if (!mainProductSearch.trim()) return allProducts.slice(0, 20);
    const searchLower = mainProductSearch.toLowerCase();
    return allProducts
      .filter((p) => p.product_name?.toLowerCase().includes(searchLower))
      .slice(0, 20);
  }, [allProducts, mainProductSearch]);

  const filteredItemProducts = useMemo(() => {
    if (!itemSearch.trim()) return allProducts.slice(0, 20);
    const searchLower = itemSearch.toLowerCase();
    return allProducts
      .filter((p) => p.product_name?.toLowerCase().includes(searchLower))
      .slice(0, 20);
  }, [allProducts, itemSearch]);

  const createBundle = useMutation({
    mutationFn: async (payload: BundleRequest) => {
      return BundlesService.bundlesCreate(payload);
    },
  });

  const updateBundle = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: PatchedBundleRequest }) => {
      return BundlesService.bundlesPartialUpdate(id, payload);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validationErrors: Record<string, string> = {};
    if (!formData.brand) validationErrors.brand = 'Brand is required';
    if (!formData.main_product) validationErrors.main_product = 'Main product is required';
    if (!formData.title.trim()) validationErrors.title = 'Title is required';
    if (!formData.pricing_mode) validationErrors.pricing_mode = 'Pricing mode is required';
    if (!items.length) validationErrors.items = 'Add at least one bundle item';

    if (formData.pricing_mode === 'FX' && !formData.bundle_price) {
      validationErrors.bundle_price = 'Bundle price is required';
    }
    if (formData.pricing_mode === 'PC' && !formData.discount_percentage) {
      validationErrors.discount_percentage = 'Discount percentage is required';
    }
    if (formData.pricing_mode === 'AM' && !formData.discount_amount) {
      validationErrors.discount_amount = 'Discount amount is required';
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload: BundleRequest = {
      brand: Number(formData.brand),
      main_product: Number(formData.main_product),
      title: formData.title,
      description: formData.description,
      pricing_mode: formData.pricing_mode,
      bundle_price: formData.bundle_price ? String(formData.bundle_price) : null,
      discount_percentage: formData.discount_percentage ? String(formData.discount_percentage) : null,
      discount_amount: formData.discount_amount ? String(formData.discount_amount) : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      is_active: formData.is_active,
      show_in_listings: formData.show_in_listings,
    };

    try {
      const bundleResponse = bundle?.id
        ? await updateBundle.mutateAsync({ id: bundle.id, payload })
        : await createBundle.mutateAsync(payload);
      const bundleId = bundleResponse?.id || bundle?.id;

      const existingItemIds = new Set<number>(
        (bundle?.items || [])
          .map((item: any) => Number(item.id))
          .filter((id: number) => Number.isFinite(id))
      );
      const nextItemIds = new Set<number>(
        items
          .filter((item) => item.id)
          .map((item) => Number(item.id))
          .filter((id: number) => Number.isFinite(id))
      );

      const deletePromises = Array.from(existingItemIds)
        .filter((id) => !nextItemIds.has(id))
        .map((id) => BundleItemsService.bundleItemsDestroy(id));

      const updatePromises = items
        .filter((item) => item.id)
        .map((item) =>
          BundleItemsService.bundleItemsPartialUpdate(item.id as number, {
            bundle: bundleId,
            product: item.product,
            quantity: item.quantity,
            override_price: item.override_price ? String(item.override_price) : null,
            display_order: item.display_order,
          } as BundleItemRequest)
        );

      const createPromises = items
        .filter((item) => !item.id)
        .map((item) =>
          BundleItemsService.bundleItemsCreate({
            bundle: bundleId,
            product: item.product,
            quantity: item.quantity,
            override_price: item.override_price ? String(item.override_price) : null,
            display_order: item.display_order,
          } as BundleItemRequest)
        );

      await Promise.all([...deletePromises, ...updatePromises, ...createPromises]);
      onSuccess();
    } catch (error: any) {
      setErrors({ form: error?.message || 'Failed to save bundle' });
    }
  };

  const handleAddItem = (productId: number, productName?: string) => {
    if (items.find((item) => item.product === productId)) return;
    setItems((prev) => [
      ...prev,
      {
        product: productId,
        product_name: productName,
        quantity: 1,
        override_price: '',
        display_order: prev.length,
      },
    ]);
  };

  const handleToggleItem = (productId: number, productName?: string) => {
    const existingIndex = items.findIndex((item) => item.product === productId);
    if (existingIndex >= 0) {
      removeItem(existingIndex);
      return;
    }
    handleAddItem(productId, productName);
  };

  const updateItemField = (index: number, field: keyof BundleItemInput, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bundle ? 'Edit Bundle' : 'Create Bundle'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="promotion-form">
          {errors.form && <div className="error-message">{errors.form}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Brand <span className="required">*</span></label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                disabled={isLoading}
              >
                <option value="">Select brand</option>
                {adminBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name || brand.code}</option>
                ))}
              </select>
              {errors.brand && <span className="error-text">{errors.brand}</span>}
            </div>

            <div className="form-group product-search-container">
              <label>Main Product <span className="required">*</span></label>
              <div className="product-search-input-wrapper">
                <span className="product-search-icon">🔍</span>
                <input
                  ref={mainProductSearchInputRef}
                  type="text"
                  placeholder="Search product..."
                  value={mainProductSearch}
                  onChange={(e) => {
                    setMainProductSearch(e.target.value);
                    setShowMainProductSuggestions(true);
                    setHighlightedMainIndex(-1);
                  }}
                  onFocus={() => setShowMainProductSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowMainProductSuggestions(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedMainIndex(prev =>
                        prev < filteredMainProducts.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedMainIndex(prev => (prev > 0 ? prev - 1 : -1));
                    } else if (e.key === 'Enter' && highlightedMainIndex >= 0) {
                      e.preventDefault();
                      const product = filteredMainProducts[highlightedMainIndex];
                      if (product?.id) {
                        setFormData({ ...formData, main_product: product.id });
                        setMainProductSearch(product.product_name || '');
                        setShowMainProductSuggestions(false);
                        setHighlightedMainIndex(-1);
                      }
                    } else if (e.key === 'Escape') {
                      setShowMainProductSuggestions(false);
                      setHighlightedMainIndex(-1);
                    }
                  }}
                  disabled={isLoading}
                  autoComplete="off"
                />
                {mainProductSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setMainProductSearch('');
                      setShowMainProductSuggestions(false);
                      setHighlightedMainIndex(-1);
                      mainProductSearchInputRef.current?.focus();
                    }}
                    className="product-search-clear"
                    title="Clear search"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    ×
                  </button>
                )}
              </div>
              {showMainProductSuggestions && filteredMainProducts.length > 0 && (
                <div className="product-suggestions">
                  {filteredMainProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`product-suggestion-item ${highlightedMainIndex === index ? 'highlighted' : ''}`}
                      onClick={() => {
                        if (product.id) {
                          setFormData({ ...formData, main_product: product.id });
                          setMainProductSearch(product.product_name || '');
                          setShowMainProductSuggestions(false);
                          setHighlightedMainIndex(-1);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightedMainIndex(index)}
                    >
                      <div className="product-suggestion-content">
                        <div className="product-suggestion-name">{product.product_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showMainProductSuggestions && mainProductSearch && filteredMainProducts.length === 0 && (
                <div className="product-suggestions product-suggestions-empty">
                  No products found matching "{mainProductSearch}"
                </div>
              )}
              {errors.main_product && <span className="error-text">{errors.main_product}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pricing Mode <span className="required">*</span></label>
              <select
                value={formData.pricing_mode}
                onChange={(e) => setFormData({ ...formData, pricing_mode: e.target.value })}
                disabled={isLoading}
              >
                <option value="FX">Fixed bundle price</option>
                <option value="PC">Percentage off items total</option>
                <option value="AM">Amount off items total</option>
              </select>
              {errors.pricing_mode && <span className="error-text">{errors.pricing_mode}</span>}
            </div>
            <div className="form-group">
              {formData.pricing_mode === 'FX' && (
                <>
                  <label>Bundle Price (KES) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.bundle_price}
                    onChange={(e) => setFormData({ ...formData, bundle_price: e.target.value })}
                    disabled={isLoading}
                  />
                  {errors.bundle_price && <span className="error-text">{errors.bundle_price}</span>}
                </>
              )}
              {formData.pricing_mode === 'PC' && (
                <>
                  <label>Discount Percentage (%) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    disabled={isLoading}
                  />
                  {errors.discount_percentage && <span className="error-text">{errors.discount_percentage}</span>}
                </>
              )}
              {formData.pricing_mode === 'AM' && (
                <>
                  <label>Discount Amount (KES) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    disabled={isLoading}
                  />
                  {errors.discount_amount && <span className="error-text">{errors.discount_amount}</span>}
                </>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  disabled={isLoading}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.show_in_listings}
                  onChange={(e) => setFormData({ ...formData, show_in_listings: e.target.checked })}
                  disabled={isLoading}
                />
                <span>Show in listings</span>
              </label>
            </div>
          </div>

          <div className="form-group product-search-container">
            <label>Bundle Items <span className="required">*</span></label>
            <div className="product-search-input-wrapper">
              <span className="product-search-icon">🔍</span>
              <input
                ref={itemSearchInputRef}
                type="text"
                placeholder="Search products to add..."
                value={itemSearch}
                onChange={(e) => {
                  setItemSearch(e.target.value);
                  setShowItemSuggestions(true);
                  setHighlightedItemIndex(-1);
                }}
                onFocus={() => setShowItemSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowItemSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedItemIndex(prev =>
                      prev < filteredItemProducts.length - 1 ? prev + 1 : prev
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedItemIndex(prev => (prev > 0 ? prev - 1 : -1));
                  } else if (e.key === 'Enter' && highlightedItemIndex >= 0) {
                    e.preventDefault();
                    const product = filteredItemProducts[highlightedItemIndex];
                    if (product?.id) {
                      handleToggleItem(product.id, product.product_name || '');
                      setItemSearch('');
                      setShowItemSuggestions(true);
                      setHighlightedItemIndex(-1);
                    }
                  } else if (e.key === 'Escape') {
                    setShowItemSuggestions(false);
                    setHighlightedItemIndex(-1);
                  }
                }}
                disabled={isLoading}
                autoComplete="off"
              />
              {itemSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setItemSearch('');
                    setShowItemSuggestions(false);
                    setHighlightedItemIndex(-1);
                    itemSearchInputRef.current?.focus();
                  }}
                  className="product-search-clear"
                  title="Clear search"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ×
                </button>
              )}
            </div>
            {showItemSuggestions && filteredItemProducts.length > 0 && (
              <div className="product-suggestions">
                {filteredItemProducts.map((product, index) => {
                  const isSelected = selectedItemIds.has(product.id!);
                  return (
                    <div
                      key={product.id}
                      className={`product-suggestion-item ${isSelected ? 'selected' : ''} ${highlightedItemIndex === index ? 'highlighted' : ''}`}
                      onClick={() => {
                        if (product.id) {
                          handleToggleItem(product.id, product.product_name || '');
                          setItemSearch('');
                          setShowItemSuggestions(true);
                          setHighlightedItemIndex(-1);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightedItemIndex(index)}
                    >
                      <div className="product-suggestion-checkbox" />
                      <div className="product-suggestion-content">
                        <div className="product-suggestion-name">{product.product_name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showItemSuggestions && itemSearch && filteredItemProducts.length === 0 && (
              <div className="product-suggestions product-suggestions-empty">
                No products found matching "{itemSearch}"
              </div>
            )}
            {hasMore && (
              <button type="button" className="btn-secondary" onClick={loadMore} disabled={isLoading}>
                Load more products
              </button>
            )}
            {errors.items && <span className="error-text">{errors.items}</span>}
          </div>

          {items.length > 0 && (
            <div className="responsive-table" style={{ marginBottom: '16px' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Override Price</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || `${item.product}-${index}`}>
                      <td>{item.product_name || item.product}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemField(index, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.override_price || ''}
                          onChange={(e) => updateItemField(index, 'override_price', e.target.value)}
                          placeholder="Leave blank to use product price"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.display_order}
                          onChange={(e) => updateItemField(index, 'display_order', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <button type="button" className="btn-small btn-delete" onClick={() => removeItem(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createBundle.isPending || updateBundle.isPending}>
              {bundle ? 'Update Bundle' : 'Create Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
