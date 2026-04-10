import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PublicPortfolio() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [user, setUser] = useState(null);
  const [activeScroll, setActiveScroll] = useState(false);

  useEffect(() => {
    // 1. Try to find the specific student from the global list
    const allStudents = JSON.parse(localStorage.getItem('allStudents') || '[]');
    const targetStudent = allStudents.find(s => s.studentId === studentId);

    if (targetStudent) {
      if (targetStudent.portfolio?.isPublic) {
        setPortfolio(targetStudent.portfolio);
        setUser(targetStudent);
      }
    } else {
      // 2. Fallback to current session (for immediate testing after edit)
      const storedPortfolio = localStorage.getItem('portfolio');
      const storedUser = localStorage.getItem('user');

      if (storedPortfolio && storedUser) {
        const p = JSON.parse(storedPortfolio);
        const u = JSON.parse(storedUser);

        if (p.isPublic && u.studentId === studentId) {
          setPortfolio(p);
          setUser(u);
        }
      }
    }

    const handleScroll = () => {
      setActiveScroll(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [studentId]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      lineHeight: '1.6',
    },
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: activeScroll ? '15px 20px' : '20px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: activeScroll ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
      backdropFilter: activeScroll ? 'blur(12px)' : 'none',
      borderBottom: activeScroll ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#f8fafc',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
    },
    hero: {
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '100px 20px 60px',
      background: 'radial-gradient(circle at top right, rgba(30, 86, 49, 0.15), transparent), radial-gradient(circle at bottom left, rgba(255, 193, 7, 0.05), transparent)',
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '800px',
      padding: '0 20px',
    },
    avatarWrapper: {
      width: '180px',
      height: '180px',
      padding: '5px',
      background: 'linear-gradient(135deg, #1e5631 0%, #ffc107 100%)',
      borderRadius: '50%',
      marginBottom: '30px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      display: 'inline-block',
    },
    avatar: {
      width: '100%',
      height: '100%',
      backgroundColor: '#1e293b',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '64px',
      overflow: 'hidden',
    },
    name: {
      fontSize: 'clamp(36px, 10vw, 64px)',
      fontWeight: '800',
      marginBottom: '10px',
      letterSpacing: '-1.5px',
      background: 'linear-gradient(to right, #fff, #94a3b8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: '1.1'
    },
    badge: {
      padding: '6px 16px',
      backgroundColor: 'rgba(30, 86, 49, 0.2)',
      color: '#4ade80',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1px solid rgba(74, 222, 128, 0.2)',
      marginBottom: '20px',
      display: 'inline-block',
    },
    meta: {
      fontSize: '18px',
      color: '#94a3b8',
      marginBottom: '40px',
    },
    content: {
      maxWidth: '1100px',
      margin: '-100px auto 0',
      padding: '0 20px 100px',
      position: 'relative',
      zIndex: 5,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '24px',
    },
    card: {
      gridColumn: 'span 12',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(16px)',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
    },
    sectionHeader: {
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#fff',
    },
    icon: {
      fontSize: '24px',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
    },
    skillGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
    },
    skillTag: {
      padding: '10px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      color: '#cbd5e1',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s ease',
    },
    timelineItem: {
      paddingLeft: '30px',
      position: 'relative',
      marginBottom: '30px',
      borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
    },
    timelineDot: {
      position: 'absolute',
      left: '-7px',
      top: '0',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#ffc107',
      boxShadow: '0 0 15px rgba(255, 193, 7, 0.5)',
    },
    itemTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '4px',
    },
    itemSub: {
      fontSize: '14px',
      color: '#4ade80',
      fontWeight: '500',
      marginBottom: '8px',
    },
    itemDesc: {
      fontSize: '15px',
      color: '#94a3b8',
    },
    projectCard: {
      gridColumn: 'span 6',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      padding: '30px',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s ease',
    },
    notFound: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }
  };

  const responsiveStyles = `
    @media (max-width: 768px) {
      .content-wrapper {
        margin-top: 0 !important;
        padding-top: 40px !important;
      }
      .portfolio-grid {
        display: flex !important;
        flex-direction: column !important;
      }
      .portfolio-card {
        padding: 25px !important;
      }
      .skills-card {
        order: 2 !important;
      }
      .education-card {
        order: 1 !important;
      }
      .education-content {
        flex-direction: column !important;
        gap: 20px !important;
      }
      .projects-grid {
        grid-template-columns: 1fr !important;
      }
      .timeline-card-grid {
        grid-template-columns: 1fr !important;
        gap: 40px !important;
      }
      .timeline-item-content {
        flex-direction: column-reverse !important;
        gap: 15px !important;
      }
      .timeline-item-img {
        width: 100% !important;
        height: 150px !important;
      }
    }
  `;

  if (!portfolio || !user) {
    return (
      <div style={styles.container}>
        <div style={styles.notFound}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Portfolio not found or set to private.</p>
          <button style={styles.backBtn} onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      {/* Dynamic Header / Navigation */}
      <nav style={styles.nav}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> <span className="hide-mobile">Back</span>
        </button>
        <div style={{ fontWeight: '700', letterSpacing: '2px', fontSize: 'clamp(10px, 3vw, 14px)', color: '#ffc107', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/siet.png" alt="SIET" style={{ height: '32px', backgroundColor: '#fff', borderRadius: '4px', padding: '2px' }} />
          SIET PORTFOLIO
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {portfolio.profilePhoto ? (
                <img src={portfolio.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.fullName?.charAt(0).toUpperCase() || '👤'
              )}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={styles.badge}>Available for Projects</span>
              {portfolio.isVerified && (
                <span style={{ ...styles.badge, background: '#1e5631', color: '#ffc107', border: '1px solid #ffc107' }}>✅ Verified by SIET</span>
              )}
            </div>
            <h1 style={styles.name}>{user.fullName}</h1>
            <p style={styles.meta}>{user.department} • Class of 2024 • Section {user.section}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content} className="content-wrapper container-responsive">
        <div style={styles.grid} className="portfolio-grid grid-responsive">

          {/* About Section */}
          <div style={styles.card} className="portfolio-card">
            <div style={styles.sectionHeader}>
              <span style={styles.icon}>👋</span>
              <h2 style={styles.sectionTitle}>About Me</h2>
            </div>
            <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#cbd5e1', maxWidth: '800px' }}>
              {portfolio.bio || "Hello! I am a passionate student at Sri Shakthi Institute of Engineering and Technology, constantly exploring new technologies and building impactful solutions."}
            </p>
          </div>

          {/* Skills Section */}
          <div style={{ ...styles.card, gridColumn: 'span 4' }} className="portfolio-card skills-card">
            <div style={styles.sectionHeader}>
              <span style={styles.icon}>⚡</span>
              <h2 style={styles.sectionTitle}>Expertise</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill, i) => {
                  const sName = typeof skill === 'string' ? skill : skill.name;
                  const sLevel = typeof skill === 'string' ? 80 : skill.level;
                  return (
                    <div key={i} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                        <span style={{ color: '#fff', fontWeight: '500' }}>{sName}</span>
                        <span style={{ color: '#ffc107' }}>{sLevel}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${sLevel}%`,
                            background: 'linear-gradient(90deg, #1e5631 0%, #2e7d32 100%)',
                            boxShadow: '0 0 10px rgba(46, 125, 50, 0.5)',
                            transition: 'width 1s ease-out'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#64748b' }}>Technical skills listed here</p>
              )}
            </div>
          </div>

          {/* Education/Stats Section */}
          <div style={{ ...styles.card, gridColumn: 'span 8' }} className="portfolio-card education-card">
            <div style={styles.sectionHeader}>
              <span style={styles.icon}>🎓</span>
              <h2 style={styles.sectionTitle}>Education</h2>
            </div>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }} className="education-content">
              <div style={{ padding: '20px', backgroundColor: 'rgba(30, 86, 49, 0.2)', borderRadius: '16px', flex: 1 }}>
                <h4 style={{ color: '#fff', marginBottom: '5px' }}>Bachelor of Engineering</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sri Shakthi Institute of Engineering and Technology</p>
                <p style={{ color: '#ffc107', marginTop: '10px', fontSize: '14px' }}>CGPA: 8.5/10 (Estimated)</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', flex: 1, width: '100%' }}>
                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{portfolio.projects.length}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>PROJECTS</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{portfolio.achievements.length}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>AWARDS</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{portfolio.journals?.length || 0}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>JOURNALS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div style={{ gridColumn: 'span 12', marginTop: '40px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: '800', marginBottom: '30px', color: '#fff' }}>Selected Projects</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }} className="projects-grid">
              {portfolio.projects.map((p) => (
                <div key={p.id} style={{ ...styles.projectCard, gridColumn: 'auto' }} className="full-width-mobile">
                  {p.file && (
                    <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={p.file} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ height: '4px', width: '40px', backgroundColor: '#ffc107', marginBottom: '20px' }}></div>
                  <h3 style={styles.itemTitle}>{p.title}</h3>
                  <p style={{ color: '#4ade80', fontSize: '12px', marginBottom: '15px', fontWeight: '600', textTransform: 'uppercase' }}>{p.technologies}</p>
                  <p style={styles.itemDesc}>{p.description}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    {p.journalFile && (
                      <button style={{ ...styles.backBtn, padding: '5px 12px', fontSize: '11px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }} onClick={() => window.open(p.journalFile, '_blank')}>
                        📝 Journal
                      </button>
                    )}
                    {p.certificateFile && (
                      <button style={{ ...styles.backBtn, padding: '5px 12px', fontSize: '11px', background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }} onClick={() => window.open(p.certificateFile, '_blank')}>
                        📜 Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Certificates */}
          <div style={{ gridColumn: 'span 12', marginTop: '60px' }} className="section-spacing-mobile">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }} className="timeline-card-grid grid-responsive">
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '30px' }}>🏆 Achievements</h2>
                {portfolio.achievements.map(a => (
                  <div key={a.id} style={styles.timelineItem}>
                    <div style={styles.timelineDot}></div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }} className="timeline-item-content">
                      <div style={{ flex: 1 }}>
                        <div style={styles.itemTitle}>{a.title}</div>
                        <div style={styles.itemDesc}>{a.description}</div>
                      </div>
                      {a.file && (
                        <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} className="timeline-item-img">
                          <img src={a.file} alt="Achievement" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '30px' }}>📜 Certificates</h2>
                {portfolio.certificates.map(c => (
                  <div key={c.id} style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, backgroundColor: '#4ade80', boxShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}></div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }} className="timeline-item-content">
                      <div style={{ flex: 1 }}>
                        <div style={styles.itemTitle}>{c.title}</div>
                        <div style={styles.itemSub}>Issued by {c.issuer}</div>
                        <div style={styles.itemDesc}>Credential Date: {c.date}</div>
                      </div>
                      {c.file && (
                        <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} className="timeline-item-img">
                          <img src={c.file} alt="Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Designed for Sri Shakthi Institute of Engineering and Technology</p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '5px' }}>© 2024 Portfolio System</p>
      </footer>
    </div>
  );
}

export default PublicPortfolio;
