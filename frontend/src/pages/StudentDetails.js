import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function StudentDetails() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [darkMode] = useState(false); // Initializing to false for professional light theme

    useEffect(() => {
        const fetchStudentData = async () => {
            // First try localStorage
            const allStudentsLocal = JSON.parse(localStorage.getItem('allStudents') || '[]');
            const foundLocal = allStudentsLocal.find(s => s.studentId === studentId);

            if (foundLocal) {
                setStudent(foundLocal);
            }

            // Always attempt to fetch from backend to ensure data is up to date
            try {
                const response = await fetch('http://localhost:5000/api/auth/students');
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('allStudents', JSON.stringify(data));
                    const foundBackend = data.find(s => s.studentId === studentId);
                    if (foundBackend) {
                        setStudent(foundBackend);
                    }
                }
            } catch (err) {
                console.error("Error fetching student details:", err);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const styles = {
        container: {
            minHeight: '100vh',
            background: darkMode ? '#121212' : '#f0f4f3',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            padding: '60px 20px',
            position: 'relative',
            overflow: 'hidden'
        },
        bgDecoration1: {
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 86, 49, 0.05) 0%, transparent 70%)',
            top: '-200px', right: '-100px', animation: 'float 15s infinite alternate',
            zIndex: 0
        },
        bgDecoration2: {
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 86, 49, 0.03) 0%, transparent 70%)',
            bottom: '-100px', left: '-100px', animation: 'float 12s infinite alternate-reverse',
            zIndex: 0
        },
        backBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '40px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        },
        card: {
            background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            backdropFilter: 'blur(30px)',
            padding: 'min(64px, 8vw)',
            borderRadius: '32px',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.08)',
            maxWidth: '1100px',
            margin: '0 auto',
            border: '1px solid rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 10
        },
        header: {
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            paddingBottom: '32px',
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        title: {
            fontSize: '32px',
            fontWeight: '800',
            color: '#1a202c',
            margin: '0 0 12px 0',
            letterSpacing: '-1px'
        },
        section: {
            marginBottom: '40px',
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e5631',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
        },
        infoGroup: {
            padding: '24px',
            backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fbfc',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease'
        },
        label: {
            display: 'block',
            fontWeight: '600',
            color: '#94a3b8',
            fontSize: '11px',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        value: {
            fontWeight: '700',
            color: '#334155',
            fontSize: '17px',
        },
        badge: {
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        publicBadge: {
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            color: '#059669',
        },
        privateBadge: {
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            color: '#dc2626',
        }
    };

    const responsiveStyles = `
        @keyframes float {
            from { transform: translate(0, 0) scale(1.0); }
            to { transform: translate(20px, 20px) scale(1.1); }
        }
        @media (max-width: 600px) {
            .student-details-header {
                flex-direction: column !important;
                text-align: center !important;
                align-items: center !important;
            }
            .student-details-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            .student-details-card {
                padding: 25px 15px !important;
            }
            .student-details-title {
                font-size: 24px !important;
            }
        }
        @media (max-width: 480px) {
            .student-details-value {
                font-size: 15px !important;
            }
        }
    `;

    if (!student) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, textAlign: 'center' }}>
                    <h2 style={{ color: '#dc3545' }}>Student Not Found</h2>
                    <p>The student details could not be loaded.</p>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
                </div>
            </div>
        );
    }

    const isPublic = student.portfolio?.isPublic;

    return (
        <div style={styles.container}>
            <style>{responsiveStyles}</style>
            <div style={styles.bgDecoration1}></div>
            <div style={styles.bgDecoration2}></div>
            <button
                style={styles.backBtn}
                onClick={() => navigate(-1)}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
                ← Back to Dashboard
            </button>

            <div style={styles.card} className="student-details-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }} className="student-details-header">
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#ffc107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        color: '#1e5631',
                        border: '4px solid #fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {student.portfolio?.profilePhoto ? (
                            <img src={student.portfolio.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            student.fullName.charAt(0)
                        )}
                    </div>
                    <div>
                        <h1 style={{ ...styles.title, margin: 0 }} className="student-details-title">{student.fullName}'s Details</h1>
                        <span style={{
                            ...styles.badge,
                            ...(isPublic ? styles.publicBadge : styles.privateBadge),
                            marginTop: '10px'
                        }}>
                            Portfolio: {isPublic ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Personal Information</h2>
                    <div style={styles.grid} className="student-details-grid">
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Full Name</span>
                            <span style={styles.value}>{student.fullName}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Email Address</span>
                            <span style={styles.value}>{student.email}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Student ID</span>
                            <span style={styles.value}>{student.studentId}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Phone Number</span>
                            <span style={styles.value}>{student.phone || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Address</span>
                            <span style={styles.value}>{student.address || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Date of Birth</span>
                            <span style={styles.value}>{student.dob || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Gender</span>
                            <span style={styles.value}>{student.gender || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>UMIS Number</span>
                            <span style={styles.value}>{student.umisNumber || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Academic Information</h2>
                    <div style={styles.grid} className="student-details-grid">
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Department</span>
                            <span style={styles.value}>{student.department}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Section</span>
                            <span style={styles.value}>{student.section}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Current Year</span>
                            <span style={styles.value}>{student.currentYear || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Current Semester</span>
                            <span style={styles.value}>{student.currentSemester || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Cumulative GPA</span>
                            <span style={styles.value}>{student.cgpa || 'Not provided'}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Specialization</span>
                            <span style={styles.value}>{student.specialization || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Portfolio Highlights</h2>
                    <div style={{ ...styles.grid, gridTemplateColumns: '1fr' }} className="student-details-grid">
                        <div style={styles.infoGroup}>
                            <span style={styles.label}>Skills</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                {student.portfolio?.skills?.length > 0
                                    ? student.portfolio.skills.map((s, i) => (
                                        <span key={i} style={{ backgroundColor: '#0b4f00', color: '#ffe600', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                                            {typeof s === 'string' ? s : `${s.name} (${s.level}%)`}
                                        </span>
                                    ))
                                    : 'No skills listed'}
                            </div>
                        </div>

                        {student.portfolio?.projects?.length > 0 && (
                            <div style={styles.infoGroup}>
                                <span style={styles.label}>Projects</span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
                                    {student.portfolio.projects.map((p, i) => (
                                        <div key={i} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eef0f2', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0b4f00', marginBottom: '8px' }}>{p.title}</div>
                                            <div style={{ color: '#1e5631', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>🛠 {p.technologies}</div>
                                            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>{p.description}</p>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                {p.journalFile && (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>JOURNAL</div>
                                                        <img src={p.journalFile} alt="Journal" style={{ width: '80px', height: '60px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => window.open(p.journalFile, '_blank')} />
                                                    </div>
                                                )}
                                                {p.certificateFile && (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>CERTIFICATE</div>
                                                        <img src={p.certificateFile} alt="Cert" style={{ width: '80px', height: '60px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => window.open(p.certificateFile, '_blank')} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {student.portfolio?.achievements?.length > 0 && (
                            <div style={styles.infoGroup}>
                                <span style={styles.label}>Achievements & Awards</span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
                                    {student.portfolio.achievements.map((a, i) => (
                                        <div key={i} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eef0f2', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <div style={{ fontWeight: 'bold', color: '#0b4f00' }}>🏆 {a.title}</div>
                                            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>{a.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {student.subjects?.length > 0 && (
                  <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Academic Performance (Subjects & Grades)</h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#0b4f00', color: '#ffe600' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Subject Name</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Grade</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.subjects.map((subj, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold' }}>{subj.subject_code}</td>
                              <td style={{ padding: '12px', fontSize: '14px' }}>{subj.subject_name}</td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                                <span style={{ padding: '4px 10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontWeight: 'bold' }}>{subj.grade}</span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  backgroundColor: subj.status === 'PASS' ? '#d4edda' : '#f8d7da',
                                  color: subj.status === 'PASS' ? '#155724' : '#721c24'
                                }}>
                                  {subj.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
}

export default StudentDetails;
