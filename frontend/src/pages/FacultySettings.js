import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';

function FacultySettings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const staffName = (JSON.parse(localStorage.getItem('staff') || '{}').fullName || 'staff').split(' ')[0].toLowerCase();
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      newStudentAlerts: true,
      portfolioUpdates: false,
      systemUpdates: true
    },
    privacy: {
      showStaffInfo: true,
      allowStudentContact: false,
      dataSharing: false
    },
    appearance: {
      theme: 'light',
      language: 'english',
      pageSize: 10
    },
    account: {
      name: '',
      email: '',
      department: '',
      staffId: ''
    }
  });

  useEffect(() => {
    // Load theme
    const storedTheme = localStorage.getItem('facultyTheme');
    if (storedTheme) setDarkMode(storedTheme === 'dark');

    // Load staff data and settings
    const staffData = JSON.parse(localStorage.getItem('staff') || '{}');
    const savedSettings = JSON.parse(localStorage.getItem('facultySettings') || '{}');

    setSettings(prev => ({
      ...prev,
      account: {
        name: staffData.fullName || '',
        email: staffData.email || '',
        department: staffData.department || '',
        staffId: staffData.staffId || ''
      },
      ...savedSettings
    }));

    // Add float animation to head
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('facultyTheme', newMode ? 'dark' : 'light');
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme: newMode ? 'dark' : 'light' }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('staff');
    localStorage.removeItem('staffProfile');
    localStorage.removeItem('facultyTheme');
    window.location.href = '/';
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('facultySettings', JSON.stringify(settings));
    localStorage.setItem('facultyTheme', darkMode ? 'dark' : 'light');
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    const defaultSettings = {
      notifications: {
        emailNotifications: true,
        newStudentAlerts: true,
        portfolioUpdates: false,
        systemUpdates: true
      },
      privacy: {
        showStaffInfo: true,
        allowStudentContact: false,
        dataSharing: false
      },
      appearance: {
        theme: 'light',
        language: 'english',
        pageSize: 10
      }
    };
    setSettings(prev => ({
      ...prev,
      ...defaultSettings
    }));
    setDarkMode(false);
    localStorage.setItem('facultyTheme', 'light');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: darkMode ? '#121212' : '#ffffff',
      fontFamily: "'Inter', Arial, sans-serif",
      marginLeft: '260px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease',
      boxSizing: 'border-box'
    },
    decorCircle1: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: darkMode
        ? 'linear-gradient(135deg, rgba(255, 230, 0, 0.05) 0%, rgba(255, 230, 0, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(11, 79, 0, 0.08) 0%, rgba(11, 79, 0, 0.03) 100%)',
      top: '-100px',
      right: '-100px',
      animation: 'float 8s ease-in-out infinite'
    },
    decorCircle2: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: darkMode
        ? 'linear-gradient(135deg, rgba(255, 230, 0, 0.03) 0%, rgba(255, 230, 0, 0.01) 100%)'
        : 'linear-gradient(135deg, rgba(11, 79, 0, 0.06) 0%, rgba(11, 79, 0, 0.02) 100%)',
      bottom: '-50px',
      left: '-50px',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: '1s'
    },
    header: {
      padding: '0 0 18px 0',
      background: 'transparent',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '20px'
    },
    headerBrand: { display: 'flex', alignItems: 'center', gap: '14px' },
    headerLogoWrap: {
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    headerLogo: { width: '44px', height: '44px', objectFit: 'contain' },
    headerTitle: {
      margin: 0,
      fontSize: '32px',
      fontWeight: '800',
      color: '#1a3625'
    },
    headerSubtitle: {
      color: '#64748b',
      fontSize: '16px',
      margin: '4px 0 0 0'
    },
    topActionBtn: {
      background: '#ffffff',
      color: '#1a3625',
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      padding: '8px 16px',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '12px'
    },
    topActionPrimaryBtn: {
      background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '999px',
      padding: '8px 16px',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '12px'
    },
    main: { maxWidth: 800, margin: '0 auto', padding: '25px' },
    sectionCard: {
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.1)',
      border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #0b4f00',
      marginBottom: '30px'
    },
    sectionTitle: { fontSize: '20px', fontWeight: 'bold', color: '#ffe600', marginBottom: '20px' },
    settingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e9ecef'
    },
    settingLabel: { fontSize: '14px', color: darkMode ? '#fff' : '#333', fontWeight: '500' },
    toggleSwitch: {
      position: 'relative',
      width: '50px',
      height: '24px',
      backgroundColor: darkMode ? '#333' : '#ccc',
      borderRadius: '12px',
      cursor: 'pointer'
    },
    toggleSwitchActive: { backgroundColor: '#ffe600' },
    toggleSlider: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      transition: 'transform 0.3s'
    },
    toggleSliderActive: { transform: 'translateX(26px)', backgroundColor: '#0b4f00' },
    btn: {
      padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', border: 'none'
    },
    saveBtn: { backgroundColor: '#ffe600', color: '#0b4f00' }
  };

  const responsiveStyles = `
    @media (max-width: 850px) {
      .settings-container {
        margin-left: 0 !important;
        padding: 20px !important;
        padding-bottom: 90px !important;
      }
      .settings-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 20px !important;
        padding: 15px !important;
      }
      .settings-header-right {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        width: 100% !important;
        gap: 10px !important;
      }
      .settings-header-right button {
        width: 100% !important;
        padding: 10px !important;
      }
      .settings-main {
        padding: 15px !important;
      }
      .mobile-logout-only { display: block !important; }
    }
    .mobile-logout-only { display: none !important; }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      <div style={styles.container} className="settings-container">
        <div style={styles.decorCircle1}></div>
        <div style={styles.decorCircle2}></div>
        <div style={styles.header} className="settings-header">
          <div style={styles.headerBrand}>
            <div style={styles.headerLogoWrap}>
              <img src="/siet.png" alt="SIET Logo" style={styles.headerLogo} />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Settings</h2>
              <p style={styles.headerSubtitle}>Welcome back, {staffName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 15 }} className="settings-header-right">
            <button
               className="mobile-logout-only" 
               style={{...styles.topActionPrimaryBtn, background: '#64748b'}} 
               onClick={() => navigate('/faculty-settings')}
             >
               Settings
             </button>
            <button
               className="mobile-logout-only" 
               style={{...styles.topActionPrimaryBtn, background: '#dc2626'}} 
               onClick={handleLogout}
             >
               Logout
             </button>
            <button
              style={styles.topActionPrimaryBtn}
              onClick={toggleDarkMode}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button
              style={styles.topActionBtn}
              onClick={() => navigate('/faculty-analytics')}
            >
              Analytics
            </button>
            <button
              style={styles.topActionBtn}
              onClick={() => navigate('/faculty-reports')}
            >
              Reports
            </button>
            <button
              style={styles.topActionBtn}
              onClick={() => navigate('/staff-dashboard')}
            >
              Students
            </button>
          </div>
        </div>

        <div style={styles.main} className="settings-main">
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Account Info</h3>
            <div style={{ color: darkMode ? '#ddd' : '#666' }}>
              <p><strong>Name:</strong> {settings.account.name}</p>
              <p><strong>Email:</strong> {settings.account.email}</p>
              <p><strong>Staff ID:</strong> {settings.account.staffId}</p>
              <p><strong>Dept:</strong> {settings.account.department}</p>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Notifications</h3>
            <div style={styles.settingItem}>
              <span style={styles.settingLabel}>Email Alerts</span>
              <div
                role="button"
                tabIndex={0}
                style={{ ...styles.toggleSwitch, ...(settings.notifications.emailNotifications ? styles.toggleSwitchActive : {}) }}
                onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
              >
                <div style={{ ...styles.toggleSlider, ...(settings.notifications.emailNotifications ? styles.toggleSliderActive : {}) }}></div>
              </div>
            </div>
            <div style={styles.settingItem}>
              <span style={styles.settingLabel}>New Student Alerts</span>
              <div
                role="button"
                tabIndex={0}
                style={{ ...styles.toggleSwitch, ...(settings.notifications.newStudentAlerts ? styles.toggleSwitchActive : {}) }}
                onClick={() => handleSettingChange('notifications', 'newStudentAlerts', !settings.notifications.newStudentAlerts)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSettingChange('notifications', 'newStudentAlerts', !settings.notifications.newStudentAlerts)}
              >
                <div style={{ ...styles.toggleSlider, ...(settings.notifications.newStudentAlerts ? styles.toggleSliderActive : {}) }}></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'flex-end' }}>
            <button style={{ ...styles.btn, background: '#dc3545', color: '#fff' }} onClick={resetSettings}>Reset</button>
            <button style={{ ...styles.btn, ...styles.saveBtn }} onClick={saveSettings}>Save Settings</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FacultySettings;
