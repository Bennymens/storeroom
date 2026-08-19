import React, { useState, useEffect } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { SidebarUser } from './components/SidebarUser';
import { SidebarAdmin } from './components/SidebarAdmin';
import { TopHeader } from './components/TopHeader';
import { Dashboard } from './components/Dashboard';
import { InventoryOverview } from './components/InventoryOverview';
import { StaffPickupPortal } from './components/StaffPickupPortal';
import { RequisitionHub } from './components/RequisitionHub';
import { MovementLog } from './components/MovementLog';
import { AnalyticsReports } from './components/AnalyticsReports';
import { ItemModal } from './components/ItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { StockAdjustModal } from './components/StockAdjustModal';
import { RequisitionCartDrawer } from './components/RequisitionCartDrawer';
import { RequisitionVoucherModal } from './components/RequisitionVoucherModal';
import { ToastContainer } from './components/ToastContainer';

function MainApp() {
  // App Mode based on URL: 'user' for '/' vs 'admin' for '/admin'
  const [appMode, setAppMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('/admin')) {
        return 'admin';
      }
    }
    return 'user';
  });

  // Admin Active Tab: 'inventory' | 'dashboard' | 'pickup' | 'requisitions' | 'movements' | 'analytics' | 'settings'
  const [adminTab, setAdminTab] = useState('inventory');

  // User Active Tab: 'pickup' | 'status' | 'guide'
  const [userTab, setUserTab] = useState('pickup');

  // Mobile Hamburger Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(null);

  // Sync with URL
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('/admin')) {
        setAppMode('admin');
      } else {
        setAppMode('user');
      }
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const getHeaderTitle = () => {
    if (appMode === 'user') {
      if (userTab === 'status') return 'Requisition Status Tracker';
      if (userTab === 'guide') return 'Storeroom Guidelines';
      return 'Pick & Request Items';
    }

    switch (adminTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'inventory': return 'Inventory Management';
      case 'pickup': return 'Staff Pickup Portal';
      case 'requisitions': return 'Requisitions & Gate Passes';
      case 'movements': return 'Stock Movements & Audit Log';
      case 'analytics': return 'Reports & Analysis';
      case 'settings': return 'Settings & Backups';
      default: return 'Inventory Management';
    }
  };

  return (
    <div className="app-wrapper">
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className="dashboard-shell">
        {/* SIDEBAR: Dedicated User Sidebar on '/' vs Admin Sidebar on '/admin' */}
        {appMode === 'user' ? (
          <SidebarUser
            userTab={userTab}
            setUserTab={setUserTab}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        ) : (
          <SidebarAdmin
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN VIEWPORT */}
        <div className="main-viewport">
          <TopHeader
            title={getHeaderTitle()}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNavigateTab={(tab) => {
              if (appMode === 'admin') setAdminTab(tab);
              else if (tab === 'requisitions') setUserTab('status');
              else setUserTab('pickup');
            }}
          />

          <div className="view-content">
            {/* USER VIEWPORT ('/') */}
            {appMode === 'user' && (
              <StaffPickupPortal userTab={userTab} />
            )}

            {/* ADMIN VIEWPORT ('/admin') */}
            {appMode === 'admin' && (
              <>
                {adminTab === 'inventory' && (
                  <InventoryOverview
                    onSelectItem={(item) => setSelectedItem(item)}
                    onOpenAddItem={() => setIsAddItemOpen(true)}
                    onOpenEditItem={(item) => setEditItem(item)}
                    onOpenAdjustModal={(item) => setAdjustItem(item)}
                    onOpenPickup={() => setAdminTab('pickup')}
                  />
                )}

                {adminTab === 'dashboard' && (
                  <Dashboard
                    onNavigateTab={setAdminTab}
                    onOpenAddItem={() => setIsAddItemOpen(true)}
                    onOpenAdjust={(item) => setAdjustItem(item)}
                    onSelectItem={(item) => setSelectedItem(item)}
                    onOpenStaffPickup={() => setAdminTab('pickup')}
                  />
                )}

                {adminTab === 'pickup' && (
                  <StaffPickupPortal userTab="pickup" />
                )}

                {adminTab === 'requisitions' && (
                  <RequisitionHub
                    onOpenCart={() => setIsCartOpen(true)}
                    onOpenVoucher={(req) => setActiveVoucher(req)}
                  />
                )}

                {adminTab === 'movements' && (
                  <MovementLog />
                )}

                {adminTab === 'analytics' && (
                  <AnalyticsReports />
                )}

                {adminTab === 'settings' && (
                  <div className="content-panel" style={{ maxWidth: '700px' }}>
                    <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Storeroom System Settings</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Manage inventory data backups and system restore points.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-ui btn-primary-ui"
                        onClick={() => {
                          const data = {
                            items: JSON.parse(localStorage.getItem('storehub_items_v4') || '[]'),
                            categories: JSON.parse(localStorage.getItem('storehub_categories_v4') || '[]'),
                            requisitions: JSON.parse(localStorage.getItem('storehub_requisitions_v4') || '[]'),
                            movements: JSON.parse(localStorage.getItem('storehub_movements_v4') || '[]'),
                            exportedAt: new Date().toISOString()
                          };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `StoreHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                        }}
                      >
                        Export Complete JSON Backup
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add New Item Modal */}
      <ItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />

      {/* Edit Item Modal */}
      <ItemModal
        isOpen={!!editItem}
        editItem={editItem}
        onClose={() => setEditItem(null)}
      />

      {/* Item Details Modal */}
      <ItemDetailModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenAdjust={(item) => setAdjustItem(item)}
        onOpenEdit={(item) => setEditItem(item)}
      />

      {/* Quick Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={!!adjustItem}
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
      />

      {/* Requisition Cart Drawer */}
      <RequisitionCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRequisitionCreated={() => {
          setAdminTab('requisitions');
        }}
      />

      {/* Printable Requisition Voucher Modal */}
      <RequisitionVoucherModal
        isOpen={!!activeVoucher}
        requisition={activeVoucher}
        onClose={() => setActiveVoucher(null)}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainApp />
    </InventoryProvider>
  );
}
