import React from 'react';
import {
  BarChart3,
  AlertTriangle,
  DollarSign,
  PieChart,
  Boxes,
  Users
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AnalyticsReports = () => {
  const { items, requisitions } = useInventory();

  const totalValuation = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.costPerUnit) || 0)), 0);
  const lowStockItems = items.filter(i => i.quantity <= i.minThreshold);

  const categoryStats = items.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = { count: 0, units: 0 };
    acc[cat].count += 1;
    acc[cat].units += (Number(item.quantity) || 0);
    return acc;
  }, {});

  const deptStats = requisitions.reduce((acc, req) => {
    const dept = req.department || 'General';
    if (!acc[dept]) acc[dept] = 0;
    acc[dept] += 1;
    return acc;
  }, {});

  return (
    <div style={{ width: '100%' }}>
      {/* KPI Cards Row */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-box-top">
            <div className="kpi-icon-pill">
              <DollarSign size={20} />
            </div>
            <span className="kpi-box-title">Stock Valuation</span>
          </div>
          <div className="kpi-box-subtitle">Estimated inventory asset value</div>
          <div className="kpi-box-value">GH₵ {totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <div className="kpi-icon-pill">
              <Boxes size={20} />
            </div>
            <span className="kpi-box-title">Total Catalog SKUs</span>
          </div>
          <div className="kpi-box-subtitle">Across 3 storerooms</div>
          <div className="kpi-box-value">{items.length}</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <div className="kpi-icon-pill" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#f87171' }}>
              <AlertTriangle size={20} />
            </div>
            <span className="kpi-box-title">Procurement Need</span>
          </div>
          <div className="kpi-box-subtitle">Items requiring replenishment</div>
          <div className="kpi-box-value" style={{ color: lowStockItems.length > 0 ? '#f87171' : 'inherit' }}>
            {lowStockItems.length}
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <div className="kpi-icon-pill">
              <Users size={20} />
            </div>
            <span className="kpi-box-title">Total Requisitions</span>
          </div>
          <div className="kpi-box-subtitle">Ministry request records</div>
          <div className="kpi-box-value">{requisitions.length}</div>
        </div>
      </div>

      {/* Two Breakdown Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="content-panel">
          <div className="panel-header">
            <h4 className="panel-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} style={{ color: '#dc2626' }} />
              <span>Category Distribution</span>
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(categoryStats).map(([cat, stat]) => {
              const percent = items.length ? Math.round((stat.count / items.length) * 100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{cat}</span>
                    <span style={{ color: '#71717a' }}>{stat.count} SKUs &bull; {stat.units} units ({percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#222', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#dc2626' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Usage */}
        <div className="content-panel">
          <div className="panel-header">
            <h4 className="panel-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: '#dc2626' }} />
              <span>Department Frequency</span>
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(deptStats).map(([dept, count]) => {
              const percent = requisitions.length ? Math.round((count / requisitions.length) * 100) : 0;
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{dept}</span>
                    <span style={{ color: '#71717a' }}>{count} Requests ({percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#222', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#dc2626' }} />
                  </div>
                </div>
              );
            })}

            {Object.keys(deptStats).length === 0 && (
              <p style={{ color: '#71717a', fontSize: '0.85rem' }}>No department activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
