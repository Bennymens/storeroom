import React from 'react';
import {
  Boxes,
  UserCheck,
  ClipboardList,
  Info,
  X
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import firstLoveLogo from '../assets/img/first_love_logo.png';

export const SidebarUser = ({ userTab, setUserTab, isOpen, onClose }) => {
  const { requisitions } = useInventory();
  const pendingCount = requisitions.filter(r => r.status === 'Pending').length;

  const handleNavClick = (tab) => {
    setUserTab(tab);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div>
        {/* Brand & Mobile Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div className="sidebar-brand" style={{ margin: 0 }} onClick={() => handleNavClick('pickup')}>
            <div className="brand-orb" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
              <img src={firstLoveLogo} alt="First Love Church" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            </div>
            <div className="sidebar-brand-text">
              <h2>StoreHub</h2>
              <span>Storeroom Pickup</span>
            </div>
          </div>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={onClose}
            className="hamburger-btn"
            style={{ display: isOpen ? 'flex' : undefined, width: 34, height: 34, marginRight: 0 }}
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Nav (Hamburger Menu on Mobile) */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${userTab === 'pickup' ? 'active' : ''}`}
            onClick={() => handleNavClick('pickup')}
          >
            <UserCheck size={18} />
            <span>Pick &amp; Request Items</span>
          </button>

          <button
            className={`nav-item ${userTab === 'status' ? 'active' : ''}`}
            onClick={() => handleNavClick('status')}
          >
            <ClipboardList size={18} />
            <span>Requisition Status</span>
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>

          <button
            className={`nav-item ${userTab === 'guide' ? 'active' : ''}`}
            onClick={() => handleNavClick('guide')}
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
          background: '#121215',
          border: '1px solid #1c1c22'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#991b1b',
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
