import React from 'react';
import { LayoutDashboard, FileText, Calendar, Stethoscope, LogOut, Building2 } from 'lucide-react';
import '../assets/styles/sidebar.css';
import { useAuth } from '../context/useAuth.js';

function Sidebar({ currentPage, onNavigate }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'medical-records', label: 'Medical Records', icon: FileText, path: '/medical-records' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
        { id: 'clinic-management', label: 'Clinic', icon: Building2, path: '/clinic-management' },
    ];

  const { user, logout } = useAuth();

  const displayName = user?.firstname || user?.name || user?.firstname || 'Dr. User';
  const initials = (() => {
    const n = displayName || '';
    const parts = n.split(' ').filter(Boolean);
    if (parts.length === 0) return 'DR';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Stethoscope className="icon" />
          </div>
          <div className="logo-text">
            <h1 className="app-title">VetCare Pro</h1>
            <p className="app-subtitle">Veterinary Management</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path || currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </ul>
      </nav>
      
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

        <div className="sidebar-actions">
          <button className="logout-button" onClick={() => logout()}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;