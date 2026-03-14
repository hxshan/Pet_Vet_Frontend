import React from 'react';
import { Sun, Moon } from 'lucide-react';

const routeLabels = {
  '/dashboard':         'Dashboard',
  '/medical-records':   'Medical Records',
  '/appointments':      'Appointments',
  '/clinic-management': 'Clinic',
};

function MenuIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Topbar({ currentPage, sidebarCollapsed, onToggleSidebar, theme, onToggleTheme }) {
  const currentLabel = routeLabels[currentPage] || 'Dashboard';
  const isLight = theme === 'light';

  // Build breadcrumb segments
  const segments = currentPage.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    return { label: routeLabels[path] || seg, path };
  });

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: sidebarCollapsed ? 0 : 'var(--sidebar-width)',
      right: 0,
      height: 'var(--topbar-height)',
      background: isLight
        ? 'rgba(255, 255, 255, 0.92)'
        : 'rgba(9, 9, 11, 0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '0.0625rem solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 30,
      transition: 'left var(--transition-base)',
    }}>
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast), background var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.background = 'var(--color-surface)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.background = 'none';
          }}
          title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <MenuIcon />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.625rem',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}>
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: 'var(--color-border)' }}>/</span>}
                <span style={{ color: i === crumbs.length - 1 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
          }}>
            {currentLabel}
          </h1>
        </div>
      </div>

      {/* Right: theme toggle + divider + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: '0.0625rem solid var(--color-border)',
            borderRadius: '0.5rem',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.background = 'var(--color-primary-faint)';
            e.currentTarget.style.borderColor = 'var(--color-primary-subtle)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '1.5rem', background: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* Avatar */}
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.75rem',
          background: 'var(--color-primary-faint)',
          border: '0.0625rem solid var(--color-primary-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'var(--color-primary)', fontSize: '0.65rem', fontWeight: 700 }}>VC</span>
        </div>
      </div>
    </header>
  );
}
