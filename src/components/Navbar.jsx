import React from 'react';
import {
  Boxes,
  LayoutDashboard,
  ClipboardList,
  History,
  BarChart3,
  Plus,
  RotateCcw,
  Download,
  Upload,
  Lock
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import firstLoveLogo from '../assets/img/first_love_logo.png';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAddItem,
  appMode,
  onLockAdmin
}) => {
  const { requisitions, resetToDefaultData, importBackupData, addToast } = useInventory();

  const pendingReqCount = requisitions.filter(r => r.status === 'Pending').length;

  const handleExportBackup = () => {
    const data = {
      items: JSON.parse(localStorage.getItem('storehub_items_v4') || '[]'),
      categories: JSON.parse(localStorage.getItem('storehub_categories_v4') || '[]'),
      requisitions: JSON.parse(localStorage.getItem('storehub_requisitions_v4') || '[]'),
      movements: JSON.parse(localStorage.getItem('storehub_movements_v4') || '[]'),
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
    <>
      {/* Top Navbar */}
      <header className="navbar no-print">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="nav-brand">
            <div className="nav-brand-logo" style={{ background: 'transparent', padding: 0 }}>
              <img src={firstLoveLogo} alt="First Love Church" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <div className="nav-brand-text">
              <h1>StoreHub</h1>
              <span>{appMode === 'admin' ? 'Custodian Admin Portal' : 'Storeroom Pickup'}</span>
            </div>
          </div>

          {/* Admin Navigation Tabs (Only visible to Admins on the /admin URL) */}
          {appMode === 'admin' && (
            <nav className="nav-links">
              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard &amp; Pickups</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                <Boxes size={15} />
                <span>Inventory</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'requisitions' ? 'active' : ''}`}
                onClick={() => setActiveTab('requisitions')}
                style={{ position: 'relative' }}
              >
                <ClipboardList size={15} />
                <span>Requisitions</span>
                {pendingReqCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '4px',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    borderRadius: '999px',
                    padding: '0.08rem 0.35rem',
                    lineHeight: 1
                  }}>
                    {pendingReqCount}
                  </span>
                )}
              </button>

              <button
                className={`nav-link ${activeTab === 'movements' ? 'active' : ''}`}
                onClick={() => setActiveTab('movements')}
              >
                <History size={15} />
                <span>Audit Log</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 size={15} />
                <span>Reports</span>
              </button>
            </nav>
          )}

          {/* Right Action buttons (Only visible to Admins on /admin) */}
          {appMode === 'admin' && (
            <div className="nav-actions">
              <button
                className="btn btn-secondary btn-icon"
                title="Export Backup"
                onClick={handleExportBackup}
              >
                <Download size={15} />
              </button>

              <label className="btn btn-secondary btn-icon" title="Import Backup" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={15} />
                <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
              </label>

              <button
                className="btn btn-secondary btn-icon"
                title="Reset to Default Data"
                onClick={() => {
                  if (window.confirm('Reset all data to original 2026 dataset?')) {
                    resetToDefaultData();
                  }
                }}
              >
                <RotateCcw size={14} />
              </button>

              <button className="btn btn-primary" onClick={onOpenAddItem} title="Add New Item">
                <Plus size={15} />
                <span>Add Item</span>
              </button>

              {/* Lock / Exit Admin Session */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#dc2626', padding: '0.35rem 0.6rem' }}
                onClick={onLockAdmin}
                title="Lock Admin and Exit"
              >
                <Lock size={14} />
                <span>Exit Admin</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation (Only for Admin Mode on /admin) */}
      {appMode === 'admin' && (
        <nav className="mobile-bottom-nav no-print">
          <button
            className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={20} />
            <span>Inventory</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'requisitions' ? 'active' : ''}`}
            onClick={() => setActiveTab('requisitions')}
            style={{ position: 'relative' }}
          >
            <ClipboardList size={20} />
            <span>Requests</span>
            {pendingReqCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '16px',
                background: '#dc2626',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 800,
                borderRadius: '999px',
                padding: '0.05rem 0.35rem',
                lineHeight: 1
              }}>
                {pendingReqCount}
              </span>
            )}
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'movements' ? 'active' : ''}`}
            onClick={() => setActiveTab('movements')}
          >
            <History size={20} />
            <span>Audit Log</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            <span>Reports</span>
          </button>
        </nav>
      )}
    </>
  );
};
