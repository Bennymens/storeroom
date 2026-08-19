import React, { useState } from 'react';
import { X, QrCode, Search, Printer, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const BarcodeScannerModal = ({ isOpen, onClose, onSelectItem, onOpenAdjust }) => {
  const { items, activeStoreroomId } = useInventory();

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'labels'
  const [scanInput, setScanInput] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [labelStoreroom, setLabelStoreroom] = useState(activeStoreroomId === 'all' ? 'aud' : activeStoreroomId);

  if (!isOpen) return null;

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const query = scanInput.trim().toLowerCase();
    const found = items.find(
      i => i.id.toLowerCase() === query || i.name.toLowerCase().includes(query)
    );

    if (found) {
      setScannedItem(found);
    } else {
      setScannedItem(null);
      alert(`No inventory item found matching barcode "${scanInput}"`);
    }
  };

  const handleQuickSimulate = (item) => {
    setScanInput(item.id);
    setScannedItem(item);
  };

  const labelItems = items.filter(i => labelStoreroom === 'ALL' || i.storeroomId === labelStoreroom);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Barcode & QR Scanner / Labels</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>StoreHub Digital Barcode System</span>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} className="no-print">
          <button
            className={`btn btn-ghost ${activeTab === 'scanner' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'scanner' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'scanner' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700
            }}
            onClick={() => setActiveTab('scanner')}
          >
            Digital Scanner Simulator
          </button>

          <button
            className={`btn btn-ghost ${activeTab === 'labels' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'labels' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'labels' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700
            }}
            onClick={() => setActiveTab('labels')}
          >
            Printable Shelf & Bin Labels
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh' }}>
          {activeTab === 'scanner' ? (
            <div>
              {/* Scanner Visual Camera Box */}
              <div style={{
                position: 'relative',
                height: '180px',
                background: 'radial-gradient(circle at center, #1e293b 0%, #0b0f17 100%)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed rgba(99, 102, 241, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                {/* Laser animation bar */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: '#ef4444',
                  boxShadow: '0 0 10px #ef4444'
                }} />

                <QrCode size={48} style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Ready to scan Barcode / QR Code or enter SKU
                </span>
              </div>

              {/* Scan input form */}
              <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Scan or type SKU / Barcode ID (e.g. aud-1, md-1, poi-3)..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  <Search size={16} />
                  <span>Scan</span>
                </button>
              </form>

              {/* Scanned Result Card */}
              {scannedItem && (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span className={`badge ${scannedItem.storeroomId === 'aud' ? 'badge-aud' : scannedItem.storeroomId === 'md' ? 'badge-md' : 'badge-poimen'}`}>
                        {scannedItem.storeroomId.toUpperCase()} STOREROOM
                      </span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                        {scannedItem.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        SKU: {scannedItem.id} &bull; Rack: {scannedItem.locationRack || 'General'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT STOCK</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scannedItem.quantity <= scannedItem.minThreshold ? '#fbbf24' : '#34d399' }}>
                        {scannedItem.quantity} {scannedItem.unit || 'units'}
                      </div>
                    </div>
                  </div>

                  {/* Actions on Scanned Item */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        onClose();
                        onOpenAdjust(scannedItem);
                      }}
                    >
                      <Zap size={14} />
                      <span>Adjust Stock</span>
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        onClose();
                        onSelectItem(scannedItem);
                      }}
                    >
                      <span>Full Item Details &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Simulator Buttons */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Quick Simulator Test Targets (Click to simulate instant scan):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {items.slice(0, 6).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => handleQuickSimulate(item)}
                    >
                      {item.name.slice(0, 18)}... ({item.id})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Printable Shelf & Bin Labels */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }} className="no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Storeroom:</label>
                  <select
                    className="form-select"
                    value={labelStoreroom}
                    onChange={(e) => setLabelStoreroom(e.target.value)}
                    style={{ width: '180px' }}
                  >
                    <option value="ALL">All Storerooms</option>
                    <option value="aud">Auditorium</option>
                    <option value="md">Media & Sound</option>
                    <option value="poimen">Poimen</option>
                  </select>
                </div>

                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Print All Labels</span>
                </button>
              </div>

              {/* Grid of Printable Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {labelItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: '2px solid #000000',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.35rem' }}>
                        <span>STOREHUB</span>
                        <span>{item.storeroomId.toUpperCase()}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2, marginBottom: '0.25rem', color: '#0f172a' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                        LOC: <strong>{item.locationRack || 'Shelf'}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', height: '28px', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, idx) => (
                          <div key={idx} style={{ width: `${(w % 3) + 1.2}px`, background: '#000000' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800 }}>*{item.id.toUpperCase()}*</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
