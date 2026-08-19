import React from 'react';
import {
  Boxes,
  AlertTriangle,
  ShoppingCart,
  XCircle
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const KpiRow = () => {
  const { items, movements } = useInventory();

  // Metrics (matching screenshot)
  const totalItemsCount = items.length;
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold);
  const outOfStockItems = items.filter(item => item.quantity <= 0);
  const recentPickupsCount = movements.filter(m => m.quantityChange < 0).length;

  return (
    <div className="kpi-row">
      {/* 1. Total Items (Matching Screenshot Card 1) */}
      <div className="kpi-box">
        <div className="kpi-box-top">
          <div className="kpi-icon-pill" style={{ background: '#1c1c22', color: '#ffffff' }}>
            <Boxes size={20} />
          </div>
          <span className="kpi-box-title">Total Items</span>
        </div>
        <div className="kpi-box-subtitle">Total items in stock</div>
        <div className="kpi-box-value">{totalItemsCount}</div>
      </div>

      {/* 2. Low Stock Items (Matching Screenshot Card 2) */}
      <div className="kpi-box">
        <div className="kpi-box-top">
          <div className="kpi-icon-pill" style={{ background: 'rgba(153, 27, 27, 0.2)', color: '#fca5a5' }}>
            <AlertTriangle size={20} />
          </div>
          <span className="kpi-box-title">Low Stock Items</span>
        </div>
        <div className="kpi-box-subtitle">Number of items that are running low</div>
        <div className="kpi-box-value" style={{ color: lowStockItems.length > 0 ? '#fca5a5' : 'inherit' }}>
          {lowStockItems.length}
        </div>
      </div>

      {/* 3. Recent Pickups (Matching Screenshot Card 3) */}
      <div className="kpi-box">
        <div className="kpi-box-top">
          <div className="kpi-icon-pill" style={{ background: 'rgba(153, 27, 27, 0.2)', color: '#ffffff' }}>
            <ShoppingCart size={20} />
          </div>
          <span className="kpi-box-title">Recent Pickups</span>
        </div>
        <div className="kpi-box-subtitle">Items dispatched for ministry programs</div>
        <div className="kpi-box-value">{recentPickupsCount}</div>
      </div>

      {/* 4. Out of Stock Items (Matching Screenshot Card 4) */}
      <div className="kpi-box">
        <div className="kpi-box-top">
          <div className="kpi-icon-pill" style={{ background: '#1c1c22', color: '#f87171' }}>
            <XCircle size={20} />
          </div>
          <span className="kpi-box-title">Out of Stock Items</span>
        </div>
        <div className="kpi-box-subtitle">Count of items currently out of stock</div>
        <div className="kpi-box-value" style={{ color: outOfStockItems.length > 0 ? '#f87171' : 'inherit' }}>
          {outOfStockItems.length}
        </div>
      </div>
    </div>
  );
};
