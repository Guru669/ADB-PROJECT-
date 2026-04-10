import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const ADMIN_EMAIL = 'admin@siet.edu';
        const ADMIN_PASSWORD = 'admin123';

        if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
            setIsLoading(true);
            setTimeout(() => {
                localStorage.setItem('admin', JSON.stringify({ email: formData.email, role: 'admin' }));
                navigate('/admin');
            }, 500);
        } else {
            setError('Invalid admin credentials. Please try again.');
        }
    };

    const styles = {
        page: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fef9ec 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            position: 'relative',
            overflow: 'hidden',
            padding: '20px',
        },
        blob1: {
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)',
            top: '-180px',
            right: '-80px',
            animation: 'blobFloat 11s ease-in-out infinite alternate',
            pointerEvents: 'none',
        },
        blob2: {
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-80px',
            animation: 'blobFloat 9s ease-in-out infinite alternate-reverse',
            pointerEvents: 'none',
        },
        card: {
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            width: 'min(440px, 95vw)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden',
            animation: isLoaded ? 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
        },
        cardTop: {
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 60%, #ef4444 100%)',
            padding: 'min(40px, 7vw)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        topRing: {
            position: 'absolute',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
        },
        adminIcon: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 20px auto',
            border: '2px solid rgba(255,255,255,0.25)',
        },
        cardTopTitle: {
            color: '#fff',
            fontSize: '26px',
            fontWeight: '800',
            margin: '0 0 6px 0',
            letterSpacing: '-0.4px',
        },
        cardTopSubtitle: {
            color: 'rgba(255,255,255,0.75)',
            fontSize: '13px',
            margin: '0',
            letterSpacing: '1px',
            fontWeight: '600',
            textTransform: 'uppercase',
        },
        cardBody: {
            padding: 'min(40px, 7vw)',
        },
        inputGroup: {
            marginBottom: '18px',
        },
        label: {
            display: 'block',
            color: '#374151',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
        },
        inputWrapper: {
            position: 'relative',
        },
        input: {
            width: '100%',
            padding: '13px 16px',
            backgroundColor: '#f9fafb',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            color: '#111827',
            fontSize: '15px',
            transition: 'all 0.25s ease',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: "'Inter', sans-serif",
        },
        passwordToggle: {
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '4px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
        },
        error: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '18px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        button: {
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(185,28,28,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        },
        backLink: {
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #f3f4f6',
        },
        backButton: {
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'color 0.2s',
            fontFamily: "'Inter', sans-serif",
        },
        securityNote: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#991b1b',
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <div style={styles.card}>
                {/* Top Header */}
                <div style={styles.cardTop}>
                    {[180, 280, 360].map((size, i) => (
                        <div key={i} style={{
                            ...styles.topRing,
                            width: size + 'px',
                            height: size + 'px',
                            top: `calc(50% - ${size / 2}px)`,
                            left: `calc(50% - ${size / 2}px)`,
                        }} />
                    ))}
                    <div style={{
                        ...styles.adminIcon,
                        background: 'rgba(255,255,255,0.92)',
                        padding: '6px',
                        overflow: 'hidden',
                    }}>
                        <img
                            src="/siet.png"
                            alt="SIET Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <h2 style={styles.cardTopTitle}>Admin Portal</h2>
                    <p style={styles.cardTopSubtitle}>System Administration Access</p>
                </div>

                {/* Form Body */}
                <div style={styles.cardBody}>
                    <div style={styles.securityNote}>
                        <span>🔒</span>
                        <span>This is a restricted area. Authorized personnel only.</span>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Admin Email Address</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@siet.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.backgroundColor = '#fff';
                                        e.target.style.borderColor = '#dc2626';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.10)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ ...styles.input, paddingRight: '48px' }}
                                    onFocus={(e) => {
                                        e.target.style.backgroundColor = '#fff';
                                        e.target.style.borderColor = '#dc2626';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.10)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    style={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={styles.button}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(185,28,28,0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.25)';
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                                    Authenticating...
                                </>
                            ) : (
                                '🔑 Login as Administrator'
                            )}
                        </button>
                    </form>

                    <div style={styles.backLink}>
                        <button
                            style={styles.backButton}
                            onClick={() => navigate('/')}
                            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blobFloat {
                    0% { transform: translateY(0) scale(1); }
                    100% { transform: translateY(-25px) scale(1.04); }
                }
                body { margin: 0; overflow-x: hidden; }
                ::placeholder { color: #9ca3af; }
            `}</style>
        </div>
    );
}

export default AdminLogin;
