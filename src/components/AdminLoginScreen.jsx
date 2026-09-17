import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import firstLoveLogo from '../assets/img/first_love_logo.png';

export const ADMIN_AUTH_SESSION_KEY = 'fl_inventory_admin_session_token';
const ADMIN_LOCKOUT_KEY = 'fl_inventory_admin_lockout_until';
const ADMIN_ATTEMPTS_KEY = 'fl_inventory_admin_failed_attempts';

// Authorized admin credentials
const ADMIN_USER = 'LPGold12';
const ADMIN_PASS = 'FL@2026';
const MAX_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout

export const checkIsAdminAuthenticated = () => {
  try {
    const token = sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY);
    return !!token && token.startsWith('FL_AUTH_');
  } catch (e) {
    return false;
  }
};

export const logoutAdminSession = () => {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
  } catch (e) {
    // ignore
  }
};

export const AdminLoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check persistent lockout on mount and tick
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = parseInt(localStorage.getItem(ADMIN_LOCKOUT_KEY) || '0', 10);
        const now = Date.now();
        if (lockoutUntil > now) {
          setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
        } else {
          setLockoutRemaining(0);
        }
      } catch (e) {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg('');
    setIsSubmitting(true);

    const trimmedUser = username.trim();
    const trimmedPass = password;

    // Verify credentials
    const isUserValid = trimmedUser === ADMIN_USER;
    const isPassValid = trimmedPass === ADMIN_PASS;

    if (isUserValid && isPassValid) {
      // Clear failed attempts and lockout
      localStorage.removeItem(ADMIN_LOCKOUT_KEY);
      localStorage.removeItem(ADMIN_ATTEMPTS_KEY);

      // Create session token with timestamp
      const sessionToken = `FL_AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, sessionToken);

      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      // Handle failed attempt
      try {
        const currentAttempts = parseInt(localStorage.getItem(ADMIN_ATTEMPTS_KEY) || '0', 10) + 1;
        if (currentAttempts >= MAX_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
          localStorage.setItem(ADMIN_LOCKOUT_KEY, lockoutUntil.toString());
          localStorage.setItem(ADMIN_ATTEMPTS_KEY, '0');
          setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
          setErrorMsg('Security alert: Maximum failed attempts reached. System locked for 60 seconds.');
        } else {
          localStorage.setItem(ADMIN_ATTEMPTS_KEY, currentAttempts.toString());
          const remaining = MAX_ATTEMPTS - currentAttempts;
          setErrorMsg(`Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before security cooldown.`);
        }
      } catch (e) {
        setErrorMsg('Invalid username or password.');
      }
      setIsSubmitting(false);
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #1e1014 0%, #0c0a0b 60%, #060506 100%)',
      padding: '1.5rem',
      fontFamily: 'var(--font-main, sans-serif)',
      color: '#fff'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: '#121114',
        border: '1px solid #292328',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(185, 28, 28, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            background: '#1a181c',
            border: '1px solid #332b32',
            padding: '10px',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
          }}>
            <img
              src={firstLoveLogo}
              alt="First Love Church"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em',
            color: '#fff'
          }}>
            FL Inventory Admin
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#a1a1aa',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <ShieldCheck size={16} style={{ color: '#ef4444' }} />
            <span>Admin Portal</span>
          </p>
        </div>

        {/* Error / Lockout Alert Banner */}
        {lockoutRemaining > 0 ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.82rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#fee2e2' }}>Security Cooldown Active</div>
              <div>Too many failed attempts. Try again in <strong>{lockoutRemaining}s</strong>.</div>
            </div>
          </div>
        ) : errorMsg ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.82rem'
          }}>
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#d4d4d8',
              marginBottom: '0.5rem'
            }}>
              Custodian Username
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a',
                display: 'flex',
                alignItems: 'center'
              }}>
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={lockoutRemaining > 0}
                required
                autoFocus
                autoComplete="username"
                style={{
                  width: '100%',
                  background: '#19181c',
                  border: '1px solid #2e2830',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#991b1b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(153, 27, 27, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2e2830';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#d4d4d8',
              marginBottom: '0.5rem'
            }}>
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={lockoutRemaining > 0}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: '#19181c',
                  border: '1px solid #2e2830',
                  borderRadius: '12px',
                  padding: '0.85rem 2.75rem 0.85rem 2.75rem',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#991b1b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(153, 27, 27, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2e2830';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={lockoutRemaining > 0 || isSubmitting || !username || !password}
            style={{
              width: '100%',
              background: lockoutRemaining > 0
                ? '#3f3f46'
                : 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: lockoutRemaining > 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: lockoutRemaining > 0 ? 'none' : '0 4px 14px rgba(185, 28, 28, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Login</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Portal Switch Link */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #221d22',
          textAlign: 'center'
        }}>
          <a
            href="/"
            style={{
              color: '#a1a1aa',
              fontSize: '0.82rem',
              textDecoration: 'none',
              transition: 'color 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
          >
            &larr; Return to Staff Pickup Portal
          </a>
        </div>
      </div>
    </div>
  );
};
