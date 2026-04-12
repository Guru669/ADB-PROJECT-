import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';
import { API_URL } from '../config/api';

function FacultyReports() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const staff = JSON.parse(localStorage.getItem('staff') || '{}');
  const staffName = (staff.fullName || 'staff').split(' ')[0].toLowerCase();
  
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/students`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const students = await response.json();
      
      const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
      
      // 1. Comprehensive Student Ledger
      const enrollmentReport = {
        id: 'enrollment',
        name: 'Student Enrollment Ledger',
        type: 'students',
        description: 'Global overview of student distribution and profile visibility.',
        data: {
          'Total Enrolled': students.length,
          'Public Profiles': students.filter(s => s.portfolio?.isPublic).length,
          'Verified Portfolios': students.filter(s => s.portfolio?.bio || s.portfolio?.skills?.length > 0).length,
          'Departments': students.reduce((acc, s) => { if(s.department) acc[s.department] = (acc[s.department] || 0) + 1; return acc; }, {}),
          'Sections': students.reduce((acc, s) => { if(s.section) acc[s.section] = (acc[s.section] || 0) + 1; return acc; }, {})
        }
      };

      // 2. Innovation & Project Audit
      const projectReport = {
        id: 'projects',
        name: 'Innovation & Research Audit',
        type: 'portfolios',
        description: 'Tracking student technical output and project milestones.',
        data: {
          'Total Projects Published': students.reduce((acc, s) => acc + (s.portfolio?.projects?.length || 0), 0),
          'Students with Projects': students.filter(s => s.portfolio?.projects?.length > 0).length,
          'Active Research Journals': students.reduce((acc, s) => acc + (s.portfolio?.journals?.length || 0), 0),
          'Avg projects/Student': (students.reduce((acc, s) => acc + (s.portfolio?.projects?.length || 0), 0) / (students.length || 1)).toFixed(2)
        }
      };

      // 3. High Performers Directory
      const highPerformers = students.filter(s => parseFloat(s.cgpa) >= 8.5)
        .sort((a, b) => b.cgpa - a.cgpa)
        .slice(0, 10)
        .map(s => `${s.fullName} (${s.cgpa}) - ${s.department}`);

      const performanceReport = {
        id: 'merit',
        name: 'Academic Merit Directory',
        type: 'merit',
        description: 'Top 10 High-Ranking students based on cumulative performance.',
        data: {
          'Total High Achievers (>=8.5)': students.filter(s => parseFloat(s.cgpa) >= 8.5).length,
          'Elite Class (>=9.0)': students.filter(s => parseFloat(s.cgpa) >= 9.0).length,
          'Top Graduates': highPerformers
        }
      };

      // 4. Skills Mastery Index
      const skillsCount = {};
      students.forEach(s => s.portfolio?.skills?.forEach(sk => {
        const name = typeof sk === 'string' ? sk : sk.name;
        if(name) skillsCount[name] = (skillsCount[name] || 0) + 1;
      }));
      
      const skillsReport = {
        id: 'skills',
        name: 'Technical Mastery Index',
        type: 'skills',
        description: 'Heatmap of skills across the institution.',
        data: Object.fromEntries(Object.entries(skillsCount).sort((a,b) => b[1]-a[1]).slice(0, 15))
      };

      setReports([enrollmentReport, projectReport, performanceReport, skillsReport]);
    } catch (err) {
      console.error("Error generating reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (report) => {
    let csvRows = [`${report.name} Report`, `Description: ${report.description}`, `Generated: ${new Date().toLocaleString()}`, ''];
    
    Object.entries(report.data).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        csvRows.push(`${key}:`);
        val.forEach(item => csvRows.push(`,${item}`));
      } else if (typeof val === 'object') {
        csvRows.push(`${key}:`);
        Object.entries(val).forEach(([k, v]) => csvRows.push(`,${k},${v}`));
      } else {
        csvRows.push(`${key},${val}`);
      }
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `siet_report_${report.id}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const styles = {
    container: { 
      minHeight: '100vh', 
      background: darkMode ? '#0f172a' : '#f8fafc', 
      fontFamily: "'Inter', sans-serif", 
      marginLeft: '260px', 
      padding: '34px',
      transition: 'all 0.3s ease',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px'
    },
    headerTitle: { fontSize: '28px', fontWeight: '800', color: darkMode ? '#ffe600' : '#14532d', margin: 0 },
    
    controls: {
      background: darkMode ? 'rgba(30, 41, 59, 0.7)' : '#ffffff', 
      padding: '24px', 
      borderRadius: '20px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: `1px solid ${darkMode ? 'rgba(255, 230, 0, 0.1)' : 'rgba(20, 83, 45, 0.05)'}`, 
      marginBottom: '32px', 
      display: 'flex', 
      gap: '16px', 
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    select: {
      padding: '12px 20px', 
      borderRadius: '12px', 
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
      background: darkMode ? '#1e293b' : '#fff', 
      color: darkMode ? '#f1f5f9' : '#1e293b', 
      fontSize: '14px', 
      minWidth: '200px'
    },
    btnPrimary: {
       padding: '12px 24px',
       background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
       color: '#fff',
       border: 'none',
       borderRadius: '12px',
       fontWeight: '700',
       cursor: 'pointer',
       boxShadow: '0 4px 12px rgba(20, 83, 45, 0.25)',
       fontSize: '14px'
    },

    reportGrid: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
      gap: '24px'
    },
    reportCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.7)' : '#ffffff', 
      padding: '30px', 
      borderRadius: '24px', 
      border: `1px solid ${darkMode ? 'rgba(255, 230, 0, 0.1)' : 'rgba(20, 83, 45, 0.05)'}`, 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s'
    },
    reportBadge: {
       display: 'inline-block',
       padding: '4px 10px',
       background: 'rgba(22, 163, 74, 0.1)',
       color: '#16a34a',
       borderRadius: '8px',
       fontSize: '11px',
       fontWeight: '800',
       textTransform: 'uppercase',
       marginBottom: '12px'
    },
    reportTitle: { fontSize: '20px', fontWeight: '800', color: darkMode ? '#f1f5f9' : '#1e293b', margin: '0 0 8px 0' },
    reportDesc: { fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '24px', lineHeight: '1.5' },
    
    statRow: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '12px 16px', 
      background: darkMode ? '#1e293b' : '#f8fafc', 
      borderRadius: '12px',
      marginBottom: '8px',
      fontSize: '14px'
    },
    statKey: { fontWeight: '600', color: darkMode ? '#cbd5e1' : '#475569' },
    statVal: { fontWeight: '800', color: '#16a34a' }
  };

  const responsiveStyles = `
    @media (max-width: 850px) {
      .reports-container { margin-left: 0 !important; padding: 15px !important; padding-bottom: 90px !important; }
      .faculty-header { flex-direction: column; gap: 20px; text-align: center; }
      .reports-grid { grid-template-columns: 1fr !important; }
      .mobile-logout-only { display: block !important; }
    }
    .mobile-logout-only { display: none !important; }
  `;
  if (loading) return (
    <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div style={{width: '60px', height: '60px', border: '6px solid #f3f4f6', borderTopColor: '#14532d', borderRadius: '50%', animation: 'spin 1s infinite linear', margin: '0 auto 20px'}}></div>
        <p style={{fontWeight: '700', color: '#14532d'}}>Assembling Analytical Data...</p>
      </div>
      <style>{`@keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }`}</style>
    </div>
  );

  return (
    <>
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      <div style={styles.container} className="reports-container">
        
        {/* Header */}
        <header style={styles.header} className="faculty-header">
          <div>
            <h1 style={styles.headerTitle}>Intelligence Reports</h1>
            <p style={{color: darkMode ? '#94a3b8' : '#64748b', marginTop: '4px'}}>Executive documents and auditing tools</p>
          </div>
          <div className="mobile-nav-buttons" style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <button style={{...styles.btnPrimary, background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0'}} onClick={() => navigate('/faculty-analytics')}>Analyze Trends</button>
            <button style={styles.btnPrimary} onClick={generateReports}>Re-Generate</button>
            <button style={{...styles.btnPrimary, background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0'}} onClick={toggleDarkMode}>
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        {/* Global Controls */}
        <section style={styles.controls} className="report-controls">
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <span style={{fontSize: '14px', fontWeight: '700', opacity: 0.7}}>Filter Category:</span>
            <select id="report-category-filter" value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
              <option value="all">Full Spectrum</option>
              <option value="students">Enrollment & Growth</option>
              <option value="portfolios">Portfolios & Projects</option>
              <option value="merit">Academic Excellence</option>
              <option value="skills">Marketable Skills</option>
            </select>
          </div>
          <p style={{fontSize: '12px', opacity: 0.6, margin: 0}}>Total Data Points: {reports.length}</p>
        </section>

        {/* Reports Display */}
        <div style={styles.reportGrid} className="report-grid">
          {reports.filter(r => reportType === 'all' || r.type === reportType).map(report => (
            <div key={report.id} style={styles.reportCard}>
              <div style={styles.reportBadge}>{report.type} Audit</div>
              <h3 style={styles.reportTitle}>{report.name}</h3>
              <p style={styles.reportDesc}>{report.description}</p>
              
              <div style={{flex: 1, marginBottom: '24px'}}>
                 {Object.entries(report.data).map(([key, val]) => (
                   <div key={key}>
                     {typeof val !== 'object' ? (
                        <div style={styles.statRow}>
                          <span style={styles.statKey}>{key}</span>
                          <span style={styles.statVal}>{val}</span>
                        </div>
                     ) : (
                       <div style={{...styles.statRow, flexDirection: 'column', alignItems: 'flex-start', gap: '12px', background: 'transparent', padding: '16px 0'}}>
                          <span style={{...styles.statKey, fontSize: '13px', borderBottom: '2px solid #16a34a', paddingBottom: '4px', marginBottom: '8px'}}>{key} Breakdown</span>
                          <div style={{width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                             {Array.isArray(val) ? (
                               val.map((item, idx) => <div key={idx} style={{padding: '8px 12px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '8px', fontSize: '12px', fontWeight: '600', width: '100%'}}>{item}</div>)
                             ) : (
                               Object.entries(val).map(([k, v]) => (
                                 <div key={k} style={{padding: '8px 12px', background: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                   <strong>{k}</strong>
                                   <span style={{color: '#16a34a', fontWeight: '800'}}>{v}</span>
                                 </div>
                               ))
                             )}
                          </div>
                       </div>
                     )}
                   </div>
                 ))}
              </div>

              <button 
                style={{...styles.btnPrimary, width: '100%', display: 'flex', justifyContent: 'center', gap: '10px'}}
                onClick={() => downloadCSV(report)}
              >
                Export Spreadsheet (.csv)
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @media (max-width: 850px) {
          .reports-container { margin-left: 0 !important; padding: 20px !important; }
          .faculty-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .report-grid { grid-template-columns: 1fr !important; }
          .report-controls { flex-direction: column; align-items: stretch; gap: 15px; }
          .mobile-nav-buttons { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .mobile-nav-buttons button { width: 100%; padding: 10px; font-size: 12px; }
        }
      `}</style>
    </>
  );
}

export default FacultyReports;

