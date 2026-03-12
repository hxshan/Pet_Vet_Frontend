import React from 'react';

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

export default function Topbar({ currentPage, sidebarCollapsed, onToggleSidebar }) {
  const currentLabel = routeLabels[currentPage] || 'Dashboard';

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
      background: 'rgba(9, 9, 11, 0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '0.0625rem solid rgba(39, 39, 42, 0.6)',
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
            color: '#71717a',
            cursor: 'pointer',
            transition: 'color 0.15s ease, background 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#d4d4d8'; e.currentTarget.style.background = 'rgba(39,39,42,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'none'; }}
          title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <MenuIcon />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.625rem', color: '#52525b', fontWeight: 500, letterSpacing: '0.04em' }}>
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span style={{ color: '#3f3f46' }}>/</span>}
                <span style={{ color: i === crumbs.length - 1 ? '#a1a1aa' : '#52525b' }}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
            {currentLabel}
          </h1>
        </div>
      </div>

      {/* Right: divider + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '1px', height: '1.5rem', background: 'rgba(39,39,42,0.8)' }} />
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, rgba(251,111,146,0.4) 0%, rgba(232,85,119,0.3) 100%)',
          border: '0.0625rem solid rgba(251,111,146,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fb6f92', fontSize: '0.65rem', fontWeight: 700 }}>VC</span>
        </div>
      </div>
    </header>
  );
}
