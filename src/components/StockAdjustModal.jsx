import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const StockAdjustModal = ({ isOpen, onClose, item }) => {
  const { adjustStock, setExactStock } = useInventory();
  const [mode, setMode] = useState('IN');
  const [deltaQty, setDeltaQty] = useState(1);
  const [exactQty, setExactQty] = useState(item ? item.quantity : 0);
  const [reason, setReason] = useState('Stock Replenishment');
  const [staffName, setStaffName] = useState('Store Custodian');

  if (!isOpen || !item) return null;

  const handleApply = (e) => {
    e.preventDefault();
    if (mode === 'SET') {
      setExactStock(item.id, exactQty, reason, staffName);
    } else {
      adjustStock(item.id, mode === 'IN' ? Math.abs(deltaQty) : -Math.abs(deltaQty), reason, staffName);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header-ui">
          <div>
            <span className="status-pill" style={{ background: '#1a1a1a', color: '#a1a1aa', border: '1px solid #333', marginBottom: '0.2rem' }}>
              {item.storeroomId.toUpperCase()} STOREROOM
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Adjust Stock: {item.name}
            </h3>
          </div>
          <button className="btn-ui btn-ghost-ui" style={{ padding: '0.35rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleApply}>
          <div className="modal-body-ui">
            {/* Current Stock Banner */}
            <div style={{
              background: '#181818',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a' }}>CURRENT STOCK</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {item.quantity} <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{item.unit || 'pcs'}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a' }}>LOW ALERT AT</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a1a1aa' }}>{item.minThreshold}</div>
              </div>
            </div>

            {/* Mode Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`btn-ui ${mode === 'IN' ? 'btn-primary-ui' : 'btn-secondary-ui'}`}
                style={{ padding: '0.55rem', fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={() => { setMode('IN'); setReason('Stock Replenishment'); }}
              >
                <ArrowDownLeft size={14} />
                <span>Stock In</span>
              </button>

              <button
                type="button"
                className={`btn-ui ${mode === 'OUT' ? 'btn-primary-ui' : 'btn-secondary-ui'}`}
                style={{ padding: '0.55rem', fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={() => { setMode('OUT'); setReason('Department Dispatch'); }}
              >
                <ArrowUpRight size={14} />
                <span>Stock Out</span>
              </button>

              <button
                type="button"
                className={`btn-ui ${mode === 'SET' ? 'btn-primary-ui' : 'btn-secondary-ui'}`}
                style={{ padding: '0.55rem', fontSize: '0.8rem', borderRadius: '8px' }}
                onClick={() => { setMode('SET'); setExactQty(item.quantity); setReason('Audit Count'); }}
              >
                <RotateCcw size={14} />
                <span>Set Exact</span>
              </button>
            </div>

            {mode !== 'SET' ? (
              <div className="form-field">
                <label className="form-label-ui">{mode === 'IN' ? 'Quantity to Add' : 'Quantity to Deduct'}</label>
                <input
                  type="number"
                  min="1"
                  className="input-ui"
                  style={{ fontSize: '1.2rem', fontWeight: 700 }}
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[1, 5, 10, 20, 50].map(a => (
                    <button
                      key={a}
                      type="button"
                      className="btn-ui btn-secondary-ui"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px' }}
                      onClick={() => setDeltaQty(a)}
                    >
                      +{a}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label-ui">New Exact Count</label>
                <input
                  type="number"
                  min="0"
                  className="input-ui"
                  style={{ fontSize: '1.2rem', fontWeight: 700 }}
                  value={exactQty}
                  onChange={(e) => setExactQty(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
            )}

            <div className="form-field">
              <label className="form-label-ui">Reason / Notes</label>
              <input
                type="text"
                className="input-ui"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label-ui">Staff Name</label>
              <input
                type="text"
                className="input-ui"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer-ui">
            <button type="button" className="btn-ui btn-secondary-ui" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-ui btn-primary-ui">
              <CheckCircle2 size={15} />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
