import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [portfolio, setPortfolio] = useState({
    bio: '', skills: [], certificates: [], projects: [], journalPapers: [], achievements: []
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    section: '',
    phone: '',
    address: '',
    currentYear: '',
    currentSemester: '',
    cgpa: '',
    specialization: '',
    dateOfBirth: '',
    gender: '',
    umisNumber: '',
    bio: '',
    profilePhoto: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [certificateForm, setCertificateForm] = useState({ title: '', issuer: '', year: '', fileName: '', fileData: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tech: '', fileName: '', fileData: '' });
  const [journalForm, setJournalForm] = useState({ title: '', journal: '', publishedYear: '', doi: '', fileName: '', fileData: '' });
  const [studentSettings, setStudentSettings] = useState({
    emailNotifications: true,
    profilePublic: true,
    showContactInfo: false,
    darkMode: false
  });
  const isDarkMode = studentSettings.darkMode;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/'); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    const storedPortfolio = localStorage.getItem('portfolio') || JSON.stringify(parsedUser.portfolio || {});
    const parsedPortfolio = JSON.parse(storedPortfolio);
    setPortfolio(parsedPortfolio);
    setProfileForm({
      fullName: parsedUser.fullName || '',
      email: parsedUser.email || '',
      studentId: parsedUser.studentId || '',
      department: parsedUser.department || '',
      section: parsedUser.section || '',
      phone: parsedUser.phone || '',
      address: parsedUser.address || '',
      currentYear: parsedUser.currentYear || '',
      currentSemester: parsedUser.currentSemester || '',
      cgpa: parsedUser.cgpa || '',
      specialization: parsedUser.specialization || '',
      dateOfBirth: parsedUser.dateOfBirth || '',
      gender: parsedUser.gender || '',
      umisNumber: parsedUser.umisNumber || '',
      bio: parsedPortfolio.bio || '',
      profilePhoto: parsedPortfolio.profilePhoto || parsedUser.profilePhoto || ''
    });
    
    setTimeout(() => setIsLoaded(true), 100);
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem('studentSettings');
    if (saved) {
      try {
        setStudentSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // Ignore malformed localStorage and keep defaults
      }
    }
  }, []);

  const handleProfileInputChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileForm((prev) => ({ ...prev, profilePhoto: ev.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePhoto = () => {
    setProfileForm((prev) => ({ ...prev, profilePhoto: '' }));
  };

  const resetProfileForm = () => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || '',
      email: user.email || '',
      studentId: user.studentId || '',
      department: user.department || '',
      section: user.section || '',
      phone: user.phone || '',
      address: user.address || '',
      currentYear: user.currentYear || '',
      currentSemester: user.currentSemester || '',
      cgpa: user.cgpa || '',
      specialization: user.specialization || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      umisNumber: user.umisNumber || '',
      bio: portfolio.bio || '',
      profilePhoto: portfolio.profilePhoto || user.profilePhoto || ''
    });
  };

  const handleSaveProfile = async () => {
    if (!user?.email) return;
    setIsSavingProfile(true);
    setProfileMessage('');
    try {
      const profResponse = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: profileForm.fullName,
          department: profileForm.department,
          section: profileForm.section,
          phone: profileForm.phone,
          address: profileForm.address,
          currentYear: profileForm.currentYear,
          currentSemester: profileForm.currentSemester,
          cgpa: profileForm.cgpa,
          specialization: profileForm.specialization,
          dateOfBirth: profileForm.dateOfBirth,
          gender: profileForm.gender,
          umisNumber: profileForm.umisNumber
        })
      });

      const portResponse = await fetch('http://localhost:5000/api/auth/update-portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          portfolio: {
            ...(user.portfolio || {}),
            ...(portfolio || {}),
            bio: profileForm.bio,
            profilePhoto: profileForm.profilePhoto
          }
        })
      });

      const profData = await profResponse.json();
      const portData = await portResponse.json();
      if (!profResponse.ok || !portResponse.ok) {
        throw new Error(profData?.message || portData?.message || 'Failed to update profile');
      }

      const updatedUser = {
        ...user,
        ...profData.user,
        portfolio: portData.user?.portfolio || {}
      };

      setUser(updatedUser);
      setPortfolio(portData.user?.portfolio || {});
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('portfolio', JSON.stringify(portData.user?.portfolio || {}));
      setProfileMessage('Profile updated successfully.');
      setIsProfileEditing(false);
    } catch (error) {
      setProfileMessage(error.message || 'Unable to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePortfolioUpdates = async (updatedPortfolio) => {
    if (!user?.email) return false;
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          portfolio: updatedPortfolio
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update records');
      }
      const nextPortfolio = data.user?.portfolio || updatedPortfolio;
      const updatedUser = { ...user, portfolio: nextPortfolio };
      setPortfolio(nextPortfolio);
      setUser(updatedUser);
      localStorage.setItem('portfolio', JSON.stringify(nextPortfolio));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      setProfileMessage(error.message || 'Unable to update records.');
      return false;
    }
  };

  const handleAddSkill = async () => {
    const skill = skillInput.trim();
    if (!skill) return;
    const updatedPortfolio = {
      ...(portfolio || {}),
      skills: [...(portfolio.skills || []), skill]
    };
    const ok = await savePortfolioUpdates(updatedPortfolio);
    if (ok) setSkillInput('');
  };

  const handleAddCertificate = async () => {
    const title = certificateForm.title.trim();
    if (!title) return;
    const entry = {
      title,
      issuer: certificateForm.issuer.trim(),
      year: certificateForm.year.trim(),
      fileName: certificateForm.fileName || '',
      fileData: certificateForm.fileData || ''
    };
    const updatedPortfolio = {
      ...(portfolio || {}),
      certificates: [...(portfolio.certificates || []), entry]
    };
    const ok = await savePortfolioUpdates(updatedPortfolio);
    if (ok) setCertificateForm({ title: '', issuer: '', year: '', fileName: '', fileData: '' });
  };

  const handleAddProject = async () => {
    const title = projectForm.title.trim();
    if (!title) return;
    const entry = {
      title,
      description: projectForm.description.trim(),
      tech: projectForm.tech.trim(),
      fileName: projectForm.fileName || '',
      fileData: projectForm.fileData || ''
    };
    const updatedPortfolio = {
      ...(portfolio || {}),
      projects: [...(portfolio.projects || []), entry]
    };
    const ok = await savePortfolioUpdates(updatedPortfolio);
    if (ok) setProjectForm({ title: '', description: '', tech: '', fileName: '', fileData: '' });
  };

  const handleAddJournalPaper = async () => {
    const title = journalForm.title.trim();
    if (!title) return;
    const entry = {
      title,
      journal: journalForm.journal.trim(),
      publishedYear: journalForm.publishedYear.trim(),
      doi: journalForm.doi.trim(),
      fileName: journalForm.fileName || '',
      fileData: journalForm.fileData || ''
    };
    const updatedPortfolio = {
      ...(portfolio || {}),
      journalPapers: [...(portfolio.journalPapers || []), entry]
    };
    const ok = await savePortfolioUpdates(updatedPortfolio);
    if (ok) setJournalForm({ title: '', journal: '', publishedYear: '', doi: '', fileName: '', fileData: '' });
  };

  const convertFileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleCertificateFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToDataUrl(file);
    setCertificateForm((prev) => ({ ...prev, fileName: file.name, fileData: dataUrl }));
  };

  const handleProjectFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToDataUrl(file);
    setProjectForm((prev) => ({ ...prev, fileName: file.name, fileData: dataUrl }));
  };

  const handleJournalFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await convertFileToDataUrl(file);
    setJournalForm((prev) => ({ ...prev, fileName: file.name, fileData: dataUrl }));
  };

  const handleSettingToggle = (key) => {
    setStudentSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('studentSettings', JSON.stringify(studentSettings));
    setProfileMessage('Settings saved successfully.');
  };

  const handleResetSettings = () => {
    const defaults = {
      emailNotifications: true,
      profilePublic: true,
      showContactInfo: false,
      darkMode: false
    };
    setStudentSettings(defaults);
    localStorage.setItem('studentSettings', JSON.stringify(defaults));
    setProfileMessage('Settings reset to default.');
  };

  const styles = {
    page: { 
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#173828',
      fontFamily: "'Poppins', 'Inter', sans-serif",
      transition: 'opacity 0.4s ease',
      opacity: isLoaded ? 1 : 0,
      position: 'relative',
      overflow: 'hidden'
    },
    decorCircle1: {
      position: 'absolute',
      width: '340px',
      height: '340px',
      borderRadius: '50%',
      top: '-110px',
      right: '-80px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(255, 230, 0, 0.08) 0%, rgba(255, 230, 0, 0.03) 100%)'
        : 'linear-gradient(135deg, rgba(11, 79, 0, 0.08) 0%, rgba(11, 79, 0, 0.03) 100%)'
    },
    decorCircle2: {
      position: 'absolute',
      width: '260px',
      height: '260px',
      borderRadius: '50%',
      bottom: '-80px',
      left: '-60px',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(255, 230, 0, 0.06) 0%, rgba(255, 230, 0, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(11, 79, 0, 0.06) 0%, rgba(11, 79, 0, 0.02) 100%)'
    },
    header: {
      padding: '18px 28px',
      backgroundColor: '#0b4f00',
      borderBottom: '1px solid rgba(255,230,0,0.25)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    title: { fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', margin: 0, color: '#ffe600' },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '14px' },
    logo: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      padding: '3px',
      objectFit: 'contain'
    },
    nav: { 
      padding: '0 28px',
      display: 'flex',
      gap: '8px',
      backgroundColor: isDarkMode ? '#111827' : '#f7f8fa',
      borderBottom: isDarkMode ? '1px solid #1f2937' : '1px solid #e6ebef',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    navTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    navActions: { display: 'flex', gap: '10px', padding: '10px 0' },
    navItem: (active) => ({
      padding: '14px 18px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '800',
      letterSpacing: '0.8px',
      backgroundColor: active ? '#0b4f00' : 'transparent',
      color: active ? '#ffe600' : (isDarkMode ? '#e2e8f0' : '#173828'),
      border: active ? 'none' : '1px solid transparent',
      borderRadius: '10px',
      transition: '0.2s',
      textTransform: 'uppercase'
    }),
    main: { padding: '28px', maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 },
    card: {
      backgroundColor: isDarkMode ? '#111827' : '#fff',
      border: isDarkMode ? '1px solid #334155' : '1px solid rgba(11,79,0,0.22)',
      padding: '30px',
      marginBottom: '24px',
      borderRadius: '14px',
      boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 15px rgba(0,0,0,0.06)'
    },
    btn: {
      padding: '10px 18px',
      backgroundColor: '#ffe600',
      color: '#0b4f00',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '800',
      fontSize: '13px',
      cursor: 'pointer'
    },
    statusText: { fontSize: '12px', fontWeight: '700', color: '#eaffd2', letterSpacing: '0.5px', marginTop: '4px' }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={styles.page}>
      <div style={styles.decorCircle1}></div>
      <div style={styles.decorCircle2}></div>
      <header className="mobile-nav" style={styles.header}>
        <div className="mobile-stack" style={styles.logoWrap}>
          <img src="/siet.png" alt="SIET Logo" style={styles.logo} />
          <div className="mobile-center">
            <h1 style={styles.title}>Student Dashboard</h1>
            <div style={styles.statusText}>Welcome back, {user?.fullName || 'Student'}</div>
          </div>
        </div>
        <div className="mobile-nav-buttons" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="mobile-full-width" style={{ ...styles.btn, backgroundColor: '#ff4757', color: '#fff' }} onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="mobile-stack" style={styles.nav}>
        <div className="mobile-grid-2" style={styles.navTabs}>
          {['profile', 'skills', 'certificates', 'projects', 'journal', 'analytics', 'settings'].map(tab => (
            <button key={tab} className="mobile-full-width" style={styles.navItem(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="mobile-stack mobile-nav-buttons" style={styles.navActions}>
          <button className="mobile-full-width" style={styles.btn} onClick={() => setShowQR(true)}>Show QR</button>
          <button className="mobile-full-width" style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #0b4f00', color: '#0b4f00' }}>Export Data</button>
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'profile' && (
          isProfileEditing ? (
            <div className="mobile-super-card" style={{ ...styles.card, padding: '16px' }}>
              <div className="mobile-stack mobile-tight-spacing" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <h2 className="mobile-tiny-header" style={{ margin: 0, fontSize: '20px', color: '#173828', fontWeight: '800' }}>Edit Profile</h2>
                <div className="mobile-stack mobile-nav-buttons" style={{ display: 'flex', gap: '6px' }}>
                  <button className="mobile-tiny-btn" style={styles.btn} onClick={handleSaveProfile} disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save'}</button>
                  <button
                    className="mobile-tiny-btn"
                    style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #0b4f00', color: '#0b4f00' }}
                    onClick={() => {
                      resetProfileForm();
                      setIsProfileEditing(false);
                      setProfileMessage('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {profileMessage && (
                <p style={{ marginTop: '0', color: profileMessage.toLowerCase().includes('success') ? '#0f7a34' : '#dc2626', fontWeight: '600' }}>
                  {profileMessage}
                </p>
              )}

              <div className="mobile-stack mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '18px', marginBottom: '18px' }}>
                <div className="mobile-center">
                  <div style={{ width: '200px', height: '200px', backgroundColor: '#f8fafc', border: '2px solid #0b4f00', borderRadius: '50%', overflow: 'hidden', marginBottom: '10px' }}>
                    {profileForm.profilePhoto ? <img src={profileForm.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '100px', textAlign: 'center', lineHeight: '200px' }}>???</div>}
                  </div>
                  <input id="profile-photo-input" type="file" accept="image/*" onChange={handleProfilePhotoChange} style={{ display: 'none' }} />
                  <div className="mobile-stack mobile-nav-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="mobile-tiny-btn"
                      style={styles.btn}
                      onClick={() => document.getElementById('profile-photo-input')?.click()}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      className="mobile-tiny-btn"
                      style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626' }}
                      onClick={handleRemoveProfilePhoto}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                  {[
                    { key: 'fullName', label: 'Full Name' },
                    { key: 'email', label: 'Email', readOnly: true },
                    { key: 'studentId', label: 'Student ID', readOnly: true },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'address', label: 'Address' },
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'umisNumber', label: 'UMIS Number' },
                    { key: 'department', label: 'Department' },
                    { key: 'section', label: 'Section' },
                    { key: 'currentYear', label: 'Current Year' },
                    { key: 'currentSemester', label: 'Current Semester' },
                    { key: 'cgpa', label: 'CGPA' },
                    { key: 'specialization', label: 'Specialization' }
                  ].map((field) => (
                    <div key={field.key}>
                      <div className="mobile-compact-text" style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>{field.label}</div>
                      <input
                        name={field.key}
                        value={profileForm[field.key] || ''}
                        readOnly={field.readOnly}
                        onChange={handleProfileInputChange}
                        className="mobile-tiny-input"
                        style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: field.readOnly ? '#f1f5f9' : '#fff' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mobile-full-width">
                <div className="mobile-compact-text" style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>Bio</div>
                <textarea
                  name="bio"
                  value={profileForm.bio || ''}
                  onChange={handleProfileInputChange}
                  className="mobile-tiny-input"
                  style={{ width: '100%', minHeight: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ width: '180px', height: '180px', backgroundColor: '#f8fafc', border: '2px solid #0b4f00', borderRadius: '50%', overflow: 'hidden' }}>
                  {profileForm.profilePhoto ? <img src={profileForm.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '100px', textAlign: 'center', lineHeight: '200px' }}>👤</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '10px', color: '#173828' }}>{profileForm.fullName || 'Student'}</h2>
                  <div style={{ color: '#0b4f00', fontWeight: '800', marginBottom: '16px' }}>Student ID: {profileForm.studentId || '-'}</div>
                  <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', maxWidth: '700px' }}>{profileForm.bio || "No bio added yet. Update profile to add your introduction."}</p>
                  {profileMessage && (
                    <p style={{ marginTop: '10px', marginBottom: '0', color: profileMessage.toLowerCase().includes('success') ? '#0f7a34' : '#dc2626', fontWeight: '600' }}>
                      {profileMessage}
                    </p>
                  )}
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button style={styles.btn} onClick={() => setIsProfileEditing(true)}>Edit Profile</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '26px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                  {[
                    { key: 'fullName', label: 'Full Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'studentId', label: 'Student ID' },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'address', label: 'Address' },
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'umisNumber', label: 'UMIS Number' },
                    { key: 'department', label: 'Department' },
                    { key: 'section', label: 'Section' },
                    { key: 'currentYear', label: 'Current Year' },
                    { key: 'currentSemester', label: 'Current Semester' },
                    { key: 'cgpa', label: 'CGPA' },
                    { key: 'specialization', label: 'Specialization' }
                  ].map((field) => (
                    <div key={field.key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>{field.label}</div>
                      <div style={{ color: '#173828', fontWeight: '600' }}>{profileForm[field.key] || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>PROJECTS</div>
                  <div style={{ color: '#173828', fontWeight: '700', marginBottom: '8px' }}>
                    Total: {portfolio.projects?.length || 0}
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {(portfolio.projects || []).slice(-3).reverse().map((project, idx) => (
                      <div key={`profile-project-${idx}`} style={{ fontSize: '13px', color: '#334155' }}>
                        • {project?.title || 'Untitled Project'}
                      </div>
                    ))}
                    {(portfolio.projects?.length || 0) === 0 && (
                      <div style={{ fontSize: '13px', color: '#64748b' }}>No projects added yet.</div>
                    )}
                  </div>
                  <button style={{ ...styles.btn, marginTop: '10px' }} onClick={() => setActiveTab('projects')}>
                    Add Project
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>CERTIFICATES</div>
                  <div style={{ color: '#173828', fontWeight: '700', marginBottom: '8px' }}>
                    Total: {portfolio.certificates?.length || 0}
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {(portfolio.certificates || []).slice(-3).reverse().map((cert, idx) => (
                      <div key={`profile-cert-${idx}`} style={{ fontSize: '13px', color: '#334155' }}>
                        • {cert?.title || cert?.name || 'Untitled Certificate'}
                      </div>
                    ))}
                    {(portfolio.certificates?.length || 0) === 0 && (
                      <div style={{ fontSize: '13px', color: '#64748b' }}>No certificates added yet.</div>
                    )}
                  </div>
                  <button style={{ ...styles.btn, marginTop: '10px' }} onClick={() => setActiveTab('certificates')}>
                    Add Certificate
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>JOURNAL PAPERS</div>
                  <div style={{ color: '#173828', fontWeight: '700', marginBottom: '8px' }}>
                    Total: {portfolio.journalPapers?.length || 0}
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {(portfolio.journalPapers || []).slice(-3).reverse().map((paper, idx) => (
                      <div key={`profile-paper-${idx}`} style={{ fontSize: '13px', color: '#334155' }}>
                        • {paper?.title || 'Untitled Journal Paper'}
                      </div>
                    ))}
                    {(portfolio.journalPapers?.length || 0) === 0 && (
                      <div style={{ fontSize: '13px', color: '#64748b' }}>No journal papers added yet.</div>
                    )}
                  </div>
                  <button style={{ ...styles.btn, marginTop: '10px' }} onClick={() => setActiveTab('journal')}>
                    Add Journal Paper
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'skills' && (
          <div style={{ ...styles.card, padding: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>Skills</h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Add and update your technical skills here.</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Enter skill (e.g. React, Java)"
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <button style={styles.btn} onClick={handleAddSkill}>Add Skill</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {(portfolio.skills || []).map((skill, idx) => (
                <div key={`${skill}-${idx}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '10px', fontWeight: '600' }}>
                  {typeof skill === 'string' ? skill : (skill?.name || 'Skill')}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div style={{ ...styles.card, padding: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>Certificates</h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Add your certifications and proof documents here.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '10px', marginBottom: '14px' }}>
              <input
                value={certificateForm.title}
                onChange={(e) => setCertificateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Certificate title"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <input
                value={certificateForm.issuer}
                onChange={(e) => setCertificateForm(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Issuer"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <input
                value={certificateForm.year}
                onChange={(e) => setCertificateForm(prev => ({ ...prev, year: e.target.value }))}
                placeholder="Year"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <button style={styles.btn} onClick={handleAddCertificate}>Save</button>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <input
                id="certificate-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleCertificateFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #0b4f00', color: '#0b4f00' }}
                onClick={() => document.getElementById('certificate-file-input')?.click()}
              >
                Upload Certificate File
              </button>
              {certificateForm.fileName && (
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>Selected: {certificateForm.fileName}</p>
              )}
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(portfolio.certificates || []).map((cert, idx) => (
                <div key={`${cert?.title || 'cert'}-${idx}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: '700' }}>{cert?.title || cert?.name || 'Certificate'}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{cert?.issuer || 'Issuer'} {cert?.year ? `• ${cert.year}` : ''}</div>
                  {cert?.fileData && (
                    <a href={cert.fileData} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0b4f00', fontWeight: '700' }}>
                      View Document {cert?.fileName ? `(${cert.fileName})` : ''}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{ ...styles.card, padding: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>Projects</h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Add your academic and personal projects here.</p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
              <input
                value={projectForm.title}
                onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Project title"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <input
                value={projectForm.tech}
                onChange={(e) => setProjectForm(prev => ({ ...prev, tech: e.target.value }))}
                placeholder="Technologies used"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description"
                style={{ minHeight: '90px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
              <input
                id="project-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleProjectFileChange}
                style={{ display: 'none' }}
              />
              <div>
                <button
                  type="button"
                  style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #0b4f00', color: '#0b4f00' }}
                  onClick={() => document.getElementById('project-file-input')?.click()}
                >
                  Upload Project File
                </button>
              </div>
              {projectForm.fileName && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Selected: {projectForm.fileName}</p>
              )}
              <div>
                <button style={styles.btn} onClick={handleAddProject}>Save Project</button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(portfolio.projects || []).map((project, idx) => (
                <div key={`${project?.title || 'project'}-${idx}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: '700' }}>{project?.title || project?.name || 'Project'}</div>
                  {project?.tech && <div style={{ fontSize: '13px', color: '#0b4f00', marginTop: '4px' }}>Tech: {project.tech}</div>}
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{project?.description || 'No description'}</div>
                  {project?.fileData && (
                    <a href={project.fileData} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0b4f00', fontWeight: '700' }}>
                      View Attachment {project?.fileName ? `(${project.fileName})` : ''}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div style={{ ...styles.card, padding: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>Journal Papers</h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Add your published or submitted journal papers here.</p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
              <input
                value={journalForm.title}
                onChange={(e) => setJournalForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Paper title"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <input
                value={journalForm.journal}
                onChange={(e) => setJournalForm(prev => ({ ...prev, journal: e.target.value }))}
                placeholder="Journal name"
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  value={journalForm.publishedYear}
                  onChange={(e) => setJournalForm(prev => ({ ...prev, publishedYear: e.target.value }))}
                  placeholder="Published year"
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <input
                  value={journalForm.doi}
                  onChange={(e) => setJournalForm(prev => ({ ...prev, doi: e.target.value }))}
                  placeholder="DOI / Link"
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <input
                id="journal-file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleJournalFileChange}
                style={{ display: 'none' }}
              />
              <div>
                <button
                  type="button"
                  style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #0b4f00', color: '#0b4f00' }}
                  onClick={() => document.getElementById('journal-file-input')?.click()}
                >
                  Upload Journal File
                </button>
              </div>
              {journalForm.fileName && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Selected: {journalForm.fileName}</p>
              )}
              <div>
                <button style={styles.btn} onClick={handleAddJournalPaper}>Save Journal Paper</button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(portfolio.journalPapers || []).map((paper, idx) => (
                <div key={`${paper?.title || 'paper'}-${idx}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: '700' }}>{paper?.title || 'Journal Paper'}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {paper?.journal || 'Journal'} {paper?.publishedYear ? `• ${paper.publishedYear}` : ''}
                  </div>
                  {paper?.doi && (
                    <div style={{ fontSize: '13px', color: '#0b4f00', marginTop: '4px', wordBreak: 'break-all' }}>
                      DOI/Link: {paper.doi}
                    </div>
                  )}
                  {paper?.fileData && (
                    <a href={paper.fileData} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0b4f00', fontWeight: '700' }}>
                      View Document {paper?.fileName ? `(${paper.fileName})` : ''}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '18px', color: '#173828' }}>My Records Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>TOTAL SKILLS</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#0b4f00' }}>{portfolio.skills?.length || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>TOTAL CERTIFICATES</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#0b4f00' }}>{portfolio.certificates?.length || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>TOTAL PROJECTS</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#0b4f00' }}>{portfolio.projects?.length || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>TOTAL ACHIEVEMENTS</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#0b4f00' }}>{portfolio.achievements?.length || 0}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>TOTAL JOURNAL PAPERS</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#0b4f00' }}>{portfolio.journalPapers?.length || 0}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ marginTop: 0, color: '#173828' }}>Recent Skills</h3>
                {(portfolio.skills?.length || 0) === 0 ? (
                  <p style={{ color: '#64748b', margin: 0 }}>No skills added yet.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                    {(portfolio.skills || []).slice(-5).reverse().map((skill, idx) => (
                      <li key={idx}>{typeof skill === 'string' ? skill : (skill?.name || 'Skill')}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ marginTop: 0, color: '#173828' }}>Recent Projects</h3>
                {(portfolio.projects?.length || 0) === 0 ? (
                  <p style={{ color: '#64748b', margin: 0 }}>No projects added yet.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                    {(portfolio.projects || []).slice(-5).reverse().map((project, idx) => (
                      <li key={idx}>{project?.title || project?.name || 'Project'}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ ...styles.card, padding: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>Settings</h2>
            <p style={{ color: '#64748b', marginBottom: '18px' }}>Manage your student preferences.</p>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
              {[
                { key: 'emailNotifications', label: 'Email Notifications' },
                { key: 'profilePublic', label: 'Make My Profile Public' },
                { key: 'showContactInfo', label: 'Show Contact Info in Portfolio' },
                { key: 'darkMode', label: 'Dark Mode (Coming Soon)' }
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#173828' }}>{item.label}</span>
                  <button
                    type="button"
                    onClick={() => handleSettingToggle(item.key)}
                    style={{
                      ...styles.btn,
                      minWidth: '88px',
                      backgroundColor: studentSettings[item.key] ? '#0b4f00' : '#cbd5e1',
                      color: studentSettings[item.key] ? '#ffe600' : '#334155'
                    }}
                  >
                    {studentSettings[item.key] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button style={styles.btn} onClick={handleSaveSettings}>Save Settings</button>
              <button
                style={{ ...styles.btn, backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626' }}
                onClick={handleResetSettings}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Other tabs follow same style logic */}
        {activeTab !== 'profile' && activeTab !== 'settings' && activeTab !== 'skills' && activeTab !== 'certificates' && activeTab !== 'projects' && activeTab !== 'journal' && activeTab !== 'analytics' && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '80px 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#173828' }}>{activeTab.toUpperCase()}</h2>
            <p style={{ color: '#64748b' }}>This section will be available soon.</p>
          </div>
        )}
      </main>

      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowQR(false)}>
          <div style={{ backgroundColor: '#fff', padding: '36px', border: '1px solid #0b4f00', borderRadius: '14px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontWeight: '800', color: '#173828' }}>Portfolio QR</h3>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/portfolio/' + user?.studentId)}`}
              alt="QR code for portfolio link"
              style={{ marginBottom: '30px', border: '10px solid #fff' }}
            />
            <button style={{ ...styles.btn, width: '100%' }} onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
