import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  UserCheck,
  ClipboardList,
  History,
  BarChart3,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import firstLoveLogo from '../assets/img/first_love_logo.png';

export const Sidebar = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { requisitions } = useInventory();
  const pendingCount = requisitions.filter(r => r.status === 'Pending').length;

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Orb (as seen in screenshot) */}
        <div className="sidebar-brand" onClick={() => setActiveTab('inventory')}>
          <div className="brand-orb" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <img src={firstLoveLogo} alt="First Love Church" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <div className="sidebar-brand-text">
            <h2>StoreHub</h2>
            <span>Storerooms</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={18} />
            <span>Inventory</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'pickup' ? 'active' : ''}`}
            onClick={() => setActiveTab('pickup')}
          >
            <UserCheck size={18} />
            <span>Staff Pickup</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'requisitions' ? 'active' : ''}`}
            onClick={() => setActiveTab('requisitions')}
          >
            <ClipboardList size={18} />
            <span>Requisitions</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'movements' ? 'active' : ''}`}
            onClick={() => setActiveTab('movements')}
          >
            <History size={18} />
            <span>Audit Log</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Reports &amp; Analysis</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={onOpenSettings}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          borderRadius: '12px',
          background: '#f8fafc'
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#0a6c61',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            SH
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Storeroom Custodian
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Active Session
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
