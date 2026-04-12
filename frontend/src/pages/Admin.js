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

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        if (!adminData) {
            navigate('/');
            return;
        }
        setAdmin(JSON.parse(adminData));
        fetchAllData();
    }, [navigate]);

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
                        const sec = s.section || 'A';
                        acc[sec] = (acc[sec] || 0) + 1;
                        return acc;
                    }, {})
                });
            }
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    };

    const deleteStudent = async (email) => {
        if (!window.confirm("Are you sure you want to delete this student permanently from the database?")) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/students/${email}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("Student deleted successfully");
                fetchAllData();
            } else {
                throw new Error("Deletion failed");
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const deleteAllStudents = async () => {
        if (!window.confirm("CRITICAL ACTION: Are you absolutely sure you want to delete ALL student records from the database? This cannot be undone.")) return;
        const confirmCode = window.prompt("Type 'DELETE ALL' to confirm:");
        if (confirmCode !== "DELETE ALL") return;

        try {
            const response = await fetch(`${API_URL}/api/auth/students`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("Database purged successfully");
                fetchAllData();
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin');
        navigate('/');
    };

    const handleBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `student_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const restoredData = JSON.parse(event.target.result);
                console.log("Restored data length:", restoredData.length);
                alert(`Backup containing ${restoredData.length} students loaded. (Simulated)`);
            };
            reader.readAsText(file);
        }
    };

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
        header: { 
            backgroundColor: '#0b4f00', 
            color: 'white', 
            padding: '24px 5%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
        },
        btn: { padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' },
        main: { padding: '40px 5%', maxWidth: '1400px', margin: '0 auto' },
        tableCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { textAlign: 'left', padding: '18px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '18px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontSize: '15px' },
        tag: { padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }
    };

    const responsiveStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .admin-row:hover {
            background-color: #f8fafc;
        }

        @media (max-width: 850px) {
            .admin-header { flex-direction: column; gap: 20px; text-align: center; }
            .admin-actions { flex-direction: column; width: 100%; }
            .admin-actions > * { width: 100% !important; text-align: center; }
            .admin-table-container { overflow-x: auto; }
        }
    `;

    if (!admin) return null;

    return (
        <div style={styles.container}>
            <style>{responsiveStyles}</style>
            <div style={styles.header} className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src="/siet.png" alt="SIET" style={{ height: '50px', backgroundColor: '#fff', borderRadius: '12px', padding: '6px' }} />
                    <div>
                        <h1 style={{ fontSize: '24px', margin: 0 }}>System Administration</h1>
                        <span style={{ opacity: 0.7, fontSize: '14px' }}>Global Portfolio Oversight</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }} className="admin-actions">
                    <button style={{ ...styles.btn, backgroundColor: '#16a34a', color: 'white' }} onClick={handleBackup}>Backup Database</button>
                    <button style={{ ...styles.btn, backgroundColor: '#dc2626', color: 'white' }} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.main}>
                <AnalyticsDashboard />
                
                <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', marginTop: '40px' }}>Database Maintenance</h2>

                {['A', 'B', 'C', 'D'].map(sectionKey => {
                    const sectionStudents = students.filter(s => (s.section || 'A') === sectionKey);
                    const isExpanded = expandedSection === sectionKey;

                    return (
                        <div key={sectionKey} style={{ marginBottom: '16px' }}>
                            <div
                                onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                                style={{
                                    padding: '20px 24px',
                                    background: isExpanded ? '#0b4f00' : 'white',
                                    color: isExpanded ? 'white' : '#0b4f00',
                                    borderRadius: isExpanded ? '20px 20px 0 0' : '20px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                    border: `1px solid ${isExpanded ? '#0b4f00' : '#e2e8f0'}`,
                                    fontWeight: '800'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ 
                                        width: '32px', height: '32px', borderRadius: '10px', 
                                        background: isExpanded ? '#ffe600' : '#0b4f00',
                                        color: isExpanded ? '#0b4f00' : '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {sectionKey}
                                    </span>
                                    Section {sectionKey} Registry
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ fontSize: '14px', opacity: 0.8 }}>{sectionStudents.length} Students</span>
                                    <span>{isExpanded ? '▼' : '▶'}</span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div style={{ ...styles.tableCard, borderRadius: '0 0 24px 24px', borderTop: 'none' }}>
                                    <div className="admin-table-container">
                                        <table style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Full Name</th>
                                                    <th style={styles.th}>Identification</th>
                                                    <th style={styles.th}>Department</th>
                                                    <th style={styles.th}>Portfolio Access</th>
                                                    <th style={styles.th}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sectionStudents.map((s, idx) => (
                                                    <tr key={idx} className="admin-row">
                                                        <td style={styles.td}>
                                                            <div style={{ fontWeight: '700' }}>{s.fullName}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</div>
                                                        </td>
                                                        <td style={styles.td}>{s.studentId}</td>
                                                        <td style={styles.td}>{s.department}</td>
                                                        <td style={styles.td}>
                                                            <span style={{ 
                                                                ...styles.tag, 
                                                                backgroundColor: s.portfolio?.isPublic ? '#f0fdf4' : '#f1f5f9',
                                                                color: s.portfolio?.isPublic ? '#16a34a' : '#64748b'
                                                            }}>
                                                                {s.portfolio?.isPublic ? 'Public' : 'Protected'}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button 
                                                                    style={{ ...styles.btn, padding: '6px 14px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                                                                    onClick={() => navigate(`/student-details/${s.studentId}`)}
                                                                >
                                                                    Modify
                                                                </button>
                                                                <button 
                                                                    style={{ ...styles.btn, padding: '6px 14px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                                                                    onClick={(e) => { e.stopPropagation(); deleteStudent(s.email); }}
                                                                >
                                                                    Purge
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Admin;
