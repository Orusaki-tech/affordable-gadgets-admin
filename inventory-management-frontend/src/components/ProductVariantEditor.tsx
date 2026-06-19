import React, { useState, useEffect, useCallback } from 'react';
import { OpenAPI } from '../api/core/OpenAPI';

interface VariantData {
  id?: number;
  product?: number;
  storage_gb?: number | null;
  ram_gb?: number | null;
  default_selling_price: string;
  default_cost_of_unit: string;
  is_active: boolean;
}

interface Props {
  productId: number | null;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;
  return headers;
};

const ProductVariantEditor: React.FC<Props> = ({ productId }) => {
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const baseUrl = OpenAPI.BASE || '';

  const fetchVariants = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/variants/?product=${productId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      const rows = data.results ?? data ?? [];
      setVariants(rows.filter((row: VariantData) => !row.product || row.product === productId));
    } catch (err: any) {
      setError(err.message || 'Failed to load variants');
    } finally {
      setLoading(false);
    }
  }, [productId, baseUrl]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        storage_gb: null,
        ram_gb: null,
        default_selling_price: '',
        default_cost_of_unit: '',
        is_active: true,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantData, value: any) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteVariant = async (variant: VariantData) => {
    if (!variant.id) return;
    if (!window.confirm('Delete this variant?')) return;

    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${baseUrl}/variants/${variant.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.status === 404) {
        await fetchVariants();
        setSuccessMsg('Variant was already removed.');
        return;
      }

      if (!res.ok && res.status !== 204) {
        const body = await res.text().catch(() => '');
        throw new Error(`Delete failed: ${res.status}${body ? ` — ${body.slice(0, 120)}` : ''}`);
      }

      await fetchVariants();
      setSuccessMsg('Variant deleted.');
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const saveVariants = async () => {
    if (!productId) {
      setError('Save the product first, then add variants.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    const errors: string[] = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.default_selling_price || parseFloat(v.default_selling_price) <= 0) {
        errors.push(`Row ${i + 1}: selling price is required`);
      }
    }
    if (errors.length > 0) {
      setError(errors.join('; '));
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      for (const v of variants) {
        const payload = {
          product_id: productId,
          storage_gb: v.storage_gb ?? null,
          ram_gb: v.ram_gb ?? null,
          default_selling_price: v.default_selling_price,
          default_cost_of_unit: v.default_cost_of_unit || '0',
          is_active: v.is_active,
        };

        if (v.id) {
          const res = await fetch(`${baseUrl}/variants/${v.id}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            errors.push(`Failed to update variant ${v.id}: ${JSON.stringify(body)}`);
          }
        } else {
          const res = await fetch(`${baseUrl}/variants/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            errors.push(`Failed to create variant: ${JSON.stringify(body)}`);
          }
        }
      }

      if (errors.length > 0) {
        setError(errors.join('; '));
      } else {
        setSuccessMsg('All variants saved successfully.');
        await fetchVariants();
      }
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <div className="product-variants-panel" style={{ borderStyle: 'dashed' }}>
        <p className="product-variants-empty">
          Save the product first to add variants (storage/RAM/price combinations).
        </p>
      </div>
    );
  }

  return (
    <div className="product-variants-panel">
      <div className="product-variants-header">
        <h4>Product Variants</h4>
        <button
          type="button"
          className="btn-small btn-info"
          onClick={addVariant}
          disabled={saving}
        >
          + Add Variant
        </button>
      </div>

      {loading && <p className="product-variants-empty">Loading variants...</p>}

      {error && <div className="form-error" style={{ color: 'var(--md-error)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}
      {successMsg && <div style={{ color: 'var(--md-tertiary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{successMsg}</div>}

      {variants.length === 0 && !loading && (
        <p className="product-variants-empty">
          No variants yet. Add storage/RAM/price combinations for this product.
        </p>
      )}

      {variants.length > 0 && (
        <div className="product-variants-rows">
          {variants.map((v, idx) => (
            <div key={v.id ?? `new-${idx}`} className="product-variants-row">
              <div className="product-variants-fields-grid">
              <div className="product-variants-field">
                <label htmlFor={`variant-storage-${idx}`}>Storage (GB)</label>
                <input
                  id={`variant-storage-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  className="variant-input"
                  value={v.storage_gb ?? ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    updateVariant(idx, 'storage_gb', digits ? parseInt(digits, 10) : null);
                  }}
                  placeholder="e.g. 256"
                  disabled={saving}
                />
              </div>
              <div className="product-variants-field">
                <label htmlFor={`variant-ram-${idx}`}>RAM (GB)</label>
                <input
                  id={`variant-ram-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  className="variant-input"
                  value={v.ram_gb ?? ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    updateVariant(idx, 'ram_gb', digits ? parseInt(digits, 10) : null);
                  }}
                  placeholder="e.g. 8"
                  disabled={saving}
                />
              </div>
              <div className="product-variants-field">
                <label htmlFor={`variant-price-${idx}`}>Selling Price (KES)</label>
                <input
                  id={`variant-price-${idx}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  className="variant-input"
                  value={v.default_selling_price}
                  onChange={(e) => updateVariant(idx, 'default_selling_price', e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="e.g. 142000"
                  disabled={saving}
                />
              </div>
              <div className="product-variants-field">
                <label htmlFor={`variant-cost-${idx}`}>Cost per Unit (KES)</label>
                <input
                  id={`variant-cost-${idx}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  className="variant-input"
                  value={v.default_cost_of_unit}
                  onChange={(e) => updateVariant(idx, 'default_cost_of_unit', e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="e.g. 120000"
                  disabled={saving}
                />
              </div>
              </div>
              <div className="product-variants-actions">
                <label className="product-variants-active-label">
                  <input
                    type="checkbox"
                    checked={v.is_active}
                    onChange={(e) => updateVariant(idx, 'is_active', e.target.checked)}
                    disabled={saving}
                  />
                  Active
                </label>
                {v.id ? (
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => deleteVariant(v)}
                    disabled={saving}
                    title="Delete variant"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => removeVariant(idx)}
                    disabled={saving}
                    title="Remove unsaved variant"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {variants.length > 0 && (
        <div className="product-variants-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={saveVariants}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Variants'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductVariantEditor;
