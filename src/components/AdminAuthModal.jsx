import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  X,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

const ADMIN_PASSCODE_KEY = 'fl_inventory_admin_passcode';
const ADMIN_AUTH_SESSION_KEY = 'fl_inventory_admin_auth_token';
const DEFAULT_PASSCODE = '2026'; // Default storeroom manager PIN

export const AdminAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Load passcode from storage or fallback to default
  const getStoredPasscode = () => {
    try {
      return localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_PASSCODE;
    } catch (e) {
      return DEFAULT_PASSCODE;
    }
  };

  useEffect(() => {
    let timer;
    if (lockTimer > 0) {
      timer = setTimeout(() => setLockTimer(t => t - 1), 1000);
    } else if (lockTimer === 0 && isLockedOut) {
      setIsLockedOut(false);
      setAttempts(0);
      setErrorMsg('');
    }
    return () => clearTimeout(timer);
  }, [lockTimer, isLockedOut]);

  if (!isOpen) return null;

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (isLockedOut) return;

    const correctPin = getStoredPasscode();

    if (pinInput.trim() === correctPin) {
      // Save authenticated session token
      sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'auth_' + Date.now());
      setErrorMsg('');
      setPinInput('');
      setAttempts(0);
      onSuccess();
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 4) {
        setIsLockedOut(true);
        setLockTimer(30);
        setErrorMsg('Too many failed attempts. Security cooldown active for 30 seconds.');
      } else {
        setErrorMsg(`Incorrect Passcode. ${4 - nextAttempts} attempt(s) remaining.`);
      }
      setPinInput('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', background: '#0d0d0d', border: '1px solid #dc2626' }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Admin Security Clearance</h3>
              <span style={{ fontSize: '0.72rem', color: '#888' }}>Authorized Custodian Access Only</span>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerifyPin}>
          <div className="modal-body" style={{ padding: '1.5rem 1.25rem' }}>
            <div style={{
              background: '#181818',
              border: '1px solid #222',
              borderRadius: '10px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#bbb',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start'
            }}>
              <Lock size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                Access to the Admin Management &amp; Audit portal is protected. Enter the Custodian Security PIN to proceed.
                <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.25rem' }}>Default Store PIN: <strong>2026</strong></div>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.82rem',
                color: '#f87171',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Enter Admin Passcode / PIN *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPin ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter 4-digit PIN"
                  style={{
                    fontSize: '1.35rem',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    fontWeight: 800,
                    paddingRight: '2.5rem'
                  }}
                  maxLength={8}
                  required
                  autoFocus
                  disabled={isLockedOut}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer'
                  }}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLockedOut && (
              <div style={{ textAlign: 'center', color: '#dc2626', fontSize: '0.85rem', fontWeight: 700 }}>
                Locked out. Please wait {lockTimer}s...
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLockedOut || !pinInput.trim()}
              style={{ flex: 1 }}
            >
              <KeyRound size={16} />
              <span>Verify &amp; Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const checkIsAdminAuthenticated = () => {
  try {
    return !!sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY);
  } catch (e) {
    return false;
  }
};

export const logoutAdminSession = () => {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
  } catch (e) { }
};
