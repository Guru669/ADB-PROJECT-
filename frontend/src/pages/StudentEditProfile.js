import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentEditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    profilePhoto: '',
    bio: ''
  });
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData({
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
        profilePhoto: user.portfolio?.profilePhoto || user.profilePhoto || '',
        bio: user.portfolio?.bio || ''
      });
    }
  }, []);

  const compressImage = (file, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, profilePhoto: compressed }));
      } catch (err) {
        console.error("Photo compression error:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    try {
      // Update server (both profile info and portfolio photo)
      // First update profile
      const profResponse = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: formData.fullName,
          department: formData.department,
          section: formData.section,
          phone: formData.phone,
          address: formData.address,
          currentYear: formData.currentYear,
          currentSemester: formData.currentSemester,
          cgpa: formData.cgpa,
          specialization: formData.specialization
        })
      });

      // Then update portfolio photo if changed
      const currentPortfolio = user.portfolio || {};
      const portResponse = await fetch('http://localhost:5000/api/auth/update-portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          portfolio: {
            ...currentPortfolio,
            profilePhoto: formData.profilePhoto,
            bio: formData.bio
          }
        })
      });

      const data = await profResponse.json();
      const portData = await portResponse.json();

      if (!profResponse.ok || !portResponse.ok) {
        setMessage(data.message || portData.message || 'Failed to update profile.');
        return;
      }

      // Update localStorage so UI reflects changes immediately
      const updatedUser = { 
        ...user, 
        ...data.user, 
        portfolio: portData.user.portfolio 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('portfolio', JSON.stringify(portData.user.portfolio));

      setMessage('Profile and Photo updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    decorCircle: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      top: '-200px',
      right: '-200px',
      animation: 'float 6s ease-in-out infinite'
    },
    decorCircle2: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      bottom: '-100px',
      left: '-100px',
      animation: 'float 8s ease-in-out infinite reverse'
    },
    card: {
      maxWidth: '500px',
      margin: '0 auto',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: 'min(40px, 8vw)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      position: 'relative',
      zIndex: 10,
      transform: 'translateY(0)',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '30px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    message: {
      padding: '15px',
      marginBottom: '25px',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '10px',
      textAlign: 'center',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease'
    },
    formGroup: {
      marginBottom: '25px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#555',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '15px',
      border: '2px solid #e1e5e9',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255,255,255,0.8)',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)'
    },
    inputHover: {
      borderColor: '#764ba2',
      transform: 'translateY(-1px)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginTop: '35px'
    },
    button: {
      flex: 1,
      padding: '15px 30px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden'
    },
    buttonSave: {
      background: 'linear-gradient(135deg, #28a745, #20c997)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
    },
    buttonSaveHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(40, 167, 69, 0.5)'
    },
    buttonCancel: {
      background: 'linear-gradient(135deg, #6c757d, #5a6268)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
    },
    buttonCancelHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(108, 117, 125, 0.4)'
    }
  };

  const [inputStyles, setInputStyles] = useState({
    fullName: styles.input,
    email: styles.input,
    studentId: styles.input,
    department: styles.input,
    section: styles.input,
    phone: styles.input,
    address: styles.input,
    currentYear: styles.input,
    currentSemester: styles.input,
    cgpa: styles.input,
    specialization: styles.input,
    bio: styles.input
  });

  const [buttonStyles, setButtonStyles] = useState({
    save: { ...styles.button, ...styles.buttonSave },
    cancel: { ...styles.button, ...styles.buttonCancel }
  });

  const handleInputFocus = (fieldName) => {
    setInputStyles({ ...inputStyles, [fieldName]: { ...styles.input, ...styles.inputFocus } });
  };

  const handleInputBlur = (fieldName) => {
    setInputStyles({ ...inputStyles, [fieldName]: styles.input });
  };

  const handleInputHover = (fieldName) => {
    setInputStyles({ ...inputStyles, [fieldName]: { ...styles.input, ...styles.inputHover } });
  };

  const responsiveStyles = `
    @media (max-width: 480px) {
      .edit-button-group {
        flex-direction: column !important;
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      <div style={styles.decorCircle}></div>
      <div style={styles.decorCircle2}></div>
      
      <div style={styles.card}>
        <h1 style={styles.title}>Edit Profile</h1>
        
        {message && <div style={styles.message}>{message}</div>}

        {/* Profile Photo Section */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#ffc107',
            margin: '0 auto 15px',
            overflow: 'hidden',
            border: '4px solid #fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '50px', color: '#1e5631' }}>{formData.fullName?.charAt(0) || '👤'}</span>
            )}
          </div>
          <input 
            type="file" 
            id="photo-upload" 
            style={{ display: 'none' }} 
            onChange={handlePhotoChange} 
            accept="image/*"
          />
          <button 
            type="button"
            onClick={() => document.getElementById('photo-upload').click()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isUploading ? 'Uploading...' : '📷 Change Photo'}
          </button>
        </div>
        
        <form style={{ width: '100%', margin: '20px 0' }} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name:</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={() => handleInputFocus('fullName')}
              onBlur={() => handleInputBlur('fullName')}
              onMouseEnter={() => handleInputHover('fullName')}
              onMouseLeave={() => handleInputBlur('fullName')}
              style={inputStyles.fullName}
              placeholder="Enter your full name"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleInputFocus('email')}
              onBlur={() => handleInputBlur('email')}
              onMouseEnter={() => handleInputHover('email')}
              onMouseLeave={() => handleInputBlur('email')}
              style={inputStyles.email}
              placeholder="Enter your email"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Student ID:</label>
            <input 
              type="text" 
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              onFocus={() => handleInputFocus('studentId')}
              onBlur={() => handleInputBlur('studentId')}
              onMouseEnter={() => handleInputHover('studentId')}
              onMouseLeave={() => handleInputBlur('studentId')}
              style={inputStyles.studentId}
              placeholder="Enter your student ID"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Department:</label>
            <input 
              type="text" 
              name="department"
              value={formData.department}
              onChange={handleChange}
              onFocus={() => handleInputFocus('department')}
              onBlur={() => handleInputBlur('department')}
              onMouseEnter={() => handleInputHover('department')}
              onMouseLeave={() => handleInputBlur('department')}
              style={inputStyles.department}
              placeholder="Enter your department"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Section:</label>
            <input 
              type="text" 
              name="section"
              value={formData.section}
              onChange={handleChange}
              onFocus={() => handleInputFocus('section')}
              onBlur={() => handleInputBlur('section')}
              onMouseEnter={() => handleInputHover('section')}
              onMouseLeave={() => handleInputBlur('section')}
              style={inputStyles.section}
              placeholder="Enter your section"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number:</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => handleInputFocus('phone')}
              onBlur={() => handleInputBlur('phone')}
              onMouseEnter={() => handleInputHover('phone')}
              onMouseLeave={() => handleInputBlur('phone')}
              style={inputStyles.phone}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address:</label>
            <input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              onFocus={() => handleInputFocus('address')}
              onBlur={() => handleInputBlur('address')}
              onMouseEnter={() => handleInputHover('address')}
              onMouseLeave={() => handleInputBlur('address')}
              style={inputStyles.address}
              placeholder="Enter your address"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Year:</label>
            <input 
              type="text" 
              name="currentYear"
              value={formData.currentYear}
              onChange={handleChange}
              onFocus={() => handleInputFocus('currentYear')}
              onBlur={() => handleInputBlur('currentYear')}
              onMouseEnter={() => handleInputHover('currentYear')}
              onMouseLeave={() => handleInputBlur('currentYear')}
              style={inputStyles.currentYear}
              placeholder="e.g. 3rd Year"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Semester:</label>
            <input 
              type="text" 
              name="currentSemester"
              value={formData.currentSemester}
              onChange={handleChange}
              onFocus={() => handleInputFocus('currentSemester')}
              onBlur={() => handleInputBlur('currentSemester')}
              onMouseEnter={() => handleInputHover('currentSemester')}
              onMouseLeave={() => handleInputBlur('currentSemester')}
              style={inputStyles.currentSemester}
              placeholder="e.g. 5th Sem"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cumulative GPA:</label>
            <input 
              type="number" 
              step="0.01"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              onFocus={() => handleInputFocus('cgpa')}
              onBlur={() => handleInputBlur('cgpa')}
              onMouseEnter={() => handleInputHover('cgpa')}
              onMouseLeave={() => handleInputBlur('cgpa')}
              style={inputStyles.cgpa}
              placeholder="Enter your CGPA"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Specialization:</label>
            <input 
              type="text" 
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              onFocus={() => handleInputFocus('specialization')}
              onBlur={() => handleInputBlur('specialization')}
              onMouseEnter={() => handleInputHover('specialization')}
              onMouseLeave={() => handleInputBlur('specialization')}
              style={inputStyles.specialization}
              placeholder="Enter your specialization"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bio:</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              onFocus={() => handleInputFocus('bio')}
              onBlur={() => handleInputBlur('bio')}
              onMouseEnter={() => handleInputHover('bio')}
              onMouseLeave={() => handleInputBlur('bio')}
              style={{ ...(inputStyles.bio || styles.input), minHeight: '110px', resize: 'vertical' }}
              placeholder="Write a short profile bio..."
            />
          </div>
          
          <div className="edit-button-group" style={styles.buttonGroup}>
            <button 
              type="submit"
              style={buttonStyles.save}
              onMouseEnter={() => setButtonStyles({ ...buttonStyles, save: { ...styles.button, ...styles.buttonSave, ...styles.buttonSaveHover } })}
              onMouseLeave={() => setButtonStyles({ ...buttonStyles, save: { ...styles.button, ...styles.buttonSave } })}
            >
              Save Changes
            </button>
            <button 
              type="button"
              onClick={() => navigate("/dashboard")}
              style={buttonStyles.cancel}
              onMouseEnter={() => setButtonStyles({ ...buttonStyles, cancel: { ...styles.button, ...styles.buttonCancel, ...styles.buttonCancelHover } })}
              onMouseLeave={() => setButtonStyles({ ...buttonStyles, cancel: { ...styles.button, ...styles.buttonCancel } })}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentEditProfile;