import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Download,
  Warehouse,
  Layers,
  Eye,
  SlidersHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { KpiRow } from './KpiRow';

export const InventoryOverview = ({ onSelectItem, onOpenAddItem, onOpenEditItem, onOpenAdjustModal, onOpenPickup }) => {
  const {
    items,
    deleteItem,
    activeStoreroomId,
    setActiveStoreroomId,
    categories,
    addToast
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Filter items based on active storeroom tab, category, and search query
  const filteredItems = items.filter(item => {
    // Storeroom Tab Filter
    if (activeStoreroomId !== 'all' && item.storeroomId !== activeStoreroomId) {
      return false;
    }
    // Category Filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      const matchLocation = item.locationRack?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchLocation && !matchId) {
        return false;
      }
    }
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = ['ID', 'Item Name', 'Storeroom', 'Category', 'Quantity', 'Unit', 'Location', 'Status', 'Last Updated'];
    const rows = filteredItems.map(i => [
      `"${i.id}"`, `"${i.name}"`, `"${i.storeroomId.toUpperCase()}"`, `"${i.category}"`,
      i.quantity, `"${i.unit || 'units'}"`, `"${i.locationRack || ''}"`, `"${i.status}"`, `"${i.lastUpdated || ''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Inventory_${activeStoreroomId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredItems.length} items to CSV`, 'success');
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top 4 KPI Metric Cards (As seen in Screenshot) */}
      <KpiRow />

      {/* Main Panel: Inventory Overview (Matching Screenshot) */}
      <div className="content-panel">
        {/* Panel Header */}
        <div className="panel-header">
          <h3 className="panel-title">Inventory Overview</h3>

          <div className="panel-actions">
            {/* Search Item Input (Pill matching screenshot) */}
            <div className="header-search" style={{ minWidth: '220px' }}>
              <Search size={15} className="header-search-icon" />
              <input
                type="text"
                placeholder="Search item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown (Pill matching screenshot) */}
            <select
              className="select-ui"
              style={{ width: 'auto', padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Filter Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Export CSV Button */}
            <button className="btn-ui btn-secondary-ui" style={{ borderRadius: '999px' }} onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export</span>
            </button>

            {/* + Add Item Button (Matching Screenshot) */}
            <button className="btn-ui btn-primary-ui" style={{ borderRadius: '999px' }} onClick={onOpenAddItem}>
              <Plus size={16} />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Storeroom Selector Tabs */}
        <div className="storeroom-tabs">
          <button
            className={`storeroom-tab ${activeStoreroomId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStoreroomId('all')}
          >
            <Layers size={15} />
            <span>All Storerooms ({items.length})</span>
          </button>

          <button
            className={`storeroom-tab ${activeStoreroomId === 'aud' ? 'active' : ''}`}
            onClick={() => setActiveStoreroomId('aud')}
          >
            <Warehouse size={15} />
            <span>1. Aud Storeroom ({items.filter(i => i.storeroomId === 'aud').length})</span>
          </button>

          <button
            className={`storeroom-tab ${activeStoreroomId === 'md' ? 'active' : ''}`}
            onClick={() => setActiveStoreroomId('md')}
          >
            <Warehouse size={15} />
            <span>2. MD Storeroom ({items.filter(i => i.storeroomId === 'md').length})</span>
          </button>

          <button
            className={`storeroom-tab ${activeStoreroomId === 'poimen' ? 'active' : ''}`}
            onClick={() => setActiveStoreroomId('poimen')}
          >
            <Warehouse size={15} />
            <span>3. Poimen Storeroom ({items.filter(i => i.storeroomId === 'poimen').length})</span>
          </button>
        </div>

        {/* Main Table (Matching Screenshot) */}
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredItems.length ? (
                      <CheckSquare size={18} style={{ color: '#991b1b' }} />
                    ) : (
                      <Square size={18} style={{ color: '#71717a' }} />
                    )}
                  </button>
                </th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Storage Location</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                const oos = item.quantity <= 0;
                const low = item.quantity > 0 && item.quantity <= item.minThreshold;

                let statusClass = 'status-good';
                let statusLabel = 'In Stock';
                if (oos) {
                  statusClass = 'status-out';
                  statusLabel = 'Out of Stock';
                } else if (low) {
                  statusClass = 'status-low';
                  statusLabel = 'Low Stock';
                }

                return (
                  <tr key={item.id} style={{ background: isSelected ? '#1c1214' : 'transparent' }}>
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        {isSelected ? (
                          <CheckSquare size={18} style={{ color: '#991b1b' }} />
                        ) : (
                          <Square size={18} style={{ color: '#383844' }} />
                        )}
                      </button>
                    </td>

                    {/* Item Name */}
                    <td>
                      <div
                        style={{ fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}
                        onClick={() => onSelectItem(item)}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
                        SKU: {item.id} &bull; <span style={{ color: '#a1a1aa' }}>{(item.storeroomId || '').toUpperCase()}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: '#1c1c22',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#a1a1aa',
                        border: '1px solid #272730'
                      }}>
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td>
                      <strong style={{ color: '#ffffff', fontWeight: 800 }}>
                        {item.quantity} {item.unit || 'pcs'}
                      </strong>
                    </td>

                    {/* Storage Location */}
                    <td style={{ color: '#a1a1aa' }}>
                      {item.locationRack || 'Shelf / Pantry'}
                    </td>

                    {/* Last Updated */}
                    <td style={{ color: '#71717a', fontSize: '0.8rem' }}>
                      {item.lastUpdated || 'Aug 17, 2026'}
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Actions (Matching Screenshot Pencil & ... Menu) */}
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          className="btn-ghost-ui"
                          style={{ padding: '0.35rem', borderRadius: '50%' }}
                          title="Edit Item"
                          onClick={() => onOpenEditItem(item)}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          className="btn-ghost-ui"
                          style={{ padding: '0.35rem', borderRadius: '50%' }}
                          title="More Actions"
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Popover Action Menu */}
                      {openDropdownId === item.id && (
                        <>
                          <div
                            style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '40px',
                            background: '#18181c',
                            border: '1px solid #272730',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
                            padding: '0.4rem',
                            zIndex: 70,
                            minWidth: '150px',
                            textAlign: 'left'
                          }}>
                            <button
                              className="nav-item"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                              onClick={() => {
                                setOpenDropdownId(null);
                                onSelectItem(item);
                              }}
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>

                            <button
                              className="nav-item"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                              onClick={() => {
                                setOpenDropdownId(null);
                                onOpenAdjustModal(item);
                              }}
                            >
                              <SlidersHorizontal size={14} />
                              <span>Adjust Stock</span>
                            </button>

                            <button
                              className="nav-item"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', color: '#f87171' }}
                              onClick={() => {
                                setOpenDropdownId(null);
                                if (window.confirm(`Delete "${item.name}" from inventory?`)) {
                                  deleteItem(item.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Delete Item</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
            <p>No inventory items match your search filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
