import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';
import { API_URL } from '../config/api';

function FacultyDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Analytics calculated from state
  const [stats, setStats] = useState({
    avgCgpa: 0,
    topSkill: '...',
    totalProjects: 0,
    totalCertificates: 0
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('facultyTheme');
    if (storedTheme) setDarkMode(storedTheme === 'dark');

    const staffData = localStorage.getItem('staff');
    if (!staffData) {
      navigate('/');
      return;
    }
    setStaff(JSON.parse(staffData));

    const loadStudents = async () => {
      setIsLoadingStudents(true);
      setLoadError('');
      try {
        const response = await fetch(`${API_URL}/api/auth/students`);
        if (!response.ok) throw new Error('Fetch failed');
        const liveStudents = await response.json();
        
        // Ultra-slim sync for localStorage (avoid QuotaExceededError)
        try {
          const ultraSlimStudents = liveStudents.map(s => ({
            fullName: s.fullName,
            studentId: s.studentId,
            department: s.department,
            section: s.section,
            email: s.email,
            portfolio: { isPublic: s.portfolio?.isPublic } // Exclude profilePhoto
          }));
          localStorage.removeItem('allStudents'); // Purge legacy heavy data
          localStorage.setItem('allStudents', JSON.stringify(ultraSlimStudents));
        } catch (e) {
          console.warn("localStorage quota exceeded. Student cache may be incomplete.");
        }
        setStudents(liveStudents);
      } catch (error) {
        setStudents(JSON.parse(localStorage.getItem('allStudents') || '[]'));
        setLoadError('Working with cached data.');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [navigate]);

  useEffect(() => {
    // 1. Filtering Logic
    let list = students.slice();
    if (filterDept) list = list.filter(s => s.department === filterDept);
    if (filterSection) list = list.filter(s => s.section === filterSection);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => 
        (s.fullName || '').toLowerCase().includes(q) || 
        (s.studentId || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      );
    }
    
    list.sort((a, b) => (String(a.studentId) || '').localeCompare(String(b.studentId), undefined, { numeric: true }));
    setFilteredStudents(list);

    // 2. Quick Analytics Logic
    if (students.length > 0) {
      const validCgpas = students.map(s => parseFloat(s.cgpa)).filter(n => !isNaN(n));
      const avg = validCgpas.length > 0 ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2) : '0.00';
      
      const skillsMap = {};
      students.forEach(s => s.portfolio?.skills?.forEach(sk => {
        const name = typeof sk === 'string' ? sk : sk.name;
        if(name) skillsMap[name] = (skillsMap[name] || 0) + 1;
      }));
      const top = Object.entries(skillsMap).sort((a,b) => b[1]-a[1])[0]?.[0] || 'None';
      
      const proj = students.reduce((sum, s) => sum + (s.portfolio?.projects?.length || 0), 0);
      const cert = students.reduce((sum, s) => sum + (s.portfolio?.certificates?.length || 0), 0);

      setStats({ avgCgpa: avg, topSkill: top, totalProjects: proj, totalCertificates: cert });
    }
  }, [students, filterDept, filterSection, searchTerm]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('facultyTheme', next ? 'dark' : 'light');
  };

  const styles = {
    page: { 
      minHeight: '100vh', 
      background: darkMode ? '#0f172a' : '#f1f5f9', 
      marginLeft: '260px', 
      padding: '40px', 
      fontFamily: "'Inter', sans-serif",
      transition: 'all 0.3s ease'
    },
    header: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '40px',
      padding: '24px',
      background: darkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
      borderRadius: '24px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'transparent'}`
    },
    title: { fontSize: '28px', fontWeight: '800', color: darkMode ? '#ffe600' : '#14532d', margin: 0 },
    
    summaryGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px'
    },
    summaryCard: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '28px', 
      borderRadius: '24px', 
      border: `1px solid ${darkMode ? 'rgba(255,230,0,0.1)' : 'rgba(0,0,0,0.02)'}`,
      textAlign: 'left', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    },
    cardAccent: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#14532d'
    },
    summaryLabel: { fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    summaryValue: { fontSize: '32px', fontWeight: '900', color: darkMode ? '#fff' : '#1e293b', marginTop: '8px' },

    controlBar: {
       background: darkMode ? '#1e293b' : '#ffffff', 
       padding: '24px', 
       borderRadius: '20px', 
       marginBottom: '40px',
       display: 'flex', 
       gap: '20px', 
       flexWrap: 'wrap', 
       boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
       alignItems: 'center'
    },
    input: { 
      flex: 3, padding: '14px 20px', borderRadius: '12px', 
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
      background: darkMode ? '#0f172a' : '#f8fafc', 
      color: darkMode ? '#fff' : '#1e293b',
      fontSize: '15px'
    },
    select: { 
      flex: 1, padding: '14px', borderRadius: '12px', 
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, 
      background: darkMode ? '#0f172a' : '#f8fafc', 
      color: darkMode ? '#fff' : '#1e293b',
      cursor: 'pointer'
    },

    studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' },
    studentCard: {
      background: darkMode ? '#1e293b' : '#ffffff', 
      padding: '30px', 
      borderRadius: '28px', 
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
      position: 'relative',
      cursor: 'default'
    },
    badge: { 
      position: 'absolute', top: '30px', right: '30px', 
      padding: '6px 14px', background: darkMode ? 'rgba(255,230,0,0.1)' : '#f0fdf4', 
      color: darkMode ? '#ffe600' : '#15803d', 
      borderRadius: '10px', fontSize: '12px', fontWeight: '800' 
    },
    avatar: { 
      width: '80px', height: '80px', borderRadius: '24px', 
      background: 'linear-gradient(135deg, #14532d, #16a34a)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '32px', color: '#fff', marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(20, 83, 45, 0.2)',
      overflow: 'hidden'
    },
    cardName: { fontSize: '22px', fontWeight: '800', color: darkMode ? '#fff' : '#0f172a', marginBottom: '6px' },
    cardId: { fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '24px', display: 'block' },
    metaGrid: { 
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', 
      background: darkMode ? 'rgba(15,23,42,0.4)' : '#f8fafc',
      padding: '20px', borderRadius: '20px'
    },
    metaLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '4px' },
    metaVal: { fontSize: '15px', color: darkMode ? '#fff' : '#1e293b', fontWeight: '700' },
    
    actionRow: {
      marginTop: '24px', display: 'flex', gap: '12px'
    },
    btnView: {
       flex: 2, padding: '14px', background: '#14532d', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
    },
    btnSecondary: {
       flex: 1, padding: '14px', background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#fff' : '#1e293b', border: 'none', borderRadius: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },

    logoWrap: { display: 'flex', alignItems: 'center', gap: '20px' },
    logo: { width: '60px', height: '60px', objectFit: 'contain' }
  };

  const uniqueDepts = Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort();

  const responsiveStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    .student-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      border-color: #14532d !important;
    }

    .btn-view:hover {
      filter: brightness(1.2);
      transform: scale(1.02);
    }

    button, input, select {
      transition: all 0.2s ease;
    }

    @media (max-width: 850px) {
      .faculty-page-container { margin-left: 0 !important; padding: 20px !important; padding-bottom: 100px !important; }
      .control-bar { flex-direction: column !important; }
      .control-bar > * { width: 100% !important; flex: none !important; }
      .student-grid { grid-template-columns: 1fr !important; }
      .faculty-header { flex-direction: column; text-align: center; gap: 24px; }
      .mobile-hide { display: none !important; }
    }
  `;

  return (
    <div style={styles.page} className="faculty-page-container">
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      
      <header style={styles.header} className="faculty-header">
        <div style={styles.logoWrap}>
          <img src="/siet.png" alt="Logo" style={styles.logo} />
          <div>
            <h1 style={styles.title}>Academic Oversight</h1>
            <div style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>Registry Hub • {staff?.fullName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button style={{...styles.btnSecondary, flex: 'none', padding: '10px 18px'}} onClick={toggleDarkMode}>
             {darkMode ? '☀️ Light' : '🌙 Dark'}
           </button>
           <button 
             style={{...styles.btnView, flex: 'none', padding: '10px 24px', background: '#dc2626'}} 
             className="mobile-hide"
             onClick={handleLogout}
           >
             Sign Out
           </button>
        </div>
      </header>

      {/* Analytics Summary */}
      <section style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.cardAccent} />
          <div style={styles.summaryLabel}>Total Students</div>
          <div style={styles.summaryValue}>{students.length}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{...styles.cardAccent, background: '#16a34a'}} />
          <div style={styles.summaryLabel}>Institutional CGPA</div>
          <div style={styles.summaryValue}>{stats.avgCgpa}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{...styles.cardAccent, background: '#ffe600'}} />
          <div style={styles.summaryLabel}>Innovation Lead</div>
          <div style={styles.summaryValue}>{stats.topSkill}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{...styles.cardAccent, background: '#0b4f00'}} />
          <div style={styles.summaryLabel}>Project Output</div>
          <div style={styles.summaryValue}>{stats.totalProjects}</div>
        </div>
      </section>

      {/* Search & Filtering */}
      <div style={styles.controlBar}>
        <input 
          style={styles.input} 
          placeholder="Filter by name, ID or email address..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <select style={styles.select} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={styles.select} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
           <option value="">All Sections</option>
           {['A','B','C','D','E'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Student Registry Grid */}
      {isLoadingStudents ? (
         <div style={{textAlign: 'center', padding: '100px', fontSize: '18px', color: '#64748b'}}>
           <div className="spinner">⌛</div> Synchronizing Registry...
         </div>
      ) : (
        <div style={styles.studentGrid}>
          {filteredStudents.map(s => (
            <div key={s._id} style={styles.studentCard} className="student-card">
              <div style={styles.badge}>Section {s.section}</div>
              <div style={styles.avatar}>
                {s.portfolio?.profilePhoto ? (
                  <img src={s.portfolio.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  s.fullName?.[0] || 'S'
                )}
              </div>
              <div style={styles.cardName}>{s.fullName}</div>
              <span style={styles.cardId}>{s.studentId} • {s.department}</span>
              
              <div style={styles.metaGrid}>
                <div>
                  <div style={styles.metaLabel}>Academic CGPA</div>
                  <div style={{...styles.metaVal, color: parseFloat(s.cgpa) >= 8.5 ? '#16a34a' : (darkMode ? '#fff' : '#1e293b')}}>
                    {s.cgpa || '0.00'}
                  </div>
                </div>
                <div>
                  <div style={styles.metaLabel}>Current Year</div>
                  <div style={styles.metaVal}>{s.currentYear || '1st'} Year</div>
                </div>
                <div>
                  <div style={styles.metaLabel}>Projects</div>
                  <div style={styles.metaVal}>{s.portfolio?.projects?.length || 0} Built</div>
                </div>
                <div>
                  <div style={styles.metaLabel}>Profile Status</div>
                  <div style={{...styles.metaVal, color: s.portfolio?.isPublic ? '#16a34a' : '#64748b'}}>
                    {s.portfolio?.isPublic ? '• Public' : '• Private'}
                  </div>
                </div>
              </div>

              <div style={styles.actionRow}>
                <button 
                  style={styles.btnView} 
                  className="btn-view"
                  onClick={() => navigate(`/student-details/${s.studentId || s._id}`)}
                >
                  View Full Portfolio
                </button>
                <button 
                  style={styles.btnSecondary}
                  onClick={() => window.location.href = `mailto:${s.email}`}
                  title="Contact Student"
                >
                  ✉️
                </button>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div style={{gridColumn: 'span 3', textAlign: 'center', padding: '80px', background: 'rgba(0,0,0,0.02)', borderRadius: '24px'}}>
              <div style={{fontSize: '40px', marginBottom: '16px'}}>🔍</div>
              <h3 style={{margin: 0, color: '#1e293b'}}>No records found</h3>
              <p style={{color: '#64748b'}}>Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;
