import React, { useState } from 'react';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const MovementLog = () => {
  const { movements, addToast } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [storeroomFilter, setStoreroomFilter] = useState('ALL');

  const filteredMovements = movements.filter(m => {
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    if (storeroomFilter !== 'ALL' && m.storeroomId !== storeroomFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = m.itemName?.toLowerCase().includes(q);
      const matchReason = m.reason?.toLowerCase().includes(q);
      const matchStaff = m.performedBy?.toLowerCase().includes(q);
      const matchId = m.id?.toLowerCase().includes(q);
      if (!matchName && !matchReason && !matchStaff && !matchId) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) {
      addToast('No audit logs to export', 'error');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'Item Name', 'Storeroom', 'Movement Type', 'Qty Delta', 'Previous Stock', 'New Stock', 'Reason', 'Performed By'];
    const rows = filteredMovements.map(m => [
      `"${m.id}"`,
      `"${m.timestamp}"`,
      `"${(m.itemName || '').replace(/"/g, '""')}"`,
      `"${(m.storeroomId || '').toUpperCase()}"`,
      `"${m.type}"`,
      m.quantityChange,
      m.previousQuantity,
      m.newQuantity,
      `"${(m.reason || '').replace(/"/g, '""')}"`,
      `"${(m.performedBy || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredMovements.length} audit records`, 'success');
  };

  const getMovementBadge = (type, qty) => {
    if (qty > 0) {
      return (
        <span className="status-pill status-good" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <ArrowDownLeft size={13} />
          <span>Stock In (+{qty})</span>
        </span>
      );
    }
    return (
      <span className="status-pill status-out" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <ArrowUpRight size={13} />
        <span>Stock Out ({qty})</span>
      </span>
    );
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Stock Movements &amp; Audit Ledger</h3>
          <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: '0.15rem' }}>
            Permanent record of who took what items, exact timestamps, and stock balance changes.
          </p>
        </div>

        <div className="panel-actions">
          <div className="header-search" style={{ minWidth: '220px' }}>
            <Search size={15} className="header-search-icon" />
            <input
              type="text"
              placeholder="Search item, person, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select-ui"
            style={{ width: 'auto', padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.85rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="STOCK_OUT">Stock Out / Pickups</option>
            <option value="STOCK_IN">Stock In / Restock</option>
            <option value="ADJUSTMENT">Manual Adjustments</option>
          </select>

          <select
            className="select-ui"
            style={{ width: 'auto', padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.85rem' }}
            value={storeroomFilter}
            onChange={(e) => setStoreroomFilter(e.target.value)}
          >
            <option value="ALL">All Storerooms</option>
            <option value="aud">1. Aud Storeroom</option>
            <option value="md">2. MD Storeroom</option>
            <option value="poimen">3. Poimen Storeroom</option>
          </select>

          <button className="btn-ui btn-primary-ui" style={{ borderRadius: '999px' }} onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Person (Who Took It)</th>
              <th>Item Name</th>
              <th>Storeroom</th>
              <th>Movement</th>
              <th>Stock Balance</th>
              <th>Purpose &amp; Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map(m => {
              const dateObj = new Date(m.timestamp);
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <tr key={m.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{formattedTime}</div>
                    <div style={{ fontSize: '0.72rem', color: '#71717a' }}>{formattedDate}</div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#dc2626',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {(m.performedBy || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>
                        {m.performedBy || 'Staff Member'}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{m.itemName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#71717a' }}>ID: {m.itemId}</div>
                  </td>

                  <td>
                    <span className="status-pill" style={{ background: '#1a1a1a', color: '#a1a1aa', border: '1px solid #333' }}>
                      {(m.storeroomId || 'AUD').toUpperCase()}
                    </span>
                  </td>

                  <td>
                    {getMovementBadge(m.type, m.quantityChange)}
                  </td>

                  <td style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                    {m.previousQuantity} &rarr; <strong style={{ color: '#ffffff' }}>{m.newQuantity}</strong>
                  </td>

                  <td style={{ fontSize: '0.82rem', color: '#a1a1aa', maxWidth: '300px' }}>
                    {m.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredMovements.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#71717a' }}>
          <History size={32} style={{ color: '#333', margin: '0 auto 0.5rem' }} />
          <p>No audit records found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
