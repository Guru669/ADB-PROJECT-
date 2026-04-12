import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config/api';

function AllStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [isLoading, setIsLoading] = useState(true);

  const sections = ['A', 'B', 'C', 'D', 'E'];
  const departments = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Chemical Engineering', 'Biotechnology'
  ];

  useEffect(() => {
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/students`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                // Fallback to local
                const local = JSON.parse(localStorage.getItem('allStudents') || '[]');
                setStudents(local);
            }
        } catch (err) {
            const local = JSON.parse(localStorage.getItem('allStudents') || '[]');
            setStudents(local);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsLoaded(true), 100);
        }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter(s => {
      if (filterDept && s.department !== filterDept) return false;
      if (filterSection && s.section !== filterSection) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (s.fullName || '').toLowerCase();
        const sid = (s.studentId || '').toLowerCase();
        if (!name.includes(q) && !sid.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return (a.fullName || '').localeCompare(b.fullName || '');
      if (sortBy === 'name-desc') return (b.fullName || '').localeCompare(a.fullName || '');
      if (sortBy === 'id-asc') return (a.studentId || '').localeCompare(b.studentId || '');
      if (sortBy === 'id-desc') return (b.studentId || '').localeCompare(a.studentId || '');
      return 0;
    });

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
    header: { 
        background: 'linear-gradient(135deg, #0b4f00 0%, #0b3d00 100%)', 
        color: '#fff', 
        padding: '32px 5%', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
    title: { fontSize: '32px', fontWeight: '800', margin: 0, color: '#ffe600' },
    btnBack: { 
        padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', 
        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', cursor: 'pointer', 
        fontWeight: '700', fontSize: '14px', backdropFilter: 'blur(10px)', transition: 'all 0.2s'
    },
    main: { padding: '40px 5%', maxWidth: '1400px', margin: '0 auto' },
    filterBar: { 
        backgroundColor: '#fff', padding: '24px', borderRadius: '24px', marginBottom: '40px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
        display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center'
    },
    input: { 
        flex: 2, padding: '14px 20px', border: '1px solid #e2e8f0', borderRadius: '14px', 
        fontSize: '15px', backgroundColor: '#f8fafc' 
    },
    select: { 
        flex: 1, padding: '14px', border: '1px solid #e2e8f0', borderRadius: '14px', 
        fontSize: '14px', backgroundColor: '#f8fafc', cursor: 'pointer' 
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' },
    card: { 
        backgroundColor: '#fff', padding: '30px', borderRadius: '28px', 
        border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
        position: 'relative'
    },
    avatar: { 
        width: '72px', height: '72px', borderRadius: '20px', 
        background: 'linear-gradient(135deg, #0b4f00 0%, #16a34a 100%)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(11, 79, 0, 0.2)',
        overflow: 'hidden'
    },
    studentName: { fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' },
    studentSub: { fontSize: '14px', color: '#64748b', marginBottom: '20px', display: 'flex', gap: '8px' },
    statsRow: { 
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', 
        backgroundColor: '#f8fafc', padding: '16px', borderRadius: '18px' 
    },
    statBox: { textAlign: 'left' },
    statLabel: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' },
    statValue: { fontSize: '15px', color: '#1e293b', fontWeight: '700' },
    badge: { 
        position: 'absolute', top: '30px', right: '30px', padding: '6px 12px', 
        backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '10px', 
        fontSize: '11px', fontWeight: '800' 
    }
  };

  const responsiveStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    
    .student-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        border-color: #0b4f00 !important;
    }

    .btn-back:hover {
        background: #ffe600 !important;
        color: #0b4f00 !important;
        transform: translateY(-2px);
    }

    @media (max-width: 850px) {
        .filter-bar { flex-direction: column !important; }
        .filter-bar > * { width: 100% !important; }
        .student-grid { grid-template-columns: 1fr !important; }
        .header-top { flex-direction: column; text-align: center; }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      
      <header style={styles.header}>
        <div style={styles.headerTop} className="header-top">
          <h1 style={styles.title}>Student Registry</h1>
          <button
            style={styles.btnBack}
            className="btn-back"
            onClick={() => {
                const isStaff = localStorage.getItem('staff');
                const isAdmin = localStorage.getItem('admin');
                if (isAdmin) navigate('/admin');
                else if (isStaff) navigate('/staff-dashboard');
                else navigate('/dashboard');
            }}
          >
            ← System Dashboard
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.filterBar} className="filter-bar">
          <input 
            style={styles.input} 
            placeholder="Search by name or student ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select style={styles.select} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={styles.select} value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
          <select style={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">A-Z Name</option>
            <option value="name-desc">Z-A Name</option>
            <option value="id-asc">ID (Low-High)</option>
            <option value="id-desc">ID (High-Low)</option>
          </select>
        </div>

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>⌛</div>
                <h3>Loading Digital Registry...</h3>
            </div>
        ) : (
            <div style={styles.grid} className="student-grid">
                {filteredStudents.map(s => (
                    <div 
                        key={s._id} 
                        style={styles.card} 
                        className="student-card"
                        onClick={() => navigate(`/student-details/${s.studentId}`)}
                    >
                        <div style={styles.badge}>Section {s.section || 'N/A'}</div>
                        <div style={styles.avatar}>
                            {s.portfolio?.profilePhoto ? (
                                <img src={s.portfolio.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                s.fullName?.[0] || 'S'
                            )}
                        </div>
                        <div style={styles.studentName}>{s.fullName}</div>
                        <div style={styles.studentSub}>
                            <span>{s.studentId}</span>
                            <span>•</span>
                            <span>{s.department}</span>
                        </div>

                        <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                                <div style={styles.statLabel}>Current Year</div>
                                <div style={styles.statValue}>{s.currentYear || '1st'} Year</div>
                            </div>
                            <div style={styles.statBox}>
                                <div style={styles.statLabel}>Academic CGPA</div>
                                <div style={{...styles.statValue, color: '#16a34a'}}>{s.cgpa || '0.00'}</div>
                            </div>
                            <div style={styles.statBox}>
                                <div style={styles.statLabel}>Projects</div>
                                <div style={styles.statValue}>{s.portfolio?.projects?.length || 0} Built</div>
                            </div>
                            <div style={styles.statBox}>
                                <div style={styles.statLabel}>Skills</div>
                                <div style={styles.statValue}>{s.portfolio?.skills?.length || 0} Listed</div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredStudents.length === 0 && !isLoading && (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
                        <h3>No registry matches found</h3>
                        <p>Try adjusting your search filters above</p>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}

export default AllStudents;
