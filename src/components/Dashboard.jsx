import React from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Warehouse,
  PlusCircle,
  CheckCircle2,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  History
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { KpiRow } from './KpiRow';

export const Dashboard = ({ onNavigateTab, onOpenAddItem, onOpenAdjust, onSelectItem, onOpenStaffPickup }) => {
  const { items, movements, requisitions, activeStoreroomId, setActiveStoreroomId } = useInventory();

  // Filter recent pickup movements (stock out / requisitions)
  const recentPickups = movements.filter(m => m.quantityChange < 0 || m.type === 'STOCK_OUT' || m.type === 'REQUISITION_ISSUE').slice(0, 10);

  return (
    <div style={{ width: '100%' }}>
      {/* 4 Top KPI Cards (Pure Black with Red accents) */}
      <KpiRow onOpenAddItem={onOpenAddItem} onOpenPickup={onOpenStaffPickup} />

      {/* LIVE PICKUP ACTIVITY TRACKER (Who Picked Up What and When) */}
      <div className="content-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 className="panel-title">Live Pickup &amp; Movement Log</h3>
              <span className="status-pill status-out" style={{ fontSize: '0.72rem' }}>
                Real-Time
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: '0.15rem' }}>
              Shows who picked up what item, their contact phone, and exact date/time.
            </p>
          </div>

          <div className="panel-actions">
            <button className="btn-ui btn-secondary-ui" style={{ borderRadius: '999px' }} onClick={() => onNavigateTab('movements')}>
              <History size={14} />
              <span>Full Audit Ledger</span>
            </button>
            <button className="btn-ui btn-primary-ui" style={{ borderRadius: '999px' }} onClick={onOpenStaffPickup}>
              <PlusCircle size={14} />
              <span>+ Record New Pickup</span>
            </button>
          </div>
        </div>

        {/* Live Pickups Table */}
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Who Took It (Staff &amp; Dept)</th>
                <th>Item Name</th>
                <th>Storeroom</th>
                <th>Purpose / Reason</th>
                <th style={{ textAlign: 'center' }}>Qty Taken</th>
                <th style={{ textAlign: 'right' }}>Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {recentPickups.map(m => {
                const dateObj = new Date(m.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{timeStr}</div>
                      <div style={{ fontSize: '0.72rem', color: '#71717a' }}>{dateStr}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#dc2626',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {(m.performedBy || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>
                            {m.performedBy || 'Staff Member'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{m.itemName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#71717a' }}>ID: {m.itemId}</div>
                    </td>

                    <td>
                      <span className="status-pill" style={{ background: '#1a1a1a', color: '#a1a1aa', border: '1px solid #333' }}>
                        {(m.storeroomId || 'AUD').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: '#a1a1aa', maxWidth: '280px' }}>
                      {m.reason}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#dc2626' }}>
                        {m.quantityChange}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>
                      {m.newQuantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentPickups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
            <p>No item pickups recorded yet. Pickups made by staff will automatically appear here live.</p>
          </div>
        )}
      </div>
    </div>
  );
};
