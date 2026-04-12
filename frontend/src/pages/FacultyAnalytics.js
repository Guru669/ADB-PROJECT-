import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';
import { API_URL } from '../config/api';

function FacultyAnalytics() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const staffName = (JSON.parse(localStorage.getItem('staff') || '{}').fullName || 'staff').split(' ')[0].toLowerCase();
  const [analyticsData, setAnalyticsData] = useState({
    totalStudents: 0,
    publicPortfolios: 0,
    privatePortfolios: 0,
    departments: {},
    sections: {},
    monthlyRegistrations: [],
    skillsDistribution: [],
    projectStats: {},
    projectsByDept: {}
  });

  useEffect(() => {
    // Load theme
    const storedTheme = localStorage.getItem('facultyTheme');
    if (storedTheme) setDarkMode(storedTheme === 'dark');

    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/students`);
        if (response.ok) {
          const students = await response.json();
          // Sync with localStorage - Slim version only to avoid QuotaExceededError
          try {
            const slimStudents = students.map(({ fullName, studentId, department, section, email, portfolio }) => ({
              fullName, studentId, department, section, email,
              portfolio: { isPublic: portfolio?.isPublic, profilePhoto: portfolio?.profilePhoto }
            }));
            localStorage.removeItem('allStudents'); // Clear old heavy data first
            localStorage.setItem('allStudents', JSON.stringify(slimStudents));
          } catch (e) {
            console.warn("Storage quota exceeded. Caching failed.");
          }

          const departments = {};
          const sections = {};
          const skillsList = {};
          let publicCount = 0;
          let privateCount = 0;

          students.forEach(student => {
            if (student.department) {
              departments[student.department] = (departments[student.department] || 0) + 1;
            }
            if (student.section) {
              sections[student.section] = (sections[student.section] || 0) + 1;
            }
            if (student.portfolio?.isPublic) {
              publicCount++;
            } else {
              privateCount++;
            }
            if (student.portfolio?.skills) {
              student.portfolio.skills.forEach(skill => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                skillsList[skillName] = (skillsList[skillName] || 0) + 1;
              });
            }
          });

          setAnalyticsData({
            totalStudents: students.length,
            publicPortfolios: publicCount,
            privatePortfolios: privateCount,
            departments,
            sections,
            skillsDistribution: Object.entries(skillsList).sort((a, b) => b[1] - a[1]).slice(0, 10),
            projectStats: {
              totalProjects: students.reduce((acc, s) => acc + (s.portfolio?.projects?.length || 0), 0),
              avgProjectsPerStudent: students.length > 0 ?
                (students.reduce((acc, s) => acc + (s.portfolio?.projects?.length || 0), 0) / students.length).toFixed(1) : 0,
              totalCertificates: students.reduce((acc, s) => acc + (s.portfolio?.certificates?.length || 0), 0),
              totalAchievements: students.reduce((acc, s) => acc + (s.portfolio?.achievements?.length || 0), 0)
            },
            projectsByDept: students.reduce((acc, s) => {
              if (s.department) {
                acc[s.department] = (acc[s.department] || 0) + (s.portfolio?.projects?.length || 0);
              }
              return acc;
            }, {})
          });
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };

    loadData();

    // Add float animation to head
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('facultyTheme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('staff');
    localStorage.removeItem('staffProfile');
    localStorage.removeItem('facultyTheme');
    window.location.href = '/';
  };

  const exportAnalytics = () => {
    const lines = [
      `Analytics Export - ${new Date().toLocaleDateString()}`,
      '',
      '=== OVERVIEW ===',
      `Total Students,${analyticsData.totalStudents}`,
      `Public Portfolios,${analyticsData.publicPortfolios}`,
      `Private Portfolios,${analyticsData.privatePortfolios}`,
      `Total Projects,${analyticsData.projectStats.totalProjects}`,
      `Avg Projects/Student,${analyticsData.projectStats.avgProjectsPerStudent}`,
      `Total Certificates,${analyticsData.projectStats.totalCertificates}`,
      `Total Achievements,${analyticsData.projectStats.totalAchievements}`,
      '',
      '=== PROJECTS BY DEPARTMENT ===',
      ...Object.entries(analyticsData.projectsByDept).map(([d, c]) => `${d},${c}`),
      '',
      '=== DEPARTMENTS (Enrollment) ===',
      ...Object.entries(analyticsData.departments).map(([d, c]) => `${d},${c}`),
      '',
      '=== SECTIONS ===',
      ...Object.entries(analyticsData.sections).map(([s, c]) => `Section ${s},${c}`),
      '',
      '=== TOP SKILLS ===',
      ...analyticsData.skillsDistribution.map(([skill, count]) => `${skill},${count}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const styles = {
    container: {
      minHeight: '100vh',
      background: darkMode ? '#121212' : '#ffffff',
      fontFamily: "'Inter', Arial, sans-serif",
      marginLeft: '260px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease'
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
    headerBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
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
    headerLogo: {
      width: '44px',
      height: '44px',
      objectFit: 'contain'
    },
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
    main: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '25px'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.1)',
      border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #0b4f00',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#ffe600',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '14px',
      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#0b4f00',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    chartContainer: {
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.1)',
      border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '2px solid #0b4f00',
      marginBottom: '30px',
      transition: 'all 0.3s ease'
    },
    chartTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: darkMode ? '#ffe600' : '#0b4f00',
      marginBottom: '20px'
    },
    barChart: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    barItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    barLabel: {
      minWidth: '120px',
      fontSize: '14px',
      color: darkMode ? '#fff' : '#333'
    },
    barContainer: {
      flex: 1,
      height: '30px',
      background: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
      borderRadius: '15px',
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      background: darkMode ? 'linear-gradient(90deg, #ffe600 0%, #ffc107 100%)' : 'linear-gradient(90deg, #0b4f00 0%, #1a7a0a 100%)',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '10px',
      color: darkMode ? '#0b4f00' : '#fff',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    skillItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 15px',
      background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
      borderRadius: '8px',
      border: darkMode ? '1px solid rgba(255, 230, 0, 0.2)' : '1px solid #e9ecef',
      transition: 'all 0.3s ease'
    },
    skillName: {
      fontSize: '14px',
      color: darkMode ? '#fff' : '#333',
      fontWeight: '500'
    },
    skillCount: {
      fontSize: '14px',
      color: '#ffe600',
      fontWeight: 'bold'
    },
    btn: {
      padding: '10px 25px',
      backgroundColor: '#0b4f00',
      color: '#ffe600',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(11, 79, 0, 0.3)'
    }
  };

  const responsiveStyles = `
    @media (max-width: 850px) {
      .analytics-container {
        margin-left: 0 !important;
        padding: 20px !important;
        padding-bottom: 90px !important;
      }
      .analytics-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 20px !important;
        padding: 15px !important;
      }
      .analytics-header-right {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        width: 100% !important;
        gap: 10px !important;
      }
      .analytics-header-right button {
        width: 100% !important;
        padding: 10px !important;
      }
      .mobile-logout-only { display: block !important; }
      .stats-container {
        grid-template-columns: 1fr !important;
      }
      .bar-item {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 5px !important;
      }
      .bar-label {
        min-width: unset !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      <div style={styles.container} className="analytics-container">
        <div style={styles.decorCircle1}></div>
        <div style={styles.decorCircle2}></div>
        <div style={styles.header} className="analytics-header">
          <div style={styles.headerBrand}>
            <div style={styles.headerLogoWrap}>
              <img src="/siet.png" alt="SIET Logo" style={styles.headerLogo} />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Analytics</h2>
              <p style={styles.headerSubtitle}>Welcome back, {staffName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 15 }} className="analytics-header-right">
            <button
              style={styles.topActionPrimaryBtn}
              onClick={toggleDarkMode}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button
              style={styles.topActionBtn}
              onClick={() => navigate('/staff-dashboard')}
            >
              Academic Overview
            </button>
            <button
              style={styles.topActionBtn}
              onClick={() => navigate('/faculty-reports')}
            >
              Reports
            </button>
          </div>
        </div>

        <div style={styles.main}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{
                ...styles.btn,
                backgroundColor: '#28a745',
                color: '#fff',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(40,167,69,0.3)'
              }}
              onClick={exportAnalytics}
            >
              💾 Save Analytics CSV
            </button>
          </div>
          <div style={styles.statsContainer} className="stats-container">
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{analyticsData.totalStudents}</div>
              <div style={styles.statLabel}>Total Students</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{analyticsData.publicPortfolios}</div>
              <div style={styles.statLabel}>Public Portfolios</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{analyticsData.privatePortfolios}</div>
              <div style={styles.statLabel}>Private Portfolios</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{analyticsData.projectStats.totalProjects}</div>
              <div style={styles.statLabel}>Total Projects</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Department Distribution</h3>
            <div style={styles.barChart}>
              {Object.entries(analyticsData.departments).map(([dept, count]) => {
                const percentage = (count / analyticsData.totalStudents) * 100;
                return (
                  <div key={dept} style={styles.barItem} className="bar-item">
                    <div style={styles.barLabel} className="bar-label">{dept}</div>
                    <div style={styles.barContainer}>
                      <div style={{ ...styles.barFill, width: `${percentage}%` }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Projects by Department</h3>
            <div style={styles.barChart}>
              {Object.entries(analyticsData.projectsByDept).map(([dept, count]) => {
                const maxProjects = Math.max(...Object.values(analyticsData.projectsByDept), 1);
                const percentage = (count / maxProjects) * 100;
                return (
                  <div key={dept} style={styles.barItem} className="bar-item">
                    <div style={styles.barLabel} className="bar-label">{dept}</div>
                    <div style={styles.barContainer}>
                      <div style={{ ...styles.barFill, width: `${Math.max(percentage, 5)}%`, backgroundColor: '#ffc107', color: '#1e5631' }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Top Skills</h3>
            <div style={styles.skillsGrid}>
              {analyticsData.skillsDistribution.map(([skill, count]) => (
                <div key={skill} style={styles.skillItem}>
                  <span style={styles.skillName}>{skill}</span>
                  <span style={styles.skillCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Section Distribution</h3>
            <div style={styles.barChart}>
              {Object.entries(analyticsData.sections).map(([section, count]) => {
                const percentage = (count / analyticsData.totalStudents) * 100;
                return (
                  <div key={section} style={styles.barItem} className="bar-item">
                    <div style={styles.barLabel} className="bar-label">Section {section}</div>
                    <div style={styles.barContainer}>
                      <div style={{ ...styles.barFill, width: `${percentage}%` }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FacultyAnalytics;
