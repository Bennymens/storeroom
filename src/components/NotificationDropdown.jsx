import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  ChevronRight,
  Package,
  X
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const NotificationDropdown = ({ isOpen, onClose, onNavigateTab }) => {
  const { items, requisitions, movements } = useInventory();
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'REQUESTS' | 'ALERTS'
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('fl_inventory_read_notifications') || localStorage.getItem('storehub_read_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Aggregate dynamic live notifications
  const notifications = [];

  // 1. Pending Requisitions
  requisitions
    .filter(r => r.status === 'Pending')
    .forEach(req => {
      notifications.push({
        id: `req-${req.id}`,
        type: 'REQUEST',
        title: `Requisition #${req.id} Pending`,
        message: `${req.requestorName} (${req.department}) requested ${req.items.length} item(s) for "${req.purpose || 'Church event'}".`,
        timestamp: req.createdAt || 'Just now',
        priority: req.priority || 'High',
        actionTab: 'requisitions'
      });
    });

  // 2. Out of Stock Alerts
  items
    .filter(i => i.quantity <= 0)
    .forEach(item => {
      notifications.push({
        id: `oos-${item.id}`,
        type: 'OOS',
        title: `Out of Stock: ${item.name}`,
        message: `Stock level has reached 0 ${item.unit || 'pcs'} in ${(item.storeroomId || 'AUD').toUpperCase()} storeroom. Restock required.`,
        timestamp: 'Critical Alert',
        priority: 'Urgent',
        actionTab: 'inventory'
      });
    });

  // 3. Low Stock Alerts
  items
    .filter(i => i.quantity > 0 && i.quantity <= i.minThreshold)
    .forEach(item => {
      notifications.push({
        id: `low-${item.id}`,
        type: 'LOW_STOCK',
        title: `Low Stock: ${item.name}`,
        message: `Only ${item.quantity} ${item.unit || 'pcs'} remaining (threshold is ${item.minThreshold}).`,
        timestamp: 'Threshold Alert',
        priority: 'Medium',
        actionTab: 'inventory'
      });
    });

  // 4. Recent Pickups (Stock Out)
  movements
    .filter(m => m.quantityChange < 0)
    .slice(0, 3)
    .forEach(mov => {
      notifications.push({
        id: `mov-${mov.id}`,
        type: 'MOVEMENT',
        title: `Item Taken: ${mov.itemName}`,
        message: `${mov.performedBy || 'Staff member'} took ${Math.abs(mov.quantityChange)} units from ${(mov.storeroomId || 'AUD').toUpperCase()}.`,
        timestamp: new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: 'Info',
        actionTab: 'movements'
      });
    });

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('fl_inventory_read_notifications', JSON.stringify(allIds));
  };

  const handleItemClick = (notif) => {
    if (!readIds.includes(notif.id)) {
      const updated = [...readIds, notif.id];
      setReadIds(updated);
      localStorage.setItem('fl_inventory_read_notifications', JSON.stringify(updated));
    }
    if (onNavigateTab && notif.actionTab) {
      onNavigateTab(notif.actionTab);
    }
    onClose();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'REQUESTS') return n.type === 'REQUEST';
    if (filter === 'ALERTS') return n.type === 'OOS' || n.type === 'LOW_STOCK';
    return true;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop for Dropdown */}
      <div
        className="notif-backdrop-mobile"
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className="notification-dropdown-card"
      >
        {/* Header */}
        <div style={{
          padding: '0.9rem 1.15rem',
          borderBottom: '1px solid #1c1c22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0e0e11'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={17} style={{ color: '#991b1b' }} />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span style={{
                background: '#991b1b',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.45rem',
                  borderRadius: '6px'
                }}
                title="Mark all as read"
              >
                <Check size={13} />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#18181c',
                border: '1px solid #272730',
                color: '#a1a1aa',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          padding: '0.55rem 1rem',
          background: '#121215',
          borderBottom: '1px solid #1c1c22',
          overflowX: 'auto'
        }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ALERTS', label: 'Stock Alerts' },
            { id: 'REQUESTS', label: 'Requisitions' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                background: filter === t.id ? '#991b1b' : '#18181c',
                color: filter === t.id ? '#ffffff' : '#a1a1aa',
                border: filter === t.id ? '1px solid #991b1b' : '1px solid #272730',
                borderRadius: '999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          WebkitOverflowScrolling: 'touch'
        }}>
          {filteredNotifications.map(notif => {
            const isRead = readIds.includes(notif.id);

            let icon = <AlertTriangle size={15} style={{ color: '#fca5a5' }} />;
            let iconBg = 'rgba(153, 27, 27, 0.2)';

            if (notif.type === 'REQUEST') {
              icon = <ClipboardList size={15} style={{ color: '#ffffff' }} />;
              iconBg = '#1c1c22';
            } else if (notif.type === 'OOS') {
              icon = <XCircle size={15} style={{ color: '#f87171' }} />;
              iconBg = '#991b1b';
            } else if (notif.type === 'MOVEMENT') {
              icon = <Package size={15} style={{ color: '#a1a1aa' }} />;
              iconBg = '#1c1c22';
            }

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.7rem',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  background: isRead ? '#141418' : '#1a1a20',
                  border: isRead ? '1px solid #1f1f26' : '1px solid #2d2d38',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.2rem'
                  }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isRead ? 600 : 800,
                      color: '#ffffff'
                    }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#71717a' }}>
                      {notif.timestamp}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.73rem',
                    color: isRead ? '#71717a' : '#a1a1aa',
                    lineHeight: 1.35,
                    margin: 0
                  }}>
                    {notif.message}
                  </p>
                </div>

                <ChevronRight size={14} style={{ color: '#71717a', alignSelf: 'center', flexShrink: 0 }} />
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#71717a' }}>
              <Bell size={24} style={{ margin: '0 auto 0.4rem', color: '#383844' }} />
              <p style={{ fontSize: '0.8rem', margin: 0 }}>No notifications at this time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.6rem 1rem',
          borderTop: '1px solid #1c1c22',
          background: '#0e0e11',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#71717a' }}>
            Real-Time Storeroom Notification Feed
          </span>
        </div>
      </div>
    </>
  );
};
