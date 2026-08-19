import React from 'react';
import {
  Boxes,
  UserCheck,
  ClipboardList,
  Info,
  Warehouse
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const SidebarUser = ({ userTab, setUserTab }) => {
  const { requisitions } = useInventory();
  const pendingCount = requisitions.filter(r => r.status === 'Pending').length;

  return (
    <aside className="sidebar">
      <div>
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => setUserTab('pickup')}>
          <div className="brand-orb">
            <Boxes size={22} />
          </div>
          <div className="sidebar-brand-text">
            <h2>StoreHub</h2>
            <span>Storeroom Pickup</span>
          </div>
        </div>

        {/* User Nav */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${userTab === 'pickup' ? 'active' : ''}`}
            onClick={() => setUserTab('pickup')}
          >
            <UserCheck size={18} />
            <span>Pick &amp; Request Items</span>
          </button>

          <button
            className={`nav-item ${userTab === 'status' ? 'active' : ''}`}
            onClick={() => setUserTab('status')}
          >
            <ClipboardList size={18} />
            <span>Requisition Status</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>

          <button
            className={`nav-item ${userTab === 'guide' ? 'active' : ''}`}
            onClick={() => setUserTab('guide')}
          >
            <Info size={18} />
            <span>Pickup Guidelines</span>
          </button>
        </nav>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.65rem',
          borderRadius: '10px',
          background: '#111111',
          border: '1px solid #1e1e1e'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#dc2626',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ST
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
              Staff &amp; Ministry Member
            </div>
            <div style={{ fontSize: '0.7rem', color: '#71717a' }}>
              Self-Service Portal
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
