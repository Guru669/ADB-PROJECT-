import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config/api';

function ForgotPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identifier: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { identifier, newPassword, confirmPassword } = formData;

        if (!identifier || !newPassword || !confirmPassword) {
            setError('Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data || 'Failed to reset password');
            }

            setMessage(data.message || 'Password reset successful');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0b4f00 0%, #1a1a1a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
        },
        bgDecoration1: {
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 230, 0, 0.1) 0%, transparent 70%)',
            top: '-200px',
            right: '-100px',
            animation: 'pulse 10s infinite alternate'
        },
        bgDecoration2: {
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(11, 79, 0, 0.3) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            animation: 'pulse 8s infinite alternate-reverse'
        },
        card: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(25px) saturate(180%)',
            WebkitBackdropFilter: 'blur(25px) saturate(180%)',
            padding: 'min(50px, 8vw) min(40px, 6vw)',
            borderRadius: '32px',
            width: '100%',
            maxWidth: '440px',
            boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 10,
            transition: 'transform 0.3s ease',
            animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        },
        logoArea: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        logo: {
            width: '80px',
            height: '80px',
            marginBottom: '15px',
            filter: 'drop-shadow(0 0 15px rgba(255, 230, 0, 0.3))'
        },
        title: {
            color: '#fff',
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 10px 0',
            letterSpacing: '-0.5px'
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '15px',
            margin: '0'
        },
        inputGroup: {
            marginBottom: '24px'
        },
        label: {
            display: 'block',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '10px',
            marginLeft: '4px'
        },
        inputWrapper: {
            position: 'relative'
        },
        input: {
            width: '100%',
            padding: '16px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '15px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            boxSizing: 'border-box'
        },
        button: {
            width: '100%',
            padding: '16px',
            backgroundColor: '#ffe600',
            color: '#0b4f00',
            border: 'none',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '750',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 30px -10px rgba(255, 230, 0, 0.4)',
            marginTop: '10px'
        },
        error: {
            backgroundColor: 'rgba(224, 49, 49, 0.15)',
            color: '#ff8787',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '24px',
            border: '1px solid rgba(224, 49, 49, 0.3)',
            textAlign: 'center'
        },
        success: {
            backgroundColor: 'rgba(40, 167, 69, 0.15)',
            color: '#4ade80',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '24px',
            border: '1px solid rgba(40, 167, 69, 0.3)',
            textAlign: 'center'
        },
        homeLink: {
            position: 'absolute',
            top: '30px',
            left: '30px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            zIndex: 100
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.bgDecoration1}></div>
            <div style={styles.bgDecoration2}></div>

            <a href="/login" className="back-login" style={styles.homeLink}>
                ← Back to Login
            </a>

            <div style={styles.card}>
                <div style={styles.logoArea}>
                    <img src="/siet.png" alt="SIET" style={styles.logo} />
                    <h2 style={styles.title}>Reset Password</h2>
                    <p style={styles.subtitle}>Enter your details to create a new password</p>
                </div>

                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ID or Email Address</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="Student ID, Staff ID, or Email"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !!message}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            if (isLoading || !!message) return;
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.backgroundColor = '#fff066';
                            e.target.style.boxShadow = '0 15px 35px -10px rgba(255, 230, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            if (isLoading || !!message) return;
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.backgroundColor = '#ffe600';
                            e.target.style.boxShadow = '0 10px 30px -10px rgba(255, 230, 0, 0.4)';
                        }}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    from { transform: scale(1); opacity: 0.1; }
                    to { transform: scale(1.1); opacity: 0.15; }
                }
                body { margin: 0; background: #000; overflow-x: hidden; }
                ::placeholder { color: rgba(255, 255, 255, 0.2); }
                
                @media (max-width: 480px) {
                    .back-login {
                        top: 20px !important;
                        left: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default ForgotPassword;
