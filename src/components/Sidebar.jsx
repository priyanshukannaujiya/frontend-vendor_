import React from 'react';
import { Shield, LayoutDashboard, Users, Mail, FileSearch, BarChart3, Activity } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, mobileSidebarOpen, setMobileSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Compliance Overview',    icon: LayoutDashboard },
    { id: 'vendors',   label: 'Vendor Management',      icon: Users },
    { id: 'email',     label: 'Email Automation',       icon: Mail },
    { id: 'sds',       label: 'SDS Processing',         icon: FileSearch },
    { id: 'analytics', label: 'Compliance Analytics',   icon: BarChart3 },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileSidebarOpen ? 'show' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <polygon points="11,1 20,6 20,16 11,21 2,16 2,6" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            <polygon points="11,4 17,7.5 17,14.5 11,18 5,14.5 5,7.5" fill="rgba(13,71,161,0.6)"/>
            <text x="11" y="13.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="800">DOW</text>
          </svg>
        </div>
        <div className="brand-text">
          <h1>Dow Chemical</h1>
          <span>SDS Compliance System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li className="nav-section-label">Main Navigation</li>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}>
                <button onClick={() => handleNavClick(item.id)}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-status">
          <div className="status-indicator online" />
          <span>System Online</span>
        </div>
        <div className="app-version">v2.0.0</div>
      </div>
    </aside>
  );
}
