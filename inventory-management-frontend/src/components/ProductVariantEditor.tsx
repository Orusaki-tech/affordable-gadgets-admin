import React, { useState, useEffect, useCallback } from 'react';
import { OpenAPI } from '../api/core/OpenAPI';

interface VariantData {
  id?: number;
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
      setVariants(data.results ?? data ?? []);
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
      <div className="form-group" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
        <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
          Save the product first to add variants (storage/RAM/price combinations).
        </p>
      </div>
    );
  }

  return (
    <div className="form-group" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #dee2e6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>Product Variants</h4>
        <button
          type="button"
          className="btn-small btn-info"
          onClick={addVariant}
          disabled={saving}
        >
          + Add Variant
        </button>
      </div>

      {loading && <p style={{ color: '#666' }}>Loading variants...</p>}

      {error && <div className="form-error" style={{ color: '#d32f2f', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}
      {successMsg && <div style={{ color: '#2e7d32', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{successMsg}</div>}

      {variants.length === 0 && !loading && (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          No variants yet. Add storage/RAM/price combinations for this product.
        </p>
      )}

      {variants.map((v, idx) => (
        <div
          key={v.id ?? `new-${idx}`}
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            background: '#fff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ flex: '0 0 90px' }}>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Storage (GB)</label>
            <input
              type="number"
              min="0"
              value={v.storage_gb ?? ''}
              onChange={(e) => updateVariant(idx, 'storage_gb', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 256"
              disabled={saving}
              style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ flex: '0 0 80px' }}>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>RAM (GB)</label>
            <input
              type="number"
              min="0"
              value={v.ram_gb ?? ''}
              onChange={(e) => updateVariant(idx, 'ram_gb', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 8"
              disabled={saving}
              style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Selling Price (KES)</label>
            <input
              type="number"
              min="0"
              value={v.default_selling_price}
              onChange={(e) => updateVariant(idx, 'default_selling_price', e.target.value)}
              placeholder="e.g. 142000"
              disabled={saving}
              style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Cost per Unit (KES)</label>
            <input
              type="number"
              min="0"
              value={v.default_cost_of_unit}
              onChange={(e) => updateVariant(idx, 'default_cost_of_unit', e.target.value)}
              placeholder="e.g. 120000"
              disabled={saving}
              style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ flex: '0 0 auto', alignSelf: 'flex-end', display: 'flex', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={v.is_active}
                onChange={(e) => updateVariant(idx, 'is_active', e.target.checked)}
                disabled={saving}
              />
              Active
            </label>
            {v.id && (
              <button
                type="button"
                className="btn-small btn-danger"
                onClick={async () => {
                  if (!window.confirm('Delete this variant?')) return;
                  try {
                    const token = localStorage.getItem('auth_token');
                    const headers: Record<string, string> = {};
                    if (token) headers['Authorization'] = `Token ${token}`;
                    const res = await fetch(`${baseUrl}/variants/${v.id}/`, {
                      method: 'DELETE',
                      headers,
                    });
                    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
                    setVariants((prev) => prev.filter((x) => x.id !== v.id));
                    setSuccessMsg('Variant deleted.');
                  } catch (err: any) {
                    setError(err.message || 'Delete failed');
                  }
                }}
                disabled={saving}
                title="Delete variant"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              >
                Delete
              </button>
            )}
            {!v.id && (
              <button
                type="button"
                className="btn-small btn-danger"
                onClick={() => removeVariant(idx)}
                disabled={saving}
                title="Remove unsaved variant"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      {variants.length > 0 && (
        <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={saveVariants}
            disabled={saving}
            style={{ padding: '8px 24px' }}
          >
            {saving ? 'Saving...' : 'Save Variants'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductVariantEditor;
