import React, { useState } from 'react';
import { X, Trash2, Send, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DEPARTMENTS } from '../data/initialData';

export const RequisitionCartDrawer = ({ isOpen, onClose, onRequisitionCreated }) => {
  const { cart, removeFromCart, updateCartQty, clearCart, createRequisition, addToast } = useInventory();

  const [formData, setFormData] = useState({
    requestorName: '',
    department: DEPARTMENTS[0] || 'Youth & Campus Ministry',
    phone: '',
    purpose: '',
    dateNeeded: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    notes: ''
  });

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (cart.length === 0) {
      setFormError('Please add items to your requisition request first.');
      addToast('Cart is empty', 'error');
      return;
    }
    if (!formData.requestorName.trim()) {
      setFormError('Requestor full name is required.');
      addToast('Please enter requestor name', 'error');
      return;
    }

    // Phone Number is REQUIRED
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^[+]?[0-9]{7,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setFormError('Valid Phone Number is required (min 7 digits, e.g. 0241234567 or +233...).');
      addToast('Phone number is mandatory for security verification', 'error');
      return;
    }

    const newReq = createRequisition(formData);
    if (newReq) {
      onClose();
      if (onRequisitionCreated) onRequisitionCreated(newReq);
    }
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />
      <div className="cart-drawer">
        {/* Drawer Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart size={18} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              Item Request Form ({cart.length})
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form & Items Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
            
            {/* Informational banner */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '0.75rem 0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
              color: '#bbb'
            }}>
              Fill this requisition to take items. When approved &amp; issued, stock figures update automatically.
            </div>

            {formError && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.82rem',
                color: '#f87171',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>
                  Items to Request
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', color: '#dc2626', padding: '0.1rem 0.4rem' }}
                    onClick={clearCart}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cart.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#181818',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #222'
                      }}
                    >
                      <div style={{ flex: 1, marginRight: '0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#666' }}>
                          {item.storeroomId.toUpperCase()} Storeroom &bull; Available: {item.maxStock}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#111', borderRadius: '6px', border: '1px solid #333' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                            onClick={() => updateCartQty(item.id, item.requestedQty - 1)}
                            disabled={item.requestedQty <= 1}
                          >
                            <Minus size={12} />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={item.maxStock}
                            value={item.requestedQty}
                            onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                            style={{
                              width: '36px',
                              textAlign: 'center',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                            onClick={() => updateCartQty(item.id, item.requestedQty + 1)}
                            disabled={item.requestedQty >= item.maxStock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.3rem', color: '#dc2626' }}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.75rem 1rem', background: '#181818', borderRadius: '8px', border: '1px dashed #333' }}>
                  <ShoppingCart size={28} style={{ color: '#555', margin: '0 auto 0.4rem' }} />
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>
                    Cart is empty. Click "+ Request" on any item in the storeroom to add it.
                  </p>
                </div>
              )}
            </div>

            {/* Requestor Info */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                Requestor Information (Mandatory)
              </span>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Requestor Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pastor David, Sister Grace"
                  required
                  value={formData.requestorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestorName: e.target.value }))}
                />
              </div>

              {/* Phone (MANDATORY) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, color: '#fff' }}>
                    Contact Phone Number * (Required)
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>Mandatory</span>
                </div>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 024 123 4567 or +233 50 123 4567"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem', display: 'block' }}>
                  Required for custodian contact and approval verification.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Department / Ministry *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Needed *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateNeeded: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Purpose / Event Details</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Sunday Morning Service, Camp Meeting, Sound rehearsal..."
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={cart.length === 0}
              style={{ flex: 1 }}
            >
              <Send size={15} />
              <span>Submit Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
