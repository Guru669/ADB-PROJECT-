import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function AllStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');

  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    
    // Load registered students from localStorage
    const realStudents = JSON.parse(localStorage.getItem('allStudents') || '[]');
    setStudents(realStudents);
    setTimeout(() => setIsLoaded(true), 100);
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
      if (sortBy === 'name-asc') {
        return a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'name-desc') {
        return b.fullName.localeCompare(a.fullName);
      } else if (sortBy === 'id-asc') {
        return a.studentId.localeCompare(b.studentId);
      } else if (sortBy === 'id-desc') {
        return b.studentId.localeCompare(a.studentId);
      }
      return 0;
    });

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f5f7fa', fontFamily: "'Inter', Arial, sans-serif" },
    header: { backgroundColor: '#0b4f00', color: '#ffe600', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', gap: '20px' },
    title: { fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 'bold' },
    navButtons: { display: 'flex', gap: '10px' },
    btnBack: { padding: '8px 16px', backgroundColor: '#ffe600', color: '#0b4f00', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
    filters: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    filterRow: { display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', flex: 1, minWidth: '200px' },
    select: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', flex: 1, minWidth: '200px' },
    clearBtn: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: '1', minWidth: '150px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', transition: 'all 0.3s', cursor: 'pointer', border: '2px solid transparent' },
    cardHover: { borderColor: '#0b4f00', transform: 'translateY(-5px)' },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '32px', fontWeight: 'bold', color: '#0b4f00' },
    name: { fontSize: '18px', fontWeight: 'bold', color: '#0b4f00', marginBottom: '5px' },
    email: { color: '#666', fontSize: '14px', marginBottom: '10px' },
    info: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '5px' },
    badge: { background: '#0b4f00', color: '#ffe600', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' },
    noResults: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' }
  };

  const responsiveStyles = `
    @media (max-width: 600px) {
      .header-content {
        flex-direction: column !important;
        text-align: center !important;
      }
      .nav-buttons {
        width: 100% !important;
      }
      .nav-buttons button {
        width: 100% !important;
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      <div style={styles.header}>
        <div style={styles.headerContent} className="header-content">
          <h1 style={styles.title}>All Students Portfolio</h1>
          <div style={styles.navButtons} className="nav-buttons">
            <button
              style={styles.btnBack}
              onClick={() => {
                const isStaff = localStorage.getItem('staff');
                navigate(isStaff ? '/staff-dashboard' : '/dashboard');
              }}
            >
              ← My Dashboard
            </button>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.filters}>
          <SearchBar showDepartmentFilter={true} showSkillsFilter={false} onSearch={(filters) => {
            setSearchQuery(filters.query || '');
            setFilterDept(filters.department || '');
          }} />
          
          <div style={styles.filterRow}>
            <select 
              value={filterSection} 
              onChange={e => setFilterSection(e.target.value)} 
              style={styles.select}
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              style={styles.select}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="id-asc">Student ID (A-Z)</option>
              <option value="id-desc">Student ID (Z-A)</option>
            </select>

            <button 
              style={styles.clearBtn} 
              onClick={() => { 
                setFilterDept(''); 
                setFilterSection(''); 
                setSearchQuery(''); 
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {!isLoaded ? (
          <div style={styles.noResults}>Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div style={styles.noResults}>No students found matching your criteria</div>
        ) : (
          <div style={styles.grid}>
            {filteredStudents.map(student => (
              <div
                key={student.id || student.studentId}
                style={styles.card}
                onClick={() => navigate(`/portfolio/${student.studentId}`)}
              >
                <div style={styles.avatar}>
                  {student.fullName?.charAt(0).toUpperCase() || '👤'}
                </div>
                <div style={styles.name}>{student.fullName}</div>
                <div style={styles.email}>{student.email}</div>
                <div style={styles.info}>
                  <span>ID: {student.studentId}</span>
                  <span style={styles.badge}>{student.section}</span>
                </div>
                <div style={styles.info}>
                  <span>{student.department}</span>
                  <span>{student.portfolio?.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllStudents;
