import React from 'react';
import { X, MapPin, Package, SlidersHorizontal, Edit2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const ItemDetailModal = ({ isOpen, onClose, item, onOpenAdjust, onOpenEdit }) => {
  const { movements } = useInventory();
  if (!isOpen || !item) return null;

  const itemMovements = movements.filter(m => m.itemId === item.id);
  const oos = item.quantity <= 0;
  const low = item.quantity > 0 && item.quantity <= item.minThreshold;

  let statusClass = 'status-good';
  let statusLabel = 'In Stock';
  if (oos) { statusClass = 'status-out'; statusLabel = 'Out of Stock'; }
  else if (low) { statusClass = 'status-low'; statusLabel = 'Low Stock'; }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header-ui">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-pill" style={{ background: '#1a1a1a', color: '#a1a1aa', border: '1px solid #333' }}>
              {item.storeroomId.toUpperCase()} STOREROOM
            </span>
            <span className={`status-pill ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <button className="btn-ui btn-ghost-ui" style={{ padding: '0.35rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-ui">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
              {item.name}
            </h2>
            <div style={{ color: '#71717a', fontSize: '0.82rem' }}>
              SKU: <strong style={{ color: '#ffffff' }}>{item.id}</strong> &bull; Category: <strong style={{ color: '#ffffff' }}>{item.category}</strong>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            background: '#181818',
            padding: '1rem',
            borderRadius: '14px',
            marginBottom: '1.25rem',
            border: '1px solid #2a2a2a'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 700, textTransform: 'uppercase' }}>Available Stock</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {item.quantity} <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{item.unit || 'pcs'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 700, textTransform: 'uppercase' }}>Min Threshold</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>{item.minThreshold}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 700, textTransform: 'uppercase' }}>Unit Price / Cost</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>GH₵ {(item.costPerUnit || 0).toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#181818', padding: '0.85rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#71717a', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <MapPin size={13} /> Location Rack
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{item.locationRack || 'General Shelf'}</div>
            </div>

            <div style={{ background: '#181818', padding: '0.85rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#71717a', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <Package size={13} /> Packaging Detail
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{item.packageDetail || 'Standard unit'}</div>
            </div>
          </div>

          {item.notes && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#71717a', marginBottom: '0.35rem' }}>Item Notes</h4>
              <p style={{ fontSize: '0.85rem', background: '#181818', padding: '0.75rem', borderRadius: '10px', color: '#a1a1aa', border: '1px solid #2a2a2a' }}>
                {item.notes}
              </p>
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#fff' }}>
              Recent Item Movements ({itemMovements.length})
            </h4>
            {itemMovements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                {itemMovements.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#181818', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #222' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{m.reason}</div>
                      <div style={{ color: '#71717a', fontSize: '0.72rem' }}>{new Date(m.timestamp).toLocaleDateString()} &bull; {m.performedBy}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: m.quantityChange > 0 ? '#4ade80' : '#f87171' }}>
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#71717a', fontSize: '0.8rem' }}>No activity records found for this item.</p>
            )}
          </div>
        </div>

        <div className="modal-footer-ui">
          <button className="btn-ui btn-secondary-ui" onClick={() => { onClose(); onOpenEdit(item); }}>
            <Edit2 size={14} />
            <span>Edit Item</span>
          </button>
          <button className="btn-ui btn-primary-ui" onClick={() => { onClose(); onOpenAdjust(item); }}>
            <SlidersHorizontal size={14} />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
