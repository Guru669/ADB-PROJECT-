import React from 'react';

function StudentProfileModal({ student, isOpen, onClose, darkMode }) {
  if (!isOpen || !student) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)'
    },
    modal: {
      background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '24px',
      width: '95%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(11, 79, 0, 0.1)',
      position: 'relative'
    },
    bgDecoration: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '150px',
      background: darkMode 
        ? 'linear-gradient(135deg, #0b4f00 0%, #1a5d1a 100%)' 
        : 'linear-gradient(135deg, #1e5631 0%, #2e7d32 100%)',
      zIndex: -1,
      opacity: 0.15
    },
    header: {
      padding: '30px 40px',
      borderBottom: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'transparent'
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '600',
      color: darkMode ? '#fff' : '#2d3748'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: darkMode ? '#999' : '#718096',
      padding: '5px',
      borderRadius: '50%',
      width: '35px',
      height: '35px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    content: {
      padding: '0 40px 40px 40px'
    },
    section: {
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: darkMode ? '#667eea' : '#5a67d8',
      marginBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    infoItem: {
      padding: '18px',
      background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(11, 79, 0, 0.02)',
      borderRadius: '16px',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(11, 79, 0, 0.05)',
      transition: 'all 0.3s ease'
    },
    infoLabel: {
      fontSize: '12px',
      color: darkMode ? '#999' : '#718096',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '5px'
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#fff' : '#2d3748'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      margin: '2px',
      textTransform: 'uppercase'
    },
    skillBadge: {
      background: darkMode ? '#2d5a2d' : '#c6f6d5',
      color: darkMode ? '#9ae6b4' : '#22543d'
    },
    projectCard: {
      background: darkMode ? '#2d2d2d' : '#f7fafc',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '10px',
      border: darkMode ? '1px solid #444' : '1px solid #e2e8f0'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: darkMode ? '#fff' : '#2d3748',
      marginBottom: '8px'
    },
    projectDesc: {
      fontSize: '14px',
      color: darkMode ? '#ccc' : '#4a5568',
      marginBottom: '10px'
    },
    projectLink: {
      color: darkMode ? '#667eea' : '#5a67d8',
      textDecoration: 'none',
      fontSize: '12px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @media (max-width: 600px) {
          .modal-content-mobile {
            padding: 20px !important;
          }
          .modal-header-mobile {
            padding: 20px !important;
            flex-direction: column !important;
            text-align: center !important;
          }
          .info-grid-mobile {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.bgDecoration}></div>
        <div style={styles.header} className="modal-header-mobile">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ffc107',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#1e5631',
            border: '2px solid #fff',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {student.portfolio?.profilePhoto ? (
              <img src={student.portfolio.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              student.fullName.charAt(0)
            )}
          </div>
          <h2 style={{ ...styles.title, margin: 0 }}>Student Profile: {student.fullName}</h2>
          <button 
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = darkMode ? '#333' : '#f1f1f1';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>
        
        <div style={styles.content} className="modal-content-mobile">
          {/* Basic Information */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Basic Information</div>
            <div style={styles.infoGrid} className="info-grid-mobile">
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Student ID</div>
                <div style={styles.infoValue}>{student.studentId}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Full Name</div>
                <div style={styles.infoValue}>{student.fullName}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Department</div>
                <div style={styles.infoValue}>{student.department}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Section</div>
                <div style={styles.infoValue}>{student.section}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{student.email}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Phone Number</div>
                <div style={styles.infoValue}>{student.phone || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Address</div>
                <div style={styles.infoValue}>{student.address || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Current Year</div>
                <div style={styles.infoValue}>{student.currentYear || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Current Semester</div>
                <div style={styles.infoValue}>{student.currentSemester || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>CGPA</div>
                <div style={styles.infoValue}>{student.cgpa || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Specialization</div>
                <div style={styles.infoValue}>{student.specialization || 'Not provided'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Portfolio Status</div>
                <div style={styles.infoValue}>
                  <span style={{
                    ...styles.badge,
                    background: student.portfolio?.isPublic 
                      ? (darkMode ? '#2d5a2d' : '#c6f6d5')
                      : (darkMode ? '#5a2d2d' : '#fed7d7'),
                    color: student.portfolio?.isPublic 
                      ? (darkMode ? '#9ae6b4' : '#22543d')
                      : (darkMode ? '#fc8181' : '#742a2a')
                  }}>
                    {student.portfolio?.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Skills & Expertise</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(student.portfolio?.skills || []).map((s, index) => (
                  <span key={index} style={{...styles.badge, ...styles.skillBadge}}>
                    {typeof s === 'string' ? s : `${s.name} (${s.level}%)`}
                  </span>
                ))}
              </div>
            </div>

          {/* Projects */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Projects</div>
              <div>
                {(student.portfolio?.projects || []).map((project, index) => (
                  <div key={index} style={styles.projectCard}>
                    <div style={styles.projectTitle}>{project.title}</div>
                    <div style={{ color: '#5a67d8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>🛠 {project.technologies}</div>
                    <div style={styles.projectDesc}>{project.description}</div>
                    {(project.link || project.github) && (
                      <a 
                        href={project.link || project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.projectLink}
                      >
                        🔗 View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

          {/* Achievements */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Achievements</div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {(student.portfolio?.achievements || []).map((a, index) => (
                  <div key={index} style={{ 
                    ...styles.infoItem, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 18px'
                  }}>
                    <span style={{ fontSize: '18px' }}>🏆</span>
                    <div>
                      <div style={{ fontWeight: '600', color: darkMode ? '#fff' : '#2d3748' }}>{a.title}</div>
                      <div style={{ fontSize: '12px', color: darkMode ? '#999' : '#718096' }}>{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileModal;
