import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Printer,
  Search,
  Plus,
  Boxes,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const RequisitionHub = ({ onOpenCart, onOpenVoucher }) => {
  const { requisitions, updateRequisitionStatus, fulfillRequisition } = useInventory();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = requisitions.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!req.id.toLowerCase().includes(q) &&
          !req.requestorName.toLowerCase().includes(q) &&
          !req.department.toLowerCase().includes(q) &&
          !req.items.some(i => i.itemName.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="content-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Requisitions &amp; Gate Passes</h3>
          <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: '0.15rem' }}>
            Review item requests, approve requisitions, and print material gate passes.
          </p>
        </div>

        <div className="panel-actions">
          <div className="header-search" style={{ minWidth: '220px' }}>
            <Search size={15} className="header-search-icon" />
            <input
              type="text"
              placeholder="Search request or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select-ui"
            style={{ width: 'auto', padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({requisitions.length})</option>
            <option value="Pending">Pending ({requisitions.filter(r => r.status === 'Pending').length})</option>
            <option value="Approved">Approved ({requisitions.filter(r => r.status === 'Approved').length})</option>
            <option value="Fulfilled">Fulfilled ({requisitions.filter(r => r.status === 'Fulfilled').length})</option>
          </select>

          <button className="btn-ui btn-primary-ui" style={{ borderRadius: '999px' }} onClick={onOpenCart}>
            <Plus size={15} />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Requisitions List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(req => {
          const isPending = req.status === 'Pending';
          const isApproved = req.status === 'Approved';

          let statusClass = 'status-good';
          if (isPending) statusClass = 'status-low';
          else if (req.status === 'Rejected') statusClass = 'status-out';

          return (
            <div
              key={req.id}
              style={{
                background: '#181818',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      #{req.id}
                    </span>
                    <span className={`status-pill ${statusClass}`}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#a1a1aa', flexWrap: 'wrap' }}>
                    <span>Requestor: <strong style={{ color: '#ffffff' }}>{req.requestorName}</strong></span>
                    <span>Phone: <strong>{req.phone || 'N/A'}</strong></span>
                    <span>Department: <strong>{req.department}</strong></span>
                    <span>Needed: <strong>{req.dateNeeded}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button className="btn-ui btn-secondary-ui" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => onOpenVoucher(req)}>
                    <Printer size={14} />
                    <span>Print Gate Pass</span>
                  </button>

                  {isPending && (
                    <button className="btn-ui btn-primary-ui" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => updateRequisitionStatus(req.id, 'Approved')}>
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                  )}

                  {(isApproved || isPending) && (
                    <button
                      className="btn-ui btn-primary-ui"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (window.confirm(`Fulfill requisition #${req.id}? Stock will be automatically deducted.`)) {
                          fulfillRequisition(req.id);
                        }
                      }}
                    >
                      <Boxes size={14} />
                      <span>Fulfill &amp; Issue</span>
                    </button>
                  )}
                </div>
              </div>

              {req.purpose && (
                <div style={{ fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.75rem', background: '#111111', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #222' }}>
                  <strong>Purpose:</strong> {req.purpose}
                </div>
              )}

              {/* Items Table */}
              <div style={{ background: '#111111', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#0d0d0d', color: '#71717a', textAlign: 'left', borderBottom: '1px solid #222' }}>
                      <th style={{ padding: '0.5rem 0.85rem' }}>Item</th>
                      <th style={{ padding: '0.5rem 0.85rem' }}>Storeroom</th>
                      <th style={{ padding: '0.5rem 0.85rem', textAlign: 'right' }}>Qty Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {req.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < req.items.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                        <td style={{ padding: '0.5rem 0.85rem', fontWeight: 600, color: '#ffffff' }}>{it.itemName}</td>
                        <td style={{ padding: '0.5rem 0.85rem' }}>
                          <span className="status-pill" style={{ background: '#1a1a1a', color: '#a1a1aa', border: '1px solid #333' }}>
                            {it.storeroomId.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                          {it.quantityRequested} {it.unit || 'pcs'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#71717a' }}>
            <ClipboardList size={32} style={{ color: '#333', margin: '0 auto 0.5rem' }} />
            <p>No requisitions found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
