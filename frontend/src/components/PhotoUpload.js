import { useState } from 'react';

function PhotoUpload({ onPhotoChange, currentPhoto }) {
  const [preview, setPreview] = useState(currentPhoto || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onPhotoChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    },
    preview: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      backgroundColor: '#e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      border: '3px solid #667eea'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    placeholder: {
      fontSize: '48px',
      color: '#adb5bd'
    },
    uploadBtn: {
      padding: '10px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    hiddenInput: {
      display: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.preview}>
        {preview ? (
          <img src={preview} alt="Profile" style={styles.image} />
        ) : (
          <span style={styles.placeholder}>📷</span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={styles.hiddenInput}
        id="photo-upload"
      />
      <label htmlFor="photo-upload">
        <button
          type="button"
          style={styles.uploadBtn}
          onClick={() => document.getElementById('photo-upload').click()}
        >
          Choose Photo
        </button>
      </label>
    </div>
  );
}

export default PhotoUpload;
