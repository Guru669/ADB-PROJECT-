import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/FacultySidebar';

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
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/students', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error('Unable to fetch students from server');
        }

        const liveStudents = await response.json();
        localStorage.setItem('allStudents', JSON.stringify(liveStudents));
        setStudents(liveStudents);
        setFilteredStudents(liveStudents);
      } catch (error) {
        const cachedStudents = JSON.parse(localStorage.getItem('allStudents') || '[]');
        setStudents(cachedStudents);
        setFilteredStudents(cachedStudents);
        if (cachedStudents.length === 0) {
          setLoadError('Could not load students. Please ensure the backend server is running.');
        }
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [navigate]);

  useEffect(() => {
    let list = students.slice();
    if (filterDept) list = list.filter(s => s.department === filterDept);
    if (filterSection) list = list.filter(s => s.section === filterSection);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => (s.fullName || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q));
    }
    // Keep student list in stable ascending order (studentId, then name)
    list.sort((a, b) => {
      const idA = String(a.studentId || '').trim();
      const idB = String(b.studentId || '').trim();
      if (idA && idB && idA !== idB) return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
      const nameA = String(a.fullName || a.name || '').trim();
      const nameB = String(b.fullName || b.name || '').trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
    setFilteredStudents(list);
  }, [students, filterDept, filterSection, searchTerm]);

  const handleViewDetails = (student) => {
    const studentIdentifier = student.studentId || student._id || student.id;
    if (studentIdentifier) {
      navigate(`/student-details/${studentIdentifier}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff');
    localStorage.removeItem('staffProfile');
    localStorage.removeItem('facultyTheme');
    navigate('/');
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('facultyTheme', next ? 'dark' : 'light');
  };

  const uniqueDepartments = Array.from(
    new Set(students.map((s) => s.department).filter(Boolean))
  ).sort();
  const uniqueSections = Array.from(
    new Set(students.map((s) => s.section).filter(Boolean))
  ).sort();
  const totalProjects = students.reduce((sum, s) => sum + (Array.isArray(s.portfolio?.projects) ? s.portfolio.projects.length : 0), 0);
  const totalCertificates = students.reduce((sum, s) => sum + (Array.isArray(s.portfolio?.certificates) ? s.portfolio.certificates.length : 0), 0);

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      marginLeft: '260px'
    },
    wrapper: {
      width: 'min(1200px, 96vw)',
      backgroundColor: '#fff',
      borderRadius: '30px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      minHeight: 'calc(100vh - 48px)',
      position: 'relative'
    },
    watermark: {
      position: 'absolute',
      top: '52%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '420px',
      opacity: 0.06,
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none'
    },
    mainContent: {
      padding: '32px',
      backgroundColor: '#ffffff',
      position: 'relative',
      zIndex: 1
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
    title: {
      fontSize: '34px',
      fontWeight: '800',
      color: '#1a3625',
      margin: 0
    },
    subtitle: {
      color: '#64748b',
      fontSize: '16px',
      margin: '4px 0 0 0'
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
    headerActions: {
      display: 'flex',
      gap: '10px'
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
    filterSection: {
      background: '#ffffff',
      padding: '14px',
      borderRadius: '12px',
      margin: '0 0 16px 0',
      border: '1px solid #e5e7eb'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    summaryCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '12px 14px',
      boxShadow: '0 6px 14px rgba(15,23,42,0.06)'
    },
    summaryLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '700',
      marginBottom: '6px'
    },
    summaryValue: {
      fontSize: '22px',
      color: '#173828',
      fontWeight: '800'
    },
    filterTitle: {
      display: 'none'
    },
    filterRow: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'nowrap'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      boxSizing: 'border-box',
      outline: 'none',
      backgroundColor: '#eef2ff',
      flex: 1,
      minWidth: '260px',
      color: '#111827'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      backgroundColor: '#eef2ff',
      minWidth: '180px',
      color: '#111827'
    },
    button: {
      padding: '15px',
      background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '18px'
    },
    tableContainer: {
      background: 'transparent',
      borderRadius: '16px',
      overflow: 'hidden',
      border: 'none',
      margin: '0'
    },
    studentCardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '16px'
    },
    studentCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      padding: '16px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
    },
    studentCardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '10px'
    },
    avatarWrap: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '15px',
      flexShrink: 0
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    studentCardTitleBlock: {
      display: 'flex',
      flexDirection: 'column'
    },
    studentCardName: {
      margin: 0,
      color: '#1a3625',
      fontWeight: '700',
      fontSize: '17px',
      lineHeight: 1.05,
      textTransform: 'none'
    },
    studentCardId: {
      color: '#64748b',
      fontSize: '12px',
      fontWeight: '500'
    },
    studentCardMeta: {
      color: '#334155',
      fontSize: '13px',
      marginBottom: '6px'
    },
    studentCardActions: {
      display: 'flex',
      marginTop: '12px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '16px 20px',
      background: '#f8fafc',
      color: '#374151',
      fontWeight: '600',
      fontSize: '14px',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '16px 20px',
      borderBottom: '1px solid #f1f5f9',
      color: '#374151',
      fontSize: '14px'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    successBtn: {
      background: '#ffe600',
      color: '#0b4f00',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(255,230,0,0.45)'
    },
    contentInner: {
      padding: '0 0 10px 0'
    },
    detailsModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    detailsModalContent: {
      background: '#ffffff',
      padding: '30px',
      borderRadius: '15px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      boxShadow: '0 20px 60px rgba(0,0,0,0.06)'
    },
    detailsModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '15px'
    },
    detailsModalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1a3625',
      margin: 0
    },
    detailsModalClose: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    detailsSection: {
      marginBottom: '20px'
    },
    detailsProfileWrap: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '18px'
    },
    detailsProfilePhoto: {
      width: '84px',
      height: '84px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    },
    detailsProfileFallback: {
      width: '84px',
      height: '84px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '30px',
      background: '#f3f4f6',
      border: '2px solid #e5e7eb'
    },
    detailsSectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1a3625',
      marginBottom: '10px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '5px'
    },
    detailsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    detailsLabel: {
      fontWeight: '600',
      color: '#6b7280',
      fontSize: '14px'
    },
    detailsValue: {
      fontWeight: '500',
      color: '#374151',
      fontSize: '14px'
    }
  };

  if (!staff) return null;

  const responsiveStyles = `
    @media (max-width: 1200px) {
      .student-cards-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }
    @media (max-width: 760px) {
      .dashboard-page {
        margin-left: 0 !important;
      }
      .dashboard-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      .dashboard-filters {
        flex-wrap: wrap !important;
      }
      .student-cards-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
      }
    }
  `;

  return (
    <div style={styles.page} className="dashboard-page">
      <style>{responsiveStyles}</style>
      <FacultySidebar darkMode={darkMode} onLogout={handleLogout} />
      <div style={styles.wrapper}>
        <img src="/siet.png" alt="" aria-hidden="true" style={styles.watermark} />
        <div style={styles.mainContent}>
          <header style={styles.header} className="dashboard-header">
            <div style={styles.headerBrand}>
              <div style={styles.headerLogoWrap}>
                <img src="/siet.png" alt="SIET Logo" style={styles.headerLogo} />
              </div>
              <div>
                <h1 style={styles.title}>Student Dashboard</h1>
                <p style={styles.subtitle}>Welcome back, {staff?.fullName?.split(' ')[0]?.toLowerCase() || 'staff'}</p>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.topActionPrimaryBtn} onClick={toggleDarkMode}>
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button style={styles.topActionBtn} onClick={() => navigate('/faculty-analytics')}>Analytics</button>
              <button style={styles.topActionBtn} onClick={() => navigate('/faculty-settings')}>Settings</button>
              <button style={styles.topActionBtn} onClick={() => navigate('/faculty-reports')}>Reports</button>
            </div>
          </header>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Students</div>
              <div style={styles.summaryValue}>{students.length}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Projects</div>
              <div style={styles.summaryValue}>{totalProjects}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Certificates</div>
              <div style={styles.summaryValue}>{totalCertificates}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Filtered Students</div>
              <div style={styles.summaryValue}>{filteredStudents.length}</div>
            </div>
          </div>

          <div style={styles.filterSection}>
            <h2 style={styles.filterTitle}>Filter Students</h2>
            <div style={styles.filterRow} className="dashboard-filters">
              <input style={styles.input} placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <select style={styles.select} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select style={styles.select} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                <option value="">All Sections</option>
                {uniqueSections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.tableContainer}>
            {isLoadingStudents ? (
              <div style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                <div style={{color: '#6b7280', fontSize: '16px'}}>Loading students...</div>
              </div>
            ) : loadError ? (
              <div style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                <div style={{color: '#dc2626', fontSize: '16px'}}>{loadError}</div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                <div style={{color: '#6b7280', fontSize: '16px'}}>
                  No students found matching your criteria
                </div>
              </div>
            ) : (
              <div style={styles.studentCardsGrid} className="student-cards-grid">
                {filteredStudents.map((s) => {
                  const studentName = s.fullName || s.name || 'Unnamed Student';
                  const studentIdentifier = s.studentId || s._id || s.id || 'N/A';
                  const studentSkills = Array.isArray(s.portfolio?.skills)
                    ? s.portfolio.skills
                        .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
                        .filter(Boolean)
                    : [];
                  const projectCount = Array.isArray(s.portfolio?.projects) ? s.portfolio.projects.length : 0;
                  const certificateCount = Array.isArray(s.portfolio?.certificates) ? s.portfolio.certificates.length : 0;
                  const portfolioVisibility = s.portfolio?.isPublic ? 'Public' : 'Private';
                  const cgpaValue = s.cgpa || 'N/A';
                  const yearValue = s.currentYear || 'N/A';
                  const studentPhoto = s.profilePhoto || s.profileImage || s.photo || s.avatar || s.portfolio?.profilePhoto || '';
                  return (
                    <div key={s._id || s.id || s.studentId} style={styles.studentCard}>
                      <div style={styles.studentCardHeader}>
                        <div style={styles.avatarWrap}>
                          {studentPhoto ? (
                            <img src={studentPhoto} alt={`${studentName} profile`} style={styles.avatarImage} />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <div style={styles.studentCardTitleBlock}>
                          <h3 style={styles.studentCardName}>{studentName}</h3>
                          <span style={styles.studentCardId}>{studentIdentifier} | {s.department || 'N/A'}</span>
                        </div>
                      </div>
                      <div style={styles.contentInner}>
                      <div style={styles.studentCardMeta}>Section: {s.section || 'N/A'}</div>
                      <div style={styles.studentCardMeta}>
                        Skills: {studentSkills.length > 0 ? studentSkills.slice(0, 3).join(', ') : 'Not provided'}
                      </div>
                      <div style={styles.studentCardMeta}>Projects: {projectCount} | Certificates: {certificateCount}</div>
                      <div style={styles.studentCardMeta}>Portfolio: {portfolioVisibility}</div>
                      <div style={styles.studentCardMeta}>CGPA: {cgpaValue} | Year: {yearValue}</div>
                      </div>
                      <div style={styles.studentCardActions}>
                        <button style={{...styles.successBtn}} onClick={() => handleViewDetails(s)}>View Details</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default FacultyDashboard;
