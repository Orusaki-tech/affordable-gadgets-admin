import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../api/index';

type DeliveryRate = {
  id?: number;
  county?: string;
  ward?: string | null;
  price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
};

const fetchDeliveryRates = async (): Promise<DeliveryRate[]> => {
  const response = await fetch(`${OpenAPI.BASE}/delivery-rates/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to load delivery rates');
  }
  return response.json();
};

export const DeliveryRatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DeliveryRate | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['delivery-rates'],
    queryFn: fetchDeliveryRates,
  });

  const filteredRates = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((rate) => {
      return (
        (rate.county || '').toLowerCase().includes(term) ||
        (rate.ward || '').toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const createMutation = useMutation({
    mutationFn: async (payload: DeliveryRate) => {
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.detail || 'Failed to create rate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      setShowModal(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: DeliveryRate) => {
      if (!payload.id) throw new Error('Missing delivery rate id');
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/${payload.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.detail || 'Failed to update rate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      setShowModal(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${OpenAPI.BASE}/delivery-rates/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete rate');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
    },
  });

  const handleEdit = (rate: DeliveryRate) => {
    setEditing(rate);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleDelete = (rate: DeliveryRate) => {
    if (!rate.id) return;
    if (window.confirm(`Delete delivery rate for ${rate.county}${rate.ward ? ` - ${rate.ward}` : ''}?`)) {
      deleteMutation.mutate(rate.id);
    }
  };

  if (isLoading) return <div className="loading">Loading delivery rates...</div>;
  if (error) return <div className="error">Error loading delivery rates: {(error as Error).message}</div>;

  return (
    <div className="colors-page">
      <div className="page-header">
        <h1>Delivery Rates</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Add Rate
          </button>
        </div>
      </div>

      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by county or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredRates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No delivery rates</h3>
          <p>Create delivery rates to calculate fees at checkout.</p>
        </div>
      ) : (
        <div className="colors-table-container">
          <table className="colors-table">
            <thead>
              <tr>
                <th>County</th>
                <th>Ward</th>
                <th>Price (KES)</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate) => (
                <tr key={rate.id}>
                  <td>{rate.county || '-'}</td>
                  <td>{rate.ward || '-'}</td>
                  <td>{Number(rate.price || 0).toFixed(2)}</td>
                  <td>{rate.is_active ? 'Yes' : 'No'}</td>
                  <td className="color-actions-cell">
                    <button className="btn-action btn-edit" onClick={() => handleEdit(rate)}>
                      Edit
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(rate)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DeliveryRateModal
          rate={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (payload.id) {
              updateMutation.mutate(payload);
            } else {
              createMutation.mutate(payload);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};

interface DeliveryRateModalProps {
  rate: DeliveryRate | null;
  onClose: () => void;
  onSubmit: (payload: DeliveryRate) => void;
  isLoading: boolean;
}

const DeliveryRateModal: React.FC<DeliveryRateModalProps> = ({ rate, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<DeliveryRate>({
    id: rate?.id,
    county: rate?.county || '',
    ward: rate?.ward || '',
    price: rate?.price ?? 0,
    is_active: rate?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.county?.trim()) {
      alert('County is required');
      return;
    }
    onSubmit({
      ...formData,
      county: formData.county?.trim(),
      ward: formData.ward?.trim() || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{rate ? 'Edit Delivery Rate' : 'Create Delivery Rate'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label>County *</label>
            <input
              type="text"
              value={formData.county || ''}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Ward (optional)</label>
            <input
              type="text"
              value={formData.ward || ''}
              onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Price (KES)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price ?? 0}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span style={{ marginLeft: '0.5rem' }}>Active</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : rate ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
