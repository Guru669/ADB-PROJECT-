import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config/api';

function UnifiedLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedCredentials = localStorage.getItem('rememberedCredentials');
        if (savedCredentials) {
            const { identifier } = JSON.parse(savedCredentials);
            setFormData(prev => ({ ...prev, identifier }));
        }
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data || 'Login failed');
            localStorage.setItem('token', data.token);
            if (data.user.role === 'student') {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else if (data.user.role === 'staff') {
                localStorage.setItem('staff', JSON.stringify(data.user));
                navigate('/staff-dashboard');
            }
        } catch (err) { setError(err.message); }
        finally { setIsLoading(false); }
    };

    const styles = {
        page: {
            minHeight: '100vh',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '24px',
            position: 'relative'
        },
        wrapper: {
            width: 'min(980px, 96vw)',
            backgroundColor: '#fff',
            borderRadius: '24px',
            boxShadow: '0 18px 46px rgba(15, 23, 42, 0.10)',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) 1.35fr',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
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
            fontSize: '28px',
            letterSpacing: '-0.5px'
        },
        panelText: {
            marginTop: '10px',
            color: 'rgba(234, 255, 210, 0.9)',
            lineHeight: '1.55',
            fontSize: '14px'
        },
        panelTag: {
            marginTop: '20px',
            color: '#ffe600',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.7px'
        },
        panelFooter: {
            fontSize: '12px',
            color: 'rgba(234, 255, 210, 0.8)'
        },
        formPanel: {
            padding: '48px 40px',
            textAlign: 'center'
        },
        title: { fontSize: '34px', fontWeight: '800', color: '#1a3625', marginBottom: '8px' },
        input: {
            width: '100%',
            padding: '14px 16px',
            margin: '8px 0',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxSizing: 'border-box',
            outline: 'none',
            backgroundColor: '#eef2ff'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '14px',
            fontSize: '14px'
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
            zIndex: 20
        }
    };

    const responsiveStyles = `
      @media (max-width: 850px) {
        .login-wrapper {
          grid-template-columns: 1fr !important;
        }
        .login-side-panel {
          padding: 24px !important;
        }
        .login-form-panel {
          padding: 36px 24px !important;
        }
      }
    `;

    return (
        <div style={styles.page}>
            <style>{responsiveStyles}</style>
            <button type="button" style={styles.homeBtn} onClick={() => navigate('/')}>
                Home
            </button>
            <div style={styles.wrapper} className="login-wrapper">
                <div style={styles.sidePanel} className="login-side-panel">
                    <div>
                        <div style={styles.logoWrap}>
                            <img src="/siet.png" alt="SIET Logo" style={styles.logo} />
                        </div>
                        <h2 style={styles.panelTitle}>SIET Portal</h2>
                        <p style={styles.panelText}>
                            Access your student and faculty workspace with one secure login.
                            Track portfolios, manage profiles, and stay connected.
                        </p>
                        <p style={styles.panelTag}>Portfolio Based Student Project Platform</p>
                    </div>
                    <div style={styles.panelFooter}>
                        Empowering the youth. Empowering the nation.
                    </div>
                </div>

                <div style={styles.formPanel} className="login-form-panel">
                    <h1 style={styles.title}>Login</h1>
                    <p style={{ color: '#64748b', marginBottom: '34px' }}>Sign in to your professional portal.</p>
                    {error && <div style={{ color: '#dc3545', marginBottom: '20px' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <input name="identifier" value={formData.identifier} style={styles.input} placeholder="Email or Student ID" onChange={handleChange} />
                        <input name="password" value={formData.password} type="password" style={styles.input} placeholder="Password" onChange={handleChange} />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Sign In'}
                        </button>
                        <p style={{ marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
                            New here? <span style={{ color: '#1a3625', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/register')}>Create Account</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UnifiedLogin;
