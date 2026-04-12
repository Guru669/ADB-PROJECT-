import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentSidebar({ activeTab, setActiveTab, darkMode, onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'certificates', label: 'Certificates', icon: '📜' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'journal', label: 'Journal', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: isOpen ? 'block' : 'none',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.3s ease'
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: isOpen ? 0 : '-280px',
      width: '280px',
      height: '100vh',
      backgroundColor: darkMode ? '#111827' : '#ffffff',
      zIndex: 1001,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 25px rgba(0,0,0,0.15)',
      borderRight: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
    },
    header: {
      padding: '30px 24px',
      backgroundColor: '#0b4f00',
      color: '#ffe600',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    logoutBtn: {
      backgroundColor: '#ff4757',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '14px',
      fontWeight: '800',
      fontSize: '15px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)',
      marginTop: '10px'
    },
    menu: {
      flex: 1,
      padding: '20px 12px',
      overflowY: 'auto'
    },
    menuItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: '0.2s',
      backgroundColor: active ? (darkMode ? 'rgba(255, 230, 0, 0.1)' : '#f0fdf4') : 'transparent',
      color: active ? (darkMode ? '#ffe600' : '#0b4f00') : (darkMode ? '#e2e8f0' : '#1e293b'),
      fontWeight: active ? '700' : '500',
      border: active ? `1px solid ${darkMode ? 'rgba(255,230,0,0.3)' : '#0b4f00'}` : '1px solid transparent'
    }),
    mobileToggle: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#0b4f00',
      color: '#ffe600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      boxShadow: '0 8px 30px rgba(11, 79, 0, 0.4)',
      zIndex: 1002,
      border: '2px solid #ffe600',
      cursor: 'pointer'
    }
  };

  return (
    <>
      <div style={styles.mobileToggle} className="show-mobile" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </div>

      <div style={styles.overlay} onClick={() => setIsOpen(false)} />

      <div style={styles.sidebar} className="student-sidebar">
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/siet.png" alt="Logo" style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '8px', padding: '2px' }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>SIET Portal</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{user?.fullName || 'Student'}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>

        <nav style={styles.menu}>
          {menuItems.map(item => (
            <div 
              key={item.id} 
              style={styles.menuItem(activeTab === item.id)}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}`, fontSize: '10px', opacity: 0.5, textAlign: 'center' }}>
          SIET Portfolio System v2.1
        </div>
      </div>

      <style>{`
        @media (min-width: 851px) {
          .student-sidebar {
            position: sticky !important;
            top: 0;
            left: 0 !important;
            height: 100vh;
            border-bottom: none;
          }
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default StudentSidebar;
