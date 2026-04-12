import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function FacultySidebar({ darkMode, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Students List', icon: '👥', path: '/staff-dashboard' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '/faculty-analytics' },
    { id: 'reports', label: 'Reports', icon: '📄', path: '/faculty-reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/faculty-settings' },
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
        transform: translateX(${isOpen ? '0' : '-100%'});
        width: 240px !important;
      }
      .mobile-toggle {
        display: flex !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <button 
        className="mobile-toggle"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 2000,
          width: '50px',
          height: '50px',
          borderRadius: '25px',
          backgroundColor: '#0b4f00',
          color: '#ffe600',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="faculty-sidebar" style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>Faculty Portal</div>
        <div style={styles.subtitle}>Student Portfolio Management</div>
      </div>
      
      <nav style={styles.nav}>
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
              <span style={styles.label}>{item.label}</span>
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
      
      <div style={styles.footer}>
        <button style={styles.logoutBtn} onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
    </>
  );
}

export default FacultySidebar;
