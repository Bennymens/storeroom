import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { NotificationDropdown } from './NotificationDropdown';

export const TopHeader = ({ title = 'Inventory Management', onNavigateTab, onToggleMobileMenu }) => {
  const { items, requisitions } = useInventory();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Count active pending requests + low stock items
  const pendingReqCount = requisitions.filter(r => r.status === 'Pending').length;
  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;
  const totalAlertCount = pendingReqCount + lowStockCount;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="top-header" style={{ position: 'relative' }}>
      {/* Left: Title & Subtitle */}
      <div className="header-title-group">
        <h1>{title}</h1>
        <p>Today, {today}</p>
      </div>

      {/* Right Header Actions: Notification Bell + Hamburger Menu */}
      <div className="header-actions">
        {/* Bell Notification Button */}
        <button
          className="bell-btn"
          title="Notifications & Alerts"
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          style={{
            borderColor: isNotifOpen ? '#991b1b' : undefined,
            background: isNotifOpen ? '#1c1c22' : undefined
          }}
        >
          <Bell size={18} style={{ color: isNotifOpen ? '#ffffff' : '#a1a1aa' }} />
          {totalAlertCount > 0 && <span className="bell-dot" />}
        </button>

        {/* Hamburger Toggle Button (Beside notification bell on the right) */}
        <button
          className="hamburger-btn"
          onClick={onToggleMobileMenu}
          title="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Popover Notification Dropdown */}
      <NotificationDropdown
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateTab={onNavigateTab}
      />
    </header>
  );
};
