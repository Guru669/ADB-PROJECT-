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
        localStorage.setItem('allStudents', JSON.stringify(liveStudents));
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
      list = list.filter(s => (s.fullName || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q));
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
      background: darkMode ? '#0f172a' : '#f8fafc', 
      marginLeft: '260px', 
      padding: '30px', 
      fontFamily: "'Inter', sans-serif" 
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '800', color: darkMode ? '#ffe600' : '#14532d', margin: 0 },
    
    summaryGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px'
    },
    summaryCard: {
      background: darkMode ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
      padding: '20px', borderRadius: '16px', border: `1px solid ${darkMode ? 'rgba(255,230,0,0.1)' : 'rgba(20,83,45,0.05)'}`,
      textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    summaryLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' },
    summaryValue: { fontSize: '24px', fontWeight: '800', color: '#16a34a' },

    controlBar: {
       background: darkMode ? '#1e293b' : '#ffffff', padding: '16px', borderRadius: '16px', marginBottom: '32px',
       display: 'flex', gap: '16px', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    input: { flex: 2, padding: '12px 18px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#fff' : '#1e293b' },
    select: { flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#fff' : '#1e293b' },

    studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    studentCard: {
      background: darkMode ? '#1e293b' : '#ffffff', padding: '24px', borderRadius: '20px', 
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s', position: 'relative'
    },
    badge: { position: 'absolute', top: '24px', right: '24px', padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontSize: '11px', fontWeight: '800' },
    avatar: { width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #14532d, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', marginBottom: '16px' },
    cardName: { fontSize: '18px', fontWeight: '700', marginBottom: '4px' },
    cardId: { fontSize: '13px', opacity: 0.6, marginBottom: '16px', display: 'block' },
    metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' },
    metaItem: { color: '#64748b', fontWeight: '600' },
    metaVal: { color: '#1e293b', fontWeight: '700', marginLeft: '4px' },
    
    btnPrimary: {
       marginTop: '20px', width: '100%', padding: '12px', background: '#14532d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'filter 0.2s'
    }
  };

  const uniqueDepts = Array.from(new Set(students.map(s => s.department).filter(Boolean))).sort();

  return (
    <div style={styles.page} className="faculty-page-container">
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      
      <header style={styles.header} className="faculty-header">
        <div style={styles.logoWrap} className="mobile-center">
          <img src="/siet.png" alt="SIET Logo" style={styles.logo} />
          <div>
            <h1 style={styles.title} className="dashboard-title">Academic Oversight</h1>
            <div style={styles.statusText}>Welcome back, {staff?.fullName || 'Faculty'}</div>
          </div>
        </div>
        <div className="mobile-nav-buttons" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
           <button style={{...styles.btnPrimary, background: '#fff', color: '#1e293b', marginTop: 0, width: 'auto', border: '1px solid #e2e8f0'}} onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
           <button style={{...styles.btnPrimary, marginTop: 0, width: 'auto'}} onClick={() => navigate('/faculty-analytics')}>Analytics Hub</button>
        </div>
      </header>

      {/* Summary KPI Widgets */}
      <section style={styles.summaryGrid} className="summary-grid">
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Cohort Size</div>
          <div style={styles.summaryValue}>{students.length}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Avg Institutional CGPA</div>
          <div style={styles.summaryValue}>{stats.avgCgpa}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Dominant Skill</div>
          <div style={{...styles.summaryValue, fontSize: '18px', marginTop: '6px'}}>{stats.topSkill}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Innovation Output</div>
          <div style={styles.summaryValue}>{stats.totalProjects} <span style={{fontSize: '11px', opacity: 0.5}}>PRJ</span></div>
        </div>
      </section>

      {/* Control Bar */}
      <div style={styles.controlBar} className="control-bar">
        <input id="student-search" name="student-search" style={styles.input} placeholder="Search by name or identifier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select id="dept-filter" name="dept-filter" style={styles.select} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">Global Departments</option>
          {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select id="section-filter" name="section-filter" style={styles.select} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
           <option value="">All Sections</option>
           {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Student Catalog */}
      {isLoadingStudents ? (
         <div style={{textAlign: 'center', padding: '100px'}}>⏳ Loading Student Registry...</div>
      ) : (
        <div style={styles.studentGrid} className="student-grid">
          {filteredStudents.map(s => (
            <div key={s._id} style={styles.studentCard} onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform='none'}>
              <div style={styles.badge}>{s.section}</div>
              <div style={styles.avatar}>
                {s.portfolio?.profilePhoto ? (
                  <img src={s.portfolio.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                ) : (
                  s.fullName?.[0] || '👤'
                )}
              </div>
              <div style={styles.cardName}>{s.fullName}</div>
              <span style={styles.cardId}>{s.studentId} • {s.department}</span>
              
              <div style={styles.metaGrid}>
                <div><span style={styles.metaItem}>CGPA:</span><span style={{...styles.metaVal, color: '#16a34a'}}>{s.cgpa || 'N/A'}</span></div>
                <div><span style={styles.metaItem}>Year:</span><span style={styles.metaVal}>{s.currentYear}</span></div>
                <div><span style={styles.metaItem}>Projects:</span><span style={styles.metaVal}>{s.portfolio?.projects?.length || 0}</span></div>
                <div><span style={styles.metaItem}>Status:</span><span style={styles.metaVal}>{s.portfolio?.isPublic ? '🌐' : '🔒'}</span></div>
              </div>

              <button style={styles.btnPrimary} onClick={() => navigate(`/student-details/${s.studentId || s._id}`)}>
                View Professional Profile
              </button>
            </div>
          ))}
          {filteredStudents.length === 0 && <div style={{gridColumn: 'span 3', textAlign: 'center', opacity: 0.5, padding: '60px'}}>No records found matching your query.</div>}
        </div>
      )}

      <style>{`
        @media (max-width: 850px) {
          .faculty-page-container { margin-left: 0 !important; padding: 20px !important; }
          .faculty-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .summary-grid { grid-template-columns: 1fr !important; }
          .control-bar { flex-direction: column; gap: 10px; }
          .student-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default FacultyDashboard;

