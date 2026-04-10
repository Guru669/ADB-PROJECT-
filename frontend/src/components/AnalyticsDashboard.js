import React, { useState, useEffect } from 'react';

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // For now, use localStorage data since we don't have backend API yet
      const students = JSON.parse(localStorage.getItem('allStudents') || '[]');
      const staff = JSON.parse(localStorage.getItem('allStaff') || '[]');

      const totalStudents = students.length;
      const totalStaff = staff.length;
      const publicPortfolios = students.filter(s => s.portfolio?.isPublic).length;
      const privatePortfolios = students.filter(s => s.portfolio && !s.portfolio.isPublic).length;
      const totalAchievements = students.reduce((sum, s) => sum + (s.portfolio?.achievements?.length || 0), 0);
      const totalProjects = students.reduce((sum, s) => sum + (s.portfolio?.projects?.length || 0), 0);
      const totalCertificates = students.reduce((sum, s) => sum + (s.portfolio?.certificates?.length || 0), 0);
      const avgSkills = students.reduce((sum, s) => sum + (s.portfolio?.skills?.length || 0), 0) / (totalStudents || 1);

      // Skills distribution
      const skillsCount = {};
      students.forEach(s => {
        s.portfolio?.skills?.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          skillsCount[skillName] = (skillsCount[skillName] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setAnalytics({
        totalStudents,
        totalStaff,
        publicPortfolios,
        privatePortfolios,
        totalAchievements,
        totalProjects,
        totalCertificates,
        avgSkills: avgSkills.toFixed(1),
        topSkills,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Loading analytics...</div>;
  if (!analytics) return <div style={{ textAlign: 'center', padding: '40px' }}>No data available</div>;

  const styles = {
    container: {
      padding: 'min(20px, 4vw)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    card: {
      background: 'linear-gradient(135deg, #1e5631 0%, #2e7d32 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(30, 86, 49, 0.2)',
      textAlign: 'center',
    },
    value: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    label: {
      fontSize: '12px',
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    skillsSection: {
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    skillsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1e5631',
      marginBottom: '15px',
      borderBottom: '2px solid #ffc107',
      paddingBottom: '10px',
    },
    skillItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      marginBottom: '8px',
      background: '#f8f9fa',
      borderRadius: '8px',
      borderLeft: '4px solid #1e5631',
    },
    skillBar: {
      height: '8px',
      background: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    skillProgress: {
      height: '100%',
      background: 'linear-gradient(90deg, #1e5631, #2e7d32)',
      transition: 'width 0.5s ease',
    },
  };

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      <h2 style={{ color: '#1e5631', marginBottom: '20px', fontSize: 'clamp(20px, 5vw, 24px)' }}>📊 Analytics Dashboard</h2>

      <div style={styles.grid} className="analytics-grid">
        <div style={styles.card}>
          <div style={styles.value}>{analytics.totalStudents}</div>
          <div style={styles.label}>👥 Total Students</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.totalStaff}</div>
          <div style={styles.label}>👨‍🏫 Total Staff</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.publicPortfolios}</div>
          <div style={styles.label}>🌐 Public Portfolios</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.privatePortfolios}</div>
          <div style={styles.label}>🔒 Private Portfolios</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.totalAchievements}</div>
          <div style={styles.label}>🏆 Achievements</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.totalProjects}</div>
          <div style={styles.label}>💼 Total Projects</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.totalCertificates}</div>
          <div style={styles.label}>📜 Certificates</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{analytics.avgSkills}</div>
          <div style={styles.label}>⭐ Avg Skills/Student</div>
        </div>
      </div>

      <div style={styles.skillsSection}>
        <div style={styles.skillsTitle}>🎯 Top Skills</div>
        {analytics.topSkills.map(([skill, count]) => {
          const percentage = (count / analytics.totalStudents) * 100;
          return (
            <div key={skill} style={styles.skillItem}>
              <div>
                <strong>{skill}</strong>
                <div style={styles.skillBar}>
                  <div style={{
                    ...styles.skillProgress,
                    width: `${percentage}%`
                  }} />
                </div>
              </div>
              <span style={{ fontWeight: 'bold', color: '#1e5631' }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const responsiveStyles = `
  @media (max-width: 600px) {
    .analytics-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
      gap: 15px !important;
    }
  }
`;

export default AnalyticsDashboard;
