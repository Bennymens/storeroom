import React, { useState, useEffect } from 'react';
import { X, Save, Warehouse } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const ItemModal = ({ isOpen, onClose, editItem = null }) => {
  const { categories, addItem, updateItem } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    storeroomId: 'aud',
    packageDetail: '',
    quantity: 10,
    unit: 'pcs',
    minThreshold: 5,
    locationRack: '',
    costPerUnit: '',
    notes: ''
  });

  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        category: editItem.category || 'General',
        storeroomId: editItem.storeroomId || 'aud',
        packageDetail: editItem.packageDetail || '',
        quantity: editItem.quantity || 0,
        unit: editItem.unit || 'pcs',
        minThreshold: editItem.minThreshold || 5,
        locationRack: editItem.locationRack || '',
        costPerUnit: editItem.costPerUnit || '',
        notes: editItem.notes || ''
      });
    } else {
      setFormData({
        name: '',
        category: categories[0] || 'General',
        storeroomId: 'aud',
        packageDetail: '',
        quantity: 10,
        unit: 'pcs',
        minThreshold: 5,
        locationRack: '',
        costPerUnit: '',
        notes: ''
      });
    }
  }, [editItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    editItem ? updateItem(editItem.id, formData) : addItem(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-ui">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {editItem ? 'Edit Inventory Item' : '+ Add New Inventory Item'}
          </h3>
          <button className="btn-ui btn-ghost-ui" style={{ padding: '0.35rem', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body-ui">
            {/* Storeroom Selector */}
            <div className="form-field">
              <label className="form-label-ui">Select Storeroom Location *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'aud', label: '1. Aud Storeroom' },
                  { id: 'md', label: '2. MD Storeroom' },
                  { id: 'poimen', label: '3. Poimen Storeroom' }
                ].map(sr => (
                  <button
                    key={sr.id}
                    type="button"
                    className={`btn-ui ${formData.storeroomId === sr.id ? 'btn-primary-ui' : 'btn-secondary-ui'}`}
                    style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', borderRadius: '10px' }}
                    onClick={() => setFormData(prev => ({ ...prev, storeroomId: sr.id }))}
                  >
                    <Warehouse size={15} />
                    <span>{sr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Item Name */}
            <div className="form-field">
              <label className="form-label-ui">Item Name *</label>
              <input
                type="text"
                className="input-ui"
                placeholder="e.g. Shure SM58 Microphone"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label-ui" style={{ margin: 0 }}>Category *</label>
                <button
                  type="button"
                  className="btn-ui btn-ghost-ui"
                  style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}
                  onClick={() => setShowNewCat(!showNewCat)}
                >
                  + Custom Category
                </button>
              </div>

              {!showNewCat ? (
                <select
                  className="select-ui"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="New category name..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-ui btn-primary-ui"
                    onClick={() => {
                      if (newCatInput.trim()) {
                        setFormData(prev => ({ ...prev, category: newCatInput.trim() }));
                        setNewCatInput('');
                        setShowNewCat(false);
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Quantity, Unit, Min Threshold */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div className="form-field">
                <label className="form-label-ui">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="input-ui"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-field">
                <label className="form-label-ui">Unit</label>
                <input
                  type="text"
                  className="input-ui"
                  placeholder="pcs / packs"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label className="form-label-ui">Low Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  className="input-ui"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, minThreshold: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Rack Location & Packaging */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-field">
                <label className="form-label-ui">Storage Location / Rack</label>
                <input
                  type="text"
                  className="input-ui"
                  placeholder="e.g. Rack A-02, Shelf 3"
                  value={formData.locationRack}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationRack: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label className="form-label-ui">Packaging Detail</label>
                <input
                  type="text"
                  className="input-ui"
                  placeholder="e.g. Box of 50"
                  value={formData.packageDetail}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageDetail: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer-ui">
            <button type="button" className="btn-ui btn-secondary-ui" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-ui btn-primary-ui">
              <Save size={15} />
              <span>{editItem ? 'Save Changes' : 'Create Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
