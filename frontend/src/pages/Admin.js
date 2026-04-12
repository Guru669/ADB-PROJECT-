import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { API_URL } from '../config/api';

function Admin() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [students, setStudents] = useState([]);
    const [expandedSection, setExpandedSection] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        totalPortfolios: 0,
        publicPortfolios: 0,
        privatePortfolios: 0,
        avgSkillsPerStudent: 0,
        totalAchievements: 0,
        sections: {}
    });

    const fetchAllData = async () => {
        try {
            // Fetch students from backend
            const response = await fetch(`${API_URL}/api/auth/students`);
            if (response.ok) {
                const fetchedStudents = await response.json();
                const sortedStudents = fetchedStudents.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
                setStudents(sortedStudents);
                
                // Ultra-slim sync for localStorage (avoid QuotaExceededError)
                try {
                    const ultraSlimStudents = fetchedStudents.map(s => ({
                        fullName: s.fullName,
                        studentId: s.studentId,
                        department: s.department,
                        section: s.section,
                        email: s.email,
                        portfolio: { isPublic: s.portfolio?.isPublic }
                    }));
                    localStorage.removeItem('allStudents');
                    localStorage.setItem('allStudents', JSON.stringify(ultraSlimStudents));
                } catch (e) {
                    console.warn("Storage quota exceeded. Caching failed.");
                }

                // Calculate stats
                const activePortfolios = fetchedStudents.filter(s => s.portfolio && (s.portfolio.bio || s.portfolio.skills?.length > 0)).length;
                const publicPortfolios = fetchedStudents.filter(s => s.portfolio?.isPublic).length;
                const privatePortfolios = fetchedStudents.filter(s => s.portfolio && !s.portfolio.isPublic).length;
                const totalSkills = fetchedStudents.reduce((sum, s) => sum + (s.portfolio?.skills?.length || 0), 0);
                const totalAchievements = fetchedStudents.reduce((sum, s) => sum + (s.portfolio?.achievements?.length || 0), 0);

                const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
                const staffCount = new Set(logs.filter(log => log.type === 'staff').map(log => log.email)).size;

                setStats({
                    totalStudents: fetchedStudents.length,
                    totalStaff: staffCount,
                    totalPortfolios: activePortfolios,
                    publicPortfolios: publicPortfolios,
                    privatePortfolios: privatePortfolios,
                    avgSkillsPerStudent: fetchedStudents.length > 0 ? parseFloat((totalSkills / fetchedStudents.length).toFixed(1)) : 0,
                    totalAchievements: totalAchievements,
                    sections: fetchedStudents.reduce((acc, s) => {
                        const sec = s.section || 'N/A';
                        acc[sec] = (acc[sec] || 0) + 1;
                        return acc;
                    }, {})
                });
            }
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    };

    useEffect(() => {
        const adminUser = localStorage.getItem('admin');
        if (!adminUser) {
            navigate('/login');
            return;
        }
        setAdmin(JSON.parse(adminUser));


        fetchAllData();
    }, [navigate]);

    const deleteStudent = async (email) => {
        if (window.confirm(`Are you sure you want to delete the student with email ${email}? This action cannot be undone.`)) {
            try {
                const response = await fetch(`${API_URL}/api/auth/students/${email}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await fetchAllData();
                    alert('Student deleted successfully');
                } else {
                    alert('Failed to delete student');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error deleting student');
            }
        }
    };

    const deleteAllStudents = async () => {
        if (!window.confirm('Are you sure you want to delete all students? This action cannot be undone.')) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/students`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("All students have been deleted from the database.");
                fetchAllData();
            } else {
                alert("Failed to delete all students.");
            }
        } catch (err) {
            console.error("Delete all error:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin');
        navigate('/');
    };

    const handleBackup = () => {
        const data = {
            allStudents: students,
            loginLogs: JSON.parse(localStorage.getItem('loginLogs') || '[]')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SIET_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                alert("Restore from file currently only updates legacy localStorage. Please use registration for database updates.");
                // Note: Restoring to database would require a bulk-insert API
            };
            reader.readAsText(file);
        }
    };

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#f1f2f6', fontFamily: "'Inter', sans-serif" },
        header: { backgroundColor: '#1e5631', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' },
        logoutBtn: { padding: '10px 25px', backgroundColor: '#ffc107', color: '#1e5631', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
        main: { padding: 'min(40px, 4vw)', maxWidth: '1200px', margin: '0 auto' },
        statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },
        statCard: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' },
        statValue: { fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 'bold', color: '#1e5631', display: 'block' },
        statLabel: { color: '#666', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' },
        tableContainer: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f2f6', color: '#747d8c' },
        td: { padding: '12px', borderBottom: '1px solid #f1f2f6' }
    };

    const responsiveStyles = `
        @media (max-width: 768px) {
            .admin-header {
                flex-direction: column !important;
                text-align: center !important;
                gap: 20px !important;
            }
            .admin-header-right {
                flex-direction: column !important;
                width: 100% !important;
            }
            .admin-header-right button, .admin-header-right label {
                width: 100% !important;
                text-align: center !important;
            }
            .admin-table-container {
                overflow-x: auto !important;
            }
        }
    `;

    if (!admin) return null;

    return (
        <div style={styles.container}>
            <style>{responsiveStyles}</style>
            <div style={styles.header} className="admin-header">
                <h1 style={{ fontSize: 'clamp(20px, 5vw, 32px)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src="/siet.png" alt="SIET" style={{ height: '50px', backgroundColor: '#fff', borderRadius: '8px', padding: '4px' }} />
                    Admin Control Panel
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="admin-header-right">
                    <button style={{ ...styles.logoutBtn, backgroundColor: '#2ed573', color: 'white' }} onClick={handleBackup}>📥 Backup Data</button>
                    <label style={{ ...styles.logoutBtn, backgroundColor: '#747d8c', color: 'white', cursor: 'pointer' }}>
                        📤 Restore
                        <input type="file" style={{ display: 'none' }} onChange={handleRestore} accept=".json" />
                    </label>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.main}>
                <AnalyticsDashboard />
                
                <div className="mobile-grid-2" style={styles.statsRow}>
                    <div className="mobile-card" style={styles.statCard}>
                        <span style={styles.statValue}>{stats.totalStudents}</span>
                        <span style={styles.statLabel}>Total Students</span>
                    </div>
                    <div className="mobile-card" style={styles.statCard}>
                        <span style={styles.statValue}>{stats.totalStaff}</span>
                        <span style={styles.statLabel}>Total Staff</span>
                    </div>
                    <div className="mobile-card" style={styles.statCard}>
                        <span style={styles.statValue}>{stats.totalPortfolios}</span>
                        <span style={styles.statLabel}>Active Portfolios</span>
                    </div>
                    <div className="mobile-card mobile-grid-1" style={styles.statCard}>
                        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%', gap: '10px', minHeight: '50px' }}>
                            {Object.entries(stats.sections).sort().map(([sec, count]) => (
                                <div key={sec}>
                                    <span style={{ ...styles.statValue, fontSize: '24px' }}>{count}</span>
                                    <span style={styles.statLabel}>Sec {sec}</span>
                                </div>
                            ))}
                        </div>
                        <span style={{ ...styles.statLabel, display: 'block', marginTop: '10px', color: '#1e5631' }}>Section-wise Distribution</span>
                    </div>
                </div>

                <div className="mobile-super-card admin-table-container" style={styles.tableContainer}>
                    <div className="mobile-stack mobile-tight-spacing" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h2 className="mobile-tiny-header">Student Management (Database)</h2>
                        <button className="mobile-tiny-btn"
                            style={{ ...styles.logoutBtn, backgroundColor: '#ff4757', color: 'white' }}
                            onClick={deleteAllStudents}
                        >
                            ?? Delete All from DB
                        </button>
                    </div>
                    {['A', 'B', 'C', 'D'].map(sectionKey => {
                        const sectionStudents = students.filter(s => (s.section || 'A') === sectionKey);
                        const isExpanded = expandedSection === sectionKey;

                        return (
                            <div 
                                key={sectionKey} 
                                style={{ 
                                    marginBottom: '20px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '12px', 
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                                    className="mobile-compact-card"
                                    style={{
                                        padding: '20px',
                                        backgroundColor: isExpanded ? '#1e5631' : '#fff',
                                        color: isExpanded ? '#fff' : '#1e5631',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        fontWeight: 'bold',
                                        fontSize: '18px'
                                    }}
                                >
                                    <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{
                                            backgroundColor: isExpanded ? '#ffc107' : '#1e5631',
                                            color: isExpanded ? '#1e5631' : '#fff',
                                            width: '35px',
                                            height: '35px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {sectionKey}
                                        </span>
                                        <span className="mobile-compact-text">Section {sectionKey} Management</span>
                                    </div>
                                    <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span className="mobile-compact-text" style={{ fontSize: '14px', opacity: 0.8 }}>{sectionStudents.length} Students</span>
                                        <span>{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mobile-card" style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fcfcfc' }}>
                                        <table className="mobile-table" style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th className="mobile-compact-text" style={styles.th}>Full Name</th>
                                                    <th className="mobile-compact-text" style={styles.th}>Email</th>
                                                    <th className="mobile-compact-text" style={styles.th}>Department</th>
                                                    <th className="mobile-compact-text" style={styles.th}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sectionStudents.length > 0 ? (
                                                    sectionStudents.map((s, idx) => (
                                                        <tr key={idx}>
                                                            <td className="mobile-compact-text mobile-name-wrap" style={styles.td}>{s.fullName}</td>
                                                            <td className="mobile-compact-text" style={styles.td}>{s.email}</td>
                                                            <td className="mobile-compact-text" style={styles.td}>{s.department}</td>
                                                            <td style={styles.td}>
                                                                <button
                                                                    className="mobile-tiny-btn"
                                                                    style={{ ...styles.logoutBtn, backgroundColor: '#ff4757', color: 'white', padding: '5px 12px' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteStudent(s.email);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No students found in Section {sectionKey}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Admin;
