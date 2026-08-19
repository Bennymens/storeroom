import React, { useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { NotificationDropdown } from './NotificationDropdown';

export const TopHeader = ({ title = 'Inventory Management', onNavigateTab }) => {
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
      {/* Title & Subtitle */}
      <div className="header-title-group">
        <h1>{title}</h1>
        <p>Today, {today}</p>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Bell Notification Button (Interactive) */}
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

        {/* User Profile Badge */}
        <div className="user-profile">
          <div className="user-avatar">
            SC
          </div>
          <span className="user-name">Store Custodian</span>
          <ChevronDown size={14} style={{ color: '#71717a' }} />
        </div>
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
