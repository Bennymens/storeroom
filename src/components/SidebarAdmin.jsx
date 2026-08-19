import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  History,
  BarChart3,
  Settings,
  UserCheck,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const SidebarAdmin = ({ activeTab, setActiveTab }) => {
  const { requisitions, resetToDefaultData, importBackupData, addToast } = useInventory();
  const pendingCount = requisitions.filter(r => r.status === 'Pending').length;

  const handleExportBackup = () => {
    const data = {
      items: JSON.parse(localStorage.getItem('storehub_items_v2') || '[]'),
      categories: JSON.parse(localStorage.getItem('storehub_categories_v2') || '[]'),
      requisitions: JSON.parse(localStorage.getItem('storehub_requisitions_v2') || '[]'),
      movements: JSON.parse(localStorage.getItem('storehub_movements_v2') || '[]'),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StoreHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup exported successfully!', 'success');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importBackupData(json);
      } catch (err) {
        addToast('Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Orb (as seen in screenshot) */}
        <div className="sidebar-brand" onClick={() => setActiveTab('inventory')}>
          <div className="brand-orb">
            <Boxes size={22} />
          </div>
          <div className="sidebar-brand-text">
            <h2>StoreHub</h2>
            <span>Storerooms</span>
          </div>
        </div>

        {/* Navigation Menu (Matching Screenshot) */}
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
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile (Matching Screenshot) */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          borderRadius: '12px',
          background: '#121215',
          border: '1px solid #1c1c22'
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#991b1b',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            SC
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Store Custodian
            </div>
            <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
              Admin Session
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
