import React from 'react';
import { LayoutDashboard, FileText, Calendar, LogOut, Building2, X } from 'lucide-react';
import '../assets/styles/sidebar.css';
import { useAuth } from '../context/useAuth.js';

const navGroups = [
  {
    group: 'Overview',
    links: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    group: 'Clinical',
    links: [
      { id: 'medical-records', label: 'Medical Records', icon: FileText, path: '/medical-records' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
    ],
  },
  {
    group: 'Management',
    links: [
      { id: 'clinic-management', label: 'Clinic', icon: Building2, path: '/clinic-management' },
    ],
  },
];

function PAW_SVG() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '1.25rem' }}>
      <ellipse cx="16" cy="20" rx="6" ry="8" fill="#fb6f92" opacity="0.9" />
      <ellipse cx="32" cy="13" rx="6" ry="8" fill="#fb6f92" opacity="0.9" />
      <ellipse cx="48" cy="20" rx="6" ry="8" fill="#fb6f92" opacity="0.9" />
      <ellipse cx="8" cy="36" rx="5" ry="7" fill="#fb6f92" opacity="0.9" />
      <path d="M32 58c-12 0-22-8-22-18 0-6 4-10 10-10h24c6 0 10 4 10 10 0 10-10 18-22 18z" fill="#fb6f92" opacity="0.9" />
    </svg>
  );
}

function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();

  const displayName = user?.firstname || user?.name || 'Dr. User';
  const initials = (() => {
    const n = displayName || '';
    const parts = n.split(' ').filter(Boolean);
    if (parts.length === 0) return 'DR';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <PAW_SVG />
          </div>
          <div className="logo-text">
            <h1 className="app-title">VetCare Pro</h1>
            <p className="app-subtitle">Vet Portal</p>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onToggleCollapse} title="Close sidebar">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className="nav-group-label">{group.group}</p>
            <ul className="nav-list">
              {group.links.map((link) => {
                const NavIcon = link.icon;
                const isActive = currentPage === link.path || currentPage === link.id;
                return (
                  <li key={link.id}>
                    <button
                      onClick={() => onNavigate(link.path)}
                      className={`nav-item${isActive ? ' active' : ''}`}
                    >
                      <NavIcon size={16} className="nav-icon" />
                      <span>{link.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span className="avatar-text">{initials}</span>
          </div>
          <div className="user-info">
            <p className="user-name">{displayName}</p>
            <p className="user-role">Veterinarian</p>
          </div>
        </div>
        <button className="logout-button" onClick={() => logout()}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
