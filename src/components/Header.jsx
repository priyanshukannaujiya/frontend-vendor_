import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Bell, ChevronDown, Settings, User, LogOut, Menu, FileCheck, MailWarning, Info } from 'lucide-react';

export default function Header({ activePage, notifications, setNotifications, setMobileSidebarOpen, onLogout, currentUser }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu,   setShowProfileMenu]   = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const pad = v => String(v).padStart(2,'0');
      setTimeStr(`${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())} ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const pageTitles = {
    dashboard: 'Compliance Overview',
    vendors:   'Vendor Management',
    email:     'Email Automation',
    sds:       'SDS Processing',
    analytics: 'Compliance Analytics',
  };

  const getIcon = (type) => {
    if (type === 'success') return <div className="noti-icon success"><FileCheck size={15}/></div>;
    if (type === 'warning') return <div className="noti-icon warning"><MailWarning size={15}/></div>;
    return <div className="noti-icon info"><Info size={15}/></div>;
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-toggle-btn" onClick={() => setMobileSidebarOpen(p => !p)}>
          <Menu size={22}/>
        </button>
        <div className="breadcrumb">
          <span className="parent-path">Dow Chemical</span>
          <span className="separator">/</span>
          <span className="active-path">{pageTitles[activePage] || 'Portal'}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-time">
          <Calendar className="time-icon" size={13}/>
          <span>{timeStr}</span>
        </div>

        {/* Notifications */}
        <div className="header-action-wrapper" ref={notifRef}>
          <button className="header-action-btn" onClick={() => { setShowNotifications(p=>!p); setShowProfileMenu(false); }}>
            <Bell size={18}/>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="dropdown-menu notifications-dropdown show">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <button className="mark-all-read-btn" onClick={() => setNotifications(p => p.map(n=>({...n,read:true})))}>Mark all read</button>}
              </div>
              <ul className="notification-list">
                {notifications.length === 0
                  ? <li className="notification-item" style={{justifyContent:'center',color:'var(--text-muted)',fontSize:'13px',padding:'24px'}}>No notifications</li>
                  : notifications.map(n => (
                    <li key={n.id} className={`notification-item ${n.read?'':'unread'}`} onClick={() => setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:!x.read}:x))}>
                      {getIcon(n.type)}
                      <div className="noti-content">
                        <p className="noti-text" dangerouslySetInnerHTML={{__html:n.text}}/>
                        <span className="noti-time">{n.time}</span>
                      </div>
                    </li>
                  ))
                }
              </ul>
              {notifications.length > 0 && (
                <div className="dropdown-footer">
                  <button onClick={() => { setNotifications([]); setShowNotifications(false); }}>Clear all notifications</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="header-action-wrapper" ref={profileRef}>
          <button className="profile-toggle" onClick={() => { setShowProfileMenu(p=>!p); setShowNotifications(false); }}>
            {currentUser?.avatar
              ? <div className="avatar-initials">{currentUser.avatar}</div>
              : <div className="avatar-initials">DC</div>
            }
            <div className="profile-info">
              <span className="profile-name">{currentUser?.name || 'Compliance Admin'}</span>
              <span className="profile-role">{currentUser?.role || 'Product Safety Officer'}</span>
            </div>
            <ChevronDown className="profile-chevron" size={13}/>
          </button>
          {showProfileMenu && (
            <div className="dropdown-menu profile-dropdown show">
              <div className="profile-dropdown-header">
                <strong>{currentUser?.name || 'Compliance Admin'}</strong>
                <span>{currentUser?.email || 'compliance@dow.com'}</span>
              </div>
              <ul className="profile-menu">
                <li><button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}><Settings size={15}/>Settings</button></li>
                <li><button className="profile-menu-item" onClick={() => setShowProfileMenu(false)}><User size={15}/>Account Profile</button></li>
                <hr className="dropdown-divider"/>
                <li>
                  <button className="profile-menu-item logout-btn-item" onClick={() => { setShowProfileMenu(false); onLogout(); }}>
                    <LogOut size={15}/>Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
