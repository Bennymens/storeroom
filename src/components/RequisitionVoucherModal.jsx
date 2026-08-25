import React from 'react';
import { X, Printer } from 'lucide-react';
import firstLoveLogo from '../assets/img/first_love_logo.png';

export const RequisitionVoucherModal = ({ isOpen, onClose, requisition }) => {
  if (!isOpen || !requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', background: '#ffffff', color: '#000000' }}>
        {/* Modal Toolbar */}
        <div className="modal-header no-print" style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>
            Official Requisition Voucher & Gate Pass
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Voucher</span>
            </button>
            <button className="btn btn-secondary btn-sm" style={{ color: '#000', borderColor: '#ccc', background: '#fff' }} onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="modal-body printable-voucher" style={{ padding: '2.5rem', background: '#ffffff', color: '#000000' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <img src={firstLoveLogo} alt="First Love Church" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000' }}>
                  FL INVENTORY SYSTEM
                </h1>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#444', fontWeight: 600 }}>
                Storeroom Requisition &amp; Material Gate Pass
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#dc2626' }}>
                {requisition.id}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>
                DATE: {new Date(requisition.createdAt || Date.now()).toLocaleDateString()}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '0.25rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid #000',
                background: '#000',
                color: '#fff'
              }}>
                {requisition.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Requisition Meta Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem',
            background: '#fafafa',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <div>
              <div style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>REQUESTOR NAME</div>
              <div style={{ fontWeight: 800, color: '#000' }}>{requisition.requestorName}</div>
            </div>

            <div>
              <div style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>DEPARTMENT / MINISTRY</div>
              <div style={{ fontWeight: 800, color: '#000' }}>{requisition.department}</div>
            </div>

            <div>
              <div style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>DATE NEEDED</div>
              <div style={{ fontWeight: 700, color: '#000' }}>{requisition.dateNeeded}</div>
            </div>

            <div>
              <div style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>CONTACT PHONE</div>
              <div style={{ fontWeight: 700, color: '#000' }}>{requisition.phone || 'N/A'}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700 }}>EVENT PURPOSE / DETAILS</div>
              <div style={{ color: '#000' }}>{requisition.purpose || 'General Ministry Purpose'}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#000', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Approved Inventory Items
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #000' }}>
              <thead>
                <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #000', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.65rem' }}>#</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Item Description</th>
                  <th style={{ padding: '0.5rem 0.65rem' }}>Storeroom</th>
                  <th style={{ padding: '0.5rem 0.65rem', textAlign: 'right' }}>Qty Dispatched</th>
                </tr>
              </thead>
              <tbody>
                {requisition.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem 0.65rem', color: '#666', fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: '#000' }}>{item.itemName}</td>
                    <td style={{ padding: '0.5rem 0.65rem' }}>{item.storeroomId.toUpperCase()} Storeroom</td>
                    <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontWeight: 800, color: '#000' }}>
                      {item.quantityRequested} {item.unit || 'units'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px dashed #000' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', height: '35px', marginBottom: '0.35rem' }}></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Requestor Signature</div>
              <div style={{ fontSize: '0.68rem', color: '#666' }}>{requisition.requestorName}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', height: '35px', marginBottom: '0.35rem' }}></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Custodian / Store Lead</div>
              <div style={{ fontSize: '0.68rem', color: '#666' }}>{requisition.approvedBy || 'Authorized Officer'}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', height: '35px', marginBottom: '0.35rem' }}></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Gate / Security Clearance</div>
              <div style={{ fontSize: '0.68rem', color: '#666' }}>Date &amp; Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
