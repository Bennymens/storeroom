import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Minus, ShoppingCart, Edit2, Trash2, Eye,
  SlidersHorizontal, LayoutGrid, List, Download, AlertCircle, MapPin
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const InventoryList = ({ onSelectItem, onOpenAddItem, onOpenEditItem, onOpenAdjustModal }) => {
  const { items, categories, activeStoreroomId, adjustStock, deleteItem, addToCart, addToast } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table'));
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeStoreroomId !== 'all' && item.storeroomId !== activeStoreroomId) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.category?.toLowerCase().includes(q) &&
            !item.locationRack?.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (statusFilter === 'IN_STOCK' && item.quantity <= item.minThreshold) return false;
      if (statusFilter === 'LOW_STOCK' && (item.quantity <= 0 || item.quantity > item.minThreshold)) return false;
      if (statusFilter === 'OUT_OF_STOCK' && item.quantity > 0) return false;
      return true;
    }).sort((a, b) => {
      let c = 0;
      if (sortBy === 'name') c = a.name.localeCompare(b.name);
      else if (sortBy === 'quantity') c = Number(a.quantity) - Number(b.quantity);
      else if (sortBy === 'category') c = (a.category || '').localeCompare(b.category || '');
      return sortOrder === 'asc' ? c : -c;
    });
  }, [items, activeStoreroomId, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    if (!filteredItems.length) { addToast('No items to export', 'error'); return; }
    const headers = ['ID','Name','Storeroom','Category','Qty','Unit','Min','Location','Status','Last Updated'];
    const rows = filteredItems.map(i => [
      `"${i.id}"`,`"${i.name}"`,`"${i.storeroomId.toUpperCase()}"`,`"${i.category}"`,
      i.quantity,`"${i.unit||'units'}"`,i.minThreshold,`"${i.locationRack||''}"`,`"${i.status}"`,`"${i.lastUpdated||''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Inventory_${activeStoreroomId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    addToast(`Exported ${filteredItems.length} items`, 'success');
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar no-print">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" className="form-input" placeholder="Search items, categories, racks..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ minWidth: '150px' }}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select className="form-select" value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [s,o]=e.target.value.split('-'); setSortBy(s); setSortOrder(o); }} style={{ minWidth: '140px' }}>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="quantity-asc">Stock Low→High</option>
            <option value="quantity-desc">Stock High→Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <div style={{ background: '#1a1a1a', padding: '0.2rem', borderRadius: '10px', display: 'flex', border: '1px solid #222' }}>
            <button className="btn btn-ghost btn-sm" style={{ background: viewMode === 'table' ? '#222' : 'transparent' }} onClick={() => setViewMode('table')}><List size={14} /></button>
            <button className="btn btn-ghost btn-sm" style={{ background: viewMode === 'grid' ? '#222' : 'transparent' }} onClick={() => setViewMode('grid')}><LayoutGrid size={14} /></button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}><Download size={14} /><span>CSV</span></button>
        </div>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }} className="no-print">
        {[
          { key: 'ALL', label: `All (${items.length})` },
          { key: 'IN_STOCK', label: `In Stock (${items.filter(i => i.quantity > i.minThreshold).length})` },
          { key: 'LOW_STOCK', label: `Low (${items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length})` },
          { key: 'OUT_OF_STOCK', label: `Out (${items.filter(i => i.quantity <= 0).length})` }
        ].map(f => (
          <button key={f.key} className={`btn btn-sm ${statusFilter === f.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Storeroom</th>
                <th>Category</th>
                <th>Location</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const oos = item.quantity <= 0;
                const low = item.quantity > 0 && item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id}>
                    <td style={{ minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => onSelectItem(item)}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#666' }}>SKU: {item.id}</div>
                    </td>
                    <td><span className="badge badge-aud">{item.storeroomId.toUpperCase()}</span></td>
                    <td style={{ color: '#999', fontSize: '0.82rem' }}>{item.category}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#888' }}>
                        <MapPin size={12} />{item.locationRack || 'General'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', minWidth: '140px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" style={{ width: 24, height: 24, padding: 0 }} disabled={item.quantity<=0}
                          onClick={() => adjustStock(item.id, -1, 'Quick -1')}><Minus size={12} /></button>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '32px', color: oos ? '#f87171' : low ? '#facc15' : '#fff' }}>{item.quantity}</span>
                        <button className="btn btn-ghost btn-sm" style={{ width: 24, height: 24, padding: 0 }}
                          onClick={() => adjustStock(item.id, 1, 'Quick +1')}><Plus size={12} /></button>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#666' }}>min: {item.minThreshold}</div>
                    </td>
                    <td><span className={`badge ${oos ? 'badge-out-of-stock' : low ? 'badge-low-stock' : 'badge-in-stock'}`}>{item.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.5rem' }} onClick={() => addToCart(item, 1)} disabled={oos} title="Request"><ShoppingCart size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }} onClick={() => onOpenAdjustModal(item)} title="Adjust"><SlidersHorizontal size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }} onClick={() => onSelectItem(item)} title="View"><Eye size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }} onClick={() => onOpenEditItem(item)} title="Edit"><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem', color: '#dc2626' }}
                          onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) deleteItem(item.id); }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredItems.map(item => {
            const oos = item.quantity <= 0;
            const low = item.quantity > 0 && item.quantity <= item.minThreshold;
            const max = Math.max(item.minThreshold * 3, item.quantity, 10);
            const pct = Math.min(100, Math.round((item.quantity / max) * 100));
            return (
              <div key={item.id} className="item-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-aud">{item.storeroomId.toUpperCase()}</span>
                    <span className={`badge ${oos ? 'badge-out-of-stock' : low ? 'badge-low-stock' : 'badge-in-stock'}`}>{item.status}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', cursor: 'pointer' }} onClick={() => onSelectItem(item)}>{item.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.6rem' }}>{item.category} · {item.locationRack || 'Shelf'}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#666' }}>Stock</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: oos ? '#f87171' : low ? '#facc15' : '#fff' }}>{item.quantity}</span>
                  </div>
                  <div style={{ height: '3px', background: '#222', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: oos ? '#dc2626' : low ? '#eab308' : '#22c55e' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => addToCart(item, 1)} disabled={oos}>
                      <ShoppingCart size={13} /><span>Request</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenAdjustModal(item)}><SlidersHorizontal size={13} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onSelectItem(item)}><Eye size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#111', borderRadius: '14px', border: '1px solid #222', marginTop: '1rem' }}>
          <AlertCircle size={40} style={{ color: '#666', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No items found</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Try adjusting your search or filters.</p>
          <button className="btn btn-primary" onClick={onOpenAddItem}><Plus size={16} />Add Item</button>
        </div>
      )}
    </div>
  );
};
