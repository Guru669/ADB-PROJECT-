import React, { useState } from 'react';

function SearchBar({ onSearch, showDepartmentFilter = true, showSkillsFilter = true }) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      await onSearch({ query, department, skills });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setDepartment('');
    setSkills('');
    onSearch({ query: '', department: '', skills: '' });
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    form: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      minWidth: '200px',
      padding: '12px 15px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    inputFocus: {
      borderColor: '#1e5631',
      boxShadow: '0 0 0 3px rgba(30, 86, 49, 0.1)',
    },
    select: {
      flex: 1,
      minWidth: '150px',
      padding: '12px 15px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      backgroundColor: 'white',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    button: {
      padding: '12px 25px',
      backgroundColor: '#1e5631',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    buttonHover: {
      backgroundColor: '#2e7d32',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(30, 86, 49, 0.3)',
    },
    clearButton: {
      padding: '12px 20px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = '#e9ecef';
            e.target.style.boxShadow = 'none';
          }}
          style={styles.input}
        />

        {showDepartmentFilter && (
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
            }}
            style={styles.select}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {showSkillsFilter && (
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
            }}
            style={styles.input}
          />
        )}

        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#1e5631';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          disabled={isSearching}
        >
          🔍 {isSearching ? 'Searching...' : 'Search'}
        </button>

        <button
          type="button"
          style={styles.clearButton}
          onClick={handleClear}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          Clear
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
