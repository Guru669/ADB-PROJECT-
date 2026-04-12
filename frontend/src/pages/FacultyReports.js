import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';
import { API_URL } from '../config/api';

function FacultyReports() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const staffName = (JSON.parse(localStorage.getItem('staff') || '{}').fullName || 'staff').split(' ')[0].toLowerCase();
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    // Load theme
    const storedTheme = localStorage.getItem('facultyTheme');
    if (storedTheme) setDarkMode(storedTheme === 'dark');

    generateReports();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('facultyTheme', newMode ? 'dark' : 'light');
  };

  const generateReports = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/students`);
      if (!response.ok) return;
      const students = await response.json();
      localStorage.setItem('allStudents', JSON.stringify(students));
      
      const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
      
      const generatedReports = [
        {
          id: 1,
          name: 'Student Enrollment Report',
          type: 'students',
          generatedDate: new Date().toLocaleDateString(),
          data: {
            totalStudents: students.length,
            departments: {},
            sections: {},
            publicPortfolios: students.filter(s => s.portfolio?.isPublic).length,
            privatePortfolios: students.filter(s => !s.portfolio?.isPublic).length
          }
        },
        {
          id: 2,
          name: 'Portfolio Status Report',
          type: 'portfolios',
          generatedDate: new Date().toLocaleDateString(),
          data: {
            totalPortfolios: students.length,
            publicPortfolios: students.filter(s => s.portfolio?.isPublic).length,
            privatePortfolios: students.filter(s => !s.portfolio?.isPublic).length,
            portfoliosWithProjects: students.filter(s => s.portfolio?.projects?.length > 0).length,
            portfoliosWithSkills: students.filter(s => s.portfolio?.skills?.length > 0).length
          }
        },
        {
          id: 3,
          name: 'Activity Report',
          type: 'activity',
          generatedDate: new Date().toLocaleDateString(),
          data: {
            totalLogins: loginLogs.length,
            uniqueUsers: [...new Set(loginLogs.map(log => log.email))].length,
            averageLoginsPerDay: loginLogs.length > 0 ? (loginLogs.length / 30).toFixed(1) : 0
          }
        }
      ];

      const departments = {};
      const sections = {};
      students.forEach(student => {
        if (student.department) {
          departments[student.department] = (departments[student.department] || 0) + 1;
        }
        if (student.section) {
          sections[student.section] = (sections[student.section] || 0) + 1;
        }
      });

      generatedReports[0].data.departments = departments;
      generatedReports[0].data.sections = sections;
      setReports(generatedReports);
    } catch (err) {
      console.error("Error generating reports:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff');
    localStorage.removeItem('staffProfile');
    localStorage.removeItem('facultyTheme');
    window.location.href = '/';
  };

  const downloadReport = (report) => {
    const reportData = JSON.stringify(report.data, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}_${report.generatedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    const visible = reports.filter(r => reportType === 'all' || r.type === reportType);
    if (visible.length === 0) return;

    let csvLines = [`All Reports Export - ${new Date().toLocaleDateString()}`, ''];
    visible.forEach(report => {
      csvLines.push(`=== ${report.name} (${report.generatedDate}) ===`);
      Object.entries(report.data).forEach(([key, val]) => {
        if (typeof val !== 'object') {
          csvLines.push(`${key.replace(/([A-Z])/g, ' $1')},${val}`);
        } else {
          Object.entries(val).forEach(([k, v]) => csvLines.push(`  ${k},${v}`));
        }
      });
      csvLines.push('');
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_reports_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const styles = {
    container: { 
      minHeight: '100vh', 
      background: darkMode ? '#121212' : '#ffffff', 
      fontFamily: "'Inter', sans-serif", 
      marginLeft: '260px', 
      position: 'relative', 
      overflow: 'hidden', 
      transition: 'background-color 0.3s ease',
      boxSizing: 'border-box'
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
    headerTitle: { margin: 0, fontSize: '32px', fontWeight: '800', color: '#1a3625' },
    headerSubtitle: { color: '#64748b', fontSize: '16px', margin: '4px 0 0 0' },
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
    main: { maxWidth: 1200, margin: '0 auto', padding: '25px' },
    controls: {
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', padding: '20px', borderRadius: '15px', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.1)', border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #0b4f00', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'
    },
    select: {
      padding: '10px 15px', borderRadius: '8px', border: darkMode ? '1px solid rgba(255, 230, 0, 0.4)' : '2px solid #0b4f00', background: darkMode ? '#2d2d2d' : '#fff', color: darkMode ? '#ffe600' : '#0b4f00', fontSize: '14px', minWidth: '150px'
    },
    btn: {
      padding: '10px 25px', backgroundColor: '#0b4f00', color: '#ffe600', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
    },
    reportCard: {
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', padding: '25px', borderRadius: '15px', border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #0b4f00', transition: 'all 0.3s ease'
    },
    statItem: {
      display: 'flex', justifyContent: 'space-between', padding: '10px', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa', borderRadius: '8px'
    }
  };

  const responsiveStyles = `
    @media (max-width: 768px) {
      .reports-container {
        margin-left: 0 !important;
      }
      .reports-header {
        flex-direction: column !important;
        text-align: center !important;
        gap: 20px !important;
        padding: 20px !important;
      }
      .reports-header-right {
        flex-direction: column !important;
        width: 100% !important;
      }
      .reports-header-right button {
        width: 100% !important;
      }
      .reports-main {
        padding: 15px !important;
      }
      .reports-controls {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .reports-controls button, .reports-controls select {
        width: 100% !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      <div style={styles.container} className="reports-container">
        <div style={styles.header} className="reports-header">
          <div style={styles.headerBrand}>
            <div style={styles.headerLogoWrap}>
              <img src="/siet.png" alt="SIET Logo" style={styles.headerLogo} />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Reports</h2>
              <p style={styles.headerSubtitle}>Welcome back, {staffName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 15 }} className="reports-header-right">
            <button style={styles.topActionPrimaryBtn} onClick={toggleDarkMode}>{darkMode ? 'Light' : 'Dark'}</button>
            <button style={styles.topActionBtn} onClick={() => navigate('/faculty-analytics')}>Analytics</button>
            <button style={styles.topActionBtn} onClick={() => navigate('/faculty-settings')}>Settings</button>
            <button style={styles.topActionBtn} onClick={() => navigate('/staff-dashboard')}>Students</button>
          </div>
        </div>

        <div style={styles.main} className="reports-main">
          <div style={styles.controls} className="reports-controls">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
              <option value="all">All Reports</option>
              <option value="students">Student Reports</option>
              <option value="portfolios">Portfolio Reports</option>
              <option value="activity">Activity Reports</option>
            </select>
            <button style={{ ...styles.btn, background: '#28a745', color: '#fff', boxShadow: '0 4px 15px rgba(40,167,69,0.3)' }} onClick={exportAllReports}>💾 Save All Reports CSV</button>
            <button style={styles.btn} onClick={generateReports}>🔄 Refresh Reports</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '25px' }}>
            {reports.filter(r => reportType === 'all' || r.type === reportType).map(report => (
              <div key={report.id} style={styles.reportCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ color: darkMode ? '#ffe600' : '#0b4f00', margin: 0 }}>{report.name}</h3>
                  <button style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: '20px', padding: '7px 15px', cursor: 'pointer' }} onClick={() => downloadReport(report)}>📥 Download</button>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                   {Object.entries(report.data).map(([key, val]) => (
                     typeof val !== 'object' && (
                       <div key={key} style={styles.statItem}>
                         <span style={{ color: darkMode ? '#ccc' : '#666', fontSize: '12px' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                         <span style={{ color: '#ffe600', fontWeight: 'bold' }}>{val}</span>
                       </div>
                     )
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default FacultyReports;
