import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function FacultySidebar({ darkMode, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Students List', icon: '', path: '/staff-dashboard' },
    { id: 'analytics', label: 'Analytics', icon: '', path: '/faculty-analytics' },
    { id: 'reports', label: 'Reports', icon: '', path: '/faculty-reports' },
    { id: 'settings', label: 'Settings', icon: '', path: '/faculty-settings' },
  ];

  const styles = {
    sidebar: {
      width: '260px',
      height: '100vh',
      background: darkMode ? '#1a1a1a' : '#0b4f00',
      color: '#ffe600',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      borderRight: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : 'none',
      transition: 'all 0.3s ease'
    },
    header: {
      padding: '25px 20px',
      borderBottom: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #ffe600',
      textAlign: 'center'
    },
    logo: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#ffe600'
    },
    subtitle: {
      fontSize: '11px',
      opacity: 0.9,
      color: darkMode ? 'rgba(255, 230, 0, 0.8)' : '#fff'
    },
    nav: {
      flex: 1,
      padding: '20px 0'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px 25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderLeft: '4px solid transparent',
      textDecoration: 'none',
      color: '#ffe600'
    },
    menuItemActive: {
      background: darkMode ? 'rgba(255, 230, 0, 0.1)' : 'rgba(255, 230, 0, 0.2)',
      borderLeftColor: '#ffe600'
    },
    menuItemHover: {
      background: 'rgba(255, 255, 255, 0.05)'
    },
    icon: {
      fontSize: '18px',
      marginRight: '15px',
      width: '20px',
      textAlign: 'center'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500'
    },
    footer: {
      padding: '20px',
      borderTop: darkMode ? '1px solid rgba(255, 230, 0, 0.1)' : '2px solid #ffe600'
    },
    logoutBtn: {
      width: '100%',
      padding: '12px',
      background: '#ffe600',
      color: '#0b4f00',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(255, 230, 0, 0.3)'
    }
  };

  const [isOpen, setIsOpen] = React.useState(false);

  const responsiveStyles = `
    @media (max-width: 850px) {
      .faculty-sidebar {
        width: 100% !important;
        height: 70px !important;
        flex-direction: row !important;
        bottom: 0 !important;
        top: auto !important;
        left: 0 !important;
        padding: 0 10px !important;
        justify-content: space-around !important;
        align-items: center !important;
        border-right: none !important;
        border-top: 1px solid rgba(255,230,0,0.1) !important;
        background: #0b4f00 !important;
        box-shadow: 0 -4px 15px rgba(0,0,0,0.2) !important;
      }
      .sidebar-footer {
        display: none !important;
      }
      .sidebar-logo {
        display: none !important;
      }
      .sidebar-menu {
        display: flex !important;
        flex-direction: row !important;
        width: 100% !important;
        justify-content: space-around !important;
        margin: 0 !important;
      }
      .menu-item-text {
        font-size: 10px !important;
        margin-top: 4px !important;
      }
      .mobile-toggle {
        display: none !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="faculty-sidebar" style={styles.sidebar}>
        <div style={styles.header} className="sidebar-logo">
          <div style={styles.logo}>Faculty Portal</div>
          <div style={styles.subtitle}>Student Portfolio Management</div>
        </div>
        
        <nav style={styles.nav} className="sidebar-menu">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <a
                key={item.id}
                href={item.path}
                className={`faculty-sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {})
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label} className="menu-item-text">{item.label}</span>
              </a>
            );
          })}
        </nav>
        <style>{`
          .faculty-sidebar-link:hover {
            background: ${styles.menuItemHover.background} !important;
          }
          .faculty-sidebar-link.active {
            background: ${styles.menuItemActive.background} !important;
            border-left-color: ${styles.menuItemActive.borderLeftColor} !important;
          }
        `}</style>
        
        <div style={styles.footer} className="sidebar-footer">
          <button 
            style={{...styles.logoutBtn, background: 'rgba(255,255,255,0.1)', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.2)'}} 
            onClick={() => navigate('/faculty-settings')}
          >
            Settings
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default FacultySidebar;
