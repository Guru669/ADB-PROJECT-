import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config/api';
function Home() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setShowLoginPanel] = useState(false);
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeLoginTab, setActiveLoginTab] = useState('student'); // Add login tab state
  // Registration States
  const [, setShowRegisterPanel] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    staffId: '',
    department: '',
    section: '',
    role: 'student'
  });
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeRegisterTab, setActiveRegisterTab] = useState('student');

  // Scroll Animation Refs and State
  const statsRef = useRef(null);
  const aboutRef = useRef(null);
  const ctaRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState({
    stats: false,
    about: false,
    cta: false
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, []);

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Chemical Engineering', 'Biotechnology'
  ];
  const sections = ['A', 'B', 'C', 'D', 'E'];
  useEffect(() => {
    setIsLoaded(true);

    // NUCLEAR RESET: One-time purge of legacy Base64 bloat to fix QuotaExceededError
    try {
      if (!localStorage.getItem('storage_integrity_v1')) {
        console.log("Cleaning legacy storage bloat...");
        // Set the flag FIRST so we don't loop if the siguientes steps fail
        localStorage.setItem('storage_integrity_v1', 'true'); 
        
        // Targeted removal of known bloat keys
        localStorage.removeItem('allStudents');
        localStorage.removeItem('portfolio');
        
        // Also strip profilePhotos from existing session objects if they are too big
        const user = localStorage.getItem('user');
        if (user && user.length > 500000) { // If > 0.5MB, it's definitely bloated
           localStorage.removeItem('user');
        }
        const staff = localStorage.getItem('staff');
        if (staff && staff.length > 500000) {
           localStorage.removeItem('staff');
        }
      }
    } catch (e) {
      console.warn("Storage reset encountered an issue, but flag is set to prevent loops.");
      // Ensure flag is set even on error to prevent refresh loops
      try { localStorage.setItem('storage_integrity_v1', 'true'); } catch(e2) {}
    }

    // Add keyboard shortcut for admin access
    const handleKeyPress = (e) => {
      // Ctrl + Shift + A to open admin login
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin-login');
      }
      // Ctrl + Shift + D for direct admin dashboard (if already logged in as admin)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const adminUser = localStorage.getItem('admin');
        if (adminUser) {
          navigate('/admin');
        } else {
          alert('Please login as admin first using Ctrl+Shift+A');
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
  const studentUser = localStorage.getItem('user');
  const staffUser = localStorage.getItem('staff');
  const adminUser = localStorage.getItem('admin');
  const getDashboardPath = () => {
    if (adminUser) return '/admin';
    if (staffUser) return '/staff-dashboard';
    if (studentUser) return '/dashboard';
    return null;
  };
  const dashboardPath = getDashboardPath();
  // Get current user info
  const getCurrentUser = () => {
    if (studentUser) {
      const user = JSON.parse(studentUser);
      return { name: user.fullName, role: 'Student', photo: user.portfolio?.profilePhoto };
    }
    if (staffUser) {
      const user = JSON.parse(staffUser);
      return { name: user.fullName, role: 'Faculty', photo: user.profilePhoto };
    }
    if (adminUser) {
      return { name: 'Administrator', role: 'Admin', photo: null };
    }
    return null;
  };
  const currentUser = getCurrentUser();
  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = loginData;

    if (!identifier || !password) {
      setLoginError('Please fill all fields');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data || 'Login failed');
      }

      const { token, user } = data;

      // Store token
      localStorage.setItem('token', token);

      // Track login activity locally for now
      const loginDataLog = {
        email: user.email,
        type: user.role,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      const existingLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
      existingLogs.push(loginDataLog);
      localStorage.setItem('loginLogs', JSON.stringify(existingLogs));

      localStorage.setItem('token', data.token);
      const slimUser = { ...data.user };
      if (slimUser.portfolio) {
        slimUser.portfolio = { 
          ...slimUser.portfolio, 
          profilePhoto: '', 
          certificates: (slimUser.portfolio.certificates || []).map(c => ({ ...c, file: '' })),
          projects: (slimUser.portfolio.projects || []).map(p => ({ ...p, file: '', presentationPhoto: '', journalFile: '', certificateFile: '' })),
          achievements: (slimUser.portfolio.achievements || []).map(a => ({ ...a, file: '' }))
        };
      }
      if (data.user.role === 'student' || data.user.role === 'user') {
          localStorage.setItem('user', JSON.stringify(slimUser));
          if (data.user.portfolio) {
              localStorage.setItem('portfolio', JSON.stringify(slimUser.portfolio));
          }
          setShowLoginPanel(false);
          navigate('/dashboard');
      } else if (data.user.role === 'staff' || data.user.role === 'admin') {
          localStorage.setItem('staff', JSON.stringify(slimUser));
          setShowLoginPanel(false);
          navigate('/staff-dashboard');
      } else {
        setLoginError('Unknown user role');
      }

    } catch (err) {
      console.error(err);
      setLoginError(typeof err === 'string' ? err : err.message || 'Invalid ID/Email or Password');
    } finally {
      setIsLoggingIn(false);
    }
  };
  // Handle registration change
  const handleRegisterChange = (e) => {
    setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
  };
  // Handle registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    // Set role based on active tab
    const role = activeRegisterTab;

    // Create submission data and clear irrelevant fields
    const submissionData = {
      ...registerFormData,
      role,
      studentId: role === 'student' ? registerFormData.studentId : '',
      staffId: role === 'staff' ? registerFormData.staffId : '',
      section: role === 'student' ? registerFormData.section : '', // Clear section for staff
    };

    const { fullName, email, password, confirmPassword, studentId, staffId, department, section } = submissionData;

    // Validation
    if (!fullName.trim()) {
      setRegisterError('Full Name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterError('Please enter a valid email address');
      return;
    }

    if (role === 'student') {
      if (!studentId.trim()) {
        setRegisterError('Student ID is required');
        return;
      }
      if (!department) {
        setRegisterError('Department is required');
        return;
      }
      if (!section) {
        setRegisterError('Section is required');
        return;
      }
    } else {
      if (!staffId.trim()) {
        setRegisterError('Staff ID is required');
        return;
      }
      if (!department) {
        setRegisterError('Department is required');
        return;
      }
    }

    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data || 'Registration failed');
      }

      const { token, user } = data;
      localStorage.setItem('token', token);

      if (user.role === 'student') {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.portfolio) {
          localStorage.setItem('portfolio', JSON.stringify(user.portfolio));
        }
        setShowRegisterPanel(false);
        navigate('/dashboard');
      } else { // Staff or admin
        localStorage.setItem('staff', JSON.stringify(user));
        setShowRegisterPanel(false);
        navigate('/staff-dashboard');
      }

    } catch (err) {
      console.error(err);
      setRegisterError(typeof err === 'string' ? err : err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f8fafc 100%)',
      fontFamily: "'Inter', Arial, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    decorCircle1: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(11, 79, 0, 0.08) 0%, rgba(11, 79, 0, 0.03) 100%)',
      top: '-100px',
      right: '-100px',
      animation: 'float 8s ease-in-out infinite'
    },
    decorCircle2: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(11, 79, 0, 0.06) 0%, rgba(11, 79, 0, 0.02) 100%)',
      bottom: '-50px',
      left: '-50px',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: '1s'
    },
    watermark: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      height: '400px',
      opacity: 0.05,
      zIndex: 1,
      pointerEvents: 'none',
      userSelect: 'none'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 38px',
      backgroundColor: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      zIndex: 10,
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 8px 24px rgba(15,23,42,0.06)'
    },
    logo: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#18442f'
    },
    navButtons: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center'
    },
    btnLogin: {
      padding: '10px 25px',
      backgroundColor: '#ffffff',
      color: '#18442f',
      border: '1px solid #cbd5e1',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s',
      fontWeight: '500'
    },
    btnLoginHover: {
      backgroundColor: '#eef2ff',
      color: '#18442f',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(15,23,42,0.08)'
    },
    btnRegister: {
      padding: '10px 25px',
      background: 'linear-gradient(90deg, #18442f 0%, #14532d 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s',
      boxShadow: '0 8px 20px rgba(20,83,45,0.25)'
    },
    btnRegisterHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 28px rgba(20,83,45,0.32)'
    },
    ctaButton: {
      padding: '15px 40px',
      backgroundColor: '#0b4f00',
      color: '#ffe600',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      transition: 'all 0.3s',
      boxShadow: '0 8px 25px rgba(11, 79, 0, 0.3)'
    },
    ctaButtonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 35px rgba(11, 79, 0, 0.4)',
      backgroundColor: '#0a3d00'
    },
    hero: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '90px 20px',
      color: '#333',
      position: 'relative',
      zIndex: 5,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.95) 100%)'
    },
    heroTitle: {
      fontSize: '52px',
      marginBottom: '20px',
      fontWeight: '800',
      color: '#0b4f00'
    },
    heroSubtitle: {
      fontSize: '20px',
      marginBottom: '40px',
      maxWidth: '600px',
      lineHeight: '1.6',
      color: '#555'
    },
    features: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      padding: '60px 20px',
      flexWrap: 'wrap'
    },
    featureCard: {
      backgroundColor: '#ffffff',
      backdropFilter: 'blur(8px)',
      padding: '30px',
      borderRadius: '15px',
      width: '280px',
      textAlign: 'center',
      color: '#0b4f00',
      transition: 'all 0.3s',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 24px rgba(15,23,42,0.08)'
    },
    featureCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      backgroundColor: '#f8f9fa'
    },
    featureIcon: {
      fontSize: '40px',
      marginBottom: '15px'
    },
    featureTitle: {
      fontSize: '20px',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    featureDesc: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    footer: {
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #eee',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
      marginTop: '60px'
    },
    adminLink: {
      color: '#666',
      textDecoration: 'none',
      opacity: 0.5,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'opacity 0.3s'
    },
    // New Sections Styles
    statsSection: {
      display: 'flex',
      justifyContent: 'center',
      gap: '80px',
      padding: '60px 20px',
      background: 'linear-gradient(135deg, #18442f 0%, #14532d 100%)',
      color: 'white',
      marginTop: '40px',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 2
    },
    statItem: {
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#ffe600',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '16px',
      opacity: 0.9,
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    aboutSection: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '100px 50px',
      gap: '80px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,250,252,0.95) 100%)',
      backdropFilter: 'blur(20px)',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 2
    },
    aboutContent: {
      maxWidth: '500px'
    },
    sectionTitle: {
      fontSize: '42px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #18442f 0%, #14532d 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '25px'
    },
    sectionText: {
      fontSize: '18px',
      color: '#4a5568',
      lineHeight: '1.7',
      marginBottom: '30px'
    },
    benefitList: {
      listStyle: 'none',
      padding: 0
    },
    benefitItem: {
      fontSize: '18px',
      marginBottom: '18px',
      color: '#2d3748',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    checkIcon: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    ctaSection: {
      padding: '120px 20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(24,68,47,0.95) 0%, rgba(20,83,45,0.95) 100%)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      zIndex: 2
    },
    ctaBox: {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'rgba(255,255,255,0.95)',
      padding: '60px',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(20px)'
    },
    // How It Works
    howToSection: {
      padding: '80px 20px',
      backgroundColor: '#fff',
      textAlign: 'center'
    },
    stepsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      marginTop: '50px',
      flexWrap: 'wrap'
    },
    stepCard: {
      flex: '1',
      minWidth: '250px',
      maxWidth: '300px',
      position: 'relative',
      padding: '20px'
    },
    stepNumber: {
      width: '40px',
      height: '40px',
      backgroundColor: '#ffe600',
      color: '#0b4f00',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '20px',
      margin: '0 auto 20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    // Recruiters
    recruiterSection: {
      padding: '60px 20px',
      backgroundColor: '#f1f3f5',
      textAlign: 'center'
    },
    logoGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '40px',
      marginTop: '40px',
      opacity: 0.6
    },
    companyName: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#868e96'
    }
  };
  const [buttonStyles, setButtonStyles] = useState({
    staffLogin: {},
    studentLogin: {},
    register: {},
    cta: {}
  });
  const handleButtonHover = (buttonKey, styleKey) => {
    setButtonStyles({
      ...buttonStyles,
      [buttonKey]: styles[`${styleKey}Hover`]
    });
  };
  const handleButtonLeave = (buttonKey) => {
    setButtonStyles({
      ...buttonStyles,
      [buttonKey]: {}
    });
  };
  return (
    <>
      <div style={styles.container}>
        <div style={styles.decorCircle1}></div>
        <div style={styles.decorCircle2}></div>
        <img src="/siet.png" alt="SIET" style={styles.watermark} />
        {/* Navigation */}
        <nav className="mobile-nav" style={{
          ...styles.nav,
          animation: isLoaded ? 'slideDown 0.6s ease-out forwards' : 'none',
          opacity: isLoaded ? 1 : 0
        }}>
          <div style={styles.logo} className="mobile-center">Sri Shakthi Institute of Engineering</div>
          <div className="mobile-nav-buttons" style={styles.navButtons}>
            {dashboardPath ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* User Info Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(255, 230, 0, 0.15)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 230, 0, 0.3)'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffe600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid #ffe600'
                  }}>
                    {currentUser?.photo ? (
                      <img src={currentUser.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0b4f00' }}>
                        {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{currentUser?.name}</div>
                    <div style={{ color: '#ffe600', fontSize: '11px', fontWeight: '500' }}>{currentUser?.role}</div>
                  </div>
                </div>
                <button
                  style={{ ...styles.btnRegister, padding: '10px 30px' }}
                  onClick={() => navigate(dashboardPath)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(255, 230, 0, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 230, 0, 0.4)';
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <button
                  style={{ ...styles.btnLogin, ...buttonStyles.login }}
                  onClick={() => navigate('/login')}
                  onMouseEnter={() => handleButtonHover('login', 'btnLogin')}
                  onMouseLeave={() => handleButtonLeave('login')}
                >
                  Login
                </button>
                <button
                  style={{ ...styles.btnRegister, ...buttonStyles.register }}
                  onClick={() => navigate('/register')}
                  onMouseEnter={() => handleButtonHover('register', 'btnRegister')}
                  onMouseLeave={() => handleButtonLeave('register')}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </nav>

        {/* How It Works Section */}
        <div className="mobile-super-card" style={styles.howToSection}>
          <h2 className="mobile-tiny-header" style={styles.sectionTitle}>How It Works</h2>
          <p className="mobile-compact-text" style={{ ...styles.sectionText, maxWidth: '600px', margin: '0 auto' }}>
            Build your professional identity in three simple steps.
          </p>
          <div className="mobile-grid-1 mobile-tight-spacing" style={styles.stepsContainer}>
            <div className="mobile-compact-card" style={styles.stepCard}>
              <div className="mobile-tiny-badge" style={styles.stepNumber}>1</div>
              <h3 className="mobile-compact-text" style={styles.featureTitle}>Create Account</h3>
              <p className="mobile-compact-text" style={styles.featureDesc}>Sign up with your college ID to access the exclusive student portal.</p>
            </div>
            <div className="mobile-compact-card" style={styles.stepCard}>
              <div className="mobile-tiny-badge" style={styles.stepNumber}>2</div>
              <h3 className="mobile-compact-text" style={styles.featureTitle}>Build Profile</h3>
              <p className="mobile-compact-text" style={styles.featureDesc}>Add your projects, skills, and certifications to showcase your talent.</p>
            </div>
            <div className="mobile-compact-card" style={styles.stepCard}>
              <div className="mobile-tiny-badge" style={styles.stepNumber}>3</div>
              <h3 className="mobile-compact-text" style={styles.featureTitle}>Get Hired</h3>
              <p className="mobile-compact-text" style={styles.featureDesc}>Connect with top recruiters and apply for exclusive campus placements.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          id="stats"
          ref={statsRef}
          style={{
            ...styles.statsSection,
            opacity: visibleSections.stats ? 1 : 0,
            transform: visibleSections.stats ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <div className="mobile-grid-2" style={styles.statItem}>
            <div style={styles.statNumber}>5000+</div>
            <div style={styles.statLabel}>Students</div>
          </div>
          <div className="mobile-grid-2" style={styles.statItem}>
            <div style={styles.statNumber}>150+</div>
            <div style={styles.statLabel}>Recruiters</div>
          </div>
          <div className="mobile-grid-2" style={styles.statItem}>
            <div style={styles.statNumber}>98%</div>
            <div style={styles.statLabel}>Placement Rate</div>
          </div>
          <div className="mobile-grid-2" style={styles.statItem}>
            <div style={styles.statNumber}>12k+</div>
            <div style={styles.statLabel}>Certifications</div>
          </div>
        </div>

        {/* About Section */}
        <div
          id="about"
          ref={aboutRef}
          style={{
            ...styles.aboutSection,
            opacity: visibleSections.about ? 1 : 0,
            transform: visibleSections.about ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <div style={styles.aboutContent}>
            <h2 style={styles.sectionTitle}>Why Build Your Portfolio?</h2>
            <p style={styles.sectionText}>
              In today's competitive job market, a resume isn't enough.
              Your SIET portfolio showcases your projects, certifications, and skills in a way that
              static documents cannot. Stand out to recruiters with a verified digital profile.
            </p>
            <ul style={styles.benefitList}>
              <li style={styles.benefitItem}>
                <span style={styles.checkIcon}>✓</span>
                Showcase verified skills and achievements
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.checkIcon}>✓</span>
                Direct access to top-tier campus recruiters
              </li>
              <li style={styles.benefitItem}>
                <span style={styles.checkIcon}>✓</span>
                Generate professional, download-ready resumes
              </li>
            </ul>
          </div>
          <div style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #0b4f00 0%, #1a6d1a 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(11, 79, 0, 0.2)',
            transform: 'rotate(3deg)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid #ffe600',
              borderRadius: '20px',
              transform: 'rotate(-6deg) scale(0.95)',
              opacity: 0.5
            }}></div>
            <div style={{ fontSize: '100px' }}>🚀</div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          id="cta"
          ref={ctaRef}
          style={{
            ...styles.ctaSection,
            opacity: visibleSections.cta ? 1 : 0,
            transform: visibleSections.cta ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <div style={styles.ctaBox}>
            <h2 style={{ ...styles.sectionTitle, fontSize: '42px' }}>Ready to Launch Your Career?</h2>
            <p style={{ ...styles.sectionText, maxWidth: '600px', margin: '0 auto 40px' }}>
              Join thousands of students who are already shaping their future with SIET Portfolio.
            </p>
            {!currentUser && (
              <button
                id="bottom-cta-register-btn"
                style={{ ...styles.btnRegister, padding: '18px 45px', fontSize: '18px' }}
                onClick={() => navigate('/register')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 230, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 230, 0, 0.4)';
                }}
              >
                Create Your Portfolio Now
              </button>
            )}
          </div>
        </div>

        {/* Top Recruiters Section */}
        <div style={styles.recruiterSection}>
          <h2 style={{ ...styles.sectionTitle, fontSize: '28px', marginBottom: '10px' }}>Top Recruiters</h2>
          <p style={styles.sectionText}>Trusted by leading companies</p>
          <div style={styles.logoGrid}>
            <div style={styles.companyName}>Google</div>
            <div style={styles.companyName}>Microsoft</div>
            <div style={styles.companyName}>Amazon</div>
            <div style={styles.companyName}>Zoho</div>
            <div style={styles.companyName}>TCS</div>
            <div style={styles.companyName}>Infosys</div>
            <div style={styles.companyName}>Wipro</div>
            <div style={styles.companyName}>Accenture</div>
          </div>
        </div>
        <footer style={styles.footer}>
          <p>© 2024 Sri Shakthi Institute of Engineering and Technology. All rights reserved.</p>
          <div style={{ marginTop: '10px' }}>
            <span
              style={styles.adminLink}
              onClick={() => navigate('/admin-login')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.5'}
            >
              Administration Access
            </span>
          </div>
        </footer>
      </div>
      {false && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => setShowLoginPanel(false)}
          />
          {/* Login Panel */}
          <div
            className="mobile-form-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100vw',
              maxWidth: '500px',
              height: '100vh',
              backgroundColor: '#fff',
              zIndex: 1000,
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
              animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            {/* Panel Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0b4f00 0%, #1a6d1a 100%)',
              padding: '30px',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                ×
              </button>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Welcome Back</h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Sign in to your account</p>
            </div>
            {/* Login Form */}
            <div style={{
              padding: '40px 30px',
              flex: 1,
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src="/siet-logo.svg" alt="SIET" style={{ width: '80px', opacity: 0.8 }} />
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '25px',
                background: '#f1f3f5',
                padding: '5px',
                borderRadius: '12px'
              }}>
                <button
                  onClick={() => setActiveLoginTab('student')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', transition: '0.3s',
                    backgroundColor: activeLoginTab === 'student' ? '#0b4f00' : 'transparent',
                    color: activeLoginTab === 'student' ? '#ffe600' : '#495057'
                  }}
                >
                  Student
                </button>
                <button
                  onClick={() => setActiveLoginTab('staff')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', transition: '0.3s',
                    backgroundColor: activeLoginTab === 'staff' ? '#0b4f00' : 'transparent',
                    color: activeLoginTab === 'staff' ? '#ffe600' : '#495057'
                  }}
                >
                  Staff/Faculty
                </button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '12px', color: '#666' }}>
                {activeLoginTab === 'student' ? 'Login with Student ID or Email' : 'Login with Staff ID or Email'}
              </div>
              {loginError && (
                <div style={{
                  backgroundColor: '#fff5f5',
                  color: '#e03131',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  border: '1px solid #ffc9c9',
                  textAlign: 'center'
                }}>
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Student ID / Staff ID / Email
                  </label>
                  <input
                    type="text"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    placeholder="Enter your ID or Email"
                    className="mobile-input"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0b4f00'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    className="mobile-input"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0b4f00'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#0b4f00',
                    color: '#ffe600',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(11, 79, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(11, 79, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(11, 79, 0, 0.3)';
                  }}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Don't have an account?{' '}
                  <span
                    style={{ color: '#0b4f00', fontWeight: '700', cursor: 'pointer' }}
                    onClick={() => {
                      setShowLoginPanel(false);
                      setShowRegisterPanel(true);
                    }}
                  >
                    Register Now
                  </span>
                </p>
              </div>
            </div>
            {/* Panel Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #eee',
              textAlign: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                Secure login powered by SIET
              </p>
            </div>
          </div>
        </>
      )}
      {/* Slide-in Register Panel */}
      {false && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => setShowRegisterPanel(false)}
          />
          {/* Register Panel */}
          <div
            className="mobile-form-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100vw',
              maxWidth: '500px',
              height: '100vh',
              backgroundColor: '#fff',
              zIndex: 1000,
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
              animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            {/* Panel Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0b4f00 0%, #1a6d1a 100%)',
              padding: '30px',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                ×
              </button>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Join SIET Portfolio</h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Create your account to get started</p>
            </div>
            {/* Register Form */}
            <div style={{
              padding: '40px 30px',
              flex: 1,
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src="/siet-logo.svg" alt="SIET" style={{ width: '80px', opacity: 0.8 }} />
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '25px',
                background: '#f1f3f5',
                padding: '5px',
                borderRadius: '12px'
              }}>
                <button
                  onClick={() => setActiveRegisterTab('student')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', transition: '0.3s',
                    backgroundColor: activeRegisterTab === 'student' ? '#0b4f00' : 'transparent',
                    color: activeRegisterTab === 'student' ? '#ffe600' : '#495057'
                  }}
                >
                  Student
                </button>
                <button
                  onClick={() => setActiveRegisterTab('staff')}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 'bold', transition: '0.3s',
                    backgroundColor: activeRegisterTab === 'staff' ? '#0b4f00' : 'transparent',
                    color: activeRegisterTab === 'staff' ? '#ffe600' : '#495057'
                  }}
                >
                  Staff
                </button>
              </div>
              {registerError && (
                <div style={{
                  backgroundColor: '#fff5f5',
                  color: '#e03131',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  border: '1px solid #ffc9c9',
                  textAlign: 'center'
                }}>
                  {registerError}
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} noValidate>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={registerFormData.fullName}
                    onChange={handleRegisterChange}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                      fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registerFormData.email}
                    onChange={handleRegisterChange}
                    placeholder="Enter your email"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                      fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                    }}
                    required
                  />
                </div>
                {activeRegisterTab === 'student' ? (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={registerFormData.studentId}
                        onChange={handleRegisterChange}
                        placeholder="Enter Student ID"
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                          fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                        Department
                      </label>
                      <select
                        name="department"
                        value={registerFormData.department}
                        onChange={handleRegisterChange}
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                          fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff'
                        }}
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                        Section
                      </label>
                      <select
                        name="section"
                        value={registerFormData.section}
                        onChange={handleRegisterChange}
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                          fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff'
                        }}
                      >
                        <option value="">Select Section</option>
                        {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                        Staff ID
                      </label>
                      <input
                        type="text"
                        name="staffId"
                        value={registerFormData.staffId}
                        onChange={handleRegisterChange}
                        placeholder="Enter Staff ID"
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                          fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                        Department
                      </label>
                      <select
                        name="department"
                        value={registerFormData.department}
                        onChange={handleRegisterChange}
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                          fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff'
                        }}
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={registerFormData.password}
                    onChange={handleRegisterChange}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                      fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={registerFormData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #e9ecef', borderRadius: '10px',
                      fontSize: '15px', boxSizing: 'border-box', outline: 'none'
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRegistering}
                  style={{
                    width: '100%', padding: '16px', backgroundColor: '#0b4f00', color: '#ffe600',
                    border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(11, 79, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(11, 79, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(11, 79, 0, 0.3)';
                  }}
                >
                  {isRegistering ? 'Registering...' : 'Register Now'}
                </button>
              </form>
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <span
                    style={{ color: '#0b4f00', fontWeight: '700', cursor: 'pointer' }}
                    onClick={() => {
                      setShowRegisterPanel(false);
                      setTimeout(() => navigate('/login'), 300);
                    }}
                  >
                    Login
                  </span>
                </p>
              </div>
            </div>
            {/* Panel Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #eee',
              textAlign: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                Secure registration powered by SIET
              </p>
            </div>
          </div>
        </>
      )}
      {/* Add keyframe animation for slideInRight */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
export default Home;
