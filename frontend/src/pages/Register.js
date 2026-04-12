import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config/api';

function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('student');
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', confirmPassword: '',
        studentId: '', staffId: '', department: '', section: '',
        phone: '', address: '', dateOfBirth: '', gender: '', umisNumber: '',
        currentYear: '', currentSemester: '', cgpa: '', specialization: '',
        role: 'student'
    });
    const [error, setError] = useState('');

    const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil'];

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: activeTab })
            });
            if (!response.ok) throw new Error('Registration failed');
            navigate('/login');
        } catch (err) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const styles = {
        page: {
            minHeight: '100vh',
            background: 'linear-gradient(140deg, #f8fafc 0%, #eef2ff 55%, #f3f4f6 100%)',
            padding: '14px',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
        },
        wrapper: {
            width: 'min(920px, 95vw)',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 18px 46px rgba(15, 23, 42, 0.10)',
            display: 'grid',
            gridTemplateColumns: 'minmax(250px, 0.9fr) 1.3fr',
            overflow: 'hidden',
            backdropFilter: 'blur(6px)'
        },
        sidePanel: {
            background: 'linear-gradient(150deg, #0b4f00 0%, #14532d 100%)',
            color: '#eaffd2',
            padding: '36px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        logoWrap: {
            width: '68px',
            height: '68px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            padding: '6px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        logo: {
            width: '100%',
            height: '100%',
            objectFit: 'contain'
        },
        panelTitle: {
            margin: 0,
            color: '#ffe600',
            fontWeight: '800',
            fontSize: '30px',
            letterSpacing: '-0.7px',
            textShadow: '0 4px 14px rgba(0,0,0,0.25)'
        },
        panelText: {
            marginTop: '10px',
            color: 'rgba(234, 255, 210, 0.9)',
            lineHeight: '1.55',
            fontSize: '14px'
        },
        panelCard: {
            marginTop: '18px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px'
        },
        panelList: {
            margin: '8px 0 0',
            paddingLeft: '18px',
            color: 'rgba(234, 255, 210, 0.95)',
            fontSize: '13px',
            lineHeight: '1.6'
        },
        panelFooter: {
            fontSize: '12px',
            color: 'rgba(234, 255, 210, 0.8)'
        },
        formPanel: {
            padding: '34px 30px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%)'
        },
        title: { fontSize: '34px', fontWeight: '800', color: '#173828', marginBottom: '8px', letterSpacing: '-1px' },
        subtitle: { color: '#6b7280', marginBottom: '16px', fontSize: '15px' },
        lineTag: {
            color: '#16a34a',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '24px',
            letterSpacing: '0.3px'
        },
        tabRow: { display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' },
        tab: (active) => ({
            padding: '10px 24px',
            borderRadius: '12px',
            border: active ? '1px solid #18442f' : '1px solid #cbd5e1',
            cursor: 'pointer',
            minWidth: '86px',
            backgroundColor: active ? '#18442f' : '#e5e7eb',
            color: active ? '#fff' : '#64748b',
            fontWeight: '700',
            boxShadow: active ? '0 6px 16px rgba(24, 68, 47, 0.25)' : 'none'
        }),
        sideTabRow: { display: 'flex', gap: '8px', marginTop: '14px', marginBottom: '6px' },
        sideTab: (active) => ({
            padding: '9px 14px',
            borderRadius: '10px',
            border: active ? '1px solid #ffe600' : '1px solid rgba(255,255,255,0.25)',
            cursor: 'pointer',
            minWidth: '92px',
            backgroundColor: active ? '#ffe600' : 'rgba(255,255,255,0.08)',
            color: active ? '#0b4f00' : '#eaffd2',
            fontWeight: '700',
            fontSize: '13px'
        }),
        input: {
            width: '100%',
            padding: '12px 14px',
            margin: '4px 0',
            backgroundColor: '#f8fafc',
            border: '1px solid #d6deea',
            borderRadius: '10px',
            boxSizing: 'border-box',
            fontSize: '14px',
            color: '#0f172a',
            transition: 'all 0.2s ease'
        },
        btn: {
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '14px',
            fontSize: '14px',
            boxShadow: '0 10px 24px rgba(20, 83, 45, 0.25)',
            transition: 'all 0.2s ease'
        },
        homeBtn: {
            position: 'absolute',
            left: '16px',
            top: '16px',
            padding: '10px 16px',
            background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 20
        }
    };

    const responsiveStyles = `
      @media (max-width: 850px) {
        .register-wrapper {
          grid-template-columns: 1fr !important;
        }
        .register-side-panel {
          padding: 18px !important;
        }
        .register-form-panel {
          padding: 22px 16px !important;
        }
      }
    `;

    return (
        <div style={styles.page}>
            <style>{responsiveStyles}</style>
            <button type="button" style={styles.homeBtn} onClick={() => navigate('/')}>
                Home
            </button>
            <div className="mobile-grid-1 register-wrapper" style={styles.wrapper}>
                <div className="mobile-card register-side-panel" style={styles.sidePanel}>
                    <div className="mobile-center">
                        <div className="mobile-center" style={styles.logoWrap}>
                            <img src="/siet.png" alt="SIET Logo" style={styles.logo} />
                        </div>
                        <h2 className="mobile-center" style={styles.panelTitle}>SIET Portal</h2>
                        <p className="mobile-center" style={styles.panelText}>
                            Create your student or faculty account to access portfolios,
                            profile management, and institutional services.
                        </p>
                        <div className="mobile-nav-buttons" style={styles.sideTabRow}>
                            <button className="mobile-full-width" style={styles.sideTab(activeTab === 'student')} onClick={() => setActiveTab('student')}>Student</button>
                            <button className="mobile-full-width" style={styles.sideTab(activeTab === 'staff')} onClick={() => setActiveTab('staff')}>Faculty</button>
                        </div>
                        <p style={styles.lineTag}>Portfolio Based Student Project Platform</p>
                        <div style={styles.panelCard}>
                            <div style={{ fontWeight: '700', color: '#ffe600', fontSize: '13px' }}>What you can do</div>
                            <ul style={styles.panelList}>
                                <li>Create and maintain your academic profile</li>
                                <li>Upload projects and certificates</li>
                                <li>Showcase skills through public portfolio</li>
                            </ul>
                        </div>
                        <div style={{ ...styles.panelCard, marginTop: '10px' }}>
                            <div style={{ fontWeight: '700', color: '#ffe600', fontSize: '13px' }}>Need help?</div>
                            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(234, 255, 210, 0.95)', lineHeight: '1.6' }}>
                                Contact your department faculty coordinator for onboarding and profile approval.
                            </p>
                        </div>
                    </div>
                    <div style={styles.panelFooter}>
                        Empowering the youth. Empowering the nation.
                    </div>
                </div>

                <div className="mobile-super-card register-form-panel" style={styles.formPanel}>
                    <h1 className="mobile-tiny-header" style={styles.title}>Register</h1>
                    <p className="mobile-compact-text" style={styles.subtitle}>Create your professional account.</p>

                    {error && <div className="mobile-compact-card" style={{ color: '#dc3545', textAlign: 'center', marginBottom: '12px', padding: '8px' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mobile-grid-1 mobile-tight-spacing" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <input className="mobile-tiny-input" name="fullName" style={styles.input} placeholder="Full Name" onChange={handleChange} required />
                            <input className="mobile-tiny-input" name="email" type="email" style={styles.input} placeholder="Email" onChange={handleChange} required />
                            <input className="mobile-tiny-input" name={activeTab === 'student' ? 'studentId' : 'staffId'} style={styles.input} placeholder={activeTab === 'student' ? 'Student ID' : 'Staff ID'} onChange={handleChange} required />
                            <select className="mobile-tiny-input" name="department" style={styles.input} onChange={handleChange} required>
                                <option value="">Department</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {activeTab === 'student' && (
                                <>
                                    <input className="mobile-tiny-input" name="phone" style={styles.input} placeholder="Phone Number" onChange={handleChange} />
                                    <input className="mobile-tiny-input" name="address" style={styles.input} placeholder="Address" onChange={handleChange} />
                                    <input className="mobile-tiny-input" name="dateOfBirth" type="date" style={styles.input} onChange={handleChange} />
                                    <select className="mobile-tiny-input" name="gender" style={styles.input} onChange={handleChange}>
                                        <option value="">Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <input className="mobile-tiny-input" name="umisNumber" style={styles.input} placeholder="UMIS Number" onChange={handleChange} />
                                    <select className="mobile-tiny-input" name="section" style={styles.input} onChange={handleChange}>
                                        <option value="">Section</option>
                                        {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input className="mobile-tiny-input" name="currentYear" style={styles.input} placeholder="Current Year" onChange={handleChange} />
                                    <input className="mobile-tiny-input" name="currentSemester" style={styles.input} placeholder="Current Semester" onChange={handleChange} />
                                    <input className="mobile-tiny-input" name="cgpa" type="number" step="0.01" style={styles.input} placeholder="Cumulative GPA" onChange={handleChange} />
                                    <input className="mobile-tiny-input" name="specialization" style={styles.input} placeholder="Specialization" onChange={handleChange} />
                                </>
                            )}
                            <input className="mobile-tiny-input" name="password" type="password" style={styles.input} placeholder="Password" onChange={handleChange} required />
                            <input className="mobile-tiny-input" name="confirmPassword" type="password" style={styles.input} placeholder="Confirm Password" onChange={handleChange} required />
                        </div>
                        <button
                            type="submit"
                            className="mobile-tiny-btn"
                            style={styles.btn}
                            disabled={isLoading}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(20, 83, 45, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 24px rgba(20, 83, 45, 0.25)';
                            }}
                        >
                            {isLoading ? 'Processing...' : 'Create Account'}
                        </button>
                        <p style={{ marginTop: '18px', fontSize: '14px', color: '#64748b' }}>
                            Already have an account? <span style={{ color: '#1a3625', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign In</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
