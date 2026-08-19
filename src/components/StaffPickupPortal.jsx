import React, { useState } from 'react';
import {
  Warehouse,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingCart,
  Trash2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  X,
  Phone,
  User,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { DEPARTMENTS } from '../data/initialData';

export const StaffPickupPortal = ({ userTab = 'pickup' }) => {
  const {
    items,
    adjustStock,
    requisitions,
    addToast
  } = useInventory();

  const [selectedStoreroom, setSelectedStoreroom] = useState('aud');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [basket, setBasket] = useState([]);

  // Pop-up Form Modal state: appears after user finishes picking items!
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: '',
    department: DEPARTMENTS[0] || 'Youth & Campus Ministry',
    phone: '',
    purpose: ''
  });

  const [formError, setFormError] = useState('');
  const [confirmedPickup, setConfirmedPickup] = useState(null);

  // Filter items
  const availableItems = items.filter(item => {
    if (item.storeroomId !== selectedStoreroom) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) &&
          !item.category?.toLowerCase().includes(q) &&
          !item.locationRack?.toLowerCase().includes(q) &&
          !item.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const storeroomCategories = Array.from(
    new Set(items.filter(i => i.storeroomId === selectedStoreroom).map(i => i.category).filter(Boolean))
  );

  const handleAddToBasket = (item) => {
    if (item.quantity <= 0) {
      addToast('This item is currently out of stock', 'error');
      return;
    }

    setBasket(prev => {
      const exists = prev.find(b => b.id === item.id);
      if (exists) {
        if (exists.quantityToTake >= item.quantity) {
          addToast(`Only ${item.quantity} available in stock`, 'info');
          return prev;
        }
        return prev.map(b => b.id === item.id ? { ...b, quantityToTake: b.quantityToTake + 1 } : b);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        storeroomId: item.storeroomId,
        quantityToTake: 1,
        maxStock: item.quantity,
        unit: item.unit || 'pcs',
        locationRack: item.locationRack || 'Shelf'
      }];
    });

    addToast(`Added 1x "${item.name}"`, 'success', 1500);
  };

  const handleUpdateBasketQty = (itemId, delta) => {
    setBasket(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantityToTake + delta;
        if (newQty <= 0) return null;
        if (newQty > item.maxStock) {
          addToast(`Only ${item.maxStock} available in stock`, 'info');
          return item;
        }
        return { ...item, quantityToTake: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromBasket = (itemId) => {
    setBasket(prev => prev.filter(b => b.id !== itemId));
  };

  // Submit from the Pop-up Modal & Auto-Deduct
  const handleConfirmPickup = (e) => {
    e.preventDefault();
    setFormError('');

    if (basket.length === 0) {
      setFormError('Please pick at least one item before submitting.');
      addToast('Pickup list is empty', 'error');
      return;
    }

    if (!staffForm.name.trim()) {
      setFormError('Your Full Name is required.');
      addToast('Please enter your full name', 'error');
      return;
    }

    const cleanPhone = staffForm.phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^[+]?[0-9]{7,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setFormError('Valid Phone Number is required (minimum 7 digits).');
      addToast('Phone number is mandatory', 'error');
      return;
    }

    const timestamp = new Date().toISOString();
    const pickupId = `PICK-${Date.now().toString().slice(-6)}`;

    // Real-time stock deduction
    basket.forEach(item => {
      adjustStock(
        item.id,
        -item.quantityToTake,
        `Staff Pickup [Tel: ${staffForm.phone}]: ${staffForm.name} (${staffForm.department}) for "${staffForm.purpose || 'Ministry Program'}"`,
        `${staffForm.name} (${staffForm.phone})`
      );
    });

    setConfirmedPickup({
      id: pickupId,
      requestorName: staffForm.name,
      department: staffForm.department,
      phone: staffForm.phone,
      purpose: staffForm.purpose,
      timestamp: timestamp,
      items: [...basket]
    });

    setBasket([]);
    setIsFormModalOpen(false);
    setStaffForm({
      name: '',
      department: DEPARTMENTS[0] || 'Youth & Campus Ministry',
      phone: '',
      purpose: ''
    });

    addToast('Pickup confirmed! Stock figures automatically updated.', 'success', 4000);
  };

  const totalBasketUnits = basket.reduce((sum, i) => sum + i.quantityToTake, 0);

  // Tab 2: Requisition Status View
  if (userTab === 'status') {
    return (
      <div className="content-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Requisition Status Tracker</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Track the progress of your department's item requests.
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requestor &amp; Dept</th>
                <th>Items Requested</th>
                <th>Date Needed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map(r => (
                <tr key={r.id}>
                  <td><strong style={{ color: '#fff' }}>#{r.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.requestorName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.department}</div>
                  </td>
                  <td>
                    {r.items.map(i => `${i.quantityRequested}x ${i.itemName}`).join(', ')}
                  </td>
                  <td>{r.dateNeeded}</td>
                  <td>
                    <span className={`status-pill ${r.status === 'Fulfilled' ? 'status-good' : r.status === 'Pending' ? 'status-low' : 'status-out'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Tab 3: Guidelines View
  if (userTab === 'guide') {
    return (
      <div className="content-panel" style={{ maxWidth: '800px' }}>
        <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Storeroom Collection Guidelines</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <div style={{ background: '#181818', padding: '1rem', borderRadius: '12px', border: '1px solid #222' }}>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.3rem' }}>1. Pick Items Needed</h4>
            <p>Select your storeroom (Aud, MD, Poimen) and tap "+ Pick This Item" to add items to your list.</p>
          </div>

          <div style={{ background: '#181818', padding: '1rem', borderRadius: '12px', border: '1px solid #222' }}>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.3rem' }}>2. Complete Pickup Form Modal</h4>
            <p>Tap "Complete Pickup" to open the form modal. Enter your full name, mandatory phone number, and department.</p>
          </div>

          <div style={{ background: '#181818', padding: '1rem', borderRadius: '12px', border: '1px solid #222' }}>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.3rem' }}>3. Automatic Stock Deduction</h4>
            <p>Once confirmed, stock quantities deduct immediately in real-time, generating your digital pickup pass.</p>
          </div>
        </div>
      </div>
    );
  }

  // Digital Receipt Pass
  if (confirmedPickup) {
    return (
      <div style={{ maxWidth: '640px', margin: '1rem auto' }}>
        <div className="content-panel" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{
            width: 60,
            height: 60,
            background: 'var(--primary-light)',
            color: '#dc2626',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={32} />
          </div>

          <span className="status-pill status-good" style={{ marginBottom: '0.75rem' }}>
            PICKUP CONFIRMED &bull; STOCK UPDATED
          </span>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Items Checked Out Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            The storeroom inventory figures have been automatically updated.
          </p>

          <div style={{
            background: '#181818',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>PICKUP PASS ID</span>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.1rem' }}>#{confirmedPickup.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>DATE & TIME</span>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{new Date(confirmedPickup.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>COLLECTED BY</span>
                <div style={{ fontWeight: 700 }}>{confirmedPickup.requestorName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>CONTACT PHONE</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{confirmedPickup.phone}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>DEPARTMENT</span>
                <div style={{ fontWeight: 700 }}>{confirmedPickup.department}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Items Taken:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {confirmedPickup.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#111', borderRadius: '8px', border: '1px solid #222' }}>
                    <span style={{ fontWeight: 600 }}>{it.name}</span>
                    <strong style={{ color: '#dc2626' }}>{it.quantityToTake} {it.unit}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="btn-ui btn-primary-ui" onClick={() => setConfirmedPickup(null)}>
            <RotateCcw size={16} />
            <span>Pick Up More Items</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Storeroom Selector Tabs */}
      <div className="storeroom-tabs">
        {[
          { id: 'aud', title: '1. Aud Storeroom', count: items.filter(i => i.storeroomId === 'aud').length },
          { id: 'md', title: '2. MD Storeroom', count: items.filter(i => i.storeroomId === 'md').length },
          { id: 'poimen', title: '3. Poimen Storeroom', count: items.filter(i => i.storeroomId === 'poimen').length }
        ].map(sr => (
          <button
            key={sr.id}
            className={`storeroom-tab ${selectedStoreroom === sr.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedStoreroom(sr.id);
              setSelectedCategory('ALL');
            }}
          >
            <Warehouse size={15} />
            <span>{sr.title} ({sr.count} items)</span>
          </button>
        ))}
      </div>

      {/* Main Item Catalog Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Select Items to Pick Up</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Choose items from {selectedStoreroom.toUpperCase()} storeroom. Tap "Complete Pickup" when ready.
            </p>
          </div>

          {/* Filter Search & Complete Pickup Button */}
          <div className="panel-actions">
            <div className="header-search" style={{ minWidth: '180px' }}>
              <Search size={14} className="header-search-icon" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {storeroomCategories.length > 0 && (
              <select
                className="select-ui"
                style={{ width: 'auto', padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.85rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {storeroomCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* Complete Pickup Button -> Triggers Form Modal */}
            <button
              className="btn-ui btn-primary-ui"
              style={{ borderRadius: '999px', padding: '0.6rem 1.25rem' }}
              disabled={basket.length === 0}
              onClick={() => setIsFormModalOpen(true)}
            >
              <ShoppingCart size={16} />
              <span>Complete Pickup ({totalBasketUnits} items) &rarr;</span>
            </button>
          </div>
        </div>

        {/* Selected Items Banner Bar */}
        {basket.length > 0 && (
          <div style={{
            background: '#1a0a0a',
            border: '1px solid #dc2626',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShoppingCart size={18} style={{ color: '#dc2626' }} />
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                {basket.length} item(s) selected ({totalBasketUnits} units total)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.8rem', color: '#f87171', padding: '0.3rem 0.6rem' }}
                onClick={() => setBasket([])}
              >
                Clear
              </button>
              <button
                className="btn-ui btn-primary-ui"
                style={{ borderRadius: '999px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setIsFormModalOpen(true)}
              >
                <span>Fill Details &amp; Confirm &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {availableItems.map(item => {
            const oos = item.quantity <= 0;
            const inBasket = basket.find(b => b.id === item.id);

            return (
              <div
                key={item.id}
                style={{
                  background: inBasket ? '#180a0a' : '#141414',
                  border: inBasket ? '1px solid #dc2626' : '1px solid #222222',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      LOC: {item.locationRack || 'Shelf'}
                    </span>
                    <span className={`status-pill ${oos ? 'status-out' : item.quantity <= item.minThreshold ? 'status-low' : 'status-good'}`} style={{ fontSize: '0.7rem' }}>
                      {item.quantity} in stock
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h4>

                  {item.packageDetail && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {item.packageDetail}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  {inBasket ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0a0a', padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1px solid #333' }}>
                      <button
                        type="button"
                        className="btn-ui btn-ghost-ui"
                        style={{ width: 28, height: 28, padding: 0 }}
                        onClick={() => handleUpdateBasketQty(item.id, -1)}
                      >
                        <Minus size={14} />
                      </button>

                      <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.95rem' }}>
                        {inBasket.quantityToTake} {item.unit}
                      </span>

                      <button
                        type="button"
                        className="btn-ui btn-ghost-ui"
                        style={{ width: 28, height: 28, padding: 0 }}
                        onClick={() => handleUpdateBasketQty(item.id, 1)}
                        disabled={inBasket.quantityToTake >= item.quantity}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-ui btn-primary-ui"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '10px' }}
                      disabled={oos}
                      onClick={() => handleAddToBasket(item)}
                    >
                      <Plus size={15} />
                      <span>Pick This Item</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {availableItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No items found matching your search in this storeroom.</p>
          </div>
        )}
      </div>

      {/* POP-UP FORM MODAL (Pops up when ready to complete pickup!) */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={18} style={{ color: '#dc2626' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Pickup Details Form ({totalBasketUnits} items)
                </h3>
              </div>
              <button className="btn-ui btn-ghost-ui" style={{ padding: '0.35rem', borderRadius: '50%' }} onClick={() => setIsFormModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPickup}>
              <div className="modal-body-ui">
                {/* Summary of Items Being Taken */}
                <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Items Selected:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                    {basket.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                        <strong style={{ color: '#dc2626' }}>{b.quantityToTake} {b.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div style={{
                    background: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid #dc2626',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#f87171',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-field">
                  <label className="form-label-ui">Your Full Name *</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. Pastor David, Sister Grace"
                    required
                    autoFocus
                    value={staffForm.name}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Mandatory Phone */}
                <div className="form-field">
                  <label className="form-label-ui">Phone Number * (Required)</label>
                  <input
                    type="tel"
                    className="input-ui"
                    placeholder="e.g. 024 123 4567 or +233..."
                    required
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                {/* Department */}
                <div className="form-field">
                  <label className="form-label-ui">Department / Ministry *</label>
                  <select
                    className="select-ui"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Purpose */}
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label-ui">Event Purpose / Program Notes (Optional)</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. Sunday Service, Camp, Sound setup..."
                    value={staffForm.purpose}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer-ui">
                <button type="button" className="btn-ui btn-secondary-ui" onClick={() => setIsFormModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-ui btn-primary-ui">
                  <FileCheck size={16} />
                  <span>Confirm &amp; Take Items</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
