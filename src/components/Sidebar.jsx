import React from 'react';
import { LayoutDashboard, FileText, Calendar, Stethoscope } from 'lucide-react';
import '../assets/styles/sidebar.css';

function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

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
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span className="avatar-text">DR</span>
          </div>
          <div className="user-info">
            <p className="user-name">Dr. Sarah Johnson</p>
            <p className="user-role">Veterinarian</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;